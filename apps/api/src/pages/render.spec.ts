import { escapeHtml, renderCafePage, scriptJson } from './render.js';

describe('scriptJson', () => {
  it('cannot close the script element it is embedded in', () => {
    const out = scriptJson({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });

  it('escapes line separators that break older JS parsers', () => {
    const out = scriptJson({ t: `a${String.fromCharCode(0x2028)}b${String.fromCharCode(0x2029)}c` });
    expect(out).toBe('{"t":"a\\u2028b\\u2029c"}');
  });
});

describe('renderCafePage', () => {
  const template = '<html lang="id"><head><!--app-head--></head><body><!--app-data--></body></html>';
  const cafe = {
    name: 'Kopi $& "Senja"',
    tagline: '<img src=x onerror=alert(1)>',
    area: 'Coblong',
    city: 'Bandung',
    mode: 'dark',
    pitch: true,
    photos: { hero: 'hero.webp' },
  } as never;

  const html = renderCafePage(template, { slug: 'kopi', cafe, pitch: null }, 'https://demo.my.id');

  it('escapes cafe text in meta tags', () => {
    expect(html).toContain('<title>Kopi $&amp; &quot;Senja&quot; · Coblong, Bandung</title>');
    expect(html).not.toContain('<img src=x');
  });

  it('does not treat $& in cafe text as a replacement pattern', () => {
    expect(html).not.toContain('<!--app-head-->');
    expect(html.match(/\$&amp;/g)?.length).toBeGreaterThan(0);
  });

  it('marks prospect demos noindex and sets the theme mode', () => {
    expect(html).toContain('content="noindex, nofollow"');
    expect(html).toContain('<html lang="id" data-mode="dark">');
    expect(html).toContain('content="https://demo.my.id/media/kopi/hero.webp"');
  });

  it('escapeHtml covers all five special characters', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe('&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;');
  });
});
