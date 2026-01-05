/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient, RedisClientType } from "redis";
import { AdminConfig } from "@/types";
import { DbFavorite, DbPlayRecord, IStorage, SkipConfig } from "./types";

// Search history limit
const SEARCH_HISTORY_LIMIT = 20;

// Connection configuration interface
export interface RedisConnectionConfig {
  url: string;
  clientName: string; // For logging, e.g., "Redis" or "Upstash"
}

// Retry wrapper for Redis operations
function createRetryWrapper(clientName: string, getClient: () => RedisClientType) {
  return async function withRetry<T>(
    operation: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (err: any) {
        const isLastAttempt = i === maxRetries - 1;
        const isConnectionError =
          err.message?.includes("Connection") ||
          err.message?.includes("ECONNREFUSED") ||
          err.message?.includes("ENOTFOUND") ||
          err.code === "ECONNRESET" ||
          err.code === "EPIPE";

        if (isConnectionError && !isLastAttempt) {
          console.log(
            `${clientName} operation failed, retrying... (${i + 1}/${maxRetries})`
          );
          console.error("Error:", err.message);

          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));

          // Try to reconnect
          try {
            const client = getClient();
            if (!client.isOpen) {
              await client.connect();
            }
          } catch (reconnectErr) {
            console.error("Failed to reconnect:", reconnectErr);
          }

          continue;
        }

        throw err;
      }
    }

    throw new Error("Max retries exceeded");
  };
}

// Factory function to create Redis client
export function createRedisClient(
  config: RedisConnectionConfig,
  globalSymbol: symbol
): RedisClientType {
  let client: RedisClientType | undefined = (global as any)[globalSymbol];

  if (!client) {
    if (!config.url) {
      throw new Error(`${config.clientName}_URL env variable not set`);
    }

    // Client configuration
    const clientConfig: any = {
      url: config.url,
      socket: {
        // Reconnection strategy: exponential backoff, max 30 seconds
        reconnectStrategy: (retries: number) => {
          console.log(`${config.clientName} reconnection attempt ${retries + 1}`);
          if (retries > 10) {
            console.error(`${config.clientName} max reconnection attempts exceeded`);
            return false; // Stop reconnecting
          }
          return Math.min(1000 * Math.pow(2, retries), 30000);
        },
        connectTimeout: 10000, // 10 seconds
        noDelay: true,
      },
      pingInterval: 30000, // Ping every 30 seconds
    };

    client = createClient(clientConfig);

    // Event listeners
    client.on("error", (err) => {
      console.error(`${config.clientName} client error:`, err);
    });

    client.on("connect", () => {
      console.log(`${config.clientName} connected`);
    });

    client.on("reconnecting", () => {
      console.log(`${config.clientName} reconnecting...`);
    });

    client.on("ready", () => {
      console.log(`${config.clientName} ready`);
    });

    // Initial connection with retry
    const connectWithRetry = async () => {
      try {
        await client!.connect();
        console.log(`${config.clientName} connected successfully`);
      } catch (err) {
        console.error(`${config.clientName} initial connection failed:`, err);
        console.log("Will retry in 5 seconds...");
        setTimeout(connectWithRetry, 5000);
      }
    };

    connectWithRetry();

    (global as any)[globalSymbol] = client;
  }

  return client;
}

// Abstract base class with common Redis operations
export abstract class BaseRedisStorage implements IStorage {
  protected client: RedisClientType;
  protected withRetry: <T>(operation: () => Promise<T>, maxRetries?: number) => Promise<T>;

  constructor(config: RedisConnectionConfig, globalSymbol: symbol) {
    this.client = createRedisClient(config, globalSymbol);
    this.withRetry = createRetryWrapper(config.clientName, () => this.client);
  }

  // ---------- Play Records ----------
  private prKey(user: string, key: string) {
    return `u:${user}:pr:${key}`; // u:username:pr:source+id
  }

  async getPlayRecord(userName: string, key: string): Promise<DbPlayRecord | null> {
    const val = await this.withRetry(() => this.client.get(this.prKey(userName, key)));
    return val ? (JSON.parse(val) as DbPlayRecord) : null;
  }

  async setPlayRecord(userName: string, key: string, record: DbPlayRecord): Promise<void> {
    await this.withRetry(() =>
      this.client.set(this.prKey(userName, key), JSON.stringify(record))
    );
  }

  async getAllPlayRecords(userName: string): Promise<Record<string, DbPlayRecord>> {
    const pattern = `u:${userName}:pr:*`;
    const keys: string[] = await this.withRetry(() => this.client.keys(pattern));
    if (keys.length === 0) return {};

    const values = await this.withRetry(() => this.client.mGet(keys));
    const result: Record<string, DbPlayRecord> = {};

    keys.forEach((fullKey: string, idx: number) => {
      const raw = values[idx];
      if (raw) {
        const rec = JSON.parse(raw) as DbPlayRecord;
        const keyPart = fullKey.replace(`u:${userName}:pr:`, "");
        result[keyPart] = rec;
      }
    });

    return result;
  }

  async deletePlayRecord(userName: string, key: string): Promise<void> {
    await this.withRetry(() => this.client.del(this.prKey(userName, key)));
  }

  // ---------- Favorites ----------
  private favKey(user: string, key: string) {
    return `u:${user}:fav:${key}`;
  }

  async getFavorite(userName: string, key: string): Promise<DbFavorite | null> {
    const val = await this.withRetry(() => this.client.get(this.favKey(userName, key)));
    return val ? (JSON.parse(val) as DbFavorite) : null;
  }

