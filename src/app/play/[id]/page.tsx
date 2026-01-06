"use client";

import * as React from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { VideoPlayer } from "@/components/video/video-player";
import { EpisodeSelector, VideoSource } from "@/components/video/episode-selector";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Heart } from "lucide-react";
import {
  getAllPlayRecords,
  savePlayRecord,
  isFavorited,
  saveFavorite,
  deleteFavorite,
} from "@/lib/db.client";
import type { Video } from "@/types";
import type { DbPlayRecord, DbFavorite } from "@/lib/db/types";

export const dynamic = "force-dynamic";

// Mock data - will be replaced with API calls
const mockVideoSources: VideoSource[] = [
  {
    sourceId: "source1",
    sourceName: "播放源1",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      name: `第 ${i + 1} 集`,
      url: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`, // Mock HLS URL
    })),
  },
  {
    sourceId: "source2",
    sourceName: "播放源2",
    episodes: Array.from({ length: 24 }, (_, i) => ({
      name: `第 ${i + 1} 集`,
      url: `https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8`,
    })),
  },
];

export default function PlayPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const videoId = params.id as string;
  const sourceParam = searchParams.get("source") || "";

  const [video, setVideo] = React.useState<Video | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = React.useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);

  // Skip intro/outro configuration
  const [skipConfig, setSkipConfig] = React.useState<{
    enable: boolean;
    intro_time: number;
    outro_time: number;
  }>({
    enable: false,
    intro_time: 0,
    outro_time: 0,
  });

  // Load skip config from localStorage on mount
  React.useEffect(() => {
    const loadSkipConfig = () => {
      try {
        const saved = localStorage.getItem(`skip_${videoId}`);
        if (saved) {
          setSkipConfig(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load skip config:", error);
      }
    };

    loadSkipConfig();
  }, [videoId]);

  // Save skip config when it changes
  React.useEffect(() => {
    const saveSkipConfig = () => {
      try {
        localStorage.setItem(`skip_${videoId}`, JSON.stringify(skipConfig));
      } catch (error) {
        console.error("Failed to save skip config:", error);
      }
    };

    saveSkipConfig();
  }, [skipConfig, videoId]);

  const currentSource = video?.sources?.[currentSourceIndex];
  const currentEpisode = currentSource?.episodes[currentEpisodeIndex];

  // Load video details and play record
  React.useEffect(() => {
    const loadVideoData = async () => {
      setIsLoading(true);
      try {
        console.log('[Play Page] Fetching detail for videoId:', videoId, 'sourceParam:', sourceParam);

        // Check if source parameter is provided
        if (!sourceParam) {
          console.error('[Play Page] Missing source parameter');
          setVideo(null);
          setIsLoading(false);
          return;
        }

        // Load video details from API using separate source and id parameters
        const response = await fetch(`/api/detail?source=${encodeURIComponent(sourceParam)}&id=${encodeURIComponent(videoId)}`);
        console.log('[Play Page] API response status:', response.status);

        if (response.ok) {
          const data = await response.json();
          console.log('[Play Page] API response data:', data);

          if (!data.video) {
            console.error('[Play Page] No video data in response');
            setVideo(null);
            setIsLoading(false);
            return;
          }

          setVideo(data.video);

          // Use provided source or first available source
          const targetSource = sourceParam || data.video.sources?.[0]?.sourceId;

          // Check if favorited
          if (targetSource) {
            const favorited = await isFavorited(targetSource, videoId);
            setIsFavorite(favorited);
          }

          // Load play record from all sources
          const allRecords = await getAllPlayRecords();

          // Find a matching record for this video
          let foundRecord: DbPlayRecord | null = null;
          let recordSourceId = "";

          if (data.video.sources && Array.isArray(data.video.sources)) {
            for (const source of data.video.sources) {
              const key = `${source.sourceId}+${videoId}`;
              if (allRecords[key]) {
                foundRecord = allRecords[key];
                recordSourceId = source.sourceId;
                break;
              }
            }
          }

          if (foundRecord) {
            // Find the source index
            const sourceIndex = data.video.sources?.findIndex(
              (s: any) => s.sourceId === recordSourceId
            );
            if (sourceIndex >= 0) {
              setCurrentSourceIndex(sourceIndex);
              setCurrentEpisodeIndex(foundRecord.index);
              setCurrentTime(foundRecord.play_time);
              setDuration(foundRecord.total_time);
            }
          } else if (sourceParam && data.video.sources) {
            // If source is provided but no record, try to select that source
            const sourceIndex = data.video.sources.findIndex(
              (s: any) => s.sourceId === sourceParam
            );
            if (sourceIndex >= 0) {
              setCurrentSourceIndex(sourceIndex);
            }
          }
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('[Play Page] API error:', errorData);
          setVideo(null);
        }
      } catch (error) {
        console.error('[Play Page] Failed to load video data:', error);
        setVideo(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoData();
  }, [videoId, sourceParam]);

  // Listen for favorites updates
  React.useEffect(() => {
    const handleFavoritesUpdate = async () => {
      if (video?.sources && video.sources.length > 0) {
        const firstSource = video.sources[0].sourceId;
        const favorited = await isFavorited(firstSource, videoId);
        setIsFavorite(favorited);
      }
    };

    window.addEventListener("favoritesUpdated", handleFavoritesUpdate);
    return () => {
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate);
    };
  }, [video, videoId]);

  // Keyboard shortcuts for episode navigation
  React.useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Ignore if in input field
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA"
      ) {
        return;
      }

      // Alt + Left Arrow = Previous episode
      if (e.altKey && e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentEpisodeIndex > 0) {
          handleEpisodeChange(currentEpisodeIndex - 1);
        }
      }

      // Alt + Right Arrow = Next episode
      if (e.altKey && e.key === "ArrowRight") {
        e.preventDefault();
        const totalEpisodes = currentSource?.episodes?.length || 0;
        if (currentEpisodeIndex < totalEpisodes - 1) {
          handleEpisodeChange(currentEpisodeIndex + 1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [currentEpisodeIndex, currentSource]);

  // Save play progress (debounced)
  const saveProgressTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const handleTimeUpdate = (time: number, videoDuration?: number) => {
    setCurrentTime(time);
    if (videoDuration) {
      setDuration(videoDuration);
    }

    if (!video || !currentSource || !currentEpisode) return;

    // Debounce saving
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    saveProgressTimeoutRef.current = setTimeout(async () => {
      try {
        if (!video || !currentSource || !currentEpisode) return;

        const record: DbPlayRecord = {
          title: video.title,
          source_name: currentSource.sourceName,
          cover: video.cover || "",
          year: video.year || "",
          index: currentEpisodeIndex,
          total_episodes: currentSource.episodes?.length || 0,
          play_time: Math.floor(time),
          total_time: Math.floor(videoDuration || duration || 0),
          save_time: Date.now(),
          search_title: video.title,
        };

        await savePlayRecord(currentSource.sourceId, videoId, record);
      } catch (error) {
        console.error("Failed to save play record:", error);
      }
    }, 2000); // Save every 2 seconds
  };

  const handleSourceChange = (index: number) => {
    setCurrentSourceIndex(index);
    setCurrentEpisodeIndex(0);
    setCurrentTime(0);
  };

  const handleEpisodeChange = (index: number) => {
    setCurrentEpisodeIndex(index);
    setCurrentTime(0);
  };

  const handleNextEpisode = () => {
    const totalEpisodes = currentSource?.episodes?.length || 0;
    if (currentEpisodeIndex < totalEpisodes - 1) {
      handleEpisodeChange(currentEpisodeIndex + 1);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleToggleFavorite = async () => {
    if (!video || !currentSource) return;

    try {
      if (isFavorite) {
        // Remove from favorites
        await deleteFavorite(currentSource.sourceId, videoId);
        setIsFavorite(false);
      } else {
        // Add to favorites
        const favorite: DbFavorite = {
          title: video.title,
          source_name: currentSource.sourceName,
          cover: video.cover || "",
          year: video.year || "",
          total_episodes: currentSource.episodes?.length || 0,
          save_time: Date.now(),
          search_title: video.title,
        };

        await saveFavorite(currentSource.sourceId, videoId, favorite);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex flex-col gap-4 py-4 px-5 lg:px-[3rem] 2xl:px-20">
          {/* Loading skeleton for player */}
          <Skeleton className="aspect-video w-full rounded-xl" />
          {/* Loading skeleton for info */}
          <div className="flex gap-4">
            <Skeleton className="w-32 h-44 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
          {/* Loading skeleton for episode selector */}
          <Skeleton className="h-40 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (!video) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">未找到视频信息</p>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            返回
          </Button>
        </div>
      </PageLayout>
    );
  }

  // Check if video has playable sources
  const hasPlayableSources = video.sources && video.sources.length > 0 &&
    video.sources.some((source) => source.episodes && source.episodes.length > 0);

  if (!hasPlayableSources) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">该视频暂无播放源</p>
          <Button variant="outline" className="mt-4" onClick={handleBack}>
            返回
          </Button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex flex-col gap-4 py-4 px-5 lg:px-[3rem] 2xl:px-20">
        {/* Header - Episode Title */}
        <div className="py-1">
          <h1 className="text-2xl font-bold">
            {video?.title || "未知标题"} &gt; 第{currentEpisodeIndex + 1}集
          </h1>
        </div>

        {/* Video Player and Episode Selector */}
        <div className="grid gap-4 lg:grid-cols-4">
          {/* Player Section */}
          <div className="lg:col-span-3">
            <div className="bg-black rounded-xl overflow-hidden">
              {currentEpisode && (
                <VideoPlayer
                  url={currentEpisode.url}
                  poster={video?.cover}
                  title={`${video?.title || ""} - ${currentEpisode.name}`}
                  autoPlay={false}
                  startTime={currentTime}
                  onTimeUpdate={handleTimeUpdate}
                  onEnded={handleNextEpisode}
                  skipConfig={skipConfig}
                />
              )}
            </div>
          </div>

          {/* Episode Selector Section */}
          <div className="lg:col-span-1">
            {video?.sources && video.sources.length > 0 && (
              <Card>
                <CardContent className="p-4">
                  <EpisodeSelector
                    sources={video.sources}
                    currentSourceIndex={currentSourceIndex}
                    currentEpisodeIndex={currentEpisodeIndex}
                    onSourceChange={handleSourceChange}
                    onEpisodeChange={handleEpisodeChange}
                  />
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Video Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Info Section */}
          <div className="md:col-span-3 space-y-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{video?.title}</h1>
              <p className="text-sm text-muted-foreground mb-1">
                {video?.year} · {video?.type}
              </p>
              {video?.actors && video.actors.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  主演: {video.actors?.join(" / ")}
                </p>
              )}
              {video?.director && video.director.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  导演: {video.director?.join(" / ")}
                </p>
              )}
            </div>
          </div>

          {/* Cover Section */}
          <div className="md:col-span-1">
            {video?.cover && (
              <img
                src={video.cover}
                alt={video.title}
                className="w-full rounded-lg shadow-lg"
              />
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
