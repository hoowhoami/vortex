import { AdminConfig } from "@/types";

// Storage backend types
export type StorageType = "localstorage" | "redis" | "upstash" | "kvrocks";

// Play record structure (aligned with LunaTV)
export interface DbPlayRecord {
  title: string;
  source_name: string;
  cover: string;
  year: string;
  index: number; // Episode index
  total_episodes: number;
  play_time: number; // Progress in seconds
  total_time: number; // Total duration in seconds
  save_time: number; // Timestamp
  search_title: string;
}

// Favorite structure (aligned with LunaTV)
export interface DbFavorite {
  source_name: string;
  total_episodes: number;
  title: string;
  year: string;
  cover: string;
  save_time: number; // Timestamp
  search_title: string;
  origin?: "vod" | "live";
}

// Skip intro/outro configuration
export interface SkipConfig {
  enable: boolean;
  intro_time: number; // In seconds
  outro_time: number; // In seconds
}

// Storage interface for all backends
export interface IStorage {
  // Play records
  getPlayRecord(userName: string, key: string): Promise<DbPlayRecord | null>;
  setPlayRecord(userName: string, key: string, record: DbPlayRecord): Promise<void>;
  getAllPlayRecords(userName: string): Promise<Record<string, DbPlayRecord>>;
  deletePlayRecord(userName: string, key: string): Promise<void>;

  // Favorites
  getFavorite(userName: string, key: string): Promise<DbFavorite | null>;
  setFavorite(userName: string, key: string, favorite: DbFavorite): Promise<void>;
  getAllFavorites(userName: string): Promise<Record<string, DbFavorite>>;
  deleteFavorite(userName: string, key: string): Promise<void>;

  // User management
  registerUser(userName: string, password: string): Promise<void>;
  verifyUser(userName: string, password: string): Promise<boolean>;
  checkUserExist(userName: string): Promise<boolean>;
  changePassword(userName: string, newPassword: string): Promise<void>;
  deleteUser(userName: string): Promise<void>;

  // Search history
  getSearchHistory(userName: string): Promise<string[]>;
  addSearchHistory(userName: string, keyword: string): Promise<void>;
  deleteSearchHistory(userName: string, keyword?: string): Promise<void>;

  // User list
  getAllUsers(): Promise<string[]>;

  // Admin configuration
  getAdminConfig(): Promise<AdminConfig | null>;
  setAdminConfig(config: AdminConfig): Promise<void>;

  // Skip configuration
  getSkipConfig(userName: string, source: string, id: string): Promise<SkipConfig | null>;
  setSkipConfig(userName: string, source: string, id: string, config: SkipConfig): Promise<void>;
  deleteSkipConfig(userName: string, source: string, id: string): Promise<void>;
  getAllSkipConfigs(userName: string): Promise<Record<string, SkipConfig>>;

  // Data cleanup
  clearAllData(): Promise<void>;
}
