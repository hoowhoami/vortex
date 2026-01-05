/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInfoFromCookie } from "@/lib/auth";
import { db, isLocalStorage } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/searchhistory
 * Returns user's search history
 */
export async function GET(request: NextRequest) {
  try {
    // LocalStorage mode: not supported server-side
    if (isLocalStorage) {
      return NextResponse.json(
        { error: "Server-side storage not available in local mode" },
        { status: 400 }
      );
    }

    // Get user info from cookie
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const history = await db.getSearchHistory(authInfo.username);
    return NextResponse.json(history, { status: 200 });
  } catch (err) {
    console.error("Failed to get search history", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/searchhistory
 * body: { keyword: string }
 */
export async function POST(request: NextRequest) {
  try {
    // LocalStorage mode: not supported server-side
    if (isLocalStorage) {
      return NextResponse.json(
        { error: "Server-side storage not available in local mode" },
        { status: 400 }
      );
    }

    // Get user info from cookie
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== "string") {
      return NextResponse.json({ error: "Missing or invalid keyword" }, { status: 400 });
    }

    await db.addSearchHistory(authInfo.username, keyword);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to add search history", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/searchhistory
 *
 * 1. Without query -> Clear all search history
 * 2. With keyword=xxx -> Delete specific keyword
 */
export async function DELETE(request: NextRequest) {
  try {
    // LocalStorage mode: not supported server-side
    if (isLocalStorage) {
      return NextResponse.json(
        { error: "Server-side storage not available in local mode" },
        { status: 400 }
      );
    }

    // Get user info from cookie
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get("keyword");

    await db.deleteSearchHistory(authInfo.username, keyword || undefined);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to delete search history", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
