import { NextRequest } from "next/server";

/**
 * Authentication information structure
 */
export interface AuthInfo {
  password?: string; // For localStorage mode
  username?: string; // For database modes
  signature?: string; // HMAC signature for database modes
  timestamp?: number; // Timestamp for replay protection
  role?: "owner" | "admin" | "user"; // User role
}

/**
 * Get authentication info from server-side cookie
 */
export function getAuthInfoFromCookie(request: NextRequest): AuthInfo | null {
  const authCookie = request.cookies.get("auth");

  if (!authCookie) {
    return null;
  }

  try {
    const decoded = decodeURIComponent(authCookie.value);
    const authData = JSON.parse(decoded);
    return authData;
  } catch {
    return null;
  }
}

/**
 * Get authentication info from browser cookie (client-side)
 */
export function getAuthInfoFromBrowserCookie(): AuthInfo | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const cookies = document.cookie.split(";").reduce((acc, cookie) => {
      const trimmed = cookie.trim();
      const firstEqualIndex = trimmed.indexOf("=");

      if (firstEqualIndex > 0) {
        const key = trimmed.substring(0, firstEqualIndex);
        const value = trimmed.substring(firstEqualIndex + 1);
        if (key && value) {
          acc[key] = value;
        }
      }

      return acc;
    }, {} as Record<string, string>);

    const authCookie = cookies["auth"];
    if (!authCookie) {
      return null;
    }

    // Handle possible double encoding
    let decoded = decodeURIComponent(authCookie);

    // If still contains %, it's double encoded
    if (decoded.includes("%")) {
      decoded = decodeURIComponent(decoded);
    }

    const authData = JSON.parse(decoded);
    return authData;
  } catch {
    return null;
  }
}

/**
 * Generate HMAC-SHA256 signature for authentication
 */
export async function generateSignature(data: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    // Import key
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );

    // Generate signature
    const signature = await crypto.subtle.sign("HMAC", key, messageData);

    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch (error) {
    console.error("Failed to generate signature:", error);
    throw error;
  }
}

/**
 * Verify HMAC-SHA256 signature
 */
export async function verifySignature(
  data: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(data);

  try {
    // Import key
    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Convert hex string to Uint8Array
    const signatureBuffer = new Uint8Array(
      signature.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) || []
    );

    // Verify signature
    return await crypto.subtle.verify("HMAC", key, signatureBuffer, messageData);
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(authInfo: AuthInfo): string {
  const authValue = encodeURIComponent(JSON.stringify(authInfo));
  const maxAge = 7 * 24 * 60 * 60; // 7 days

  document.cookie = `auth=${authValue}; path=/; max-age=${maxAge}; samesite=strict`;

  return authValue;
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(): void {
  document.cookie = "auth=; path=/; max-age=0";
}

/**
 * Get current user info from localStorage (client-side only)
 */
export function getCurrentUser():
  | { username: string; role: "owner" | "admin" | "user" }
  | null {
  if (typeof window === "undefined") return null;

  try {
    const userStr = localStorage.getItem("vortex_user");
    if (!userStr) return null;
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
