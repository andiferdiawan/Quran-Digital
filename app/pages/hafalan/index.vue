<script setup>
useHead({
  title: "Tracking Hafalan Al-Quran | Quran Online",
  meta: [
    {
      name: "description",
      content:
        "Fitur Tracking Hafalan Al-Quran akan segera hadir untuk membantu Anda memantau progres hafalan.",
    },
  ],
});
</script>

<template>
  <div
    class="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
    <div
      class="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-gray-100 relative overflow-hidden">
      <!-- Decorative Elements -->
      <div
        class="absolute top-0 right-0 w-32 h-32 bg-orange-100 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
      <div
        class="absolute bottom-0 left-0 w-24 h-24 bg-orange-50 rounded-tr-full -ml-8 -mb-8 opacity-50"></div>

      <div class="relative z-10">
        <div
          class="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>

        <h1 class="text-2xl font-bold text-gray-800 mb-3">Hafalan Al-Quran</h1>
        <p class="text-gray-500 mb-8 leading-relaxed">
          Fitur tracking hafalan sedang dalam pengembangan. Insya Allah segera
          hadir untuk menemani perjalanan menghafal Anda.
        </p>

        <div
          class="inline-flex items-center px-4 py-2 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium">
          <span class="flex h-2 w-2 relative mr-2">
            <span
              class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span
              class="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Coming Soon
        </div>
      </div>
    </div>
  </div>
</template>
