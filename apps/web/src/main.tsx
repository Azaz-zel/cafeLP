import '@fontsource-variable/bodoni-moda';
import '@fontsource-variable/cormorant-garamond';
import '@fontsource-variable/hanken-grotesk';
import '@fontsource-variable/jost';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Cafe, HomeData, PageData } from '../../api/src/cafes/cafe.schema';
import { CafePage } from './CafePage';
import { HomePage } from './HomePage';
import { MalamPage } from './MalamPage';
import { PagiPage } from './PagiPage';
import './styles.css';

async function readPageData(): Promise<PageData | HomeData> {
  const el = document.getElementById('page-data');
  if (el?.textContent) return JSON.parse(el.textContent) as PageData | HomeData;
  // Vite dev has no server injection; render the sample cafe so the template can be worked on.
  if (import.meta.env.DEV) {
    const { default: cafe } = await import('../../../content/cafes/kopi-senja/cafe.json');
    document.title = 'Kopi Senja (dev)';
    return { slug: 'kopi-senja', cafe: cafe as Cafe, pitch: { name: '[Nama Kamu]', whatsapp: '6285121022185' } };
  }
  throw new Error('page-data tidak ada; halaman ini harus disajikan oleh server');
}

// One visit per tab: reloads and in-page scrolling are not new prospects.
function recordVisit(slug: string) {
  const key = `visited:${slug}`;
  try {
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch {
    // Storage blocked (private mode in some in-app browsers): still count once per load.
  }
  void fetch('/api/visits', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ slug }),
    keepalive: true,
  }).catch(() => {});
}

const data = await readPageData();
// Falls back to CafePage: the Vite dev sample is raw JSON, so the schema's default layout is not applied to it.
const Page = ('cafe' in data && { klasik: CafePage, malam: MalamPage, pagi: PagiPage }[data.cafe.layout]) || CafePage;
createRoot(document.getElementById('root')!).render(
  <StrictMode>{'cafes' in data ? <HomePage data={data} /> : <Page data={data as PageData} />}</StrictMode>,
);
// Only demo pages are tracked; the home page is not a prospect opening their link.
if (!import.meta.env.DEV && 'slug' in data) recordVisit(data.slug);
