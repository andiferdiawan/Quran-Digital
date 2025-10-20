export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  app: {
    head: {
      title: "Al-Quran Online By Portal-Islam.com",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Baca Al-Quran online dengan terjemahan Indonesia. Portal Islam menyediakan akses mudah untuk membaca dan memahami Al-Quran.",
        },
        { name: "theme-color", content: "#4CAF50" },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          href: "/icons/apple-touch-icon.svg",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap",
        },
      ],
    },
  },

  modules: ["@nuxtjs/tailwindcss", "@vite-pwa/nuxt"],

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Al-Quran Online",
      short_name: "Quran Online",
      description: "Baca Al-Quran online dengan terjemahan Indonesia",
      lang: "id",
      theme_color: "#4CAF50",
      background_color: "#ffffff",
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: "/icons/icon-72x72.svg",
          sizes: "72x72",
          type: "image/svg+xml",
        },
        {
          src: "/icons/icon-192x192.svg",
          sizes: "192x192",
          type: "image/svg+xml",
        },
        {
          src: "/icons/icon-512x512.svg",
          sizes: "512x512",
          type: "image/svg+xml",
        },
        {
          src: "/icons/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,svg,png,ico}"],
      runtimeCaching: [
        {
          urlPattern: new RegExp("https://quran-api.santrikoding.com/.*"),
          handler: "CacheFirst",
          options: {
            cacheName: "quran-api",
            expiration: {
              maxEntries: 100,
              maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
    },
  },
});
