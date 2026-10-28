import { loadConfig } from './config.js';

const prod = { NODE_ENV: 'production', PUBLIC_URL: 'https://demo.my.id/', ADMIN_PASSWORD: 'cukup-panjang-123' };

describe('loadConfig', () => {
  it('normalises PUBLIC_URL to its origin', () => {
    expect(loadConfig(prod).publicUrl).toBe('https://demo.my.id');
  });

  it.each([
    ['missing PUBLIC_URL', { ...prod, PUBLIC_URL: '' }],
    ['plain-http PUBLIC_URL', { ...prod, PUBLIC_URL: 'http://demo.my.id' }],
    ['missing ADMIN_PASSWORD', { ...prod, ADMIN_PASSWORD: '' }],
    ['short ADMIN_PASSWORD', { ...prod, ADMIN_PASSWORD: 'pendek' }],
    ['bad PITCH_WHATSAPP', { ...prod, PITCH_WHATSAPP: '0812' }],
  ])('refuses to start in production with %s', (_, env) => {
    expect(() => loadConfig(env)).toThrow();
  });

  it('allows local runs without PUBLIC_URL', () => {
    expect(loadConfig({}).publicUrl).toBeNull();
  });
});
