import { NextResponse } from "next/server";
import { getCacheTime } from "@/lib/config";
import { fetchDoubanData } from "@/lib/douban";
import { DoubanItem, DoubanResult } from "@/types";

interface DoubanApiResponse {
  subjects: Array<{
    id: string;
    title: string;
    cover: string;
    rate: string;
  }>;
}

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Get parameters
  const type = searchParams.get("type");
  const tag = searchParams.get("tag");
  const pageSize = parseInt(searchParams.get("pageSize") || "16");
  const pageStart = parseInt(searchParams.get("pageStart") || "0");

  // Validate parameters
  if (!type || !tag) {
    return NextResponse.json(
      { error: "Missing required parameters: type or tag" },
      { status: 400 }
    );
  }

  if (!["tv", "movie"].includes(type)) {
    return NextResponse.json(
      { error: "type parameter must be tv or movie" },
      { status: 400 }
    );
  }

  if (pageSize < 1 || pageSize > 100) {
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

  if (tag === "top250") {
    return handleTop250(pageStart);
  }

  const target = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${tag}&sort=recommend&page_limit=${pageSize}&page_start=${pageStart}`;

  try {
    // Call Douban API
    const doubanData = await fetchDoubanData<DoubanApiResponse>(target);

    // Transform data format
    const list: DoubanItem[] = doubanData.subjects.map((item) => ({
      id: item.id,
      title: item.title,
      poster: item.cover,
      rate: item.rate,
      year: "",
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
      { error: "Failed to fetch Douban data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

async function handleTop250(pageStart: number) {
  const target = `https://movie.douban.com/top250?start=${pageStart}&filter=`;

  // Use fetch directly to get HTML page
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  const fetchOptions = {
    signal: controller.signal,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
      Referer: "https://movie.douban.com/",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    },
  };

  try {
    const fetchResponse = await fetch(target, fetchOptions);
    clearTimeout(timeoutId);

    if (!fetchResponse.ok) {
      throw new Error(`HTTP error! Status: ${fetchResponse.status}`);
    }

    // Get HTML content
    const html = await fetchResponse.text();

    // Use regex to capture movie id, title, poster, and rating
    const moviePattern =
      /<div class="item">[\s\S]*?<a[^>]+href="https?:\/\/movie\.douban\.com\/subject\/(\d+)\/"[\s\S]*?<img[^>]+alt="([^"]+)"[^>]*src="([^"]+)"[\s\S]*?<span class="rating_num"[^>]*>([^<]*)<\/span>[\s\S]*?<\/div>/g;
    const movies: DoubanItem[] = [];
    let match;

    while ((match = moviePattern.exec(html)) !== null) {
      const id = match[1];
      const title = match[2];
      const cover = match[3];
      const rate = match[4] || "";

      // Process image URL to ensure HTTPS
      const processedCover = cover.replace(/^http:/, "https:");

      movies.push({
        id: id,
        title: title,
        poster: processedCover,
        rate: rate,
        year: "",
      });
    }

    const apiResponse: DoubanResult = {
      code: 200,
      message: "Success",
      list: movies,
    };

    const cacheTime = await getCacheTime();
    return NextResponse.json(apiResponse, {
      headers: {
        "Cache-Control": `public, max-age=${cacheTime}, s-maxage=${cacheTime}`,
        "CDN-Cache-Control": `public, s-maxage=${cacheTime}`,
        "Vercel-CDN-Cache-Control": `public, s-maxage=${cacheTime}`,
        "Netlify-Vary": "query",
      },
    });
  } catch (error) {
    clearTimeout(timeoutId);
    return NextResponse.json(
      {
        error: "Failed to fetch Douban Top250 data",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
