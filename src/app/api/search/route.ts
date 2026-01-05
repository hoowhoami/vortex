import { NextRequest } from "next/server";
import { SearchManager, AppleCMSClient } from "@/lib/api/search";
import { DEFAULT_CONFIG } from "@/lib/config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 初始化搜索管理器
function getSearchManager(): SearchManager {
  const manager = new SearchManager();

  // 从配置中注册所有视频源
  DEFAULT_CONFIG.sources.forEach((source) => {
    if (source.enabled) {
      const client = new AppleCMSClient(source.id, source.name, source.api);
      manager.registerClient(client);
    }
  });

  return manager;
}

// GET /api/search - 流式搜索
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const keyword = searchParams.get("keyword") || "";
  const type = searchParams.get("type") || undefined;
  const year = searchParams.get("year") || undefined;

  if (!keyword) {
    return new Response("Keyword is required", { status: 400 });
  }

  const manager = getSearchManager();

  // 创建 SSE 流
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const results = await manager.searchAll({
          keyword,
          type,
          year,
        });

        // 发送结果
        const data = JSON.stringify(results);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));

        controller.close();
      } catch (error) {
        console.error("Search error:", error);
        const errorData = JSON.stringify({
          error: error instanceof Error ? error.message : "Search failed",
        });
        controller.enqueue(encoder.encode(`data: ${errorData}\n\n`));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
