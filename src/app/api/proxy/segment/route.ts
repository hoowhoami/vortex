/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let response: Response | null = null;
  let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const decodedUrl = decodeURIComponent(url);
    response = await fetch(decodedUrl, {
      headers: {
        "User-Agent": "AptvPlayer/1.4.10",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch segment" },
        { status: 500 }
      );
    }

    const headers = new Headers();
    headers.set("Content-Type", "video/mp2t");
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Range, Origin, Accept"
    );
    headers.set("Accept-Ranges", "bytes");
    headers.set(
      "Access-Control-Expose-Headers",
      "Content-Length, Content-Range"
    );

    const contentLength = response.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }

    // Use streaming to avoid consuming memory
    const stream = new ReadableStream({
      start(controller) {
        if (!response?.body) {
          controller.close();
          return;
        }

        reader = response.body.getReader();
        const isCancelled = false;

        function pump() {
          if (isCancelled || !reader) {
            return;
          }

          reader
            .read()
            .then(({ done, value }) => {
              if (isCancelled) {
                return;
              }

              if (done) {
                controller.close();
                cleanup();
                return;
              }

              controller.enqueue(value);
              pump();
            })
            .catch((error) => {
              if (!isCancelled) {
                controller.error(error);
                cleanup();
              }
            });
        }

        function cleanup() {
          if (reader) {
            try {
              reader.releaseLock();
            } catch (e) {
              // Reader might already be released, ignore errors
            }
            reader = null;
          }
        }

        pump();
      },
      cancel() {
        // When stream is cancelled, ensure all resources are released
        if (reader) {
          try {
            reader.releaseLock();
          } catch (e) {
            // Reader might already be released, ignore errors
          }
          reader = null;
        }

        if (response?.body) {
          try {
            response.body.cancel();
          } catch (e) {
            // Ignore errors when cancelling
          }
        }
      },
    });

    return new Response(stream, { headers });
  } catch (error) {
    // Ensure resources are released even in error cases
    if (reader) {
      try {
        (reader as ReadableStreamDefaultReader<Uint8Array>).releaseLock();
      } catch (e) {
        // Ignore errors
      }
    }

    if (response?.body) {
      try {
        response.body.cancel();
      } catch (e) {
        // Ignore errors
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch segment" },
      { status: 500 }
    );
  }
}
