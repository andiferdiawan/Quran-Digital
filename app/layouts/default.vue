<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="pb-20">
      <slot />
    </main>

    <!-- Bottom Navigation -->
    <BottomNavigation />

    <!-- Footer -->
    <footer
      class="bg-white text-gray-600 py-4 text-center border-t border-gray-200">
      <p class="text-sm">&copy; 2025 Portal-Islam. Semua hak dilindungi.</p>
    </footer>
  </div>
</template>

<script setup>
// Layout ini akan digunakan secara default oleh semua pages
</script>
