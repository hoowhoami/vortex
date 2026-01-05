"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
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
  const videoId = params.id as string;

  const [video, setVideo] = React.useState<Video | null>(null);
  const [currentSourceIndex, setCurrentSourceIndex] = React.useState(0);
  const [currentEpisodeIndex, setCurrentEpisodeIndex] = React.useState(0);
  const [currentTime, setCurrentTime] = React.useState(0);
  const [duration, setDuration] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isFavorite, setIsFavorite] = React.useState(false);

  const currentSource = video?.sources?.[currentSourceIndex];
  const currentEpisode = currentSource?.episodes[currentEpisodeIndex];

  // Load video details and play record
  React.useEffect(() => {
    const loadVideoData = async () => {
      setIsLoading(true);
      try {
        // Load video details from API
        const response = await fetch(`/api/detail?id=${videoId}`);
        if (response.ok) {
          const data = await response.json();
          setVideo(data.video);

          // Check if favorited using first available source
          if (data.video.sources && data.video.sources.length > 0) {
            const firstSource = data.video.sources[0].sourceId;
            const favorited = await isFavorited(firstSource, videoId);
            setIsFavorite(favorited);
          }

          // Load play record from all sources
          const allRecords = await getAllPlayRecords();

          // Find a matching record for this video
          let foundRecord: DbPlayRecord | null = null;
          let recordSourceId = "";

          for (const source of data.video.sources || []) {
            const key = `${source.sourceId}+${videoId}`;
            if (allRecords[key]) {
              foundRecord = allRecords[key];
              recordSourceId = source.sourceId;
              break;
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
          }
        }
      } catch (error) {
        console.error("Failed to load video data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadVideoData();
  }, [videoId]);

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
        const record: DbPlayRecord = {
          title: video.title,
          source_name: currentSource.sourceName,
          cover: video.cover || "",
          year: video.year || "",
          index: currentEpisodeIndex,
          total_episodes: currentSource.episodes.length,
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
          total_episodes: currentSource.episodes.length,
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
        <div className="space-y-6">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回
          </Button>
          <div className="flex items-center gap-3">
            <div className="text-sm text-muted-foreground">
              <Clock className="mr-1 inline h-4 w-4" />
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, "0")}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className={isFavorite ? "text-red-500" : ""}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Video Info */}
        {video && (
          <div className="flex gap-4">
            {video.cover && (
              <img
                src={video.cover}
                alt={video.title}
                className="w-32 h-44 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{video.title}</h1>
              <p className="text-sm text-muted-foreground mb-1">
                {video.year} · {video.type}
              </p>
              {video.actors && video.actors.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  主演: {video.actors.join(" / ")}
                </p>
              )}
              {video.director && video.director.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  导演: {video.director.join(" / ")}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Video Player */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {currentEpisode && (
              <VideoPlayer
                url={currentEpisode.url}
                poster={video?.cover}
                title={currentEpisode.name}
                autoPlay={false}
                startTime={currentTime}
                onTimeUpdate={handleTimeUpdate}
              />
            )}
          </CardContent>
        </Card>

        {/* Episode Selector */}
        {video?.sources && video.sources.length > 0 && (
          <Card>
            <CardContent className="p-6">
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
    </PageLayout>
  );
}
