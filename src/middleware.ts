/* eslint-disable no-console */

import { NextRequest, NextResponse } from "next/server";
import { getAuthInfoFromCookie, verifySignature } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip authentication for certain paths
  if (shouldSkipAuth(pathname)) {
    return NextResponse.next();
  }

  const storageType = process.env.NEXT_PUBLIC_STORAGE_TYPE || "localstorage";
  const password = process.env.PASSWORD;

  // If no password is set, allow access (development mode)
  if (!password && process.env.NODE_ENV === "development") {
    return NextResponse.next();
  }

  // Get authentication info from cookie
  const authInfo = getAuthInfoFromCookie(request);

  if (!authInfo) {
    return handleAuthFailure(request, pathname);
  }

  // LocalStorage mode: verify password directly
  if (storageType === "localstorage") {
    if (!authInfo.password || authInfo.password !== password) {
      return handleAuthFailure(request, pathname);
    }
    return NextResponse.next();
  }

  // Database modes: verify signature
  if (!authInfo.username || !authInfo.signature) {
    return handleAuthFailure(request, pathname);
  }

  // Verify HMAC signature
  const isValidSignature = await verifySignature(
    authInfo.username,
    authInfo.signature,
    password || ""
  );

  if (isValidSignature) {
    return NextResponse.next();
  }

  // Signature verification failed
  return handleAuthFailure(request, pathname);
}

/**
 * Handle authentication failure
 */
function handleAuthFailure(request: NextRequest, pathname: string): NextResponse {
  // For API routes, return 401
  if (pathname.startsWith("/api")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Redirect to login page
  const loginUrl = new URL("/login", request.url);
  const fullUrl = `${pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set("redirect", fullUrl);
  return NextResponse.redirect(loginUrl);
}

/**
 * Check if path should skip authentication
 */
function shouldSkipAuth(pathname: string): boolean {
  const skipPaths = [
    "/_next",
    "/favicon.ico",
    "/robots.txt",
    "/manifest.json",
    "/icons/",
    "/logo.png",
    "/sw.js",
    "/workbox-",
  ];

  return skipPaths.some((path) => pathname.startsWith(path));
}

/**
 * Configure middleware matcher
 */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|api/login|api/logout|api/server-config).*)",
  ],
};
