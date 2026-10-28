import { fileURLToPath } from 'node:url';
import { isValidSlug, listSlugs, loadCafe, missingPhotos } from './cafe-store.js';
import { cafeSchema } from './cafe.schema.js';

const contentDir = fileURLToPath(new URL('../../../../content', import.meta.url));

describe('content/cafes', () => {
  it.each(listSlugs(contentDir))('%s is valid and has every photo it references', (slug) => {
    const result = loadCafe(contentDir, slug);
    expect(result).toMatchObject({ ok: true });
    if (result?.ok) expect(missingPhotos(contentDir, slug, result.cafe)).toEqual([]);
  });
});

describe('cafeSchema', () => {
  const base = () => {
    const r = loadCafe(contentDir, 'kopi-senja');
    if (!r?.ok) throw new Error('sample cafe must be valid');
    return structuredClone(r.cafe);
  };

  it.each(['javascript:alert(1)', 'data:text/html,hi', 'http://maps.example.com'])('rejects non-https link %s', (url) => {
    expect(cafeSchema.safeParse({ ...base(), mapsUrl: url }).success).toBe(false);
  });

  it('rejects photo names that could escape the photos folder', () => {
    const cafe = base();
    cafe.photos.hero = '../cafe.json';
    expect(cafeSchema.safeParse(cafe).success).toBe(false);
  });

  it('rejects unknown keys so typos surface instead of silently doing nothing', () => {
    expect(cafeSchema.safeParse({ ...base(), tagLine: 'x' }).success).toBe(false);
  });
});

describe('isValidSlug', () => {
  it.each(['kopi-senja', 'cafe2'])('accepts %s', (s) => expect(isValidSlug(s)).toBe(true));
  it.each(['admin', 'media', 'Kopi', '../x', 'a--b', '-a', 'a'.repeat(61)])('rejects %s', (s) =>
    expect(isValidSlug(s)).toBe(false),
  );
});
