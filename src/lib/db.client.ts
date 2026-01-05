/* eslint-disable no-console, @typescript-eslint/no-explicit-any */
"use client";

/**
 * Client-side database utilities (browser only).
 * Hybrid caching strategy for optimal UX:
 * - LocalStorage mode: Direct localStorage operations
 * - Database mode: localStorage cache + API sync
 *
 * Features:
 * 1. Optimistic updates (update cache immediately, sync to server async)
 * 2. Stale-while-revalidate pattern (return cache, update in background)
 * 3. Automatic error handling and retry
 * 4. CustomEvent system for reactive updates
 */

import { getAuthInfoFromBrowserCookie } from "./auth";
import { DbFavorite, DbPlayRecord, SkipConfig } from "./db/types";

// Global error trigger
function triggerGlobalError(message: string) {
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("globalError", {
        detail: { message },
      })
    );
  }
}

// Cache data structure
interface CacheData<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface UserCacheStore {
  playRecords?: CacheData<Record<string, DbPlayRecord>>;
  favorites?: CacheData<Record<string, DbFavorite>>;
  searchHistory?: CacheData<string[]>;
  skipConfigs?: CacheData<Record<string, SkipConfig>>;
}

// Constants
const PLAY_RECORDS_KEY = "vortex_play_records";
const FAVORITES_KEY = "vortex_favorites";
const SEARCH_HISTORY_KEY = "vortex_search_history";

// Cache constants
const CACHE_PREFIX = "vortex_cache_";
const CACHE_VERSION = "1.0.0";
const CACHE_EXPIRE_TIME = 60 * 60 * 1000; // 1 hour

// Storage type from environment
const STORAGE_TYPE = (() => {
  if (typeof window === "undefined") return "localstorage";
  const raw =
    (window as any).RUNTIME_CONFIG?.STORAGE_TYPE ||
    process.env.NEXT_PUBLIC_STORAGE_TYPE ||
    "localstorage";
  return raw as "localstorage" | "redis" | "upstash" | "kvrocks";
})();

// Search history limit
const SEARCH_HISTORY_LIMIT = 20;

// Hybrid Cache Manager
class HybridCacheManager {
  private static instance: HybridCacheManager;

  static getInstance(): HybridCacheManager {
    if (!HybridCacheManager.instance) {
      HybridCacheManager.instance = new HybridCacheManager();
    }
    return HybridCacheManager.instance;
  }

  private getCurrentUsername(): string | null {
    const authInfo = getAuthInfoFromBrowserCookie();
    return authInfo?.username || null;
  }

  private getUserCacheKey(username: string): string {
    return `${CACHE_PREFIX}${username}`;
  }

  private getUserCache(username: string): UserCacheStore {
    if (typeof window === "undefined") return {};

    try {
      const cacheKey = this.getUserCacheKey(username);
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : {};
    } catch (error) {
      console.warn("Failed to get user cache:", error);
      return {};
    }
  }

