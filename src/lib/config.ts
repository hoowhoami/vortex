import { AppConfig, VideoSourceConfig, DoubanCategory } from "@/types";

// 从环境变量获取管理员配置
const getAdminUser = () => {
  const username = process.env.ADMIN_USERNAME || process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin";
  const password = process.env.ADMIN_PASSWORD || process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "admin123";

  return {
    username,
    password,
    role: "owner" as const,
  };
};

export const DEFAULT_CONFIG: AppConfig = {
  sources: [
    {
      id: "example1",
      name: "示例源1",
      enabled: true,
      api: "https://example.com/api",
      type: "applev10",
      priority: 1,
    },
  ],
  categories: [
    { id: "movie", name: "电影", type: "movie" },
    { id: "tv", name: "电视剧", type: "tv" },
    { id: "anime", name: "动漫", type: "anime" },
    { id: "variety", name: "综艺", type: "variety" },
  ],
  liveSources: [
    {
      name: "示例直播源",
      url: "https://example.com/live.m3u",
      enabled: true,
    },
  ],
  users: [getAdminUser()],
  version: "1.0.0",
};

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Vortex",
  announcement: process.env.ANNOUNCEMENT || process.env.NEXT_PUBLIC_ANNOUNCEMENT || "",
  searchMaxPage: Number(process.env.NEXT_PUBLIC_SEARCH_MAX_PAGE) || 5,
  fluidSearch: process.env.NEXT_PUBLIC_FLUID_SEARCH !== "false",
  disableYellowFilter: process.env.NEXT_PUBLIC_DISABLE_YELLOW_FILTER === "true",
} as const;

export const STORAGE_KEYS = {
  CONFIG: "vortex_config",
  USER: "vortex_user",
  THEME: "vortex_theme",
  SEARCH_HISTORY: "vortex_search_history",
  PLAY_RECORDS: "vortex_play_records",
  FAVORITES: "vortex_favorites",
} as const;

export const API_ENDPOINTS = {
  SEARCH: "/api/search",
  DETAIL: "/api/detail",
  FAVORITES: "/api/favorites",
  PLAY_RECORDS: "/api/play-records",
  LOGIN: "/api/login",
  CONFIG: "/api/config",
  LIVE: "/api/live",
  DOUBAN: "/api/douban",
} as const;

export const DOUBAN_API = {
  BASE: "https://movie.douban.com",
  PROXY_BASE: process.env.NEXT_PUBLIC_DOUBAN_PROXY || "",
} as const;

export const REDIS_CONFIG = {
  URL: process.env.REDIS_URL || "",
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL || "",
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN || "",
} as const;

export const KVROCKS_CONFIG = {
  URL: process.env.KVROCKS_URL || "",
} as const;

export const STORAGE_CONFIG = {
  type: process.env.NEXT_PUBLIC_STORAGE_TYPE || process.env.STORAGE_TYPE || "local", // local | redis | upstash | kvrocks
} as const;
