<script setup>
import { ref, onMounted, computed, watch } from "vue";
import { useLocalStorage } from "@vueuse/core";

useHead({
  title: "Jadwal Sholat | Quran Online",
  meta: [
    {
      name: "description",
      content: "Jadwal Sholat Lengkap Seluruh Indonesia",
    },
  ],
});

// State
const loading = ref(true);
const showLocationModal = ref(false);
const provinsiList = ref([]);
const kabKotaList = ref([]);
const jadwalData = ref(null);

// Persist Location
const userLocation = useLocalStorage("quran-user-location", {
  provinsi: "",
  kabKota: "",
});

// Selection State
const selectedProvinsi = ref(userLocation.value.provinsi || "");
const selectedKabKota = ref(userLocation.value.kabKota || "");

// Date State
const currentDate = ref(new Date());
const currentMonth = ref(currentDate.value.getMonth() + 1);
const currentYear = ref(currentDate.value.getFullYear());

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Helper: Format Time
const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  return timeStr;
};

// Helper: Get Day Name
const getDayName = (dateStr) => {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  const date = new Date(dateStr);
  return days[date.getDay()];
};

// API Calls
const fetchProvinces = async () => {
  try {
    const res = await $fetch("https://equran.id/api/v2/shalat/provinsi");
    if (res && res.data) {
      provinsiList.value = res.data;
    }
  } catch (err) {
    console.error("Error fetching provinces:", err);
  }
};

const fetchKabKota = async (provinsiName) => {
  try {
    const res = await $fetch("https://equran.id/api/v2/shalat/kabkota", {
      method: "POST",
      body: { provinsi: provinsiName },
    });
    if (res && res.data) {
      kabKotaList.value = res.data;
    }
  } catch (err) {
    console.error("Error fetching cities:", err);
  }
};

const fetchJadwal = async () => {
  if (!userLocation.value.provinsi || !userLocation.value.kabKota) return;

  loading.value = true;
  try {
    const res = await $fetch("https://equran.id/api/v2/shalat", {
      method: "POST",
      body: {
        provinsi: userLocation.value.provinsi,
        kabkota: userLocation.value.kabKota,
        bulan: currentMonth.value,
        tahun: currentYear.value,
      },
    });

    if (res && res.data) {
      jadwalData.value = res.data;
    }
  } catch (err) {
    console.error("Error fetching schedule:", err);
  } finally {
    loading.value = false;
  }
};

// Logic: Countdown & Next Prayer
const now = ref(new Date());
const nextPrayer = ref(null);
const countdown = ref("");

const prayerNames = ["Subuh", "Dzuhur", "Ashar", "Maghrib", "Isya"];

