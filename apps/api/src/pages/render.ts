import { Cafe, HomeData, PageData } from '../cafes/cafe.schema.js';

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

const meta = (attr: 'name' | 'property', key: string, content: string) =>
  `<meta ${attr}="${key}" content="${escapeHtml(content)}">`;

/** Put the head tags and page data into the web build's index.html. */
function fill(template: string, mode: string, layout: string, head: string[], data: PageData | HomeData): string {
  // Function replacers: a "$&" inside cafe text must not be read as a replacement pattern.
  return template
    .replace('<html lang="id">', () => `<html lang="id" data-mode="${mode}" data-layout="${layout}">`)
    .replace('<!--app-head-->', () => head.filter(Boolean).join('\n    '))
    .replace('<!--app-data-->', () => `<script id="page-data" type="application/json">${scriptJson(data)}</script>`);
}

/**
 * Tab icon: the name's initial on a square, as an inline SVG so no file is needed per cafe.
 * A first character that is not a letter or digit (hostile or decorative names) becomes a dot.
 */
function favicon(name: string, bg: string, fg: string, font: string): string {
  const initial = /^[\p{L}\p{N}]/u.test(name) ? [...name][0].toUpperCase() : '•';
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='${bg}'/>` +
    `<text x='16' y='23' font-size='20' font-family='${font}' text-anchor='middle' fill='${fg}'>${initial}</text></svg>`;
  return `<link rel="icon" href="data:image/svg+xml,${encodeURIComponent(svg)}">`;
}

const cafeFavicon = ({ name, layout, accent }: Cafe) =>
  layout === 'malam'
    ? favicon(name, '#17181B', '#ECECEC', 'Futura,Arial,sans-serif')
    : layout === 'pagi'
      ? favicon(name, accent ?? '#4A7337', '#FFFFFF', 'Georgia,serif')
      : favicon(name, '#171513', '#EFEAE2', 'Didot,Georgia,serif');

/** Ground colour of the cafe's layout, for the browser chrome. */
const themeColor = (cafe: Cafe) =>
  cafe.layout === 'malam' ? '#17181B' : cafe.layout === 'pagi' ? '#CFC3B4' : cafe.mode === 'dark' ? '#151311' : '#EFEAE2';

export function renderCafePage(template: string, data: PageData, origin: string): string {
  const { cafe, slug } = data;
  const title = `${cafe.name} · ${cafe.area}, ${cafe.city}`;
  const url = `${origin}/${slug}`;
  const hero = `/media/${slug}/${cafe.photos.hero}`;

  return fill(template, cafe.mode, cafe.layout, [
    `<title>${escapeHtml(title)}</title>`,
    meta('name', 'description', cafe.tagline),
    // Prospect demos stay out of search engines; only the public showcase is indexable.
    cafe.pitch ? meta('name', 'robots', 'noindex, nofollow') : '',
    meta('name', 'theme-color', themeColor(cafe)),
    cafeFavicon(cafe),
    `<link rel="canonical" href="${escapeHtml(url)}">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', cafe.tagline),
    meta('property', 'og:url', url),
    meta('property', 'og:image', origin + hero),
    meta('name', 'twitter:card', 'summary_large_image'),
    `<link rel="preload" as="image" href="${escapeHtml(hero)}" fetchpriority="high">`,
  ], data);
}

export function renderHomePage(template: string, data: HomeData, origin: string): string {
  const title = 'Contoh website cafe';
  const description = 'Pilih satu cafe untuk melihat contoh websitenya.';
  const first = data.cafes[0];
  return fill(template, 'light', 'klasik', [
    `<title>${title}</title>`,
    meta('name', 'description', description),
    meta('name', 'theme-color', '#EFEAE2'),
    favicon(data.pitch?.name ?? 'Cafe', '#171513', '#EFEAE2', 'Didot,Georgia,serif'),
    `<link rel="canonical" href="${escapeHtml(origin)}/">`,
    meta('property', 'og:type', 'website'),
    meta('property', 'og:title', title),
    meta('property', 'og:description', description),
    meta('property', 'og:url', `${origin}/`),
    first ? meta('property', 'og:image', `${origin}/media/${first.slug}/${first.hero}`) : '',
    meta('name', 'twitter:card', first ? 'summary_large_image' : 'summary'),
  ], data);
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
