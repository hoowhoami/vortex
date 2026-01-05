/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";
import { getBaseUrl, resolveUrl } from "@/lib/live";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");
  const allowCORS = searchParams.get("allowCORS") === "true";

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let response: Response | null = null;
  let responseUsed = false;

  try {
    const decodedUrl = decodeURIComponent(url);

    response = await fetch(decodedUrl, {
      cache: "no-cache",
      redirect: "follow",
      credentials: "same-origin",
      headers: {
        "User-Agent": "AptvPlayer/1.4.10",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch m3u8" },
        { status: 500 }
      );
    }

    const contentType = response.headers.get("Content-Type") || "";
    // Rewrite m3u8
    if (
      contentType.toLowerCase().includes("mpegurl") ||
      contentType.toLowerCase().includes("octet-stream")
    ) {
      // Get final response URL (after redirects)
      const finalUrl = response.url;
      const m3u8Content = await response.text();
      responseUsed = true; // Mark response as used

      // Use final response URL as baseUrl, not the original request URL
      const baseUrl = getBaseUrl(finalUrl);

      // Rewrite M3U8 content
      const modifiedContent = rewriteM3U8Content(
        m3u8Content,
        baseUrl,
        request,
        allowCORS
      );

      const headers = new Headers();
      headers.set("Content-Type", contentType);
      headers.set("Access-Control-Allow-Origin", "*");
      headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Range, Origin, Accept"
      );
      headers.set("Cache-Control", "no-cache");
      headers.set(
        "Access-Control-Expose-Headers",
        "Content-Length, Content-Range"
      );
      return new Response(modifiedContent, { headers });
    }

    // Just proxy
    const headers = new Headers();
    headers.set(
      "Content-Type",
      response.headers.get("Content-Type") || "application/vnd.apple.mpegurl"
    );
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Range, Origin, Accept"
    );
    headers.set("Cache-Control", "no-cache");
    headers.set(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );

    // Return video stream directly
    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch m3u8" },
      { status: 500 }
    );
  } finally {
    // Ensure response is properly closed to release resources
    if (response && !responseUsed) {
      try {
        response.body?.cancel();
      } catch (error) {
        // Ignore errors when closing
        console.warn("Failed to close response body:", error);
      }
    }
  }
}

function rewriteM3U8Content(
  content: string,
  baseUrl: string,
  req: Request,
  allowCORS: boolean
) {
  // Extract protocol from referer header
  const referer = req.headers.get("referer");
  let protocol = "http";
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      protocol = refererUrl.protocol.replace(":", "");
    } catch (error) {
      // ignore
    }
  }

  const host = req.headers.get("host");
  const proxyBase = `${protocol}://${host}/api/proxy`;

  const lines = content.split("\n");
  const rewrittenLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Process TS segment URLs and other media files
    if (line && !line.startsWith("#")) {
      const resolvedUrl = resolveUrl(baseUrl, line);
      const proxyUrl = allowCORS
        ? resolvedUrl
        : `${proxyBase}/segment?url=${encodeURIComponent(resolvedUrl)}`;
      rewrittenLines.push(proxyUrl);
      continue;
    }

    // Process EXT-X-MAP tag URI
    if (line.startsWith("#EXT-X-MAP:")) {
      line = rewriteMapUri(line, baseUrl, proxyBase);
    }

    // Process EXT-X-KEY tag URI
    if (line.startsWith("#EXT-X-KEY:")) {
      line = rewriteKeyUri(line, baseUrl, proxyBase);
    }

    // Process nested M3U8 files (EXT-X-STREAM-INF)
    if (line.startsWith("#EXT-X-STREAM-INF:")) {
      rewrittenLines.push(line);
      // Next line is usually the M3U8 URL
      if (i + 1 < lines.length) {
        i++;
        const nextLine = lines[i].trim();
        if (nextLine && !nextLine.startsWith("#")) {
          const resolvedUrl = resolveUrl(baseUrl, nextLine);
          const proxyUrl = `${proxyBase}/m3u8?url=${encodeURIComponent(
            resolvedUrl
          )}`;
          rewrittenLines.push(proxyUrl);
        } else {
          rewrittenLines.push(nextLine);
        }
      }
      continue;
    }

    rewrittenLines.push(line);
  }

  return rewrittenLines.join("\n");
}

function rewriteMapUri(line: string, baseUrl: string, proxyBase: string) {
  const uriMatch = line.match(/URI="([^"]+)"/);
  if (uriMatch) {
    const originalUri = uriMatch[1];
    const resolvedUrl = resolveUrl(baseUrl, originalUri);
    const proxyUrl = `${proxyBase}/segment?url=${encodeURIComponent(
      resolvedUrl
    )}`;
    return line.replace(uriMatch[0], `URI="${proxyUrl}"`);
  }
  return line;
}

function rewriteKeyUri(line: string, baseUrl: string, proxyBase: string) {
  const uriMatch = line.match(/URI="([^"]+)"/);
  if (uriMatch) {
    const originalUri = uriMatch[1];
    const resolvedUrl = resolveUrl(baseUrl, originalUri);
    const proxyUrl = `${proxyBase}/key?url=${encodeURIComponent(resolvedUrl)}`;
    return line.replace(uriMatch[0], `URI="${proxyUrl}"`);
  }
  return line;
}
