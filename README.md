# Quran Online - Aplikasi Pembaca Al-Qur'an Digital

Aplikasi web modern untuk membaca Al-Qur'an dengan fitur lengkap termasuk navigasi surah, pencarian, riwayat bacaan, dan favorit.

## Fitur Utama

- 📖 **Pembacaan Al-Qur'an**: Navigasi mudah antar surah dan ayat
- 🔍 **Pencarian**: Cari surah berdasarkan nama atau nomor
- 📚 **Riwayat Bacaan**: Menyimpan ayat terakhir yang dibaca
- ⭐ **Favorit**: Tandai ayat favorit untuk dibaca kembali
- 📱 **Responsive**: Tampilan optimal di semua perangkat
- 🌐 **SEO Optimized**: Sitemap otomatis untuk mesin pencari

## Setup

Pastikan untuk menginstal dependensi:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Mulai server pengembangan di `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Bangun aplikasi untuk produksi:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Pratinjau build produksi secara lokal:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Lihat [dokumentasi deployment](https://nuxt.com/docs/getting-started/deployment) untuk informasi lebih lanjut.

## Struktur Sitemap

Aplikasi ini secara otomatis menghasilkan sitemap XML yang mencakup:
- Halaman utama (Homepage)
- Halaman favorit (/favorites)
- Halaman riwayat (/history)
- Semua halaman surah
- Ayat-ayat penting (seperti Ayat Kursi)

Sitemap dapat diakses di: `https://quran.portal-islam.com/sitemap.xml`