  private saveUserCache(username: string, cache: UserCacheStore): void {
    if (typeof window === "undefined") return;

    try {
      // Check cache size, clear if > 15MB
      const cacheSize = JSON.stringify(cache).length;
      if (cacheSize > 15 * 1024 * 1024) {
        console.warn("Cache too large, cleaning old data");
        this.cleanOldCache(cache);
      }

      const cacheKey = this.getUserCacheKey(username);
      localStorage.setItem(cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to save user cache:", error);
      // Handle quota exceeded
      if (error instanceof DOMException && error.name === "QuotaExceededError") {
        this.clearAllCache();
        try {
          const cacheKey = this.getUserCacheKey(username);
          localStorage.setItem(cacheKey, JSON.stringify(cache));
        } catch (retryError) {
          console.error("Retry save cache still failed:", retryError);
        }
      }
    }
  }

  private cleanOldCache(cache: UserCacheStore): void {
    const now = Date.now();
    const maxAge = 60 * 24 * 60 * 60 * 1000; // 2 months

    if (cache.playRecords && now - cache.playRecords.timestamp > maxAge) {
      delete cache.playRecords;
    }
    if (cache.favorites && now - cache.favorites.timestamp > maxAge) {
      delete cache.favorites;
    }
  }

  private clearAllCache(): void {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("vortex_cache_")) {
        localStorage.removeItem(key);
      }
    });
  }

  private isCacheValid<T>(cache: CacheData<T>): boolean {
    const now = Date.now();
    return cache.version === CACHE_VERSION && now - cache.timestamp < CACHE_EXPIRE_TIME;
  }

  private createCacheData<T>(data: T): CacheData<T> {
    return {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };
  }

  getCachedPlayRecords(): Record<string, DbPlayRecord> | null {
    const username = this.getCurrentUsername();
    if (!username) return null;

    const userCache = this.getUserCache(username);
    const cached = userCache.playRecords;

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    return null;
  }

  cachePlayRecords(data: Record<string, DbPlayRecord>): void {
    const username = this.getCurrentUsername();
    if (!username) return;

    const userCache = this.getUserCache(username);
    userCache.playRecords = this.createCacheData(data);
    this.saveUserCache(username, userCache);
  }

  getCachedFavorites(): Record<string, DbFavorite> | null {
    const username = this.getCurrentUsername();
    if (!username) return null;

    const userCache = this.getUserCache(username);
    const cached = userCache.favorites;

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    return null;
  }

  cacheFavorites(data: Record<string, DbFavorite>): void {
    const username = this.getCurrentUsername();
    if (!username) return;

    const userCache = this.getUserCache(username);
    userCache.favorites = this.createCacheData(data);
    this.saveUserCache(username, userCache);
  }

  getCachedSearchHistory(): string[] | null {
    const username = this.getCurrentUsername();
    if (!username) return null;

    const userCache = this.getUserCache(username);
    const cached = userCache.searchHistory;

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    return null;
  }

  cacheSearchHistory(data: string[]): void {
    const username = this.getCurrentUsername();
    if (!username) return;

    const userCache = this.getUserCache(username);
    userCache.searchHistory = this.createCacheData(data);
    this.saveUserCache(username, userCache);
  }

  getCachedSkipConfigs(): Record<string, SkipConfig> | null {
    const username = this.getCurrentUsername();
    if (!username) return null;

    const userCache = this.getUserCache(username);
    const cached = userCache.skipConfigs;

    if (cached && this.isCacheValid(cached)) {
      return cached.data;
    }

    return null;
  }

  cacheSkipConfigs(data: Record<string, SkipConfig>): void {
    const username = this.getCurrentUsername();
    if (!username) return;

    const userCache = this.getUserCache(username);
    userCache.skipConfigs = this.createCacheData(data);
    this.saveUserCache(username, userCache);
  }

  clearUserCache(username?: string): void {
    const targetUsername = username || this.getCurrentUsername();
    if (!targetUsername) return;

    try {
      const cacheKey = this.getUserCacheKey(targetUsername);
      localStorage.removeItem(cacheKey);
    } catch (error) {
      console.warn("Failed to clear user cache:", error);
    }
  }

  clearExpiredCaches(): void {
    if (typeof window === "undefined") return;

    try {
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(CACHE_PREFIX)) {
          try {
            const cache = JSON.parse(localStorage.getItem(key) || "{}");
            let hasValidData = false;
            for (const [, cacheData] of Object.entries(cache)) {
              if (cacheData && this.isCacheValid(cacheData as CacheData<any>)) {
                hasValidData = true;
                break;
              }
            }
            if (!hasValidData) {
              keysToRemove.push(key);
            }
          } catch {
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
    } catch (error) {
      console.warn("Failed to clear expired caches:", error);
    }
  }
}

// Cache manager instance
const cacheManager = HybridCacheManager.getInstance();

// Error handling helper
async function handleDatabaseOperationFailure(
  dataType: "playRecords" | "favorites" | "searchHistory",
  error: any
): Promise<void> {
  console.error(`Database operation failed (${dataType}):`, error);
  triggerGlobalError(`Database operation failed`);

  try {
    let freshData: any;
    let eventName: string;

    switch (dataType) {
      case "playRecords":
        freshData = await fetchFromApi<Record<string, DbPlayRecord>>(`/api/playrecords`);
        cacheManager.cachePlayRecords(freshData);
        eventName = "playRecordsUpdated";
        break;
      case "favorites":
        freshData = await fetchFromApi<Record<string, DbFavorite>>(`/api/favorites`);
        cacheManager.cacheFavorites(freshData);
        eventName = "favoritesUpdated";
        break;
      case "searchHistory":
        freshData = await fetchFromApi<string[]>(`/api/searchhistory`);
        cacheManager.cacheSearchHistory(freshData);
        eventName = "searchHistoryUpdated";
        break;
    }

    window.dispatchEvent(
      new CustomEvent(eventName, {
        detail: freshData,
      })
    );
  } catch (refreshErr) {
    console.error(`Failed to refresh ${dataType} cache:`, refreshErr);
    triggerGlobalError(`Failed to refresh ${dataType} cache`);
  }
}

// Clear expired caches on page load
if (typeof window !== "undefined") {
  setTimeout(() => cacheManager.clearExpiredCaches(), 1000);
}

