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
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "https://portal-islam.com/uploads/logo/favicon_646e3bf7ebb258-78293894-69402241.jpg",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Scheherazade+New:wght@400;700&display=swap",
        },
      ],
    },
  },

  modules: ["@nuxtjs/tailwindcss"],
});
