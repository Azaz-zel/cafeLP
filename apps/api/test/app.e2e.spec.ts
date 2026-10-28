import 'reflect-metadata';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import request from 'supertest';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { AppConfig } from '../src/config.js';
import { VisitsService } from '../src/visits/visits.service.js';

const repo = fileURLToPath(new URL('../../../', import.meta.url));
const PASSWORD = 'rahasia-uji';
const basic = (pw: string) => `Basic ${Buffer.from(`admin:${pw}`).toString('base64')}`;
const EVIL_NAME = '</script><b>"Kopi"</b>';

describe('app (e2e)', () => {
  let app: NestExpressApplication;
  let tmp: string;
  let visits: VisitsService;

  beforeAll(async () => {
    tmp = mkdtempSync(join(tmpdir(), 'cafe-e2e-'));
    const content = join(tmp, 'content');
    // A real cafe, one with hostile text, one with broken data.
    cpSync(join(repo, 'content/cafes/kopi-senja'), join(content, 'cafes/kopi-senja'), { recursive: true });
    const sample = JSON.parse(readFileSync(join(repo, 'content/cafes/kopi-senja/cafe.json'), 'utf8'));
    mkdirSync(join(content, 'cafes/jahat'), { recursive: true });
    writeFileSync(join(content, 'cafes/jahat/cafe.json'), JSON.stringify({ ...sample, name: EVIL_NAME }));
    mkdirSync(join(content, 'cafes/rusak'), { recursive: true });
    writeFileSync(join(content, 'cafes/rusak/cafe.json'), '{ "name": ');

    const webDist = join(tmp, 'web');
    mkdirSync(join(webDist, 'assets'), { recursive: true });
    cpSync(join(repo, 'apps/web/index.html'), join(webDist, 'index.html'));
    writeFileSync(join(webDist, 'assets/app.js'), 'console.log(1)');

    const config: AppConfig = {
      contentDir: content,
      webDist,
      dataDir: join(tmp, 'data'),
      publicUrl: 'https://demo.example',
      adminPassword: PASSWORD,
      pitch: { name: 'Adrian', whatsapp: '6281111111111' },
    };
    const moduleRef = await Test.createTestingModule({ imports: [AppModule.register(config)] }).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false, logger: false });
    configureApp(app, config);
    await app.init();
    visits = app.get(VisitsService);
  });

  afterAll(async () => {
    await app.close();
    rmSync(tmp, { recursive: true, force: true });
  });

  const http = () => request(app.getHttpServer());

  describe('cafe page', () => {
    it('renders the cafe with preview meta and page data', async () => {
      const res = await http().get('/kopi-senja').expect(200).expect('content-type', /html/);
      expect(res.text).toContain('<title>Kopi Senja · Coblong, Bandung</title>');
      expect(res.text).toContain('content="https://demo.example/media/kopi-senja/hero.webp"');
      expect(res.text).toContain('content="noindex, nofollow"');
      const json = res.text.match(/<script id="page-data" type="application\/json">(.*?)<\/script>/)![1];
      expect(JSON.parse(json)).toMatchObject({ slug: 'kopi-senja', pitch: { name: 'Adrian' } });
    });

    it('sends security headers', async () => {
      const res = await http().get('/kopi-senja');
      expect(res.headers['content-security-policy']).toContain("script-src 'self'");
      expect(res.headers['content-security-policy']).not.toContain('upgrade-insecure-requests');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBe('SAMEORIGIN');
      expect(res.headers['x-powered-by']).toBeUndefined();
    });

    it('cannot be broken out of by hostile cafe text', async () => {
      const res = await http().get('/jahat').expect(200);
      const afterHead = res.text.split('<!--')[0];
      expect(afterHead).not.toContain('<b>');
      expect(res.text.match(/<\/script>/g)).toHaveLength(2); // the data block and the app bundle only
    });

    it.each(['/tidak-ada', '/rusak', '/admin-palsu/../etc', '/Kopi-Senja', '/media', '/'])('404s %s', async (path) => {
      await http().get(path).expect(404);
    });
  });

  describe('media', () => {
    it('serves a cafe photo', async () => {
      await http().get('/media/kopi-senja/hero.webp').expect(200).expect('content-type', 'image/webp');
    });

    it.each([
      '/media/kopi-senja/cafe.json',
      '/media/kopi-senja/..%2fcafe.json',
      '/media/..%2f..%2fpackage.json/x.jpg',
      '/media/kopi-senja/%2e%2e%2f%2e%2e%2fcafe.webp',
      '/media/kopi-senja/tidak-ada.webp',
    ])('refuses %s', async (path) => {
      await http().get(path).expect(404);
    });
  });

  describe('POST /api/visits', () => {
    const post = (body: unknown, headers: Record<string, string> = {}) =>
      http().post('/api/visits').set({ 'cf-connecting-ip': `10.0.0.${Math.random()}`, ...headers }).send(body as object);

    it('records a visit with the device type', async () => {
      await post({ slug: 'kopi-senja' }, { 'user-agent': 'Mozilla/5.0 (iPhone)' }).expect(204);
      expect(visits.stats().get('kopi-senja')).toMatchObject({ count: 1, lastDevice: 'mobile' });
    });

    it('ignores the owner checking their own demo', async () => {
      await post({ slug: 'kopi-senja' }, { cookie: 'cl_owner=1' }).expect(204);
      expect(visits.stats().get('kopi-senja')?.count).toBe(1);
    });

    it.each([
      [{}, 400],
      [{ slug: 'kopi-senja', extra: 1 }, 400],
      [{ slug: '../../etc' }, 400],
      [{ slug: 'admin' }, 400],
      [{ slug: 'tidak-ada' }, 404],
    ])('rejects %j with %i', async (body, status) => {
      await post(body).expect(status);
    });

    it('rejects posts from another site', async () => {
      await post({ slug: 'kopi-senja' }, { origin: 'https://jahat.example' }).expect(403);
    });

    it('rejects oversized bodies', async () => {
      await post({ slug: 'x'.repeat(4000) }).expect(413);
    });

    it('rate limits one client', async () => {
      const ip = { 'cf-connecting-ip': '203.0.113.9', cookie: 'cl_owner=1' };
      for (let i = 0; i < 30; i++) await post({ slug: 'kopi-senja' }, ip).expect(204);
      await post({ slug: 'kopi-senja' }, ip).expect(429);
    });
  });

  describe('admin', () => {
    it('asks for a password', async () => {
      const res = await http().get('/admin').expect(401);
      expect(res.headers['www-authenticate']).toMatch(/^Basic/);
    });

    it('rejects a wrong password', async () => {
      await http().get('/admin').set('authorization', basic('salah')).expect(401);
      await http().get('/admin/admin.js').set('authorization', basic('salah')).expect(401);
    });

    it('lists cafes, escapes their names, and marks the browser as the owner', async () => {
      const res = await http().get('/admin').set('authorization', basic(PASSWORD)).expect(200);
      expect(res.text).toContain('Kopi Senja');
      expect(res.text).toContain('Data tidak valid');
      expect(res.text).not.toContain('<b>"Kopi"</b>');
      expect(res.headers['cache-control']).toBe('no-store');
      expect(res.headers['set-cookie']?.[0]).toMatch(/^cl_owner=1;.*HttpOnly/);
    });
  });

  it('serves built assets with long caching', async () => {
    const res = await http().get('/assets/app.js').expect(200);
    expect(res.headers['cache-control']).toContain('immutable');
  });
});
