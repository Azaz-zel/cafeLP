// Run before sending a demo link: `npm run check:cafes`. Exits 1 if any cafe would render broken.
import { readdirSync } from 'node:fs';
import { cafesDir, isValidSlug, listSlugs, loadCafe, missingPhotos } from './cafes/cafe-store.js';
import { loadConfig } from './config.js';

const { contentDir } = loadConfig();
let failed = 0;

for (const entry of readdirSync(cafesDir(contentDir), { withFileTypes: true })) {
  if (entry.isDirectory() && !isValidSlug(entry.name)) {
    console.log(`✗ ${entry.name}: nama folder harus huruf kecil, angka, dan tanda hubung (contoh: kopi-senja)`);
    failed++;
  }
}

for (const slug of listSlugs(contentDir)) {
  const result = loadCafe(contentDir, slug)!;
  const problems = result.ok ? missingPhotos(contentDir, slug, result.cafe).map((f) => `foto tidak ada: photos/${f}`) : result.errors;
  if (problems.length) {
    failed++;
    console.log(`✗ ${slug}\n    ${problems.join('\n    ')}`);
  } else {
    console.log(`✓ ${slug}`);
  }
}

console.log(failed ? `\n${failed} cafe bermasalah.` : '\nSemua cafe siap dikirim.');
process.exitCode = failed ? 1 : 0;
