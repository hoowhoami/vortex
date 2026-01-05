/* eslint-disable no-console, @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { generateSignature } from "@/lib/auth";
import { getConfig } from "@/lib/config";
import { db, storageType } from "@/lib/db";

export const runtime = "nodejs";

/**
 * Generate authentication cookie with signature
 */
async function generateAuthCookie(
  username?: string,
  password?: string,
  role?: "owner" | "admin" | "user",
  includePassword = false
): Promise<string> {
  const authData: any = { role: role || "user" };

  // Only include password for localStorage mode
  if (includePassword && password) {
    authData.password = password;
  }

  if (username && process.env.PASSWORD) {
    authData.username = username;
    // Sign username with password as secret
    const signature = await generateSignature(username, process.env.PASSWORD);
    authData.signature = signature;
    authData.timestamp = Date.now(); // Add timestamp for replay attack prevention
  }

  return encodeURIComponent(JSON.stringify(authData));
}

/**
 * POST /api/login
 * Login endpoint for both localStorage and database modes
 */
export async function POST(req: NextRequest) {
  try {
    // LocalStorage mode - validate with fixed password
    if (storageType === "localstorage") {
      const envPassword = process.env.PASSWORD;

      // If no password configured, allow access
      if (!envPassword) {
        const response = NextResponse.json({ ok: true });

        // Clear any existing auth cookie
        response.cookies.set("auth", "", {
          path: "/",
          expires: new Date(0),
          sameSite: "lax",
          httpOnly: false,
          secure: false,
        });

        return response;
      }

      const { password } = await req.json();
      if (typeof password !== "string") {
        return NextResponse.json({ error: "Password cannot be empty" }, { status: 400 });
      }

      if (password !== envPassword) {
        return NextResponse.json({ ok: false, error: "Incorrect password" }, { status: 401 });
      }

      // Validation successful, set auth cookie
      // Note: LocalStorage mode returns ONLY { ok: true } - no user info (matches LunaTV)
      const response = NextResponse.json({ ok: true });
      const cookieValue = await generateAuthCookie(undefined, password, "owner", true);
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiry

      response.cookies.set("auth", cookieValue, {
        path: "/",
        expires,
        sameSite: "lax",
        httpOnly: false,
        secure: false,
      });

      return response;
    }

    // Database mode - validate username and password
    const { username, password } = await req.json();

    if (!username || typeof username !== "string") {
      return NextResponse.json({ error: "Username cannot be empty" }, { status: 400 });
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password cannot be empty" }, { status: 400 });
    }

    // Check if this is the owner account
    if (
      username === process.env.USERNAME &&
      password === process.env.PASSWORD
    ) {
      // Owner login successful
      const response = NextResponse.json({
        ok: true,
        user: {
          username,
          role: "owner",
        },
      });
      const cookieValue = await generateAuthCookie(username, password, "owner", false);
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiry

      response.cookies.set("auth", cookieValue, {
        path: "/",
        expires,
        sameSite: "lax",
        httpOnly: false,
        secure: false,
      });

      return response;
    } else if (username === process.env.USERNAME) {
      return NextResponse.json({ error: "Incorrect username or password" }, { status: 401 });
    }

    // Check if user exists in configuration
    const config = await getConfig();
    const user = config.users.find((u) => u.username === username);
    if (user && user.banned) {
      return NextResponse.json({ error: "User is banned" }, { status: 401 });
    }

    // Verify user password from database
    try {
      const isValid = await db.verifyUser(username, password);
      if (!isValid) {
        return NextResponse.json(
          { error: "Incorrect username or password" },
          { status: 401 }
        );
      }

      // Login successful
      const response = NextResponse.json({
        ok: true,
        user: {
          username,
          role: user?.role || "user",
        },
      });
      const cookieValue = await generateAuthCookie(username, password, user?.role || "user", false);
      const expires = new Date();
      expires.setDate(expires.getDate() + 7); // 7 days expiry

      response.cookies.set("auth", cookieValue, {
        path: "/",
        expires,
        sameSite: "lax",
        httpOnly: false,
        secure: false,
      });

      return response;
    } catch (err) {
      console.error("Database verification failed", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  } catch (error) {
    console.error("Login API error", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
