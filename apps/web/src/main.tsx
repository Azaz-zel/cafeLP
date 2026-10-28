import '@fontsource-variable/bodoni-moda';
import '@fontsource-variable/hanken-grotesk';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import type { Cafe, PageData } from '../../api/src/cafes/cafe.schema';
import { CafePage } from './CafePage';
import './styles.css';

async function readPageData(): Promise<PageData> {
  const el = document.getElementById('page-data');
  if (el?.textContent) return JSON.parse(el.textContent) as PageData;
  // Vite dev has no server injection; render the sample cafe so the template can be worked on.
  if (import.meta.env.DEV) {
    const { default: cafe } = await import('../../../content/cafes/kopi-senja/cafe.json');
    document.title = 'Kopi Senja (dev)';
    return { slug: 'kopi-senja', cafe: cafe as Cafe, pitch: { name: '[Nama Kamu]', whatsapp: '6280000000000' } };
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
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CafePage data={data} />
  </StrictMode>,
);
if (!import.meta.env.DEV) recordVisit(data.slug);
