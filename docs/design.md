# Desain: Cafe Landing

Tanggal: 2026-10-28

## Tujuan

Alat jualan untuk jasa pembuatan landing page cafe. Calon klien (pemilik cafe lokal) menerima link lewat DM Instagram/WhatsApp, membukanya di in-app browser HP, dan melihat **cafe mereka sendiri** di website yang bagus. Sukses = mereka membalas chat.

Sekaligus proyek portofolio fullstack (frontend yang dipoles, backend kecil yang punya fungsi nyata).

## Keputusan

| Keputusan | Alasan |
|---|---|
| Satu template, demo per cafe dari file data | Demo personal jauh lebih meyakinkan daripada demo cafe fiktif. Satu demo cukup 15-30 menit isi data. |
| NestJS menyisipkan meta tag + data ke `index.html` | Crawler preview WhatsApp/IG tidak menjalankan JS, jadi tiap cafe butuh `og:` sendiri. Tanpa SSR penuh. |
| Data cafe = file JSON, divalidasi zod | Tidak perlu CRUD atau database untuk data yang jarang berubah. Validasi ketat menangkap typo sebelum link dikirim. |
| Kunjungan dicatat dari frontend, bukan saat request | Crawler preview tidak menjalankan JS, jadi kartu preview di chat tidak terhitung sebagai "dibuka". |
| SQLite bawaan Node (`node:sqlite`) | Satu tabel, tanpa dependency native. |
| Cloudflare Tunnel | HTTPS dan cache gratis, IP rumah tidak terbuka, tanpa port forwarding. |

## Visual

Arah dari referensi pemilik (NORD/NORA): minimalis editorial. Dial: ENERGY 2 / RHYTHM 2 / MOTION 1.

- Wordmark serif raksasa (Bodoni Moda), foto menu andalan menumpuk di bagian bawahnya. Ukuran wordmark dihitung dari panjang nama.
- Latar greige `#EFEAE2`, tinta `#171513`. Hitam adalah aksen. Cafe boleh mengganti warna tombol lewat `accent`; warna teks tombol dipilih otomatis dari kontras.
- Sudut tajam di semua elemen. Label uppercase dengan tracking lebar sebagai motif identitas.
- Satu band gelap (kategori menu), section belah dua (suasana, lokasi).
- Motion: tekan tombol (`scale 0.97`), foto hero "settle" sekali saat load, tombol pesan sticky muncul setelah tombol di hero lewat. Semua mati di `prefers-reduced-motion`.

Mockup: Claude Design canvas "Cafe Landing Template".

## Keamanan

- Semua teks cafe di-escape di HTML; JSON di `<script>` di-escape agar tidak bisa menutup tag.
- Link di `cafe.json` wajib `https://` (menolak `javascript:`).
- Nama folder dan nama foto di-whitelist dengan regex sebelum menyentuh filesystem.
- `/admin`: Basic Auth, perbandingan konstan-waktu, rate limit. Tanpa `ADMIN_PASSWORD` selalu ditolak.
- `POST /api/visits`: body maks 2 KB, skema ketat, cek Origin, rate limit per IP asli (`CF-Connecting-IP`).
- Helmet (CSP `script-src 'self'`, nosniff, frame-options). Container read-only, user non-root, tanpa port publik.
- Tidak menyimpan IP atau data pribadi pengunjung.

## Di luar cakupan (bisa jadi upsell)

Order online/keranjang, reservasi, pembayaran, CMS untuk klien, notifikasi Telegram saat demo dibuka, grafik analitik.