  async setFavorite(userName: string, key: string, favorite: DbFavorite): Promise<void> {
    await this.withRetry(() =>
      this.client.set(this.favKey(userName, key), JSON.stringify(favorite))
    );
  }

  async getAllFavorites(userName: string): Promise<Record<string, DbFavorite>> {
    const pattern = `u:${userName}:fav:*`;
    const keys: string[] = await this.withRetry(() => this.client.keys(pattern));
    if (keys.length === 0) return {};

    const values = await this.withRetry(() => this.client.mGet(keys));
    const result: Record<string, DbFavorite> = {};

    keys.forEach((fullKey: string, idx: number) => {
      const raw = values[idx];
      if (raw) {
        const fav = JSON.parse(raw) as DbFavorite;
        const keyPart = fullKey.replace(`u:${userName}:fav:`, "");
        result[keyPart] = fav;
      }
    });

    return result;
  }

  async deleteFavorite(userName: string, key: string): Promise<void> {
    await this.withRetry(() => this.client.del(this.favKey(userName, key)));
  }

  // ---------- User Management ----------
  private userKey(userName: string) {
    return `user:${userName}`;
  }

  async registerUser(userName: string, password: string): Promise<void> {
    await this.withRetry(() => this.client.set(this.userKey(userName), password));
  }

  async verifyUser(userName: string, password: string): Promise<boolean> {
    const stored = await this.withRetry(() => this.client.get(this.userKey(userName)));
    return stored === password;
  }

  async checkUserExist(userName: string): Promise<boolean> {
    const exists = await this.withRetry(() => this.client.exists(this.userKey(userName)));
    return exists === 1;
  }

  async changePassword(userName: string, newPassword: string): Promise<void> {
    await this.withRetry(() => this.client.set(this.userKey(userName), newPassword));
  }

  async deleteUser(userName: string): Promise<void> {
    const patterns = [
      `user:${userName}`,
      `u:${userName}:pr:*`,
      `u:${userName}:fav:*`,
      `u:${userName}:sh:*`,
      `u:${userName}:skip:*`,
    ];

    for (const pattern of patterns) {
      const keys = await this.withRetry(() => this.client.keys(pattern));
      if (keys.length > 0) {
        await this.withRetry(() => this.client.del(keys));
      }
    }
  }

  // ---------- Search History ----------
  private shKey(userName: string) {
    return `u:${userName}:sh`;
  }

  async getSearchHistory(userName: string): Promise<string[]> {
    const history = await this.withRetry(() => this.client.lRange(this.shKey(userName), 0, -1));
    return history || [];
  }

  async addSearchHistory(userName: string, keyword: string): Promise<void> {
    const key = this.shKey(userName);
    // Remove if exists
    await this.withRetry(() => this.client.lRem(key, 0, keyword));
    // Add to front
    await this.withRetry(() => this.client.lPush(key, keyword));
    // Trim to limit
    await this.withRetry(() => this.client.lTrim(key, 0, SEARCH_HISTORY_LIMIT - 1));
  }

  async deleteSearchHistory(userName: string, keyword?: string): Promise<void> {
    const key = this.shKey(userName);
    if (keyword) {
      await this.withRetry(() => this.client.lRem(key, 0, keyword));
    } else {
      await this.withRetry(() => this.client.del(key));
    }
  }

  // ---------- User List ----------
  async getAllUsers(): Promise<string[]> {
    const keys = await this.withRetry(() => this.client.keys("user:*"));
    return keys.map((key) => key.replace("user:", ""));
  }

  // ---------- Admin Configuration ----------
  private adminConfigKey() {
    return "admin:config";
  }

  async getAdminConfig(): Promise<AdminConfig | null> {
    const val = await this.withRetry(() => this.client.get(this.adminConfigKey()));
    return val ? (JSON.parse(val) as AdminConfig) : null;
  }

  async setAdminConfig(config: AdminConfig): Promise<void> {
    await this.withRetry(() => this.client.set(this.adminConfigKey(), JSON.stringify(config)));
  }

  // ---------- Skip Configuration ----------
  private skipKey(userName: string, source: string, id: string) {
    return `u:${userName}:skip:${source}+${id}`;
  }

  async getSkipConfig(userName: string, source: string, id: string): Promise<SkipConfig | null> {
    const val = await this.withRetry(() =>
      this.client.get(this.skipKey(userName, source, id))
    );
    return val ? (JSON.parse(val) as SkipConfig) : null;
  }

  async setSkipConfig(
    userName: string,
    source: string,
    id: string,
    config: SkipConfig
  ): Promise<void> {
    await this.withRetry(() =>
      this.client.set(this.skipKey(userName, source, id), JSON.stringify(config))
    );
  }

  async deleteSkipConfig(userName: string, source: string, id: string): Promise<void> {
    await this.withRetry(() => this.client.del(this.skipKey(userName, source, id)));
  }

  async getAllSkipConfigs(userName: string): Promise<Record<string, SkipConfig>> {
    const pattern = `u:${userName}:skip:*`;
    const keys: string[] = await this.withRetry(() => this.client.keys(pattern));
    if (keys.length === 0) return {};

    const values = await this.withRetry(() => this.client.mGet(keys));
    const result: Record<string, SkipConfig> = {};

    keys.forEach((fullKey: string, idx: number) => {
      const raw = values[idx];
      if (raw) {
        const config = JSON.parse(raw) as SkipConfig;
        const keyPart = fullKey.replace(`u:${userName}:skip:`, "");
        result[keyPart] = config;
      }
    });

    return result;
  }

  // ---------- Data Cleanup ----------
  async clearAllData(): Promise<void> {
    await this.withRetry(() => this.client.flushDb());
  }
}