const updateCountdown = () => {
  now.value = new Date();

  if (!jadwalData.value || !jadwalData.value.jadwal) return;

  // Find today's schedule
  const todayStr = now.value.toISOString().split("T")[0];
  const todaySchedule = jadwalData.value.jadwal.find(
    (j) => j.tanggal_lengkap === todayStr
  );

  if (!todaySchedule) return;

  const prayers = [
    { name: "Subuh", time: todaySchedule.subuh },
    { name: "Dzuhur", time: todaySchedule.dzuhur },
    { name: "Ashar", time: todaySchedule.ashar },
    { name: "Maghrib", time: todaySchedule.maghrib },
    { name: "Isya", time: todaySchedule.isya },
  ];

  let foundNext = false;

  for (const prayer of prayers) {
    const [hours, minutes] = prayer.time.split(":").map(Number);
    const prayerDate = new Date(now.value);
    prayerDate.setHours(hours, minutes, 0, 0);

    if (prayerDate > now.value) {
      nextPrayer.value = prayer;

      // Calculate diff
      const diff = prayerDate - now.value;
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      countdown.value = `${h.toString().padStart(2, "0")} : ${m
        .toString()
        .padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
      foundNext = true;
      break;
    }
  }

  if (!foundNext) {
    // Next prayer is Subuh tomorrow (simplified logic for now)
    nextPrayer.value = { name: "Subuh", time: "Besok" };
    countdown.value = "-- : -- : --";
  }
};

let timer;

// Handlers
const openLocationModal = async () => {
  await fetchProvinces();
  if (selectedProvinsi.value) {
    await fetchKabKota(selectedProvinsi.value);
  }
  showLocationModal.value = true;
};

const handleProvinsiChange = async () => {
  selectedKabKota.value = "";
  if (selectedProvinsi.value) {
    await fetchKabKota(selectedProvinsi.value);
  }
};

const saveLocation = () => {
  if (selectedProvinsi.value && selectedKabKota.value) {
    userLocation.value = {
      provinsi: selectedProvinsi.value,
      kabKota: selectedKabKota.value,
    };
    showLocationModal.value = false;
    fetchJadwal();
  }
};

const changeMonth = (delta) => {
  let newMonth = currentMonth.value + delta;
  let newYear = currentYear.value;

  if (newMonth > 12) {
    newMonth = 1;
    newYear++;
  } else if (newMonth < 1) {
    newMonth = 12;
    newYear--;
  }

  currentMonth.value = newMonth;
  currentYear.value = newYear;
  fetchJadwal();
};

const selectMonth = (index) => {
  currentMonth.value = index + 1;
  fetchJadwal();
};

// Lifecycle
onMounted(async () => {
  timer = setInterval(updateCountdown, 1000);

  if (!userLocation.value.provinsi) {
    await openLocationModal();
  } else {
    selectedProvinsi.value = userLocation.value.provinsi;
    selectedKabKota.value = userLocation.value.kabKota;
    fetchJadwal();
  }
});

watch(jadwalData, () => {
  updateCountdown();
});
</script>

<template>
  <div class="min-h-screen bg-slate-50 pb-24">
    <!-- Header Card -->
    <div
      class="bg-orange-500 text-white rounded-b-3xl shadow-lg p-6 relative overflow-hidden">
      <!-- Pattern -->
      <div
        class="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20"></div>
      <div
        class="absolute bottom-0 left-0 w-40 h-40 bg-white opacity-5 rounded-full -ml-10 -mb-10"></div>

      <div class="relative z-10">
        <!-- Location & Date -->
        <div class="flex justify-between items-start mb-6">
          <div>
            <h1
              class="font-bold text-lg flex items-center gap-2 cursor-pointer"
              @click="openLocationModal">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clip-rule="evenodd" />
              </svg>
              {{ userLocation.kabKota || "Pilih Lokasi" }}
            </h1>
            <p class="text-orange-100 text-sm ml-7">
              {{ userLocation.provinsi }}
            </p>
            <p class="text-orange-100 text-sm ml-7 mt-1">
              {{ months[currentMonth - 1] }} {{ currentYear }} •
              {{ jadwalData?.jadwal?.length || 30 }} Hari
            </p>
          </div>
          <button
            class="bg-white/20 p-2 rounded-lg hover:bg-white/30 transition-colors"
            @click="openLocationModal">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>

        <!-- Countdown -->
        <div class="text-center mb-8">
          <p class="text-orange-100 text-sm font-medium mb-1">
            Shalat Berikutnya
          </p>
          <h2 class="text-3xl font-bold mb-2">
            {{ nextPrayer?.name || "..." }}
          </h2>
          <div class="text-4xl font-mono font-bold tracking-wider mb-2">
            {{ countdown || "-- : -- : --" }}
          </div>
          <p class="text-orange-100 text-sm">
            {{ nextPrayer?.time || "--:--" }}
          </p>
        </div>

        <!-- Current Time -->
        <div
          class="flex justify-center items-center gap-2 text-orange-100 text-sm bg-orange-600/30 py-2 px-4 rounded-full w-max mx-auto">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Sekarang {{ now.toLocaleTimeString("id-ID", { hour12: false }) }}
        </div>
      </div>
    </div>

    <div class="container max-w-4xl mx-auto px-4 -mt-6 relative z-20">
      <!-- Today's Schedule Card -->
      <div
        class="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-orange-100">
        <h3 class="text-center font-bold text-gray-800 mb-1">
          Jadwal Shalat Hari Ini
        </h3>
        <p class="text-center text-gray-500 text-sm mb-6">
          {{ getDayName(now) }},
          {{
            now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }}
        </p>

        <div class="grid grid-cols-5 gap-2 text-center">
          <div
            v-for="(time, name) in {
              Subuh: jadwalData?.jadwal?.find(
                (j) => j.tanggal_lengkap === now.toISOString().split('T')[0]
              )?.subuh,
              Dzuhur: jadwalData?.jadwal?.find(
                (j) => j.tanggal_lengkap === now.toISOString().split('T')[0]
              )?.dzuhur,
              Ashar: jadwalData?.jadwal?.find(
                (j) => j.tanggal_lengkap === now.toISOString().split('T')[0]
              )?.ashar,
              Maghrib: jadwalData?.jadwal?.find(
                (j) => j.tanggal_lengkap === now.toISOString().split('T')[0]
              )?.maghrib,
              Isya: jadwalData?.jadwal?.find(
                (j) => j.tanggal_lengkap === now.toISOString().split('T')[0]
              )?.isya,
            }"
            :key="name"
            class="flex flex-col items-center">
            <span class="text-xs text-gray-500 mb-1">{{ name }}</span>
            <span class="font-bold text-gray-800 text-sm sm:text-base">{{
              time || "--:--"
            }}</span>
          </div>
        </div>
      </div>

      <!-- Month Selection -->
      <div class="mb-6">
        <h3 class="font-bold text-gray-800 mb-4">Pilih Bulan</h3>
        <div class="relative group">
          <!-- Scroll Buttons -->
          <div
            class="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-slate-50 to-transparent w-8 z-10 pointer-events-none"></div>
          <div
            class="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-slate-50 to-transparent w-8 z-10 pointer-events-none"></div>

          <div
            class="flex overflow-x-auto gap-3 pb-4 scrollbar-hide px-1 snap-x">
            <button
              v-for="(month, index) in months"
              :key="index"
              @click="selectMonth(index)"
              class="px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all snap-center flex-shrink-0"
              :class="
                currentMonth === index + 1
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-200 transform scale-105'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-orange-50 hover:border-orange-200'
              ">
              {{ month }}
            </button>
          </div>
        </div>
      </div>

      <!-- Monthly Schedule Table -->
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
        <div
          class="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center sticky left-0 right-0 z-20">
          <h3 class="font-bold text-gray-800">
            Jadwal Lengkap {{ months[currentMonth - 1] }} {{ currentYear }}
          </h3>
        </div>

        <div class="overflow-x-auto relative">
          <table class="w-full text-sm text-left border-collapse">
            <thead class="text-xs text-gray-500 uppercase bg-gray-50">
              <tr>
                <th
                  class="px-4 py-3 text-center sticky left-0 bg-gray-50 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  Tgl
                </th>
                <th class="px-4 py-3 min-w-[80px]">Imsak</th>
                <th
                  class="px-4 py-3 min-w-[80px] font-bold text-orange-600 bg-orange-50/30">
                  Subuh
                </th>
                <th class="px-4 py-3 min-w-[80px]">Terbit</th>
                <th class="px-4 py-3 min-w-[80px]">Dhuha</th>
                <th
                  class="px-4 py-3 min-w-[80px] font-bold text-orange-600 bg-orange-50/30">
                  Dzuhur
                </th>
                <th
                  class="px-4 py-3 min-w-[80px] font-bold text-orange-600 bg-orange-50/30">
                  Ashar
                </th>
                <th
                  class="px-4 py-3 min-w-[80px] font-bold text-orange-600 bg-orange-50/30">
                  Maghrib
                </th>
                <th
                  class="px-4 py-3 min-w-[80px] font-bold text-orange-600 bg-orange-50/30">
                  Isya
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading" class="bg-white border-b">
                <td colspan="9" class="px-4 py-12 text-center text-gray-500">
                  <div class="flex justify-center items-center gap-2">
                    <div
                      class="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
                    Memuat jadwal...
                  </div>
                </td>
              </tr>
              <tr
                v-else-if="!jadwalData?.jadwal?.length"
                class="bg-white border-b">
                <td colspan="9" class="px-4 py-12 text-center text-gray-500">
                  Data tidak tersedia
                </td>
              </tr>
              <tr
                v-else
                v-for="(day, index) in jadwalData.jadwal"
                :key="index"
                class="border-b hover:bg-orange-50 transition-colors group"
                :class="
                  day.tanggal_lengkap === now.toISOString().split('T')[0]
                    ? 'bg-orange-50'
                    : 'bg-white'
                ">
                <td
                  class="px-4 py-3 text-center font-medium sticky left-0 z-10 border-r border-gray-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] transition-colors group-hover:bg-orange-50"
                  :class="
                    day.tanggal_lengkap === now.toISOString().split('T')[0]
                      ? 'bg-orange-50'
                      : 'bg-white'
                  ">
                  <div class="font-bold text-gray-800">{{ day.tanggal }}</div>
                  <div
                    class="text-[10px] uppercase tracking-wider text-gray-500">
                    {{ day.hari.substring(0, 3) }}
                  </div>
                </td>
                <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {{ day.imsak }}
                </td>
                <td
                  class="px-4 py-3 font-bold text-gray-800 bg-orange-50/30 whitespace-nowrap group-hover:bg-transparent transition-colors">
                  {{ day.subuh }}
                </td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {{ day.terbit }}
                </td>
                <td class="px-4 py-3 text-gray-500 whitespace-nowrap">
                  {{ day.dhuha }}
                </td>
                <td
                  class="px-4 py-3 font-bold text-gray-800 bg-orange-50/30 whitespace-nowrap group-hover:bg-transparent transition-colors">
                  {{ day.dzuhur }}
                </td>
                <td
                  class="px-4 py-3 font-bold text-gray-800 bg-orange-50/30 whitespace-nowrap group-hover:bg-transparent transition-colors">
                  {{ day.ashar }}
                </td>
                <td
                  class="px-4 py-3 font-bold text-gray-800 bg-orange-50/30 whitespace-nowrap group-hover:bg-transparent transition-colors">
                  {{ day.maghrib }}
                </td>
                <td
                  class="px-4 py-3 font-bold text-gray-800 bg-orange-50/30 whitespace-nowrap group-hover:bg-transparent transition-colors">
                  {{ day.isya }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Location Modal -->
    <div
      v-if="showLocationModal"
      class="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4">
      <div
        class="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div
          class="p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50">
          <h3 class="font-bold text-xl text-gray-800">Pilih Lokasi</h3>
          <button
            v-if="userLocation.provinsi"
            @click="showLocationModal = false"
            class="text-gray-400 hover:text-gray-600">
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

        <div class="p-6 overflow-y-auto flex-1">
          <div class="space-y-4">
            <!-- Provinsi -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Provinsi</label
              >
              <select
                v-model="selectedProvinsi"
                @change="handleProvinsiChange"
                class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all">
                <option value="" disabled>Pilih Provinsi</option>
                <option v-for="prov in provinsiList" :key="prov" :value="prov">
                  {{ prov }}
                </option>
              </select>
            </div>

            <!-- Kab/Kota -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2"
                >Kabupaten / Kota</label
              >
              <select
                v-model="selectedKabKota"
                :disabled="!selectedProvinsi"
                class="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                <option value="" disabled>Pilih Kota/Kabupaten</option>
                <option v-for="kota in kabKotaList" :key="kota" :value="kota">
                  {{ kota }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-gray-100 bg-gray-50">
          <button
            @click="saveLocation"
            :disabled="!selectedProvinsi || !selectedKabKota"
            class="w-full py-3.5 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd" />
            </svg>
            Simpan Lokasi
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
