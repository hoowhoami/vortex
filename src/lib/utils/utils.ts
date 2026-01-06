import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function getDoubanImageProxyConfig(): {
  proxyType:
    | "direct"
    | "server"
    | "img3"
    | "cmliussss-cdn-tencent"
    | "cmliussss-cdn-ali"
    | "custom";
  proxyUrl: string;
} {
  if (typeof window === "undefined") {
    return { proxyType: "cmliussss-cdn-tencent", proxyUrl: "" };
  }

  const doubanImageProxyType =
    localStorage.getItem("doubanImageProxyType") ||
    (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY_TYPE ||
    "cmliussss-cdn-tencent";
  const doubanImageProxy =
    localStorage.getItem("doubanImageProxyUrl") ||
    (window as any).RUNTIME_CONFIG?.DOUBAN_IMAGE_PROXY ||
    "";
  return {
    proxyType: doubanImageProxyType,
    proxyUrl: doubanImageProxy,
  };
}

/**
 * Process image URL, use proxy if configured
 */
export function processImageUrl(originalUrl: string): string {
  if (!originalUrl) return originalUrl;

  // Only process Douban images
  if (!originalUrl.includes("doubanio.com")) {
    return originalUrl;
  }

  const { proxyType, proxyUrl } = getDoubanImageProxyConfig();
  switch (proxyType) {
    case "server":
      return `/api/image-proxy?url=${encodeURIComponent(originalUrl)}`;
    case "img3":
      return originalUrl.replace(/img\d+\.doubanio\.com/g, "img3.doubanio.com");
    case "cmliussss-cdn-tencent":
      return originalUrl.replace(
        /img\d+\.doubanio\.com/g,
        "img.doubanio.cmliussss.net"
      );
    case "cmliussss-cdn-ali":
      return originalUrl.replace(
        /img\d+\.doubanio\.com/g,
        "img.doubanio.cmliussss.com"
      );
    case "custom":
      return `${proxyUrl}${encodeURIComponent(originalUrl)}`;
    case "direct":
    default:
      return originalUrl;
  }
}

