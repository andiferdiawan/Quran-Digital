<script setup>
import { ref, reactive, onMounted, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const { id } = route.params;

const activeAyah = ref(null);
const isPaused = ref(true);
const audioRefs = ref([]);
const currentAyah = ref(null); // simpan ayat yang sedang aktif
const loading = ref(true);

const surah = reactive({ ayahs: [] });

// Fetch daftar surah untuk dropdown
const { data: surahList } = await useFetch(
  "https://quran-api.santrikoding.com/api/surah"
);

// Fungsi untuk navigasi ke surah yang dipilih
const changeSurah = (surahId) => {
  if (!surahId) return;

  const selectedSurah = surahList.value.find((s) => s.nomor == surahId);
  if (selectedSurah) {
    const slug = slugify(selectedSurah.nama_latin);
    router.push(`/surah/${slug}/${surahId}`);
  }
};

// Fungsi untuk scroll ke ayat yang dipilih
const scrollToAyat = (ayatNumber) => {
  if (!ayatNumber) return;

  // Cari elemen ayat berdasarkan id ayat
  const ayatElement = document.getElementById(`ayat${ayatNumber}`);
  if (ayatElement) {
    ayatElement.scrollIntoView({ behavior: "smooth", block: "start" });
    // Update URL dengan hash untuk SEO
    window.history.replaceState(null, null, `#ayat${ayatNumber}`);
  }
};

// Fungsi slugify dari halaman index
function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // hilangkan aksen
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik
    .replace(/[^a-z0-9-\s]/g, "") // hapus selain huruf/angka/dash/spasi
    .trim()
    .replace(/\s+/g, "-"); // spasi → tanda -
}

onMounted(async () => {
  try {
    // fetch arab + audio
    const arabicRes = await $fetch(
      `https://api.alquran.cloud/v1/surah/${id}/ar.alafasy`
    );
    const translationRes = await $fetch(
      `https://api.alquran.cloud/v1/surah/${id}/id.indonesian`
    );

    const arabAyahs = arabicRes.data.ayahs;
    const indoAyahs = translationRes.data.ayahs;

    Object.assign(surah, {
      number: arabicRes.data.number,
      name: arabicRes.data.name,
      englishName: arabicRes.data.englishName,
      englishNameTranslation: arabicRes.data.englishNameTranslation,
      revelationType: arabicRes.data.revelationType,
      numberOfAyahs: arabicRes.data.numberOfAyahs,
      ayahs: arabAyahs.map((a, i) => ({
        ...a,
        translation: indoAyahs[i]?.text || "",
        progress: 0,
        duration: 0,
        currentTime: 0,
      })),
    });

    // Cek hash URL untuk navigasi ke ayat tertentu
    setTimeout(() => {
      const hash = window.location.hash;
      if (hash && hash.startsWith("#ayat")) {
        const ayatNumber = hash.replace("#ayat", "");
        if (ayatNumber) {
          scrollToAyat(ayatNumber);
        }
      }
    }, 500); // Beri waktu untuk render konten
  } catch (err) {
    console.error("Gagal fetch surah", err);
  } finally {
    loading.value = false; // ⬅️ matikan loading setelah selesai
  }
});

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60) || 0;
  const s = Math.floor(seconds % 60) || 0;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const togglePlay = (ayah) => {
  const audio = document.querySelector(
    `audio[data-id="${ayah.numberInSurah}"]`
  );

  if (activeAyah.value === ayah.numberInSurah && !audio.paused) {
    audio.pause();
    isPaused.value = true;
  } else {
    document.querySelectorAll("audio").forEach((a) => a.pause());

    audio.play();
    activeAyah.value = ayah.numberInSurah;
    currentAyah.value = ayah;
    isPaused.value = false;

    audio.onloadedmetadata = () => {
      ayah.duration = audio.duration;
    };
  }
};

const updateProgress = (ayah) => {
  const audio = document.querySelector(
    `audio[data-id="${ayah.numberInSurah}"]`
  );
  if (!audio) return;

  ayah.currentTime = audio.currentTime;
  ayah.progress = (audio.currentTime / audio.duration) * 100;
};

const resetPlayer = (ayah) => {
  ayah.progress = 0;
  ayah.currentTime = 0;
  isPaused.value = true;
  activeAyah.value = null;
  currentAyah.value = null;
};

