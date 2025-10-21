export default defineEventHandler(async (event) => {
  try {
    // Set content type untuk XML
    setHeader(event, "Content-Type", "application/xml");

    // Fetch data surah dari API
    const surahList = await $fetch(
      "https://quran-api.santrikoding.com/api/surah"
    );

    // Base URL website
    const baseUrl = "https://quran.portal-islam.com"; // Ganti dengan domain Anda

    // Generate sitemap XML
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // Tambahkan URL untuk setiap surah
    if (surahList && Array.isArray(surahList)) {
      for (const surah of surahList) {
        const surahSlug = surah.nama_latin
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        sitemap += `  <!-- Surah ${surah.nama_latin} -->
  <url>
    <loc>${baseUrl}/surah/${surahSlug}/${surah.nomor}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;

        // Tambahkan URL untuk ayat-ayat penting (contoh: Ayat Kursi)
        if (surah.nomor === 2) {
          // Al-Baqarah
          sitemap += `  <!-- Ayat Kursi -->
  <url>
    <loc>${baseUrl}/surah/${surahSlug}/${surah.nomor}#ayat255</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
        }
      }
    }

    sitemap += `</urlset>`;

    return sitemap;
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Return basic sitemap jika ada error
    const baseUrl = "https://quran.portal-islam.com";
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
  }
});
