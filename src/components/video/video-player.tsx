"use client";

import * as React from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";

export interface VideoPlayerProps {
  url: string;
  poster?: string;
  title?: string;
  autoPlay?: boolean;
  startTime?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
}

export function VideoPlayer({
  url,
  poster,
  title,
  autoPlay = false,
  startTime = 0,
  onTimeUpdate,
  onEnded,
  onError,
}: VideoPlayerProps) {
  const playerRef = React.useRef<Artplayer | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Initialize player
  React.useEffect(() => {
    if (!containerRef.current) return;

    const instance = new Artplayer({
      container: containerRef.current,
      url: url,
      poster: poster,
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: autoPlay,
      pip: true,
      autoSize: true,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      theme: "#6366f1",
      lang: "zh-cn",
      customType: {
        m3u8: (video: HTMLVideoElement, url: string) => {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(url);
            hls.attachMedia(video);
          } else if ((video as any).canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          } else {
            onError?.(new Error("HLS is not supported"));
          }
        },
      },
    });

    playerRef.current = instance;

    // Event listeners
    instance.on("video:timeupdate", () => {
      onTimeUpdate?.(instance.currentTime);
    });

    instance.on("video:ended", () => {
      onEnded?.();
    });

    instance.on("error", (error) => {
      onError?.(error as Error);
    });

    // Wake Lock API to prevent screen sleep
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      try {
        if ("wakeLock" in navigator) {
          wakeLock = await (navigator as any).wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("Wake Lock error:", err);
      }
    };

    instance.on("video:play", requestWakeLock);

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    };

    instance.on("video:pause", releaseWakeLock);
    instance.on("destroy", releaseWakeLock);

    return () => {
      instance.destroy();
      releaseWakeLock();
    };
  }, [url, poster, title, autoPlay]); // Only reinitialize if these change

  // Update currentTime if changed
  React.useEffect(() => {
    if (playerRef.current && startTime > 0) {
      playerRef.current.seek = startTime;
    }
  }, [startTime]);

  return (
    <div className="relative w-full bg-black">
      <div ref={containerRef} className="aspect-video w-full" />
    </div>
  );
}

export default VideoPlayer;
