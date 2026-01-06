import { DoubanItem, DoubanCategory } from "@/types";

export interface DoubanResponse {
  items: DoubanItem[];
  total: number;
  start: number;
  count: number;
}

export interface DoubanResult {
  code: number;
  message: string;
  list: DoubanItem[];
}

interface DoubanCategoriesParams {
  kind: "tv" | "movie";
  category: string;
  type: string;
  limit?: number;
  start?: number;
}

interface DoubanRecommendsParams {
  kind: "tv" | "movie";
  format?: string;
  category?: string;
  region?: string;
  year?: string;
  sort?: string;
  limit?: number;
  start?: number;
}

// Douban API 客户端
export class DoubanClient {
  private proxyBase: string;

  constructor(proxyBase?: string) {
    this.proxyBase = proxyBase || "";
  }

  /**
   * 获取豆瓣热门内容
   */
  async getHot(category: string, start = 0, count = 20): Promise<DoubanResponse> {
    try {
      // 这里需要通过代理服务器访问豆瓣API
      // 实际项目中需要配置反向代理或使用第三方API
      const url = `${this.proxyBase}/api/douban/hot?category=${category}&start=${start}&count=${count}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch Douban hot content:`, error);
      return {
        items: [],
        total: 0,
        start,
        count,
      };
    }
  }

  /**
   * 搜索豆瓣内容
   */
  async search(keyword: string, start = 0, count = 20): Promise<DoubanResponse> {
    try {
      const url = `${this.proxyBase}/api/douban/search?q=${encodeURIComponent(keyword)}&start=${start}&count=${count}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to search Douban:`, error);
      return {
        items: [],
        total: 0,
        start,
        count,
      };
    }
  }

  /**
   * 获取豆瓣Top250
   */
  async getTop250(start = 0, count = 20): Promise<DoubanResponse> {
    try {
      const url = `${this.proxyBase}/api/douban/top250?start=${start}&count=${count}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch Douban Top250:`, error);
      return {
        items: [],
        total: 0,
        start,
        count,
      };
    }
  }
}

// Mock data generator for development
export function generateMockDoubanData(count: number): DoubanItem[] {
  const types: Array<"movie" | "tv" | "anime"> = ["movie", "tv", "anime"];
  const titles = [
    "肖申克的救赎", "霸王别姬", "阿甘正传", "泰坦尼克号", "这个杀手不太冷",
    "千与千寻", "美丽人生", "辛德勒的名单", "盗梦空间", "忠犬八公的故事",
    "海上钢琴师", "三傻大闹宝莱坞", "放牛班的春天", "楚门的世界", "大话西游",
    "罗马假日", "教父", "龙猫", "当幸福来敲门", "怦然心动"
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `douban-${i + 1}`,
    title: titles[i % titles.length] || `电影标题 ${i + 1}`,
    year: `${2020 - (i % 10)}`,
    rate: `${(8.0 + Math.random() * 1.5).toFixed(1)}`,
    poster: `https://picsum.photos/200/300?random=${i}`,
  }));
}

/**
 * Get Douban categories data
 */
export async function getDoubanCategories(
  params: DoubanCategoriesParams
): Promise<DoubanResult> {
  const { kind, category, type, limit = 20, start = 0 } = params;

  try {
    const response = await fetch(
      `/api/douban/categories?kind=${kind}&category=${encodeURIComponent(category)}&type=${encodeURIComponent(type)}&limit=${limit}&start=${start}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Douban categories:", error);
    return {
      code: 500,
      message: "获取失败",
      list: [],
    };
  }
}

/**
 * Get Douban recommends data with filters
 */
export async function getDoubanRecommends(
  params: DoubanRecommendsParams
): Promise<DoubanResult> {
  const {
    kind,
    format = "",
    category = "",
    region = "",
    year = "",
    sort = "",
    limit = 20,
    start = 0,
  } = params;

  try {
    const queryParams = new URLSearchParams();
    queryParams.append("kind", kind);
    queryParams.append("limit", limit.toString());
    queryParams.append("start", start.toString());
    if (category) queryParams.append("category", category);
    if (format) queryParams.append("format", format);
    if (region) queryParams.append("region", region);
    if (year) queryParams.append("year", year);
    if (sort) queryParams.append("sort", sort);

    const response = await fetch(`/api/douban/recommends?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch Douban recommends:", error);
    return {
      code: 500,
      message: "获取失败",
      list: [],
    };
  }
}

/**
 * Bangumi calendar data interface
 */
export interface BangumiCalendarData {
  weekday: {
    id: number;
    en: string;
    cn: string;
    ja: string;
  };
  items: {
    id: number;
    name: string;
    name_cn: string;
    rating?: {
      score: number;
    };
    air_date: string;
    images?: {
      large: string;
      common: string;
      medium: string;
      small: string;
      grid: string;
    };
  }[];
}

/**
 * Get Bangumi calendar data
 */
export async function GetBangumiCalendarData(): Promise<BangumiCalendarData[]> {
  try {
    const response = await fetch("https://api.bgm.tv/calendar");
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const filteredData = data.map((item: BangumiCalendarData) => ({
      ...item,
      items: item.items.filter((bangumiItem) => bangumiItem.images),
    }));

    return filteredData;
  } catch (error) {
    console.error("Failed to fetch Bangumi calendar:", error);
    return [];
  }
}

