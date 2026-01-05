/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInfoFromCookie } from "@/lib/auth";
import { db, isLocalStorage } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/change-password
 * Change user password
 * body: { oldPassword: string; newPassword: string }
 */
export async function POST(request: NextRequest) {
  try {
    // LocalStorage mode: not supported
    if (isLocalStorage) {
      return NextResponse.json(
        { error: "Password change not supported in local mode" },
        { status: 400 }
      );
    }

    // Get user info from cookie
    const authInfo = getAuthInfoFromCookie(request);
    if (!authInfo || !authInfo.username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { oldPassword, newPassword } = body;

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: "Old password and new password are required" },
        { status: 400 }
      );
    }

    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return NextResponse.json({ error: "Invalid password format" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "New password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Verify old password
    const isValid = await db.verifyUser(authInfo.username, oldPassword);
    if (!isValid) {
      return NextResponse.json({ error: "Incorrect old password" }, { status: 401 });
    }

    // Change password
    await db.changePassword(authInfo.username, newPassword);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Failed to change password", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
