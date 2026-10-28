import { PageData } from '../cafes/cafe.schema.js';

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);

// U+2028/U+2029 are valid in JSON but end a line in older JS parsers.
const LS = String.fromCharCode(0x2028);
const LINE_SEPARATORS = new RegExp(`[${LS}${String.fromCharCode(0x2029)}]`, 'g');

/** JSON that is safe inside a <script> element: nothing in it can close the tag. */
export const scriptJson = (value: unknown) =>
  JSON.stringify(value)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(LINE_SEPARATORS, (c) => (c === LS ? '\\u2028' : '\\u2029'));

export function renderCafePage(template: string, data: PageData, origin: string): string {
  const { cafe, slug } = data;
  const title = `${cafe.name} · ${cafe.area}, ${cafe.city}`;
  const url = `${origin}/${slug}`;
  const hero = `/media/${slug}/${cafe.photos.hero}`;
  const meta = (attr: 'name' | 'property', key: string, content: string) =>
    `<meta ${attr}="${key}" content="${escapeHtml(content)}">`;

  const head = [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', cafe.tagline),
    // Prospect demos stay out of search engines; only the public showcase is indexable.
    cafe.pitch ? meta('name', 'robots', 'noindex, nofollow') : '',
    meta('name', 'theme-color', cafe.mode === 'dark' ? '#151311' : '#EFEAE2'),
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', cafe.tagline),
    meta('property', 'og:url', url),
    meta('property', 'og:image', origin + hero),
    meta('name', 'twitter:card', 'summary_large_image'),
    `<link rel="preload" as="image" href="${escapeHtml(hero)}" fetchpriority="high">`,
  ]
    .filter(Boolean)
    .join('\n    ');

  // Function replacers: a "$&" inside cafe text must not be read as a replacement pattern.
  return template
    .replace('<html lang="id">', () => `<html lang="id" data-mode="${cafe.mode}">`)
    .replace('<!--app-head-->', () => head)
    .replace('<!--app-data-->', () => `<script id="page-data" type="application/json">${scriptJson(data)}</script>`);
}

export const NOT_FOUND_HTML = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Halaman tidak ditemukan</title>
<style>
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; background: #EFEAE2; color: #171513; font: 16px/1.5 system-ui, sans-serif; }
  main { padding: 24px; max-width: 36ch; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  p { margin: 0; color: #665E54; }
</style>
</head>
<body>
<main>
  <h1>Halaman tidak ditemukan</h1>
  <p>Link ini mungkin salah ketik atau demonya sudah dihapus.</p>
</main>
</body>
</html>`;
