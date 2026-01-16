<script setup>
import { ref, reactive, onMounted, watchEffect, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserData } from "~/composables/useUserData";
import { useLocalStorage } from "@vueuse/core";

const route = useRoute();
const router = useRouter();
const { id } = route.params;

const activeAyah = ref(null);
const isPaused = ref(true);
const audioRefs = ref([]);
const currentAyah = ref(null); // simpan ayat yang sedang aktif
const loading = ref(true);
const autoplayEnabled = ref(true); // kontrol autoplay
const autoScrollEnabled = ref(true); // kontrol auto-scroll

// Setting Font with Persistence
const showSettings = ref(false);
const showShareModal = ref(false);
const selectedAyahForShare = ref(null);
const arabicFontSize = useLocalStorage("quran-arabic-size", 32); // Default 32px
const translationFontSize = useLocalStorage("quran-trans-size", 18); // Default 18px

const surah = reactive({ ayahs: [] });

// Fungsi Share Modal
const openShareModal = (ayah) => {
  selectedAyahForShare.value = ayah;
  showShareModal.value = true;
};

const showToast = ref(false);

const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } catch (err) {
    console.error("Gagal menyalin teks", err);
  }
};

const shareToSocial = (platform) => {
  if (!selectedAyahForShare.value) return;

  const ayah = selectedAyahForShare.value;
  const text = `*${surah.name} : ${ayah.numberInSurah}*\n\n${ayah.text}\n\n"${ayah.translation}"\n\n(QS. ${surahName.value} : ${ayah.numberInSurah})\n\nSumber: ${window.location.origin}${route.path}#ayat${ayah.numberInSurah}`;
  const encodedText = encodeURIComponent(text);

  let url = "";
  switch (platform) {
    case "whatsapp":
      url = `https://wa.me/?text=${encodedText}`;
      break;
    case "facebook":
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`;
      break;
    case "twitter":
      url = `https://twitter.com/intent/tweet?text=${encodedText}`;
      break;
    case "copy":
      copyToClipboard(text);
      return;
  }

  if (url) window.open(url, "_blank");
  showShareModal.value = false;
};

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

    // Tambahkan ke riwayat bacaan
    addToHistory({
      surahId: surah.number,
      surahName: surah.nama_latin || surahName.value,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text,
      translation: ayah.translation,
      audio: ayah.audio,
      timestamp: Date.now(),
    });

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

  // Jika autoplay diaktifkan, putar ayat berikutnya
  if (autoplayEnabled.value && ayah.numberInSurah < surah.numberOfAyahs) {
    const nextAyahNumber = ayah.numberInSurah + 1;
    const nextAyah = surah.ayahs.find(
      (a) => a.numberInSurah === nextAyahNumber
    );

    if (nextAyah) {
      // Scroll ke ayat berikutnya jika auto-scroll diaktifkan
      if (autoScrollEnabled.value) {
        scrollToAyat(nextAyahNumber);
      }

      // Putar ayat berikutnya setelah sedikit jeda
      setTimeout(() => {
        togglePlay(nextAyah);
      }, 500);
      return;
    }
  }

  // Jika tidak ada ayat berikutnya atau autoplay dinonaktifkan
  isPaused.value = true;
  activeAyah.value = null;
  currentAyah.value = null;
};

// Fungsi favorit
const { addToHistory, addToFavorites, removeFromFavorites, isFavorite } =
  useUserData();

