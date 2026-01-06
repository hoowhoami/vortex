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
  onTimeUpdate?: (currentTime: number, duration?: number) => void;
  onEnded?: () => void;
  onError?: (error: Error) => void;
  skipConfig?: {
    enable: boolean;
    intro_time: number;
    outro_time: number;
  };
  blockAdEnabled?: boolean;
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
  skipConfig = { enable: false, intro_time: 0, outro_time: 0 },
  blockAdEnabled = true,
}: VideoPlayerProps) {
  const playerRef = React.useRef<Artplayer | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const skipConfigRef = React.useRef(skipConfig);
  const lastSkipCheckRef = React.useRef(0);

  // Sync skipConfig to ref
  React.useEffect(() => {
    skipConfigRef.current = skipConfig;
  }, [skipConfig]);

  // Format time helper
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Initialize player
  React.useEffect(() => {
    if (!containerRef.current) return;

    const artplayerInstance: any = new Artplayer({
      container: containerRef.current,
      url: url,
      poster: poster,
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: autoPlay,
      pip: true,
      autoSize: false,
      autoMini: false,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: false,
      theme: "#22c55e",
      lang: "zh-cn",
      hotkey: true,
      fastForward: true,
      autoOrientation: true,
      lock: true,
      moreVideoAttr: {
        crossOrigin: "anonymous",
      },
      customType: {
        m3u8: (video: HTMLVideoElement, url: string) => {
          if (!Hls.isSupported()) {
            console.error("HLS.js is not supported");
            return;
          }

          // Clean up existing hls instance
          if ((video as any).hls) {
            (video as any).hls.destroy();
          }

          const hls = new Hls({
            debug: false,
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 30,
            backBufferLength: 30,
            maxBufferSize: 60 * 1000 * 1000,
          });

          hls.loadSource(url);
          hls.attachMedia(video);
          (video as any).hls = hls;

          hls.on(Hls.Events.ERROR, function (event: any, data: any) {
            console.error("HLS Error:", event, data);
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  console.log("Network error, trying to recover...");
                  hls.startLoad();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.log("Media error, trying to recover...");
                  hls.recoverMediaError();
                  break;
                default:
                  console.log("Unrecoverable error");
                  hls.destroy();
                  break;
              }
            }
          });
        },
      },
      settings: [
        {
          html: "去广告",
          icon: '<text x="50%" y="50%" font-size="20" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="#ffffff">AD</text>',
          tooltip: blockAdEnabled ? "已开启" : "已关闭",
          onClick() {
            // This is just a placeholder - actual implementation would be in the parent component
            return blockAdEnabled ? "当前开启" : "当前关闭";
          },
        },
        {
          name: "跳过片头片尾",
          html: "跳过片头片尾",
          switch: skipConfigRef.current.enable,
          onSwitch: function (item) {
            // This is just a placeholder - actual implementation would be in the parent component
            return !item.switch;
          },
        },
        {
          html: "设置片头",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="5" cy="12" r="2" fill="#ffffff"/><path d="M9 12L17 12" stroke="#ffffff" stroke-width="2"/><path d="M17 6L17 18" stroke="#ffffff" stroke-width="2"/></svg>',
          tooltip:
            skipConfigRef.current.intro_time === 0
              ? "设置片头时间"
              : `${formatTime(skipConfigRef.current.intro_time)}`,
          onClick: function () {
            const currentTime = artplayerInstance.currentTime;
            const newConfig = {
              ...skipConfigRef.current,
              intro_time: currentTime,
            };
            // This would update the parent component's state
            console.log("Set intro time to:", formatTime(currentTime));
            return formatTime(currentTime);
          },
        },
        {
          html: "设置片尾",
          icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="19" cy="12" r="2" fill="#ffffff"/><path d="M15 12L7 12" stroke="#ffffff" stroke-width="2"/><path d="M7 6L7 18" stroke="#ffffff" stroke-width="2"/></svg>',
          tooltip:
            skipConfigRef.current.outro_time === 0
              ? "设置片尾时间"
              : `${formatTime(skipConfigRef.current.outro_time)}`,
          onClick: function () {
            const currentTime = artplayerInstance.currentTime;
            const newConfig = {
              ...skipConfigRef.current,
              outro_time: currentTime,
            };
            // This would update the parent component's state
            console.log("Set outro time to:", formatTime(currentTime));
            return formatTime(currentTime);
          },
        },
      ],
    });

    playerRef.current = artplayerInstance;

    // Event listeners
    artplayerInstance.on("video:timeupdate", () => {
      const currentTime = artplayerInstance.currentTime;
      onTimeUpdate?.(currentTime, artplayerInstance.duration);

      // Skip intro/outro logic
      if (skipConfigRef.current.enable) {
        const now = Date.now();
        // Only check every 500ms to avoid performance issues
        if (now - lastSkipCheckRef.current > 500) {
          lastSkipCheckRef.current = now;

          const { intro_time, outro_time } = skipConfigRef.current;

          // Skip intro
          if (intro_time > 0 && currentTime >= intro_time && currentTime < intro_time + 2) {
            artplayerInstance.seek = intro_time + 2;
            console.log("Skipped intro at:", formatTime(currentTime));
          }

          // Skip outro (if we're close to the end)
          const duration = artplayerInstance.duration;
          if (outro_time > 0 && currentTime >= outro_time && duration > 0 && outro_time < duration - 5) {
            artplayerInstance.seek = outro_time + 5;
            console.log("Skipped outro at:", formatTime(currentTime));
          }
        }
      }
    });

    artplayerInstance.on("video:ended", () => {
      onEnded?.();
    });

    artplayerInstance.on("error", (error: any) => {
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

    artplayerInstance.on("video:play", requestWakeLock);

    const releaseWakeLock = () => {
      if (wakeLock) {
        wakeLock.release();
        wakeLock = null;
      }
    };

    artplayerInstance.on("video:pause", releaseWakeLock);
    artplayerInstance.on("destroy", releaseWakeLock);

    return () => {
      artplayerInstance.destroy();
      releaseWakeLock();
    };
  }, [url, poster, title, autoPlay, skipConfig, blockAdEnabled]); // Reinitialize when these change

  // Update currentTime if changed externally
  React.useEffect(() => {
    if (playerRef.current && startTime > 0 && Math.abs(playerRef.current.currentTime - startTime) > 1) {
      playerRef.current.seek = startTime;
    }
  }, [startTime]);

  return (
    <div className="relative w-full bg-black rounded-xl overflow-hidden">
      <div ref={containerRef} className="aspect-video w-full" />
    </div>
  );
}

export default VideoPlayer;
