import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Cafe, RESERVED_SLUGS, SLUG, cafeSchema, referencedPhotos } from './cafe.schema.js';

export type LoadResult = { ok: true; cafe: Cafe } | { ok: false; errors: string[] };

export const isValidSlug = (slug: string) => slug.length <= 60 && SLUG.test(slug) && !RESERVED_SLUGS.has(slug);

export const cafesDir = (contentDir: string) => join(contentDir, 'cafes');
export const photosDir = (contentDir: string, slug: string) => join(cafesDir(contentDir), slug, 'photos');

/** Folder names under content/cafes that look like cafes (valid slug + cafe.json present). */
export function listSlugs(contentDir: string): string[] {
  const dir = cafesDir(contentDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && isValidSlug(d.name) && existsSync(join(dir, d.name, 'cafe.json')))
    .map((d) => d.name)
    .sort();
}

/** Read and validate one cafe. Callers must check isValidSlug first; the slug becomes a path segment. */
export function loadCafe(contentDir: string, slug: string): LoadResult | null {
  const file = join(cafesDir(contentDir), slug, 'cafe.json');
  if (!existsSync(file)) return null;
  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(file, 'utf8'));
  } catch (e) {
    return { ok: false, errors: [`cafe.json bukan JSON yang valid: ${(e as Error).message}`] };
  }
  const parsed = cafeSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`),
    };
  }
  return { ok: true, cafe: parsed.data };
}

export function missingPhotos(contentDir: string, slug: string, cafe: Cafe): string[] {
  const dir = photosDir(contentDir, slug);
  return [...new Set(referencedPhotos(cafe))].filter((f) => !existsSync(join(dir, f)));
}
