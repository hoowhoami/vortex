/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInfoFromCookie } from "@/lib/auth";
import { db, isLocalStorage } from "@/lib/db";
import { DbPlayRecord } from "@/lib/db/types";

export const runtime = "nodejs";

/**
 * GET /api/playrecords
 *
 * Supports two modes:
 * 1. Without query -> Returns all play records (Record<string, DbPlayRecord>)
 * 2. With key=source+id -> Returns single play record (DbPlayRecord | null)
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
    if (!authInfo) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For database modes, username is required
    if (!authInfo.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    // Query single play record
    if (key) {
      const [source, id] = key.split("+");
      if (!source || !id) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
      }
      const record = await db.getPlayRecord(authInfo.username, source, id);
      return NextResponse.json(record, { status: 200 });
    }

    // Query all play records
    const records = await db.getAllPlayRecords(authInfo.username);
    return NextResponse.json(records, { status: 200 });
  } catch (err) {
    console.error("Failed to get play records", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/playrecords
 * body: { key: string; record: DbPlayRecord }
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
    const { key, record }: { key: string; record: DbPlayRecord } = body;

    if (!key || !record) {
      return NextResponse.json({ error: "Missing key or record" }, { status: 400 });
    }

    // Validate required fields
    if (!record.title || !record.source_name) {
      return NextResponse.json({ error: "Invalid record data" }, { status: 400 });
    }

    const [source, id] = key.split("+");
    if (!source || !id) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
    }

    const finalRecord: DbPlayRecord = {
      ...record,
      save_time: record.save_time ?? Date.now(),
    };

    await db.savePlayRecord(authInfo.username, source, id, finalRecord);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to save play record", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/playrecords
 *
 * 1. Without query -> Clear all play records
 * 2. With key=source+id -> Delete single play record
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
      // Delete single record
      const [source, id] = key.split("+");
      if (!source || !id) {
        return NextResponse.json({ error: "Invalid key format" }, { status: 400 });
      }
      await db.deletePlayRecord(username, source, id);
    } else {
      // Clear all records
      const all = await db.getAllPlayRecords(username);
      await Promise.all(
        Object.keys(all).map(async (k) => {
          const [s, i] = k.split("+");
          if (s && i) await db.deletePlayRecord(username, s, i);
        })
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to delete play record", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
