/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInfoFromCookie } from "@/lib/auth";
import { db, isLocalStorage } from "@/lib/db";
import { DbFavorite } from "@/lib/db/types";

export const runtime = "nodejs";

/**
 * GET /api/favorites
 *
 * Supports two modes:
 * 1. Without query -> Returns all favorites (Record<string, DbFavorite>)
 * 2. With key=source+id -> Returns single favorite (DbFavorite | null)
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

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Query single favorite
    if (key) {
      const [source, id] = key.split("+");
      if (!source || !id) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
      }
      const fav = await db.getFavorite(authInfo.username, source, id);
      return NextResponse.json(fav, { status: 200 });
    }

    // Query all favorites
    const favorites = await db.getAllFavorites(authInfo.username);
    return NextResponse.json(favorites, { status: 200 });
  } catch (err) {
    console.error("Failed to get favorites", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/favorites
 * body: { key: string; favorite: DbFavorite }
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
    const { key, favorite }: { key: string; favorite: DbFavorite } = body;

    if (!key || !favorite) {
      return NextResponse.json({ error: "Missing key or favorite" }, { status: 400 });
    }

    // Validate required fields
    if (!favorite.title || !favorite.source_name) {
      return NextResponse.json({ error: "Invalid favorite data" }, { status: 400 });
    }

    const [source, id] = key.split("+");
    if (!source || !id) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
    }

    const finalFavorite: DbFavorite = {
      ...favorite,
      save_time: favorite.save_time ?? Date.now(),
    };

    await db.saveFavorite(authInfo.username, source, id, finalFavorite);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to save favorite", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/favorites
 *
 * 1. Without query -> Clear all favorites
 * 2. With key=source+id -> Delete single favorite
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

    const username = authInfo.username;
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (key) {
      // Delete single favorite
      const [source, id] = key.split("+");
      if (!source || !id) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
      }
      await db.deleteFavorite(username, source, id);
    } else {
      // Clear all favorites
      const all = await db.getAllFavorites(username);
      await Promise.all(
        Object.keys(all).map(async (k) => {
          const [s, i] = k.split("+");
          if (s && i) await db.deleteFavorite(username, s, i);
        })
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to delete favorite", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
