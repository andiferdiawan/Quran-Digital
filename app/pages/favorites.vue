<template>
  <div class="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
    <!-- Header -->
    <div class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-5">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Ayat Favorit</h1>
            <p class="text-gray-600 mt-1">
              Kumpulan ayat yang Anda tandai untuk dibaca kembali
            </p>
          </div>
          <button
            v-if="favorites.length > 0"
            @click="showClearDialog = true"
            class="px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium">
            Hapus Semua
          </button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Empty State -->
      <div v-if="favorites.length === 0" class="text-center py-16">
        <div class="mb-6">
          <svg
            class="w-24 h-24 text-gray-300 mx-auto mb-4"
            fill="currentColor"
            viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              clip-rule="evenodd" />
          </svg>
          <h3 class="text-lg font-medium text-gray-900 mb-2">
            Belum ada ayat favorit
          </h3>
          <p class="text-gray-600 mb-6">
            Tambahkan ayat ke favorit dengan menekan tombol hati saat membaca
            Al-Quran.
          </p>
          <NuxtLink
            to="/"
            class="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
            Mulai Membaca
          </NuxtLink>
        </div>
      </div>

      <!-- Favorites List -->
      <div v-else class="space-y-4">
        <div
          v-for="(ayah, index) in favorites"
          :key="`${ayah.surahId}-${ayah.ayahNumber}`"
          class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
          <div class="p-6">
            <div class="flex justify-between items-start">
              <div>
                <p class="text-sm font-semibold text-green-700">
                  QS. {{ ayah.surahName }} : {{ ayah.ayahNumber }}
                </p>
                <p class="text-xs text-gray-500 mt-1">
                  Ditambahkan {{ formatDate(ayah.timestamp) }}
                </p>
              </div>
              <div class="flex items-center space-x-1">
                <button
                  @click="removeFavorite(ayah)"
                  class="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors duration-200"
                  title="Hapus dari Favorit">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fill-rule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clip-rule="evenodd" />
                  </svg>
                </button>
                <NuxtLink
                  :to="`/surah/${slugify(ayah.surahName)}/${ayah.surahId}#ayat${
                    ayah.ayahNumber
                  }`"
                  class="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors duration-200"
                  title="Baca Ayat">
                  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path
                      fill-rule="evenodd"
                      d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                      clip-rule="evenodd" />
                  </svg>
                </NuxtLink>
              </div>
            </div>

            <p
              class="text-right text-2xl md:text-3xl font-arabic leading-loose text-gray-800 my-5">
              {{ ayah.ayahText }}
            </p>

            <p class="text-gray-600 text-sm leading-relaxed">
              "{{ ayah.translation }}"
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Clear Dialog -->
    <div
      v-if="showClearDialog"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-lg p-6 max-w-sm w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-2">
          Hapus Semua Favorit?
        </h3>
        <p class="text-gray-600 mb-6">
          Anda yakin ingin menghapus semua ayat favorit? Tindakan ini tidak
          dapat dibatalkan.
        </p>
        <div class="flex space-x-3">
          <button
            @click="showClearDialog = false"
            class="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200">
            Batal
          </button>
          <button
            @click="handleClearAll"
            class="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200">
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUserData } from "~/composables/useUserData";

const { favorites, removeFromFavorites, clearAllFavorites } = useUserData();
const showClearDialog = ref(false);

const removeFavorite = (ayah) => {
  removeFromFavorites(ayah.surahId, ayah.ayahNumber);
};

const handleClearAll = () => {
  clearAllFavorites();
  showClearDialog.value = false;
};

const formatDate = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffMinutes < 1) {
    return "Baru saja";
  } else if (diffMinutes < 60) {
    return `${diffMinutes} menit yang lalu`;
  } else if (diffHours < 24) {
    return `${diffHours} jam yang lalu`;
  } else if (diffDays < 7) {
    return `${diffDays} hari yang lalu`;
  } else {
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
};

function slugify(text) {
  return text
    .toLowerCase()
    .normalize("NFD") // hilangkan aksen
    .replace(/[\u0300-\u036f]/g, "") // hapus diakritik
    .replace(/[^a-z0-9-\s]/g, "") // hapus selain huruf/angka/dash/spasi
    .trim()
    .replace(/\s+/g, "-"); // spasi → tanda -
}

// SEO
useHead({
  title: "Ayat Favorit - Al-Quran Online",
  meta: [
    {
      name: "description",
      content:
        "Kumpulan ayat favorit dari Al-Quran yang telah Anda tandai untuk dibaca kembali.",
    },
  ],
});
</script>

<style scoped>
.font-arabic {
  font-family: "Scheherazade New", serif;
  font-size: 18px;
  font-weight: 600;
}
</style>
