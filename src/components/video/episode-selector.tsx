"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronRight, Play } from "lucide-react";
import { cn } from "@/lib/utils/utils";

export interface VideoSource {
  sourceId: string;
  sourceName: string;
  episodes: VideoEpisode[];
}

export interface VideoEpisode {
  name: string;
  url: string;
}

interface EpisodeSelectorProps {
  sources: VideoSource[];
  currentSourceIndex: number;
  currentEpisodeIndex: number;
  onSourceChange: (index: number) => void;
  onEpisodeChange: (episodeIndex: number) => void;
  className?: string;
}

export function EpisodeSelector({
  sources,
  currentSourceIndex,
  currentEpisodeIndex,
  onSourceChange,
  onEpisodeChange,
  className,
}: EpisodeSelectorProps) {
  const currentSource = sources[currentSourceIndex];
  const currentEpisodes = currentSource?.episodes || [];

  // Group episodes by season/series if possible
  const episodeGroups = React.useMemo(() => {
    // Simple implementation: all episodes in one group
    return [
      {
        title: "选集",
        episodes: currentEpisodes,
      },
    ];
  }, [currentEpisodes]);

  const handlePreviousEpisode = () => {
    if (currentEpisodeIndex > 0) {
      onEpisodeChange(currentEpisodeIndex - 1);
    }
  };

  const handleNextEpisode = () => {
    if (currentEpisodeIndex < currentEpisodes.length - 1) {
      onEpisodeChange(currentEpisodeIndex + 1);
    }
  };

  return (
    <div className={cn("space-y-4 h-full flex flex-col", className)}>
      {/* Source Selector */}
      {sources.length > 1 && (
        <div className="flex-shrink-0">
          <div className="text-sm font-medium mb-2">播放源</div>
          <Select
            value={String(currentSourceIndex)}
            onValueChange={(value) => onSourceChange(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="选择播放源" />
            </SelectTrigger>
            <SelectContent>
              {sources.map((source, index) => (
                <SelectItem key={source.sourceId} value={String(index)}>
                  {source.sourceName} ({source.episodes.length}集)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Current Episode Info and Navigation */}
      {currentEpisodes.length > 0 && (
        <div className="flex-shrink-0 space-y-2">
          <div className="text-sm">
            <span className="text-muted-foreground">当前播放：</span>
            <span className="ml-2 font-semibold">
              {currentEpisodes[currentEpisodeIndex]?.name}
            </span>
            <span className="ml-2 text-muted-foreground">
              ({currentEpisodeIndex + 1} / {currentEpisodes.length})
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousEpisode}
              disabled={currentEpisodeIndex === 0}
              className="flex-1"
            >
              上一集
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextEpisode}
              disabled={currentEpisodeIndex === currentEpisodes.length - 1}
              className="flex-1"
            >
              下一集
            </Button>
          </div>
        </div>
      )}

      {/* Episode Grid */}
      <div className="flex-1 overflow-y-auto">
        {episodeGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h3 className="text-sm font-medium sticky top-0 bg-background py-1">
              {group.title} ({group.episodes.length}集)
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {group.episodes.map((episode, index) => {
                const isActive = index === currentEpisodeIndex;
                const isWatched = false; // TODO: Implement watch status

                return (
                  <Button
                    key={episode.url}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "relative h-9",
                      isActive && "ring-2 ring-primary",
                      isWatched && "text-muted-foreground"
                    )}
                    onClick={() => onEpisodeChange(index)}
                  >
                    {index + 1}
                    {isWatched && (
                      <Play className="absolute bottom-0.5 right-0.5 h-3 w-3" />
                    )}
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EpisodeSelector;
