<template>
  <div
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
    <div class="flex justify-around items-center h-16 px-2">
      <!-- Menu Beranda -->
      <NuxtLink
        to="/"
        class="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all duration-200"
        :class="
          isActive('/')
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        ">
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
        <span class="text-xs font-medium">Beranda</span>
      </NuxtLink>

      <!-- Menu Favorit -->
      <NuxtLink
        to="/favorites"
        class="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all duration-200 relative"
        :class="
          isActive('/favorites')
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        ">
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
            clip-rule="evenodd" />
        </svg>
        <span class="text-xs font-medium">Favorit</span>
        <span
          v-if="favoritesCount > 0"
          class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
          {{ favoritesCount > 99 ? "99+" : favoritesCount }}
        </span>
      </NuxtLink>

      <!-- Menu Hafalan (Coming Soon) -->
      <NuxtLink
        to="/hafalan"
        class="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all duration-200"
        :class="
          isActive('/hafalan')
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <span class="text-xs font-medium">Hafalan</span>
      </NuxtLink>

      <!-- Menu Jadwal Sholat -->
      <NuxtLink
        to="/jadwal-sholat"
        class="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all duration-200"
        :class="
          isActive('/jadwal-sholat')
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-6 h-6 mb-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs font-medium">Jadwal</span>
      </NuxtLink>

      <!-- Menu History -->
      <NuxtLink
        to="/history"
        class="flex flex-col items-center justify-center flex-1 py-2 px-3 rounded-lg transition-all duration-200"
        :class="
          isActive('/history')
            ? 'text-orange-600 bg-orange-50'
            : 'text-gray-600 hover:text-orange-600 hover:bg-gray-50'
        ">
        <svg class="w-6 h-6 mb-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
            clip-rule="evenodd" />
        </svg>
        <span class="text-xs font-medium">History</span>
      </NuxtLink>
    </div>

    <!-- Safe area for mobile -->
    <div class="h-4 bg-white"></div>
  </div>
</template>

<script setup>
const route = useRoute();
const { favorites } = useUserData();

const favoritesCount = computed(() => favorites.value.length);

const isActive = (path) => {
  if (path === "/") {
    return route.path === "/";
  }
  return route.path.startsWith(path);
};
</script>

<style scoped>
/* Ensure proper spacing for mobile */
@media (max-width: 640px) {
  .text-xs {
    font-size: 0.7rem;
  }
}
</style>
