export interface FavoriteAyah {
  surahId: number;
  surahName: string;
  surahSlug: string;
  ayahNumber: number;
  ayahText: string;
  translation: string;
  timestamp: number;
}

export interface HistoryAyah {
  surahId: number;
  surahName: string;
  surahSlug: string;
  ayahNumber: number;
  ayahText: string;
  translation: string;
  timestamp: number;
}

export const useUserData = () => {
  // Favorites
  const favorites = useState<FavoriteAyah[]>("favorites", () => []);

  const addToFavorites = (ayah: Omit<FavoriteAyah, "timestamp">) => {
    const existing = favorites.value.find(
      (fav) =>
        fav.surahId === ayah.surahId && fav.ayahNumber === ayah.ayahNumber
    );

    if (!existing) {
      favorites.value.unshift({
        ...ayah,
        timestamp: Date.now(),
      });
      // Save to localStorage
      if (process.client) {
        localStorage.setItem(
          "quran-favorites",
          JSON.stringify(favorites.value)
        );
      }
    }
  };

  const removeFromFavorites = (surahId: number, ayahNumber: number) => {
    favorites.value = favorites.value.filter(
      (fav) => !(fav.surahId === surahId && fav.ayahNumber === ayahNumber)
    );
    if (process.client) {
      localStorage.setItem("quran-favorites", JSON.stringify(favorites.value));
    }
  };

  const isFavorite = (surahId: number, ayahNumber: number) => {
    return favorites.value.some(
      (fav) => fav.surahId === surahId && fav.ayahNumber === ayahNumber
    );
  };

  const clearAllFavorites = () => {
    favorites.value = [];
    if (process.client) {
      localStorage.removeItem("quran-favorites");
    }
  };

  // History
  const history = useState<HistoryAyah[]>("history", () => []);

  const addToHistory = (ayah: Omit<HistoryAyah, "timestamp">) => {
    // Hanya simpan 1 ayat terakhir yang dibaca
    history.value = [
      {
        ...ayah,
        timestamp: Date.now(),
      },
    ];

    if (process.client) {
      localStorage.setItem("quran-history", JSON.stringify(history.value));
    }
  };

  const clearHistory = () => {
    history.value = [];
    if (process.client) {
      localStorage.removeItem("quran-history");
    }
  };

  // Load from localStorage on client
  if (process.client) {
    const savedFavorites = localStorage.getItem("quran-favorites");
    const savedHistory = localStorage.getItem("quran-history");

    if (savedFavorites) {
      try {
        favorites.value = JSON.parse(savedFavorites);
      } catch (e) {
        console.error("Failed to load favorites from localStorage");
      }
    }

    if (savedHistory) {
      try {
        history.value = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to load history from localStorage");
      }
    }
  }

  return {
    favorites: readonly(favorites),
    history: readonly(history),
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    clearAllFavorites,
    addToHistory,
    clearHistory,
  };
};
