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
import { StorageService } from "@/lib/storage";
import type { Video } from "@/types";

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

          // Check if favorited
          setIsFavorite(StorageService.isFavorite(videoId));

          // Load play record
          const record = StorageService.getPlayRecord(videoId);
          if (record) {
            // Find the source and episode indices
            const sourceIndex = data.video.sources?.findIndex(
              (s: any) => s.sourceId === record.sourceId
            );
            if (sourceIndex >= 0) {
              setCurrentSourceIndex(sourceIndex);
              setCurrentEpisodeIndex(record.episodeIndex);
              setCurrentTime(record.progress);
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

  // Save play progress (debounced)
  const saveProgressTimeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);
  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);

    if (!video || !currentSource || !currentEpisode) return;

    // Debounce saving
    if (saveProgressTimeoutRef.current) {
      clearTimeout(saveProgressTimeoutRef.current);
    }

    saveProgressTimeoutRef.current = setTimeout(() => {
      StorageService.savePlayRecord({
        videoId: video.id,
        videoTitle: video.title,
        videoCover: video.cover,
        sourceId: currentSource.sourceId,
        sourceName: currentSource.sourceName,
        episodeIndex: currentEpisodeIndex,
        episodeName: currentEpisode.name,
        progress: time,
        duration: 0, // Will be updated when video ends
      });
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

  const handleToggleFavorite = () => {
    if (!video) return;

    const newState = StorageService.toggleFavorite({
      videoId: video.id,
      videoTitle: video.title,
      videoCover: video.cover,
      videoYear: video.year,
      videoType: video.type,
    });

    setIsFavorite(newState);
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
