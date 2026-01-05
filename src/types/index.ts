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
  poster: string;
  rate: string;
  year: string;
}

export interface DoubanResult {
  code: number;
  message: string;
  list: DoubanItem[];
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

// API Response Types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ==================== Admin Panel Types ====================

/**
 * Admin configuration structure
 * This is the complete configuration for the admin panel
 */
export interface AdminConfig {
  ConfigSubscription: {
    URL: string;
    AutoUpdate: boolean;
    LastCheck: string;
  };
  ConfigFile: string;
  SiteConfig: {
    SiteName: string;
    Announcement: string;
    SearchDownstreamMaxPage: number;
    SiteInterfaceCacheTime: number;
    DoubanProxyType: string;
    DoubanProxy: string;
    DoubanImageProxyType: string;
    DoubanImageProxy: string;
    DisableYellowFilter: boolean;
    FluidSearch: boolean;
  };
  UserConfig: {
    Users: {
      username: string;
      role: "user" | "admin" | "owner";
      banned?: boolean;
      enabledApis?: string[]; // Higher priority than tags restriction
      tags?: string[]; // Multiple tags take union of restrictions
    }[];
    Tags?: {
      name: string;
      enabledApis: string[];
    }[];
  };
  SourceConfig: {
    key: string;
    name: string;
    api: string;
    detail?: string;
    from: "config" | "custom";
    disabled?: boolean;
  }[];
  CustomCategories: {
    name?: string;
    type: "movie" | "tv";
    query: string;
    from: "config" | "custom";
    disabled?: boolean;
  }[];
  LiveConfig?: {
    key: string;
    name: string;
    url: string; // m3u address
    ua?: string;
    epg?: string; // EPG program guide
    from: "config" | "custom";
    channelNumber?: number;
    disabled?: boolean;
  }[];
}

/**
 * Admin API response with role information
 */
export interface AdminConfigResult {
  Role: "owner" | "admin";
  Config: AdminConfig;
}
