import { NextResponse } from "next/server";

export const runtime = "nodejs";

/**
 * POST /api/logout
 * Logout endpoint - clears authentication cookie
 */
export async function POST() {
  const response = NextResponse.json({ ok: true });

  // Clear auth cookie
  response.cookies.set("auth", "", {
    path: "/",
    expires: new Date(0),
    sameSite: "lax",
    httpOnly: false,
    secure: false,
  });

  return response;
}
