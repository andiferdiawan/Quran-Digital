# Sitemap Configuration

## Overview
Sitemap telah dikonfigurasi untuk project Al-Quran Online ini agar mudah didaftarkan di Google Search Console.

## Files yang dibuat/dimodifikasi:

### 1. Server Route Sitemap
- **File**: `server/api/sitemap.xml.ts`
- **URL**: `/api/sitemap.xml`
- **Fungsi**: Generate sitemap dinamis berdasarkan data surah dari API

### 2. Robots.txt
- **File**: `public/robots.txt`
- **Fungsi**: Mengarahkan search engine ke sitemap

### 3. Nuxt Config
- **File**: `nuxt.config.ts`
- **Fungsi**: Menambahkan meta tags SEO

## Cara Testing Sitemap

1. **Local Development**:
   ```
   http://localhost:3000/api/sitemap.xml
   ```

2. **Production**:
   ```
   https://your-domain.com/api/sitemap.xml
   ```

## Cara Daftar di Google Search Console

1. Buka [Google Search Console](https://search.google.com/search-console/)
2. Tambahkan property website Anda
3. Verifikasi kepemilikan domain
4. Pergi ke menu "Sitemaps"
5. Tambahkan URL sitemap: `/api/sitemap.xml`
6. Submit sitemap

## Struktur Sitemap

Sitemap ini mencakup:
- Homepage (priority: 1.0)
- Semua halaman surah (priority: 0.8)
- Ayat-ayat penting seperti Ayat Kursi (priority: 0.9)

## Update Otomatis

Sitemap akan ter-update otomatis setiap kali ada request karena:
- Data diambil real-time dari API
- Timestamp lastmod menggunakan waktu saat ini
- Tidak perlu regenerate manual

## Customization

Untuk mengubah domain atau menambah URL lain, edit file:
`server/api/sitemap.xml.ts`

Ganti `baseUrl` dengan domain production Anda.