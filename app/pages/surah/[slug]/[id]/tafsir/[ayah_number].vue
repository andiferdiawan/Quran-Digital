<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const { id, slug } = route.params;

// Make ayah_number reactive based on route params
const ayah_number = computed(() => route.params.ayah_number);

const loading = ref(true);
const tafsirData = ref(null);
const ayatData = ref(null);
const allTafsirData = ref(null); // Cache untuk menyimpan semua tafsir surah ini

// Format Surah Name
function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}
const surahName = computed(() => {
  const s = route.params.slug;
  return s ? toTitleCase(s.replace(/-/g, " ")) : "";
});

useHead({
  title: computed(
    () =>
      `Tafsir Surah ${surahName.value} Ayat ${route.params.ayah_number} | Quran Online`
  ),
  meta: [
    {
      name: "description",
      content: computed(
        () =>
          `Baca Tafsir Surah ${surahName.value} Ayat ${route.params.ayah_number} lengkap dengan penjelasan mendalam.`
      ),
    },
  ],
});

const fetchData = async (ayahNumber) => {
  if (!ayahNumber) return;

  loading.value = true;
  // Scroll ke atas saat loading mulai
  if (process.client) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  try {
    const surahId = route.params.id;
    const targetAyah = parseInt(ayahNumber);

    // 1. Fetch Tafsir (jika belum ada cache)
    if (!allTafsirData.value) {
      const response = await $fetch(
        `https://equran.id/api/v2/tafsir/${surahId}`
      );
      if (response && response.data && response.data.tafsir) {
        allTafsirData.value = response.data.tafsir;
      }
    }

    // Set tafsirData dari cache
    if (allTafsirData.value) {
      const targetTafsir = allTafsirData.value.find(
        (t) => parseInt(t.ayat) === targetAyah
      );
      tafsirData.value = targetTafsir;
    }

    // 2. Fetch Data Ayat (Arab & Terjemahan) - Selalu fetch baru karena spesifik ayat
    const arabicRes = await $fetch(
      `https://api.alquran.cloud/v1/ayah/${surahId}:${targetAyah}/ar.alafasy`
    );
    const translationRes = await $fetch(
      `https://api.alquran.cloud/v1/ayah/${surahId}:${targetAyah}/id.indonesian`
    );

    if (arabicRes.data && translationRes.data) {
      ayatData.value = {
        text: arabicRes.data.text,
        translation: translationRes.data.text,
        audio: arabicRes.data.audio,
        number: arabicRes.data.numberInSurah,
      };
    }
  } catch (err) {
    console.error("Gagal fetch tafsir", err);
  } finally {
    loading.value = false;
  }
};

// Watch perubahan ayah_number pada URL
watch(
  () => route.params.ayah_number,
  (newVal) => {
    fetchData(newVal);
  },
  { immediate: true }
);
</script>

<template>
  <div class="min-h-screen bg-slate-50">
    <!-- Navbar Sticky -->
    <div class="sticky top-0 left-0 right-0 z-10 bg-white shadow-sm">
      <div class="container max-w-4xl mx-auto p-4">
        <div class="flex items-center justify-between">
          <NuxtLink
            :to="`/surah/${slug}/${id}#ayat${ayah_number}`"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:underline hover:bg-orange-200 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Kembali ke Surah {{ surahName }}
          </NuxtLink>

          <span class="text-gray-500 text-sm font-medium"
            >Ayat {{ ayah_number }}</span
          >
        </div>
      </div>
    </div>

    <div class="container max-w-4xl mx-auto p-6 mt-4 pb-20">
      <div v-if="loading" class="flex justify-center items-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
      </div>

      <div v-else-if="tafsirData && ayatData" class="space-y-6">
        <!-- Card Ayat Utama -->
        <div
          class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 relative overflow-hidden">
          <div
            class="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-16 -mt-16 z-0"></div>

          <div class="relative z-5">
            <h1 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <span
                class="w-10 h-10 flex items-center justify-center bg-orange-500 text-white rounded-full text-sm mr-3 shadow-md"
                >{{ ayatData.number }}</span
              >
              Tafsir Surah {{ surahName }}
            </h1>

            <div class="mb-8">
              <p
                class="text-2xl md:text-2xl text-right font-arabic leading-loose mb-6 font-bold text-gray-800"
                dir="rtl">
                {{ ayatData.text }}
              </p>
              <p class="text-lg text-gray-600 italic leading-relaxed">
                "{{ ayatData.translation }}"
              </p>
            </div>
          </div>
        </div>

        <!-- Card Tafsir -->
        <div
          class="bg-white rounded-2xl shadow-lg border-t-4 border-orange-500 p-6 md:p-8">
          <div class="flex items-center mb-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6 text-orange-500 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h2 class="text-xl font-bold text-gray-800">
              Penjelasan Tafsir (Tahlili)
            </h2>
          </div>

          <div class="prose max-w-none">
            <div
              class="text-gray-700 leading-loose text-lg whitespace-pre-line">
              {{ tafsirData.teks }}
            </div>
          </div>

          <div
            class="mt-8 pt-4 border-t border-gray-100 text-center text-sm text-gray-400">
            Sumber: Kemenag RI
          </div>
        </div>

        <!-- Navigasi Antar Ayat (Optional) -->
        <div class="flex justify-between mt-8">
          <NuxtLink
            v-if="parseInt(ayah_number) > 1"
            :to="`/surah/${slug}/${id}/tafsir/${parseInt(ayah_number) - 1}`"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm text-sm md:text-base">
            &larr; <span class="hidden md:inline">Ayat</span> Sebelumnya
          </NuxtLink>
          <div v-else></div>

          <!-- Note: Need to know max ayat to disable next button, but for now simple check or just let it be -->
          <NuxtLink
            :to="`/surah/${slug}/${id}/tafsir/${parseInt(ayah_number) + 1}`"
            class="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors shadow-sm text-sm md:text-base">
            <span class="hidden md:inline">Ayat</span> Selanjutnya &rarr;
          </NuxtLink>
        </div>
      </div>

      <div v-else class="text-center py-20 bg-white rounded-xl shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 mx-auto text-gray-300 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <h3 class="text-xl font-medium text-gray-800 mb-2">
          Data tafsir tidak ditemukan
        </h3>
        <p class="text-gray-500">
          Mohon maaf, tafsir untuk ayat ini belum tersedia atau terjadi
          kesalahan koneksi.
        </p>
        <button
          @click="$router.go(0)"
          class="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          Coba Lagi
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.font-arabic {
  font-family: "Scheherazade New", serif;
}
</style>
