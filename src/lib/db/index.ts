/* eslint-disable @typescript-eslint/no-explicit-any */

import { AdminConfig } from "@/types";
import { KvrocksStorage } from "./kvrocks";
import { RedisStorage } from "./redis";
import { DbFavorite, DbPlayRecord, IStorage, SkipConfig, StorageType } from "./types";
import { UpstashRedisStorage } from "./upstash";

// Get storage type from environment
const STORAGE_TYPE = (process.env.NEXT_PUBLIC_STORAGE_TYPE as StorageType) || "localstorage";

// Create storage instance based on type
function createStorage(): IStorage | null {
  switch (STORAGE_TYPE) {
    case "redis":
      return new RedisStorage();
    case "upstash":
      return new UpstashRedisStorage();
    case "kvrocks":
      return new KvrocksStorage();
    case "localstorage":
    default:
      return null; // LocalStorage mode (client-side only)
  }
}

// Singleton storage instance
let storageInstance: IStorage | null = null;

function getStorage(): IStorage | null {
  if (STORAGE_TYPE === "localstorage") {
    return null; // No server-side storage for localstorage mode
  }

  if (!storageInstance) {
    storageInstance = createStorage();
  }
  return storageInstance;
}

// Utility: Generate storage key
export function generateStorageKey(source: string, id: string): string {
  return `${source}+${id}`;
}

// Database Manager class
export class DbManager {
  private storage: IStorage | null;

  constructor() {
    this.storage = getStorage();
  }

  // Check if database storage is available (not in local mode)
  isDbAvailable(): boolean {
    return this.storage !== null;
  }

  // ---------- Play Records ----------
  async getPlayRecord(
    userName: string,
    source: string,
    id: string
  ): Promise<DbPlayRecord | null> {
    if (!this.storage) return null;
    const key = generateStorageKey(source, id);
    return this.storage.getPlayRecord(userName, key);
  }

  async savePlayRecord(
    userName: string,
    source: string,
    id: string,
    record: DbPlayRecord
  ): Promise<void> {
    if (!this.storage) return;
    const key = generateStorageKey(source, id);
    await this.storage.setPlayRecord(userName, key, record);
  }

  async getAllPlayRecords(userName: string): Promise<Record<string, DbPlayRecord>> {
    if (!this.storage) return {};
    return this.storage.getAllPlayRecords(userName);
  }

  async deletePlayRecord(userName: string, source: string, id: string): Promise<void> {
    if (!this.storage) return;
    const key = generateStorageKey(source, id);
    await this.storage.deletePlayRecord(userName, key);
  }

  // ---------- Favorites ----------
  async getFavorite(
    userName: string,
    source: string,
    id: string
  ): Promise<DbFavorite | null> {
    if (!this.storage) return null;
    const key = generateStorageKey(source, id);
    return this.storage.getFavorite(userName, key);
  }

  async saveFavorite(
    userName: string,
    source: string,
    id: string,
    favorite: DbFavorite
  ): Promise<void> {
    if (!this.storage) return;
    const key = generateStorageKey(source, id);
    await this.storage.setFavorite(userName, key, favorite);
  }

  async getAllFavorites(userName: string): Promise<Record<string, DbFavorite>> {
    if (!this.storage) return {};
    return this.storage.getAllFavorites(userName);
  }

  async deleteFavorite(userName: string, source: string, id: string): Promise<void> {
    if (!this.storage) return;
    const key = generateStorageKey(source, id);
    await this.storage.deleteFavorite(userName, key);
  }

  async isFavorited(userName: string, source: string, id: string): Promise<boolean> {
    const favorite = await this.getFavorite(userName, source, id);
    return favorite !== null;
  }

  // ---------- User Management ----------
  async registerUser(userName: string, password: string): Promise<void> {
    if (!this.storage) throw new Error("Database storage not available");
    await this.storage.registerUser(userName, password);
  }

  async verifyUser(userName: string, password: string): Promise<boolean> {
    if (!this.storage) return false;
    return this.storage.verifyUser(userName, password);
  }

  async checkUserExist(userName: string): Promise<boolean> {
    if (!this.storage) return false;
    return this.storage.checkUserExist(userName);
  }

  async changePassword(userName: string, newPassword: string): Promise<void> {
    if (!this.storage) throw new Error("Database storage not available");
    await this.storage.changePassword(userName, newPassword);
  }

  async deleteUser(userName: string): Promise<void> {
    if (!this.storage) throw new Error("Database storage not available");
    await this.storage.deleteUser(userName);
  }

  // ---------- Search History ----------
  async getSearchHistory(userName: string): Promise<string[]> {
    if (!this.storage) return [];
    return this.storage.getSearchHistory(userName);
  }

  async addSearchHistory(userName: string, keyword: string): Promise<void> {
    if (!this.storage) return;
    await this.storage.addSearchHistory(userName, keyword);
  }

  async deleteSearchHistory(userName: string, keyword?: string): Promise<void> {
    if (!this.storage) return;
    await this.storage.deleteSearchHistory(userName, keyword);
  }

  // ---------- User List ----------
  async getAllUsers(): Promise<string[]> {
    if (!this.storage) return [];
    return this.storage.getAllUsers();
  }

  // ---------- Admin Configuration ----------
  async getAdminConfig(): Promise<AdminConfig | null> {
    if (!this.storage) return null;
    return this.storage.getAdminConfig();
  }

  async saveAdminConfig(config: AdminConfig): Promise<void> {
    if (!this.storage) throw new Error("Database storage not available");
    await this.storage.setAdminConfig(config);
  }

  // ---------- Skip Configuration ----------
  async getSkipConfig(
    userName: string,
    source: string,
    id: string
  ): Promise<SkipConfig | null> {
    if (!this.storage) return null;
    return this.storage.getSkipConfig(userName, source, id);
  }

  async setSkipConfig(
    userName: string,
    source: string,
    id: string,
    config: SkipConfig
  ): Promise<void> {
    if (!this.storage) return;
    await this.storage.setSkipConfig(userName, source, id, config);
  }

  async deleteSkipConfig(userName: string, source: string, id: string): Promise<void> {
    if (!this.storage) return;
    await this.storage.deleteSkipConfig(userName, source, id);
  }

  async getAllSkipConfigs(userName: string): Promise<Record<string, SkipConfig>> {
    if (!this.storage) return {};
    return this.storage.getAllSkipConfigs(userName);
  }

  // ---------- Data Cleanup ----------
  async clearAllData(): Promise<void> {
    if (!this.storage) throw new Error("Database storage not available");
    await this.storage.clearAllData();
  }
}

// Export default instance
export const db = new DbManager();

// Export storage type for checking
export const storageType = STORAGE_TYPE;
export const isLocalStorage = STORAGE_TYPE === "localstorage";
