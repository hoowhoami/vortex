import { NextRequest } from "next/server";
import { AppleCMSClient } from "@/lib/api/search";
import { getAvailableApiSites } from "@/lib/config";
import { getAuthInfoFromCookie } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/detail?id=xxx - 获取视频详情
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const videoId = searchParams.get("id");

  if (!videoId) {
    return Response.json({ error: "Video ID is required" }, { status: 400 });
  }

  try {
    // 解析 videoId 获取源ID
    const sourceId = videoId.split("-")[0];

    // Get username from auth
    const authInfo = getAuthInfoFromCookie(request);
    const username = authInfo?.username;

    // 查找对应的源配置
    const sources = await getAvailableApiSites(username);
    const sourceConfig = sources.find((s: any) => s.key === sourceId);
    if (!sourceConfig) {
      return Response.json({ error: "Source not found or disabled" }, { status: 404 });
    }

    // 创建客户端并获取详情
    const client = new AppleCMSClient(
      sourceConfig.key,
      sourceConfig.name,
      sourceConfig.api
    );

    const video = await client.getDetail(videoId);

    if (!video) {
      return Response.json({ error: "Video not found" }, { status: 404 });
    }

    return Response.json({ video });
  } catch (error) {
    console.error("Detail fetch error:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to fetch detail" },
      { status: 500 }
    );
  }
}
