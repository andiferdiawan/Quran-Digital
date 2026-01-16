<template>
  <div class="min-h-screen bg-white">
    <!-- Header -->
    <header
      class="mx-auto flex justify-center items-center p-4 border-b bg-white">
      <img
        src="https://portal-islam.com/uploads/logo/logo_64664f119ac888-44093355-80731801.jpg"
        class="h-20" />
    </header>

    <div class="container mx-auto flex justify-center py-7">
      <h1 class="text-black-600 text-2xl text-center font-bold">
        Daftar Surah dan Ayat Paling Sering di Bacakan
      </h1>
    </div>
    <!-- Shortcut Surah -->
    <div class="container mx-auto flex flex-wrap justify-center gap-3 px-4">
      <NuxtLink
        to="/surah/yasin/36"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Yasin</NuxtLink
      >
      <NuxtLink
        to="/surah/al-waqiah/56"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Al-Waqi'ah</NuxtLink
      >
      <NuxtLink
        to="/surah/al-mulk/67"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Al-Mulk</NuxtLink
      >
      <NuxtLink
        to="/surah/al-kahf/18"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Al-Kahfi</NuxtLink
      >
      <NuxtLink
        to="/surah/ar-rahman/55"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Ar-Rahman</NuxtLink
      >
      <NuxtLink
        to="/surah/al-baqarah/2#ayat255"
        class="px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:bg-orange-200"
        >Ayat Kursi</NuxtLink
      >
    </div>

    <!-- Daftar Surah -->
    <main
      class="container max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 p-6">
      <NuxtLink
        v-for="surah in surahList"
        :key="surah.nomor"
        :to="`/surah/${slugify(surah.nama_latin)}/${surah.nomor}`"
        class="p-4 rounded-xl shadow-sm bg-white border flex justify-between items-center hover:bg-gray-50 cursor-pointer transition hover:bg-orange-100 hover:border-orange-300">
        <div>
          <h2 class="text-lg font-bold">
            {{ surah.nomor }}. {{ surah.nama_latin }}
          </h2>
          <p class="text-sm text-gray-500">
            {{ surah.arti }} - {{ surah.jumlah_ayat }} ayat
          </p>
        </div>
        <p class="text-2xl text-gray-600 font-arabic">
          {{ surah.nama }}
        </p>
      </NuxtLink>
    </main>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
import { watchEffect } from "vue";
import { useHead } from "#imports";

const route = useRoute();

watchEffect(() => {
  if (route.path === "/") {
    // langsung pakai route.path
    // Meta default untuk halaman index
    useHead({
      title: "Al-Quran Online By Portal-Islam.com",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          name: "description",
          content:
            "Baca Al-Quran online dengan terjemahan Indonesia. Portal Islam menyediakan akses mudah untuk membaca dan memahami Al-Quran.",
        },
        {
          property: "og:title",
          content: "Al-Quran Online By Portal-Islam.com",
        },
        {
          property: "og:description",
          content:
            "Baca Al-Quran online dengan terjemahan Indonesia. Portal Islam menyediakan akses mudah untuk membaca dan memahami Al-Quran.",
        },
      ],
    });
  }
});

const {
  data: surahList,
  pending,
  error,
} = await useFetch("https://quran-api.santrikoding.com/api/surah");

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // hilangkan aksen
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik
    .replace(/[^a-z0-9-\s]/g, "") // hapus selain huruf/angka/dash/spasi
    .trim()
    .replace(/\s+/g, "-"); // spasi → tanda -
}
</script>

<style>
.font-arabic {
  font-family: "Scheherazade New", serif;
}
</style>