// Utility: fetch with auth
async function fetchWithAuth(url: string, options?: RequestInit): Promise<Response> {
  const res = await fetch(url, options);
  if (!res.ok) {
    if (res.status === 401) {
      // Unauthorized - redirect to login
      try {
        await fetch("/api/logout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        console.error("Logout request failed:", error);
      }
      const currentUrl = window.location.pathname + window.location.search;
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("redirect", currentUrl);
      window.location.href = loginUrl.toString();
      throw new Error("Unauthorized, redirected to login");
    }
    throw new Error(`Request to ${url} failed: ${res.status}`);
  }
  return res;
}

async function fetchFromApi<T>(path: string): Promise<T> {
  const res = await fetchWithAuth(path);
  return (await res.json()) as T;
}

// Generate storage key
export function generateStorageKey(source: string, id: string): string {
  return `${source}+${id}`;
}

// ==================== Play Records ====================

/**
 * Get all play records
 * Database mode: Stale-while-revalidate (return cache, update in background)
 */
export async function getAllPlayRecords(): Promise<Record<string, DbPlayRecord>> {
  if (typeof window === "undefined") {
    return {};
  }

  // Database mode: hybrid cache strategy
  if (STORAGE_TYPE !== "local") {
    const cachedData = cacheManager.getCachedPlayRecords();

    if (cachedData) {
      // Return cache, update in background
      fetchFromApi<Record<string, DbPlayRecord>>(`/api/playrecords`)
        .then((freshData) => {
          if (JSON.stringify(cachedData) !== JSON.stringify(freshData)) {
            cacheManager.cachePlayRecords(freshData);
            window.dispatchEvent(
              new CustomEvent("playRecordsUpdated", {
                detail: freshData,
              })
            );
          }
        })
        .catch((err) => {
          console.warn("Background sync play records failed:", err);
          triggerGlobalError("Background sync play records failed");
        });

      return cachedData;
    } else {
      // No cache, fetch from API
      try {
        const freshData = await fetchFromApi<Record<string, DbPlayRecord>>(`/api/playrecords`);
        cacheManager.cachePlayRecords(freshData);
        return freshData;
      } catch (err) {
        console.error("Failed to get play records:", err);
        triggerGlobalError("Failed to get play records");
        return {};
      }
    }
  }

  // LocalStorage mode
  try {
    const raw = localStorage.getItem(PLAY_RECORDS_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DbPlayRecord>;
  } catch (err) {
    console.error("Failed to read play records:", err);
    triggerGlobalError("Failed to read play records");
    return {};
  }
}

/**
 * Save play record
 * Database mode: Optimistic update (update cache immediately, sync async)
 */
export async function savePlayRecord(
  source: string,
  id: string,
  record: DbPlayRecord
): Promise<void> {
  const key = generateStorageKey(source, id);

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedRecords = cacheManager.getCachedPlayRecords() || {};
    cachedRecords[key] = record;
    cacheManager.cachePlayRecords(cachedRecords);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("playRecordsUpdated", {
        detail: cachedRecords,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth("/api/playrecords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, record }),
      });
    } catch (err) {
      await handleDatabaseOperationFailure("playRecords", err);
      triggerGlobalError("Failed to save play record");
      throw err;
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") {
    console.warn("Cannot save play record to localStorage on server");
    return;
  }

  try {
    const allRecords = await getAllPlayRecords();
    allRecords[key] = record;
    localStorage.setItem(PLAY_RECORDS_KEY, JSON.stringify(allRecords));
    window.dispatchEvent(
      new CustomEvent("playRecordsUpdated", {
        detail: allRecords,
      })
    );
  } catch (err) {
    console.error("Failed to save play record:", err);
    triggerGlobalError("Failed to save play record");
    throw err;
  }
}

/**
 * Delete play record
 * Database mode: Optimistic update
 */
export async function deletePlayRecord(source: string, id: string): Promise<void> {
  const key = generateStorageKey(source, id);

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedRecords = cacheManager.getCachedPlayRecords() || {};
    delete cachedRecords[key];
    cacheManager.cachePlayRecords(cachedRecords);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("playRecordsUpdated", {
        detail: cachedRecords,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth(`/api/playrecords?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
    } catch (err) {
      await handleDatabaseOperationFailure("playRecords", err);
      triggerGlobalError("Failed to delete play record");
      throw err;
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") {
    console.warn("Cannot delete play record from localStorage on server");
    return;
  }

  try {
    const allRecords = await getAllPlayRecords();
    delete allRecords[key];
    localStorage.setItem(PLAY_RECORDS_KEY, JSON.stringify(allRecords));
    window.dispatchEvent(
      new CustomEvent("playRecordsUpdated", {
        detail: allRecords,
      })
    );
  } catch (err) {
    console.error("Failed to delete play record:", err);
    triggerGlobalError("Failed to delete play record");
    throw err;
  }
}

// ==================== Favorites ====================

/**
 * Get all favorites
 * Database mode: Stale-while-revalidate
 */
export async function getAllFavorites(): Promise<Record<string, DbFavorite>> {
  if (typeof window === "undefined") {
    return {};
  }

  // Database mode: hybrid cache strategy
  if (STORAGE_TYPE !== "local") {
    const cachedData = cacheManager.getCachedFavorites();

    if (cachedData) {
      // Return cache, update in background
      fetchFromApi<Record<string, DbFavorite>>(`/api/favorites`)
        .then((freshData) => {
          if (JSON.stringify(cachedData) !== JSON.stringify(freshData)) {
            cacheManager.cacheFavorites(freshData);
            window.dispatchEvent(
              new CustomEvent("favoritesUpdated", {
                detail: freshData,
              })
            );
          }
        })
        .catch((err) => {
          console.warn("Background sync favorites failed:", err);
          triggerGlobalError("Background sync favorites failed");
        });

      return cachedData;
    } else {
      // No cache, fetch from API
      try {
        const freshData = await fetchFromApi<Record<string, DbFavorite>>(`/api/favorites`);
        cacheManager.cacheFavorites(freshData);
        return freshData;
      } catch (err) {
        console.error("Failed to get favorites:", err);
        triggerGlobalError("Failed to get favorites");
        return {};
      }
    }
  }

  // LocalStorage mode
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, DbFavorite>;
  } catch (err) {
    console.error("Failed to read favorites:", err);
    triggerGlobalError("Failed to read favorites");
    return {};
  }
}

/**
 * Save favorite
 * Database mode: Optimistic update
 */
export async function saveFavorite(
  source: string,
  id: string,
  favorite: DbFavorite
): Promise<void> {
  const key = generateStorageKey(source, id);

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedFavorites = cacheManager.getCachedFavorites() || {};
    cachedFavorites[key] = favorite;
    cacheManager.cacheFavorites(cachedFavorites);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("favoritesUpdated", {
        detail: cachedFavorites,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, favorite }),
      });
    } catch (err) {
      await handleDatabaseOperationFailure("favorites", err);
      triggerGlobalError("Failed to save favorite");
      throw err;
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") {
    console.warn("Cannot save favorite to localStorage on server");
    return;
  }

  try {
    const allFavorites = await getAllFavorites();
    allFavorites[key] = favorite;
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
    window.dispatchEvent(
      new CustomEvent("favoritesUpdated", {
        detail: allFavorites,
      })
    );
  } catch (err) {
    console.error("Failed to save favorite:", err);
    triggerGlobalError("Failed to save favorite");
    throw err;
  }
}

/**
 * Delete favorite
 * Database mode: Optimistic update
 */
export async function deleteFavorite(source: string, id: string): Promise<void> {
  const key = generateStorageKey(source, id);

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedFavorites = cacheManager.getCachedFavorites() || {};
    delete cachedFavorites[key];
    cacheManager.cacheFavorites(cachedFavorites);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("favoritesUpdated", {
        detail: cachedFavorites,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth(`/api/favorites?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      });
    } catch (err) {
      await handleDatabaseOperationFailure("favorites", err);
      triggerGlobalError("Failed to delete favorite");
      throw err;
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") {
    console.warn("Cannot delete favorite from localStorage on server");
    return;
  }

  try {
    const allFavorites = await getAllFavorites();
    delete allFavorites[key];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(allFavorites));
    window.dispatchEvent(
      new CustomEvent("favoritesUpdated", {
        detail: allFavorites,
      })
    );
  } catch (err) {
    console.error("Failed to delete favorite:", err);
    triggerGlobalError("Failed to delete favorite");
    throw err;
  }
}

/**
 * Check if favorited
 */
export async function isFavorited(source: string, id: string): Promise<boolean> {
  const key = generateStorageKey(source, id);
  const allFavorites = await getAllFavorites();
  return key in allFavorites;
}

// ==================== Search History ====================

/**
 * Get search history
 * Database mode: Stale-while-revalidate
 */
export async function getSearchHistory(): Promise<string[]> {
  if (typeof window === "undefined") {
    return [];
  }

  // Database mode: hybrid cache strategy
  if (STORAGE_TYPE !== "local") {
    const cachedData = cacheManager.getCachedSearchHistory();

    if (cachedData) {
      // Return cache, update in background
      fetchFromApi<string[]>(`/api/searchhistory`)
        .then((freshData) => {
          if (JSON.stringify(cachedData) !== JSON.stringify(freshData)) {
            cacheManager.cacheSearchHistory(freshData);
            window.dispatchEvent(
              new CustomEvent("searchHistoryUpdated", {
                detail: freshData,
              })
            );
          }
        })
        .catch((err) => {
          console.warn("Background sync search history failed:", err);
          triggerGlobalError("Background sync search history failed");
        });

      return cachedData;
    } else {
      // No cache, fetch from API
      try {
        const freshData = await fetchFromApi<string[]>(`/api/searchhistory`);
        cacheManager.cacheSearchHistory(freshData);
        return freshData;
      } catch (err) {
        console.error("Failed to get search history:", err);
        triggerGlobalError("Failed to get search history");
        return [];
      }
    }
  }

  // LocalStorage mode
  try {
    const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as string[];
    return Array.isArray(arr) ? arr : [];
  } catch (err) {
    console.error("Failed to read search history:", err);
    triggerGlobalError("Failed to read search history");
    return [];
  }
}

/**
 * Add keyword to search history
 * Database mode: Optimistic update
 */
export async function addSearchHistory(keyword: string): Promise<void> {
  const trimmed = keyword.trim();
  if (!trimmed) return;

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedHistory = cacheManager.getCachedSearchHistory() || [];
    const newHistory = [trimmed, ...cachedHistory.filter((k) => k !== trimmed)];
    // Limit length
    if (newHistory.length > SEARCH_HISTORY_LIMIT) {
      newHistory.length = SEARCH_HISTORY_LIMIT;
    }
    cacheManager.cacheSearchHistory(newHistory);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("searchHistoryUpdated", {
        detail: newHistory,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth("/api/searchhistory", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ keyword: trimmed }),
      });
    } catch (err) {
      await handleDatabaseOperationFailure("searchHistory", err);
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") return;

  try {
    const history = await getSearchHistory();
    const newHistory = [trimmed, ...history.filter((k) => k !== trimmed)];
    // Limit length
    if (newHistory.length > SEARCH_HISTORY_LIMIT) {
      newHistory.length = SEARCH_HISTORY_LIMIT;
    }
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    window.dispatchEvent(
      new CustomEvent("searchHistoryUpdated", {
        detail: newHistory,
      })
    );
  } catch (err) {
    console.error("Failed to save search history:", err);
    triggerGlobalError("Failed to save search history");
  }
}

