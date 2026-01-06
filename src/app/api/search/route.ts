import { NextRequest } from "next/server";
import { SearchManager, AppleCMSClient } from "@/lib/api/search";
import { getAvailableApiSites } from "@/lib/config";
import { getAuthInfoFromCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 初始化搜索管理器
async function getSearchManager(username?: string): Promise<SearchManager> {
  const manager = new SearchManager();

  // 从配置中获取用户可访问的视频源
  const sources = await getAvailableApiSites(username);
  sources.forEach((source: any) => {
    const client = new AppleCMSClient(source.key, source.name, source.api);
    manager.registerClient(client);
  });

  return manager;
}

// GET /api/search - 搜索
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";
  const type = searchParams.get("type") || undefined;
  const year = searchParams.get("year") || undefined;

  if (!keyword) {
    return Response.json({ error: "Keyword is required" }, { status: 400 });
  }

  // Get username from auth
  const authInfo = getAuthInfoFromCookie(request);
  const username = authInfo?.username;

  const manager = await getSearchManager(username);

  try {
    const results = await manager.searchAll({
      keyword,
      type,
      year,
    });

    return Response.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Search failed",
        videos: [],
        sources: {},
        total: 0,
      },
      { status: 500 }
    );
  }
}
