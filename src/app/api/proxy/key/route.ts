/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(url);
    console.log(decodedUrl);

    const response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "AptvPlayer/1.4.10",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch key" },
        { status: 500 }
      );
    }

    const keyData = await response.arrayBuffer();

    return new Response(keyData, {
      headers: {
        "Content-Type": "application/octet-stream",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch key" },
      { status: 500 }
    );
  }
}
