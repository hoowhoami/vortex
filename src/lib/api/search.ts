import { Video, VideoSource } from "@/types";

export interface SearchOptions {
  keyword: string;
  type?: string;
  year?: string;
  source?: string;
}

export interface SearchResult {
  videos: Video[];
  sourceId: string;
  sourceName: string;
  total: number;
}

export interface AggregatedSearchResult {
  videos: Video[];
  sources: Map<string, Video[]>;
  total: number;
}

// Apple CMS v10 API 客户端
export class AppleCMSClient {
  private baseUrl: string;
  private sourceId: string;
  private sourceName: string;

  constructor(sourceId: string, sourceName: string, baseUrl: string) {
    this.sourceId = sourceId;
    this.sourceName = sourceName;
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async search(options: SearchOptions): Promise<SearchResult> {
    const params = new URLSearchParams();
    params.append("ac", "videolist");
    params.append("wd", options.keyword);
    if (options.type) params.append("type", options.type);
    if (options.year) params.append("year", options.year);

    const url = `${this.baseUrl}/?${params.toString()}`;

    try {
      // Add timeout and abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log(`[${this.sourceName}] Search response for "${options.keyword}":`, {
        total: data.total,
        listCount: data.list?.length || 0,
        hasData: !!data.list,
        sampleItem: data.list?.[0] ? {
          vod_id: data.list[0].vod_id,
          vod_name: data.list[0].vod_name,
          vod_play_url: data.list[0].vod_play_url ? `${data.list[0].vod_play_url.substring(0, 100)}...` : 'none',
          vod_play_url_length: data.list[0].vod_play_url?.length || 0,
          vod_content: data.list[0].vod_content ? `${data.list[0].vod_content.substring(0, 100)}...` : 'none',
        } : 'no items'
      });

      // Apple CMS v10 响应格式: { list: [...], total: number, page: number, limit: number }
      const allVideos: Video[] = (data.list || []).map((item: any) => ({
        id: `${this.sourceId}-${item.vod_id}`,
        title: item.vod_name,
        year: item.vod_year?.toString(),
        type: this.mapType(item.type_id),
        cover: item.vod_pic,
        rating: undefined,
        actors: item.vod_actor?.split(",") || [],
        director: item.vod_director?.split(",") || [],
        area: item.vod_area,
        lang: item.vod_lang,
        remarks: item.vod_remarks,
        sources: this.parsePlayUrls(item.vod_play_url),
      }));

      // 过滤掉没有播放源的视频（参考 LunaTV 实现）
      const videos = allVideos.filter((video) => {
        const hasEpisodes = video.sources && video.sources.length > 0 &&
          video.sources.some((source) => source.episodes && source.episodes.length > 0);
        if (!hasEpisodes && allVideos.length <= 10) {
          // 只在结果数量较少时打印日志，避免刷屏
          console.log(`[${this.sourceName}] Filtered out video with no episodes: "${video.title}" (id: ${video.id})`);
        }
        return hasEpisodes;
      });

      console.log(`[${this.sourceName}] Search for "${options.keyword}": returned ${data.list?.length || 0} items, ${videos.length} after filtering`);

      return {
        videos,
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        total: data.total || videos.length,
      };
    } catch (error) {
      // Log error but return empty result instead of throwing
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Search timeout for ${this.sourceName}: ${options.keyword}`);
      } else {
        console.warn(`Search failed for ${this.sourceName}:`, error instanceof Error ? error.message : error);
      }
      return {
        videos: [],
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        total: 0,
      };
    }
  }

  async getDetail(videoId: string): Promise<Video | null> {
    // videoId is already the vod_id (without source prefix)
    const vodId = videoId;
    const url = `${this.baseUrl}/?ac=videolist&ids=${vodId}`;

    try {
      // Add timeout and abort controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout for detail

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) return null;

      const data = await response.json();
      const item = data.list?.[0];
      if (!item) return null;

      console.log(`[${this.sourceName}] Detail response for "${videoId}":`, {
        hasItem: !!item,
        vod_name: item.vod_name,
        vod_play_url: item.vod_play_url ? `${item.vod_play_url.substring(0, 100)}...` : 'none',
        vod_play_url_length: item.vod_play_url?.length || 0,
      });

      return {
        id: videoId,
        title: item.vod_name,
        year: item.vod_year?.toString(),
        type: this.mapType(item.type_id),
        cover: item.vod_pic,
        rating: undefined,
        actors: item.vod_actor?.split(",") || [],
        director: item.vod_director?.split(",") || [],
        area: item.vod_area,
        lang: item.vod_lang,
        remarks: item.vod_remarks,
        sources: this.parsePlayUrls(item.vod_play_url),
      };
    } catch (error) {
      // Log error but return null instead of throwing
      if (error instanceof Error && error.name === 'AbortError') {
        console.warn(`Detail fetch timeout for ${videoId}`);
      } else {
        console.warn(`Detail fetch failed for ${videoId}:`, error instanceof Error ? error.message : error);
      }
      return null;
    }
  }

  private mapType(typeId: number): Video["type"] {
    // 简单的类型映射，实际应该根据源配置
    const typeMap: Record<number, Video["type"]> = {
      1: "movie",
      2: "tv",
      3: "anime",
      4: "variety",
      5: "documentary",
    };
    return typeMap[typeId] || "movie";
  }

  private parsePlayUrls(vodPlayUrl: string): VideoSource[] {
    if (!vodPlayUrl) return [];

    console.log(`[${this.sourceName}] Parsing play URLs, length: ${vodPlayUrl.length}, preview: ${vodPlayUrl.substring(0, 200)}...`);

    // Apple CMS 格式: "播放源1$第1集$url1#第2集$url2$$$播放源2$第1集$url1#第2集$url2"
    // $$$ 分隔多个播放源
    // # 分隔集数
    // $ 分隔集数名称和URL
    const sources: VideoSource[] = [];
    const playGroups = vodPlayUrl.split("$$$");

    console.log(`[${this.sourceName}] Found ${playGroups.length} play groups`);

    playGroups.forEach((group, idx) => {
      if (!group.trim()) return;

      console.log(`[${this.sourceName}] Group ${idx}: ${group.substring(0, 100)}...`);

      const parts = group.split("$");
      if (parts.length < 2) return;

      const sourceName = parts[0];
      const episodes: { name: string; url: string }[] = [];

      // 从第二个元素开始解析集数
      for (let i = 1; i < parts.length; i++) {
        const episodeStr = parts[i];
        if (!episodeStr.trim()) continue;

        // 按 # 分割集数
        const episodeParts = episodeStr.split("#");
        episodeParts.forEach((ep) => {
          if (!ep.trim()) return;

          // 只提取 m3u8 链接
          if (ep.includes(".m3u8")) {
            // 检查是否包含名称$URL格式
            const dollarIdx = ep.lastIndexOf("$");
            if (dollarIdx > 0) {
              const name = ep.substring(0, dollarIdx).trim();
              const url = ep.substring(dollarIdx + 1).trim();
              if (url) {
                episodes.push({ name: name || `第 ${episodes.length + 1} 集`, url });
              }
            } else {
              episodes.push({ name: `第 ${episodes.length + 1} 集`, url: ep.trim() });
            }
          }
        });
      }

      console.log(`[${this.sourceName}] Parsed ${episodes.length} episodes for source: ${sourceName}`);

      if (episodes.length > 0) {
        sources.push({
          sourceId: this.sourceId,
          sourceName,
          episodes,
        });
      }
    });

    console.log(`[${this.sourceName}] Total parsed sources: ${sources.length}`);

    return sources;
  }
}

// 多源搜索管理器
export class SearchManager {
  private clients: Map<string, AppleCMSClient> = new Map();

  registerClient(client: AppleCMSClient) {
    this.clients.set(client["sourceId"], client);
  }

  async searchAll(options: SearchOptions): Promise<AggregatedSearchResult> {
    const searchPromises = Array.from(this.clients.values()).map((client) =>
      client.search(options)
    );

    const results = await Promise.allSettled(searchPromises);

    const allVideos: Video[] = [];
    const sources = new Map<string, Video[]>();

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const { videos, sourceId } = result.value;
        allVideos.push(...videos);
        sources.set(sourceId, videos);
      }
    });

    // 聚合相同标题的视频
    const aggregatedVideos = this.aggregateByTitle(allVideos);

    return {
      videos: aggregatedVideos,
      sources,
      total: aggregatedVideos.length,
    };
  }

  private aggregateByTitle(videos: Video[]): Video[] {
    const videoMap = new Map<string, Video>();

    videos.forEach((video) => {
      const key = `${video.title}-${video.year}`;
      const existing = videoMap.get(key);

      if (existing) {
        // 合并播放源
        if (video.sources && Array.isArray(video.sources)) {
          if (!existing.sources) {
            existing.sources = [];
          }
          if (!Array.isArray(existing.sources)) {
            existing.sources = [];
          }
          existing.sources = [...existing.sources, ...video.sources];
        }
      } else {
        videoMap.set(key, video);
      }
    });

    return Array.from(videoMap.values());
  }
}
