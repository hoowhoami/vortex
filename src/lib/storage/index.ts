import { PlayRecord, Favorite } from "@/types";
import { STORAGE_KEYS } from "@/lib/config";

// Storage abstraction layer
// Currently uses localStorage, can be extended to use Redis/Upstash
export class StorageService {
  // ==================== Play Records ====================

  /**
   * Get all play records
   */
  static getPlayRecords(): PlayRecord[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.PLAY_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save or update a play record
   */
  static savePlayRecord(record: Omit<PlayRecord, "lastPlayedAt">): void {
    if (typeof window === "undefined") return;

    const records = this.getPlayRecords();
    const existingIndex = records.findIndex((r) => r.videoId === record.videoId);

    const newRecord: PlayRecord = {
      ...record,
      lastPlayedAt: Date.now(),
    };

    if (existingIndex >= 0) {
      records[existingIndex] = newRecord;
    } else {
      records.unshift(newRecord);
    }

    // Keep only the last 100 records
    const limitedRecords = records.slice(0, 100);
    localStorage.setItem(STORAGE_KEYS.PLAY_RECORDS, JSON.stringify(limitedRecords));
  }

  /**
   * Get play record for a specific video
   */
  static getPlayRecord(videoId: string): PlayRecord | null {
    const records = this.getPlayRecords();
    return records.find((r) => r.videoId === videoId) || null;
  }

  /**
   * Delete a play record
   */
  static deletePlayRecord(videoId: string): void {
    if (typeof window === "undefined") return;

    const records = this.getPlayRecords().filter((r) => r.videoId !== videoId);
    localStorage.setItem(STORAGE_KEYS.PLAY_RECORDS, JSON.stringify(records));
  }

  /**
   * Clear all play records
   */
  static clearPlayRecords(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.PLAY_RECORDS);
  }

  // ==================== Favorites ====================

  /**
   * Get all favorites
   */
  static getFavorites(): Favorite[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.FAVORITES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add a video to favorites
   */
  static addFavorite(favorite: Omit<Favorite, "createdAt">): void {
    if (typeof window === "undefined") return;

    const favorites = this.getFavorites();
    const exists = favorites.some((f) => f.videoId === favorite.videoId);

    if (!exists) {
      const newFavorite: Favorite = {
        ...favorite,
        createdAt: Date.now(),
      };
      favorites.unshift(newFavorite);
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
    }
  }

  /**
   * Remove a video from favorites
   */
  static removeFavorite(videoId: string): void {
    if (typeof window === "undefined") return;

    const favorites = this.getFavorites().filter((f) => f.videoId !== videoId);
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
  }

  /**
   * Check if a video is favorited
   */
  static isFavorite(videoId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some((f) => f.videoId === videoId);
  }

  /**
   * Toggle favorite status
   */
  static toggleFavorite(favorite: Omit<Favorite, "createdAt">): boolean {
    if (this.isFavorite(favorite.videoId)) {
      this.removeFavorite(favorite.videoId);
      return false;
    } else {
      this.addFavorite(favorite);
      return true;
    }
  }

  /**
   * Clear all favorites
   */
  static clearFavorites(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.FAVORITES);
  }

  // ==================== Search History ====================

  /**
   * Get search history
   */
  static getSearchHistory(): string[] {
    if (typeof window === "undefined") return [];

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Add search keyword to history
   */
  static addSearchHistory(keyword: string): void {
    if (typeof window === "undefined") return;

    const history = this.getSearchHistory();
    const filtered = history.filter((h) => h !== keyword);
    filtered.unshift(keyword);

    // Keep only the last 10 searches
    const limitedHistory = filtered.slice(0, 10);
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(limitedHistory));
  }

  /**
   * Clear search history
   */
  static clearSearchHistory(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
  }
}
