import { Controller, Get, Inject, Logger, NotFoundException, Param, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PHOTO_FILE, ShowcaseCafe } from '../cafes/cafe.schema.js';
import { isValidSlug, listSlugs, loadCafe, photosDir } from '../cafes/cafe-store.js';
import { AppConfig, CONFIG } from '../config.js';
import { NOT_FOUND_HTML, renderCafePage, renderHomePage } from './render.js';

export const requestOrigin = (config: AppConfig, req: Request) =>
  config.publicUrl ?? `${req.protocol}://${req.get('host')}`;

@Controller()
export class PageController {
  private readonly logger = new Logger(PageController.name);
  private template: string | null = null;

  constructor(@Inject(CONFIG) private readonly config: AppConfig) {}

  @Get('media/:slug/:file')
  media(@Param('slug') slug: string, @Param('file') file: string, @Res() res: Response) {
    // Both params are whitelisted before they touch the filesystem; sendFile's root blocks traversal too.
    if (!isValidSlug(slug) || !PHOTO_FILE.test(file)) throw new NotFoundException();
    res.sendFile(file, { root: photosDir(this.config.contentDir, slug), maxAge: '7d', dotfiles: 'deny' }, (err) => {
      if (err && !res.headersSent) res.status(404).end();
    });
  }

  @Get()
  home(@Req() req: Request, @Res() res: Response) {
    const dir = this.config.contentDir;
    // Prospect demos (pitch: true) use the cafe's own photos and stay unlisted; broken data is shown in /admin.
    const cafes: ShowcaseCafe[] = listSlugs(dir).flatMap((slug) => {
      const result = loadCafe(dir, slug);
      if (!result?.ok || result.cafe.pitch) return [];
      const { name, area, city, mode, photos } = result.cafe;
      return [{ slug, name, area, city, mode, hero: photos.hero }];
    });
    res
      .set('Cache-Control', 'no-cache')
      .type('html')
      .send(renderHomePage(this.loadTemplate(), { cafes, pitch: this.config.pitch }, requestOrigin(this.config, req)));
  }

  @Get(':slug')
  page(@Param('slug') slug: string, @Req() req: Request, @Res() res: Response) {
    const result = isValidSlug(slug) ? loadCafe(this.config.contentDir, slug) : null;
    if (!result) return res.status(404).type('html').send(NOT_FOUND_HTML);
    if (!result.ok) {
      this.logger.error(`content/cafes/${slug}/cafe.json tidak valid:\n  ${result.errors.join('\n  ')}`);
      return res.status(404).type('html').send(NOT_FOUND_HTML);
    }
    const data = { slug, cafe: result.cafe, pitch: result.cafe.pitch ? this.config.pitch : null };
    res
      .set('Cache-Control', 'no-cache')
      .type('html')
      .send(renderCafePage(this.loadTemplate(), data, requestOrigin(this.config, req)));
  }

  private loadTemplate(): string {
    // The web build never changes while the server runs, so read it once.
    this.template ??= readFileSync(join(this.config.webDist, 'index.html'), 'utf8');
    return this.template;
  }
}
