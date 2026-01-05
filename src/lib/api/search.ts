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
    params.append("wd", options.keyword);
    if (options.type) params.append("type", options.type);
    if (options.year) params.append("year", options.year);

    const url = `${this.baseUrl}/v1/search?${params.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Apple CMS v10 响应格式: { list: [...], total: number, page: number, limit: number }
      const videos: Video[] = (data.list || []).map((item: any) => ({
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

      return {
        videos,
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        total: data.total || videos.length,
      };
    } catch (error) {
      console.error(`Search failed for ${this.sourceName}:`, error);
      return {
        videos: [],
        sourceId: this.sourceId,
        sourceName: this.sourceName,
        total: 0,
      };
    }
  }

  async getDetail(videoId: string): Promise<Video | null> {
    const vodId = videoId.replace(`${this.sourceId}-`, "");
    const url = `${this.baseUrl}/v1/detail?vod_id=${vodId}`;

    try {
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      const item = data.list?.[0];
      if (!item) return null;

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
      console.error(`Detail fetch failed for ${videoId}:`, error);
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

    // Apple CMS 格式: $"播放源1$集1URL,集2URL$$$播放源2$集1URL,集2URL"
    const sources: VideoSource[] = [];
    const playGroups = vodPlayUrl.split("$$$");

    playGroups.forEach((group) => {
      const parts = group.split("$");
      if (parts.length < 2) return;

      const sourceName = parts[0];
      const episodes = parts.slice(1).map((ep, idx) => ({
        name: `第 ${idx + 1} 集`,
        url: ep,
      }));

      sources.push({
        sourceId: this.sourceId,
        sourceName,
        episodes,
      });
    });

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
        if (video.sources) {
          existing.sources = [...(existing.sources || []), ...video.sources];
        }
      } else {
        videoMap.set(key, video);
      }
    });

    return Array.from(videoMap.values());
  }
}
