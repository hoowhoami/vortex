import { NextResponse } from "next/server";
import { storageType } from "@/lib/db";

export const runtime = "nodejs";

/**
 * GET /api/server-config
 * Returns public server configuration (no authentication required)
 */
export async function GET() {
  return NextResponse.json({
    storageType,
    siteName: process.env.NEXT_PUBLIC_SITE_NAME || "Vortex",
    announcement: process.env.ANNOUNCEMENT || "",
    version: process.env.npm_package_version || "1.0.0",
  });
}
