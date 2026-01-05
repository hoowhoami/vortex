import { DoubanItem, DoubanCategory } from "@/types";

export interface DoubanResponse {
  items: DoubanItem[];
  total: number;
  start: number;
  count: number;
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
