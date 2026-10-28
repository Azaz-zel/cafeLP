# Cafe Landing

Template landing page cafe untuk menawarkan jasa pembuatan website. Satu template, satu demo per cafe: isi data cafe dari Instagram mereka, kirim link `domainmu/nama-cafe` lewat DM, lalu pantau di `/admin` siapa yang sudah membuka.

- `apps/web`: halaman cafe (React + Vite + TypeScript)
- `apps/api`: server NestJS. Menyajikan halaman dengan link preview per cafe, mencatat kunjungan (SQLite), halaman `/admin`
- `content/cafes/<slug>/`: data tiap cafe (`cafe.json` + `photos/`)
- Desain: [`docs/design.md`](docs/design.md)

## Membuat demo baru

1. Salin folder `content/cafes/kopi-senja` menjadi `content/cafes/nama-cafe`. Nama folder adalah link-nya: huruf kecil, angka, tanda hubung.
2. Ganti foto di `photos/` (dari IG cafe tersebut) dan isi `cafe.json`.
3. Jalankan `npm run check:cafes`. Perbaiki semua yang ditandai ✗.
4. Di server: salin folder ke `content/cafes/`. Tidak perlu build ulang atau restart.

`"pitch": true` menampilkan strip "Contoh website untuk ..." dan menyembunyikan halaman dari Google. Pakai `"pitch": false` hanya untuk demo publik di portofolio.

Hanya pakai foto milik cafe untuk demo yang dikirim ke cafe itu sendiri, dan hapus foldernya kalau mereka tidak tertarik.

<details>
<summary>Isi <code>cafe.json</code></summary>

| Field | Keterangan |
|---|---|
| `name`, `tagline`, `specialty`, `since`, `area`, `city` | Teks di hero. `name` jadi wordmark besar, jadi nama pendek paling bagus. |
| `mode` | `light` atau `dark` |
| `accent` | Opsional, warna tombol `#RRGGBB`. Kosongkan untuk hitam. |
| `contact.whatsapp` | Format `62xxxxxxxxxx`. Semua tombol pesan menuju nomor ini. |
| `contact.instagram`, `gofood`, `grabfood` | Opsional. Link harus `https://`. |
| `hours.<hari>` | `{ "open": "10:00", "close": "22:00" }` atau `null` kalau tutup. Jam tutup lebih kecil dari jam buka berarti lewat tengah malam. |
| `photos` | Nama file di `photos/`: `hero` (3:4), `atmosphere`, `gallery` (maks 3), `location` |
| `facilities` | Maks 3. Ikon: `coffee`, `wifi`, `plug`, `delivery`, `parking`, `music`, `plant`, `pet` |
| `bestSellers` | 2-4 menu dengan foto |
| `menu` | 1-6 kategori, masing-masing berisi item `{ name, price, note? }` |

Field yang salah ketik akan ditolak oleh `check:cafes`, jadi kesalahannya ketahuan sebelum link dikirim.
</details>

## Pengembangan

```bash
npm install
npm run dev:api     # server di :3000 (butuh `npm run build -w apps/web` sekali)
npm run dev:web     # Vite di :5173, merender Kopi Senja
npm test            # unit + e2e
npm run build
```

Butuh Node 22.13 atau lebih baru (memakai `node:sqlite` bawaan).

## Deploy ke server rumah

Butuh Docker dan domain yang dikelola di Cloudflare.

1. Di Cloudflare Zero Trust, buat Tunnel. Tambahkan public hostname `namamu.my.id` yang mengarah ke `http://app:3000`. Salin token-nya.
2. Di server:
   ```bash
   git clone <repo> cafe-landing && cd cafe-landing
   cp .env.example .env        # isi semua nilainya
   mkdir -p data && sudo chown 1000:1000 data
   docker compose up -d --build
   ```
3. Update: `git pull && docker compose up -d --build`

Container app tidak membuka port ke luar. Satu-satunya jalan masuk adalah lewat tunnel.

## Sebelum mengirim link

- `npm run check:cafes` bersih
- Buka link di HP lewat in-app browser WhatsApp dan Instagram
- Kirim link ke diri sendiri di WhatsApp untuk cek kartu preview-nya
- Buka `/admin` sekali dari browser HP-mu, supaya kunjunganmu sendiri tidak ikut terhitung
