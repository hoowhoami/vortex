import { NextResponse } from "next/server";
import { getCacheTime } from "@/lib/config";
import { fetchDoubanData } from "@/lib/douban";
import { DoubanItem, DoubanResult } from "@/types";

interface DoubanCategoryApiResponse {
  total: number;
  items: Array<{
    id: string;
    title: string;
    card_subtitle: string;
    pic: {
      large: string;
      normal: string;
    };
    rating: {
      value: number;
    };
  }>;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Get parameters
  const kind = searchParams.get("kind") || "movie";
  const category = searchParams.get("category");
  const type = searchParams.get("type");
  const pageLimit = parseInt(searchParams.get("limit") || "20");
  const pageStart = parseInt(searchParams.get("start") || "0");

  // Validate parameters
  if (!kind || !category || !type) {
    return NextResponse.json(
      { error: "Missing required parameters: kind or category or type" },
      { status: 400 }
    );
  }

  if (!["tv", "movie"].includes(kind)) {
    return NextResponse.json(
      { error: "kind parameter must be tv or movie" },
      { status: 400 }
    );
  }

  if (pageLimit < 1 || pageLimit > 100) {
    return NextResponse.json(
      { error: "pageSize must be between 1-100" },
      { status: 400 }
    );
  }

  if (pageStart < 0) {
    return NextResponse.json(
      { error: "pageStart cannot be less than 0" },
      { status: 400 }
    );
  }

  const target = `https://m.douban.com/rexxar/api/v2/subject/recent_hot/${kind}?start=${pageStart}&limit=${pageLimit}&category=${category}&type=${type}`;

  try {
    // Call Douban API
    const doubanData =
      await fetchDoubanData<DoubanCategoryApiResponse>(target);

    // Transform data format
    const list: DoubanItem[] = doubanData.items.map((item) => ({
      id: item.id,
      title: item.title,
      poster: item.pic?.normal || item.pic?.large || "",
      rate: item.rating?.value ? item.rating.value.toFixed(1) : "",
      year: item.card_subtitle?.match(/(\d{4})/)?.[1] || "",
    }));

    const response: DoubanResult = {
      code: 200,
      message: "Success",
      list: list,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        "CDN-Cache-Control": `public, s-maxage=${cacheTime}`,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${cacheTime}`,
        "Netlify-Vary": "query",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch Douban data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