const addToFavorite = (ayah) => {
  // console.log(ayah);
  if (isFavorite(surah.number, ayah.numberInSurah)) {
    removeFromFavorites(surah.number, ayah.numberInSurah);
  } else {
    addToFavorites({
      surahId: surah.number,
      surahName: surah.nama_latin || surahName.value,
      ayahNumber: ayah.numberInSurah,
      ayahText: ayah.text,
      translation: ayah.translation,
      audio: ayah.audio,
      timestamp: Date.now(),
    });
  }
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

/* Backup dengan CSS scroll-margin */
[id^="ayat"] {
  scroll-margin-top: 120px;
}
</style>

<template>
  <!-- Navigasi Menu Sticky -->
  <div class="sticky top-0 left-0 right-0 z-10 bg-slate-50 shadow-sm">
    <div class="container max-w-4xl mx-auto">
      <div class="flex items-center justify-between p-4 rounded-lg">
        <div class="md:mb-0">
          <NuxtLink
            to="/"
            class="inline-flex items-center px-4 py-2 rounded-lg bg-orange-100 text-orange-600 text-sm font-medium hover:underline">
            ← <span class="hidden md:inline ml-1">Daftar surah</span>
          </NuxtLink>
        </div>

        <!-- Navigasi Tengah (Surah dan Ayat dalam satu baris) -->
        <div class="flex items-center space-x-2">
          <select
            id="surah-select"
            class="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 max-w-[120px] md:max-w-none truncate"
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

          <!-- Tombol Setting -->
          <button
            @click="showSettings = !showSettings"
            class="p-2 rounded-lg border bg-white hover:bg-gray-50 text-gray-600 transition-colors relative"
            title="Pengaturan Tampilan">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>

            <!-- Modal Setting -->
            <div
              v-if="showSettings"
              class="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-50"
              @click.stop>
              <div class="flex justify-between items-center mb-4">
                <h3 class="font-bold text-gray-800">Tampilan Ayat</h3>
                <button
                  @click="showSettings = false"
                  class="text-gray-400 hover:text-gray-600">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <!-- Ukuran Font Arab -->
              <div class="mb-4">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Ukuran Arab</span>
                  <span>{{ arabicFontSize }}px</span>
                </div>
                <input
                  type="range"
                  v-model="arabicFontSize"
                  min="24"
                  max="60"
                  step="2"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                <div
                  class="text-right font-arabic mt-1 text-gray-800"
                  :style="{ fontSize: `${arabicFontSize}px` }">
                  بِسْمِ اللّٰهِ
                </div>
              </div>

              <!-- Ukuran Font Terjemahan -->
              <div class="mb-2">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Ukuran Terjemahan</span>
                  <span>{{ translationFontSize }}px</span>
                </div>
                <input
                  type="range"
                  v-model="translationFontSize"
                  min="14"
                  max="30"
                  step="1"
                  class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500" />
                <div
                  class="mt-1 text-gray-600"
                  :style="{ fontSize: `${translationFontSize}px` }">
                  Dengan nama Allah
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>

  <div class="container max-w-4xl mx-auto mt-4 bg-white">
    <!-- Konten utama -->

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div
        class="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-500 border-solid"></div>
    </div>

    <!-- Header Surah -->
    <div
      class="w-full rounded-lg bg-white text-center py-6"
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
      class="border-b py-6 transition-colors duration-300"
      :class="{
        'bg-orange-50': activeAyah === ayah.numberInSurah && !isPaused,
      }">
      <!-- Container Utama -->
      <div class="flex flex-col gap-4">
        <!-- Header Ayat (Nomor + Tombol Aksi) -->
        <div class="flex items-center gap-3 border-b border-gray-100 pb-3 mb-2">
          <div
            class="w-10 h-10 ml-4 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-200 shadow-sm">
            {{ ayah.numberInSurah }}
          </div>

          <div class="flex items-center gap-1">
            <button
              @click="togglePlay(ayah)"
              class="p-2 rounded-full text-gray-500 hover:bg-orange-100 hover:text-orange-600 transition-all duration-200"
              title="Putar Audio">
              <span v-if="activeAyah === ayah.numberInSurah && !isPaused">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M10.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13A1.76 1.76 0 0 1 5.5 3.75h3a1.75 1.75 0 0 1 1.75 1.75m10 0v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13a1.76 1.76 0 0 1 1.75-1.75h3a1.75 1.75 0 0 1 1.75 1.75" />
                </svg>
              </span>
              <span v-else>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19.105 11.446a2.34 2.34 0 0 1-.21 1c-.15.332-.38.62-.67.84l-9.65 7.51a2.3 2.3 0 0 1-1.17.46h-.23a2.2 2.2 0 0 1-1-.24a2.29 2.29 0 0 1-1.28-2v-14a2.2 2.2 0 0 1 .33-1.17a2.27 2.27 0 0 1 2.05-1.1c.412.02.812.148 1.16.37l9.66 6.44c.294.204.54.47.72.78c.19.34.29.721.29 1.11" />
                </svg>
              </span>
            </button>

            <button
              @click="addToFavorite(ayah)"
              class="p-2 rounded-full transition-colors duration-200"
              :class="
                isFavorite(surah.number, ayah.numberInSurah)
                  ? 'text-red-500 bg-red-50'
                  : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
              "
              :title="
                isFavorite(surah.number, ayah.numberInSurah)
                  ? 'Hapus dari favorit'
                  : 'Tambahkan ke favorit'
              ">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                  clip-rule="evenodd" />
              </svg>
            </button>

            <!-- Tombol Tafsir -->
            <NuxtLink
              :to="`/surah/${route.params.slug}/${id}/tafsir/${ayah.numberInSurah}`"
              class="p-2 rounded-full text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors duration-200"
              title="Lihat Tafsir">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </NuxtLink>

            <!-- Tombol Share -->
            <button
              @click="openShareModal(ayah)"
              class="p-2 rounded-full text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors duration-200"
              title="Bagikan Ayat">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Konten Ayat (Arab & Terjemahan) -->
        <div class="flex-1 pl-2">
          <!-- Teks Arab -->
          <p
            class="text-right px-4 font-arabic leading-loose mb-6 font-semibold text-gray-800"
            dir="rtl"
            :style="{ fontSize: `${arabicFontSize}px` }">
            {{ ayah.text }}
          </p>

          <!-- Terjemahan Indonesia -->
          <p
            class="text-gray-600 italic px-4 leading-relaxed"
            :style="{ fontSize: `${translationFontSize}px` }">
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

  <!-- Player fixed bawah layar - Modern Design -->
  <div
    v-if="currentAyah"
    class="fixed bottom-[80px] left-0 right-0 bg-white p-4 md:p-6 shadow-2xl border-t border-gray-200 backdrop-blur-sm bg-opacity-95">
    <div class="flex items-center gap-4 md:gap-6 max-w-4xl mx-auto">
      <!-- Tombol Play/Pause Modern -->
      <button
        @click="togglePlay(currentAyah)"
        class="p-3 md:p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
        <span v-if="activeAyah === currentAyah.numberInSurah && !isPaused">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            class="md:w-7 md:h-7 drop-shadow-sm"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M10.25 5.5v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13A1.76 1.76 0 0 1 5.5 3.75h3a1.75 1.75 0 0 1 1.75 1.75m10 0v13a1.75 1.75 0 0 1-1.75 1.75h-3a1.75 1.75 0 0 1-1.75-1.75v-13a1.76 1.76 0 0 1 1.75-1.75h3a1.75 1.75 0 0 1 1.75 1.75" />
          </svg>
        </span>
        <span v-else>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            class="md:w-7 md:h-7 drop-shadow-sm"
            viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M19.105 11.446a2.34 2.34 0 0 1-.21 1c-.15.332-.38.62-.67.84l-9.65 7.51a2.3 2.3 0 0 1-1.17.46h-.23a2.2 2.2 0 0 1-1-.24a2.29 2.29 0 0 1-1.28-2v-14a2.2 2.2 0 0 1 .33-1.17a2.27 2.27 0 0 1 2.05-1.1c.412.02.812.148 1.16.37l9.66 6.44c.294.204.54.47.72.78c.19.34.29.721.29 1.11" />
          </svg>
        </span>
      </button>

      <!-- Info & Progress Modern -->
      <div class="flex-1">
        <div class="flex items-center justify-between mb-2 md:mb-3">
          <p class="text-base md:text-lg font-bold text-gray-800">
            Ayat {{ currentAyah.numberInSurah }}
          </p>
          <div
            class="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
            <span>{{ formatTime(currentAyah.currentTime) }}</span>
            <span class="text-gray-400">/</span>
            <span>{{ formatTime(currentAyah.duration) }}</span>
          </div>
        </div>

        <!-- Progress Bar Modern -->
        <div
          class="h-2 md:h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div
            class="h-2 md:h-3 bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 ease-out"
            :style="{ width: `${currentAyah.progress}%` }"></div>
        </div>
      </div>

      <!-- Kontrol Autoplay dan Auto-scroll Modern -->
      <div class="flex items-center gap-4 md:gap-6">
        <!-- Autoplay Toggle -->
        <div class="flex flex-col items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="autoplayEnabled"
              class="sr-only peer" />
            <div
              class="w-9 h-5 md:w-11 md:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
          <span class="text-xs font-medium text-gray-600 mt-1 md:mt-2"
            >Autoplay</span
          >
        </div>

        <!-- Auto-scroll Toggle -->
        <div class="flex flex-col items-center">
          <label class="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              v-model="autoScrollEnabled"
              class="sr-only peer" />
            <div
              class="w-9 h-5 md:w-11 md:h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
          </label>
          <span class="text-xs font-medium text-gray-600 mt-1 md:mt-2"
            >Auto-scroll</span
          >
        </div>
      </div>
    </div>
  </div>
  <!-- Toast Notification -->
  <div
    v-if="showToast"
    class="fixed top-20 right-4 z-[60] bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 flex items-center gap-2 animate-fade-in-down">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-5 w-5 text-green-400"
      viewBox="0 0 20 20"
      fill="currentColor">
      <path
        fill-rule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clip-rule="evenodd" />
    </svg>
    <span>Teks berhasil disalin!</span>
  </div>

  <!-- Modal Share Social Media -->
  <div
    v-if="showShareModal"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    @click="showShareModal = false">
    <div
      class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 transform transition-all scale-100"
      @click.stop>
      <div class="flex justify-between items-center mb-6">
        <h3 class="text-xl font-bold text-gray-800">Bagikan Ayat</h3>
        <button
          @click="showShareModal = false"
          class="text-gray-400 hover:text-gray-600 transition-colors">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="space-y-4">
        <button
          @click="shareToSocial('whatsapp')"
          class="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 transition-all group">
          <div
            class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 mr-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M19.05 4.91A9.82 9.82 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.15-2.9-7.02m-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.02 4.54-3.68 8.23-8.22 8.23m4.52-6.16c-.25-.12-1.47-.72-1.69-.81c-.23-.08-.39-.12-.56.12c-.17.25-.64.81-.78.97c-.14.17-.29.19-.54.06c-.25-.12-1.05-.39-1.99-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.14-.25-.02-.38.11-.51c.11-.11.25-.29.37-.43s.17-.25.25-.41c.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31s-.88.86-.88 2.09c0 1.23.89 2.42 1.02 2.61s1.76 2.68 4.26 3.76c.59.25 1.05.4 1.41.52c.61.19 1.16.16 1.59.1c.48-.07 1.47-.6 1.67-1.18c.21-.58.21-1.07.14-1.18s-.27-.16-.51-.28" />
            </svg>
          </div>
          <span class="font-medium text-gray-700 group-hover:text-green-700"
            >WhatsApp</span
          >
        </button>

        <button
          @click="shareToSocial('facebook')"
          class="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 transition-all group">
          <div
            class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mr-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4z" />
            </svg>
          </div>
          <span class="font-medium text-gray-700 group-hover:text-blue-700"
            >Facebook</span
          >
        </button>

        <button
          @click="shareToSocial('twitter')"
          class="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:bg-sky-50 hover:border-sky-200 transition-all group">
          <div
            class="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-500 mr-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.46 6c-.77.35-1.6.58-2.46.69c.88-.53 1.56-1.37 1.88-2.38c-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29c0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15c0 1.49.75 2.81 1.91 3.56c-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.2 4.2 0 0 1-1.93.07a4.28 4.28 0 0 0 4 2.98a8.52 8.52 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21C16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56c.84-.6 1.56-1.36 2.14-2.23" />
            </svg>
          </div>
          <span class="font-medium text-gray-700 group-hover:text-sky-700"
            >Twitter / X</span
          >
        </button>

        <button
          @click="shareToSocial('copy')"
          class="w-full flex items-center p-4 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all group">
          <div
            class="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 mr-4 group-hover:scale-110 transition-transform">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2m0 16H8V7h11z" />
            </svg>
          </div>
          <div class="text-left">
            <span
              class="block font-medium text-gray-700 group-hover:text-gray-900"
              >Salin Teks</span
            >
            <span class="text-xs text-gray-500">Arab, Terjemahan & Link</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