/**
 * Clear search history
 * Database mode: Optimistic update
 */
export async function clearSearchHistory(): Promise<void> {
  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    cacheManager.cacheSearchHistory([]);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("searchHistoryUpdated", {
        detail: [],
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth(`/api/searchhistory`, {
        method: "DELETE",
      });
    } catch (err) {
      await handleDatabaseOperationFailure("searchHistory", err);
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") return;
  localStorage.removeItem(SEARCH_HISTORY_KEY);
  window.dispatchEvent(
    new CustomEvent("searchHistoryUpdated", {
      detail: [],
    })
  );
}

/**
 * Delete single search history keyword
 * Database mode: Optimistic update
 */
export async function deleteSearchHistoryKeyword(keyword: string): Promise<void> {
  const trimmed = keyword.trim();
  if (!trimmed) return;

  // Database mode: optimistic update
  if (STORAGE_TYPE !== "local") {
    // Update cache immediately
    const cachedHistory = cacheManager.getCachedSearchHistory() || [];
    const newHistory = cachedHistory.filter((k) => k !== trimmed);
    cacheManager.cacheSearchHistory(newHistory);

    // Trigger immediate update event
    window.dispatchEvent(
      new CustomEvent("searchHistoryUpdated", {
        detail: newHistory,
      })
    );

    // Async sync to database
    try {
      await fetchWithAuth(`/api/searchhistory?keyword=${encodeURIComponent(trimmed)}`, {
        method: "DELETE",
      });
    } catch (err) {
      await handleDatabaseOperationFailure("searchHistory", err);
    }
    return;
  }

  // LocalStorage mode
  if (typeof window === "undefined") return;

  try {
    const history = await getSearchHistory();
    const newHistory = history.filter((k) => k !== trimmed);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
    window.dispatchEvent(
      new CustomEvent("searchHistoryUpdated", {
        detail: newHistory,
      })
    );
  } catch (err) {
    console.error("Failed to delete search history keyword:", err);
    triggerGlobalError("Failed to delete search history keyword");
  }
}

// Export for backward compatibility with existing StorageService
export { cacheManager, STORAGE_TYPE };
