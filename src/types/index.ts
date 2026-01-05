// Video Types
export interface Video {
  id: string;
  title: string;
  year?: string;
  type: VideoType;
  cover?: string;
  rating?: number;
  actors?: string[];
  director?: string[];
  area?: string;
  lang?: string;
  remarks?: string;
  sources?: VideoSource[];
}

export type VideoType = "movie" | "tv" | "anime" | "variety" | "documentary";

export interface VideoSource {
  sourceId: string;
  sourceName: string;
  episodes: VideoEpisode[];
}

export interface VideoEpisode {
  name: string;
  url: string;
}

// Search Types
export interface SearchQuery {
  keyword: string;
  type?: VideoType;
  year?: string;
  source?: string;
}

export interface SearchResult {
  videos: Video[];
  aggregated?: boolean;
  total?: number;
}

// Douban Types
export interface DoubanItem {
  id: string;
  title: string;
  year: string;
  rating: number;
  cover: string;
  type: VideoType;
  actors: string[];
  director: string[];
  area: string;
}

export interface DoubanCategory {
  id: string;
  name: string;
  type: VideoType;
  tags?: string[];
}

export interface DoubanBangumi {
  id: string;
  title: string;
  cover: string;
  rating: number;
  eps: number;
  epsCount: number;
  date: string;
  weekday: number;
}

// Play Record Types
export interface PlayRecord {
  videoId: string;
  videoTitle: string;
  videoCover?: string;
  sourceId: string;
  sourceName: string;
  episodeIndex: number;
  episodeName: string;
  progress: number; // seconds
  duration: number; // seconds
  lastPlayedAt: number; // timestamp
}

export interface PlayProgress {
  currentTime: number;
  duration: number;
}

// Favorite Types
export interface Favorite {
  videoId: string;
  videoTitle: string;
  videoCover?: string;
  videoYear?: string;
  videoType: VideoType;
  createdAt: number; // timestamp
}

// Live TV Types
export interface LiveChannel {
  id: string;
  name: string;
  logo?: string;
  group: string;
  url: string;
  epgId?: string;
}

export interface LiveGroup {
  id: string;
  name: string;
  channels: LiveChannel[];
}

export interface EPGProgram {
  channel: string;
  title: string;
  start: string;
  end: string;
}

// Config Types
export interface VideoSourceConfig {
  id: string;
  name: string;
  enabled: boolean;
  api: string;
  type: "applev10" | "other";
  priority?: number;
}

export interface AppConfig {
  sources: VideoSourceConfig[];
  categories: DoubanCategory[];
  liveSources: {
    name: string;
    url: string;
    enabled: boolean;
  }[];
  users: UserConfig[];
  version: string;
}

// User Types
export interface User {
  id: string;
  username: string;
  role: UserRole;
  apiKey?: string;
  banned?: boolean;
}

export type UserRole = "owner" | "admin" | "user";

export interface UserConfig {
  username: string;
  password: string;
  role: UserRole;
  apiKey?: string;
  banned?: boolean;
  tags?: string[];
}

// Admin Configuration Types
export interface AdminConfig {
  sources: VideoSourceConfig[];
  categories: DoubanCategory[];
  liveSources: {
    name: string;
    url: string;
    enabled: boolean;
    ua?: string;
    epg?: string;
  }[];
  users: UserConfig[];
  siteConfig: {
    siteName: string;
    announcement: string;
    searchMaxPage: number;
    fluidSearch: boolean;
    disableYellowFilter: boolean;
    doubanProxyType?: "direct" | "proxy" | "custom";
    doubanProxy?: string;
  };
  version: string;
}

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
