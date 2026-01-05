/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing image URL" }, { status: 400 });
  }

  try {
    const decodedUrl = decodeURIComponent(imageUrl);
    const imageResponse = await fetch(decodedUrl, {
      cache: "no-cache",
      redirect: "follow",
      credentials: "same-origin",
      headers: {
        "User-Agent": "AptvPlayer/1.4.10",
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: imageResponse.statusText },
        { status: imageResponse.status }
      );
    }

    const contentType = imageResponse.headers.get("content-type");

    if (!imageResponse.body) {
      return NextResponse.json(
        { error: "Image response has no body" },
        { status: 500 }
      );
    }

    // Create response headers
    const headers = new Headers();
    if (contentType) {
      headers.set("Content-Type", contentType);
    }

    // Set cache headers
    headers.set("Cache-Control", "public, max-age=86400, s-maxage=86400"); // Cache for 1 day

    // Return image stream directly
    return new Response(imageResponse.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching image" },
      { status: 500 }
    );
  }
}
