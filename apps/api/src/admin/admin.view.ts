import { escapeHtml } from '../pages/render.js';
import type { VisitStats } from '../visits/visits.service.js';

export interface AdminRow {
  slug: string;
  name: string | null;
  errors: string[];
  url: string;
  stats: VisitStats | undefined;
}

const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });
const absolute = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jakarta' });

export function relativeTime(iso: string, now = Date.now()): string {
  const minutes = Math.round((Date.parse(iso) - now) / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  return rtf.format(Math.round(hours / 24), 'day');
}

function row(r: AdminRow): string {
  const e = escapeHtml;
  const status = r.errors.length
    ? `<span class="status"><span class="dot dot-error"></span>Data tidak valid</span>
       <details><summary>Lihat masalah</summary><ul>${r.errors.map((x) => `<li>${e(x)}</li>`).join('')}</ul></details>`
    : r.stats
      ? `<span class="status"><span class="dot dot-open"></span>Dibuka</span>`
      : `<span class="status"><span class="dot"></span>Belum dibuka</span>`;
  const last = r.stats
    ? `<time datetime="${e(r.stats.lastAt)}" title="${e(absolute.format(new Date(r.stats.lastAt)))}">${e(relativeTime(r.stats.lastAt))}</time> · ${r.stats.lastDevice === 'mobile' ? 'HP' : 'Desktop'}`
    : 'Belum ada';
  return `<tr>
    <td><div class="name">${e(r.name ?? r.slug)}</div><a class="slug" href="${e(r.url)}">/${e(r.slug)}</a></td>
    <td>${status}</td>
    <td class="num">${r.stats?.count ?? 0}×</td>
    <td class="muted">${last}</td>
    <td class="action"><button type="button" class="copy" data-url="${e(r.url)}">Salin link</button></td>
  </tr>`;
}

export function renderAdmin(rows: AdminRow[]): string {
  const opened = rows.filter((r) => r.stats).length;
  const body = rows.length
    ? `<div class="table-wrap"><table>
        <thead><tr>
          <th scope="col">Cafe</th><th scope="col">Status</th><th scope="col" class="num">Dibuka</th>
          <th scope="col">Terakhir dibuka</th><th scope="col"><span class="sr-only">Aksi</span></th>
        </tr></thead>
        <tbody>${rows.map(row).join('')}</tbody>
      </table></div>`
    : `<div class="empty">
        <h2>Belum ada demo</h2>
        <p>Buat folder <code>content/cafes/nama-cafe/</code> berisi <code>cafe.json</code> dan folder <code>photos/</code>, lalu muat ulang halaman ini.</p>
      </div>`;

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Demo cafe · admin</title>
<style>
  :root { color-scheme: light; --ink: #1C1A17; --muted: #5F5A53; --line: #E3DFD9; --bg: #FAFAF9; }
  * { box-sizing: border-box; }
  body { margin: 0; background: var(--bg); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 1080px; margin: 0 auto; padding: 48px 16px; display: flex; flex-direction: column; gap: 24px; }
  header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 12px; }
  h1 { margin: 0; font-size: 28px; letter-spacing: -0.02em; }
  p { margin: 0; color: var(--muted); }
  .note { font-size: 13px; }
  .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 12px; background: #fff; }
  table { width: 100%; min-width: 720px; border-collapse: collapse; text-align: left; }
  th { padding: 12px 16px; font-size: 13px; font-weight: 600; color: var(--muted); border-bottom: 1px solid var(--line); }
  td { padding: 14px 16px; border-bottom: 1px solid #EFECE8; vertical-align: top; }
  tr:last-child td { border-bottom: 0; }
  .name { font-weight: 600; }
  .slug { font-size: 13px; color: var(--muted); }
  .num { text-align: right; font-variant-numeric: tabular-nums; }
  .muted { color: var(--muted); }
  .status { display: inline-flex; align-items: center; gap: 8px; font-weight: 500; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: #B8B2A9; }
  .dot-open { background: #2E8B57; }
  .dot-error { background: #B42318; }
  details { margin-top: 6px; font-size: 13px; color: #B42318; }
  summary { cursor: pointer; }
  .action { text-align: right; }
  .copy { height: 36px; padding: 0 14px; border-radius: 8px; border: 1px solid #D9D4CC; background: #fff; color: var(--ink); font: inherit; font-size: 14px; font-weight: 500; cursor: pointer; }
  .copy:active { transform: scale(0.97); }
  :focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }
  .empty { padding: 40px 24px; border: 1px dashed #D9D4CC; border-radius: 12px; display: flex; flex-direction: column; gap: 8px; }
  .empty h2 { margin: 0; font-size: 18px; }
  code { font-size: 13px; background: #EFECE8; padding: 1px 6px; border-radius: 4px; }
  .sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
</style>
</head>
<body>
<main>
  <header>
    <div>
      <h1>Demo cafe</h1>
      <p>${rows.length} demo · ${opened} sudah dibuka</p>
    </div>
    <p class="note">Kunjunganmu dari browser ini tidak dihitung.</p>
  </header>
  ${body}
</main>
<script src="/admin/admin.js" defer></script>
</body>
</html>`;
}

// Served as a file so the CSP can keep script-src at 'self' (no inline scripts).
export const ADMIN_JS = `document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.copy');
  if (!btn) return;
  try {
    await navigator.clipboard.writeText(btn.dataset.url);
    btn.textContent = 'Tersalin';
  } catch {
    btn.textContent = 'Gagal, salin manual';
  }
  setTimeout(() => { btn.textContent = 'Salin link'; }, 1600);
});
`;
