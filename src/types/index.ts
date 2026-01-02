export interface Connection {
  id: string;
  name: string;
  host: string;
  port: number;
  password?: string;
  database: number;
  groupId?: string;
  tags: string[];
  ssl: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ConnectionGroup {
  id: string;
  name: string;
  color: string;
  order: number;
}

export interface RedisValue {
  type: string;
  value: unknown;
  ttl?: number;
}

export interface RedisKey {
  key: string;
  type: string;
}

export type RedisDataType = "string" | "hash" | "list" | "set" | "zset";