function toTitleCase(str) {
  return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔑 surahName sebagai computed agar bisa dipakai di template
const surahName = computed(() => {
  const rawSlug = route.params.slug;
  return rawSlug ? toTitleCase(rawSlug.replace(/-/g, " ")) : "";
});

// 🔑 Title & meta otomatis update saat slug berubah
watchEffect(() => {
  useHead({
    title: `Surah ${surahName.value} : Arab dan Terjemahan Indonesia Lengkap | Portal Islam`,
    meta: [
      {
        name: "description",
        content: `Baca Surah ${surahName.value} lengkap dengan teks Arab dan arti bahasa Indonesia. Tersedia versi desktop & mobile yang ringan di Portal-Islam.com`,
      },
      {
        property: "og:title",
        content: `Surah ${surahName.value}`,
      },
      {
        property: "og:description",
        content: `Baca Surah ${surahName.value} lengkap dengan teks Arab dan terjemahan Indonesia.`,
      },
    ],
  });
});
</script>

<style>
.font-arabic {
  font-family: "Scheherazade New", serif;
}
</style>

<template>
  <!-- Navigasi Menu Sticky -->
  <div class="sticky top-0 left-0 right-0 z-10 bg-slate-50 shadow-sm">
    <div class="container max-w-4xl mx-auto">
      <div
        class="flex flex-col md:flex-row md:items-center md:justify-between p-4 rounded-lg">
        <div class="mb-3 md:mb-0">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:underline">
            ← Daftar surah
          </NuxtLink>
        </div>

        <!-- Navigasi Tengah (Surah dan Ayat dalam satu baris) -->
        <div class="flex items-center space-x-2">
          <select
            id="surah-select"
            class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            @change="changeSurah($event.target.value)"
            :value="id">
            <option v-for="s in surahList" :key="s.nomor" :value="s.nomor">
              {{ s.nama_latin }}
            </option>
          </select>
          <select
            id="ayat-select"
            class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            @change="scrollToAyat($event.target.value)">
            <option v-for="n in surah.numberOfAyahs" :key="n" :value="n">
              {{ n }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <div class="container max-w-4xl mx-auto p-6 mt-4">
    <!-- Konten utama -->

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
    </div>

    <!-- Header Surah -->
    <div
      class="w-full rounded-lg bg-slate-50 text-center py-6"
      v-if="surah.ayahs.length">
      <h1 class="text-3xl font-bold mb-2">
        {{ surahName }}
      </h1>
      <p class="text-xl font-semibold text-gray-500 mb-2">
        ({{ surah.englishNameTranslation }})
      </p>
      <h2 class="text-2xl font-arabic mb-2">{{ surah.name }}</h2>
      <p class="text-gray-500">
        {{ surah.revelationType }} • {{ surah.numberOfAyahs }} ayat
      </p>
    </div>

    <!-- List Ayat -->
    <div
      v-for="ayah in surah.ayahs"
      :key="ayah.numberInSurah"
      :id="`ayat${ayah.numberInSurah}`"
      :data-ayat="ayah.numberInSurah"
      class="border-b py-6">
      <div class="flex items-start gap-4">
        <!-- Nomor Ayat + Tombol Play -->
        <div class="flex flex-col items-center">
          <div
            class="w-10 h-10 flex items-center justify-center rounded-full border mb-2">
            {{ ayah.numberInSurah }}
          </div>
          <button
            @click="togglePlay(ayah)"
            class="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-700">
            <span v-if="activeAyah === ayah.numberInSurah && !isPaused"
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M10.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13A1.76 1.76 0 0 1 5.5 3.75h3a1.75 1.75 0 0 1 1.75 1.75m10 0v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13a1.76 1.76 0 0 1 1.75-1.75h3a1.75 1.75 0 0 1 1.75 1.75" /></svg
            ></span>
            <span v-else
              ><svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M19.105 11.446a2.34 2.34 0 0 1-.21 1c-.15.332-.38.62-.67.84l-9.65 7.51a2.3 2.3 0 0 1-1.17.46h-.23a2.2 2.2 0 0 1-1-.24a2.29 2.29 0 0 1-1.28-2v-14a2.2 2.2 0 0 1 .33-1.17a2.27 2.27 0 0 1 2.05-1.1c.412.02.812.148 1.16.37l9.66 6.44c.294.204.54.47.72.78c.19.34.29.721.29 1.11" /></svg
            ></span>
          </button>
        </div>

        <!-- Konten Ayat -->
        <div class="flex-1">
          <!-- Teks Arab -->
          <p
            class="text-2xl text-right font-arabic leading-loose mb-3 font-semibold">
            {{ ayah.text }}
          </p>

          <!-- Terjemahan Indonesia -->
          <p class="text-gray-700 mb-3 italic">
            {{ ayah.translation }}
          </p>

          <!-- Elemen audio hidden -->
          <audio
            ref="audioRefs"
            :data-id="ayah.numberInSurah"
            :src="ayah.audio"
            @timeupdate="updateProgress(ayah)"
            @ended="resetPlayer(ayah)"></audio>
        </div>
      </div>
    </div>
  </div>

  <!-- Player fixed bawah layar -->
  <div
    v-if="currentAyah"
    class="fixed bottom-0 left-0 right-0 bg-orange-100 p-4 shadow-lg border-t">
    <div class="flex items-center gap-4">
      <!-- Tombol Play/Pause -->
      <button
        @click="togglePlay(currentAyah)"
        class="p-3 bg-orange-500 text-white rounded-full hover:bg-orange-700">
        <span v-if="activeAyah === currentAyah.numberInSurah && !isPaused"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13A1.76 1.76 0 0 1 5.5 3.75h3a1.75 1.75 0 0 1 1.75 1.75m10 0v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13a1.76 1.76 0 0 1 1.75-1.75h3a1.75 1.75 0 0 1 1.75 1.75" /></svg
        ></span>
        <span v-else
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.105 11.446a2.34 2.34 0 0 1-.21 1c-.15.332-.38.62-.67.84l-9.65 7.51a2.3 2.3 0 0 1-1.17.46h-.23a2.2 2.2 0 0 1-1-.24a2.29 2.29 0 0 1-1.28-2v-14a2.2 2.2 0 0 1 .33-1.17a2.27 2.27 0 0 1 2.05-1.1c.412.02.812.148 1.16.37l9.66 6.44c.294.204.54.47.72.78c.19.34.29.721.29 1.11" /></svg
        ></span>
      </button>

      <!-- Info & Progress -->
      <div class="flex-1">
        <p class="text-sm font-semibold mb-1">
          Ayat {{ currentAyah.numberInSurah }}
        </p>
        <div class="h-2 bg-gray-300 rounded-full overflow-hidden">
          <div
            class="h-2 bg-orange-500"
            :style="{ width: currentAyah.progress + '%' }"></div>
        </div>
        <div class="flex justify-between text-xs text-gray-600 mt-1">
          <span>{{ formatTime(currentAyah.currentTime) }}</span>
          <span>{{ formatTime(currentAyah.duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
