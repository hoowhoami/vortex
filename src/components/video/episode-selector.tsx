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
import type { Video } from "@/types";

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
  // Source switching props
  availableSources?: Video[];
  currentApiSource?: string;
  currentApiId?: string;
  onApiSourceSwitch?: (source: string, id: string) => void;
  sourceSearchLoading?: boolean;
  sourceSearchError?: string | null;
}

export function EpisodeSelector({
  sources,
  currentSourceIndex,
  currentEpisodeIndex,
  onSourceChange,
  onEpisodeChange,
  className,
  availableSources = [],
  currentApiSource = "",
  currentApiId = "",
  onApiSourceSwitch,
  sourceSearchLoading = false,
  sourceSearchError = null,
}: EpisodeSelectorProps) {
  const currentSource = sources[currentSourceIndex];
  const currentEpisodes = currentSource?.episodes || [];

  // Tab state: 'episodes' or 'sources'
  const [activeTab, setActiveTab] = React.useState<'episodes' | 'sources'>(
    currentEpisodes.length > 1 ? 'episodes' : 'sources'
  );

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
      {/* Tab Switcher */}
      {currentEpisodes.length > 1 && availableSources && availableSources.length > 0 && (
        <div className="flex border-b flex-shrink-0">
          <button
            onClick={() => setActiveTab('episodes')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'episodes'
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            选集
          </button>
          <button
            onClick={() => setActiveTab('sources')}
            className={cn(
              "flex-1 py-2 text-sm font-medium transition-colors",
              activeTab === 'sources'
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            换源
          </button>
        </div>
      )}

      {/* Episodes Tab */}
      {activeTab === 'episodes' && (
        <>
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
        </>
      )}

      {/* Sources Tab */}
      {activeTab === 'sources' && (
        <div className="flex-1 overflow-y-auto space-y-2">
          {sourceSearchLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">搜索中...</p>
              </div>
            </div>
          )}

          {sourceSearchError && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="text-sm text-destructive">{sourceSearchError}</p>
              </div>
            </div>
          )}

          {!sourceSearchLoading && !sourceSearchError && (!availableSources || availableSources.length === 0) && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl mb-2">📺</div>
                <p className="text-sm text-muted-foreground">暂无可用的播放源</p>
              </div>
            </div>
          )}

          {!sourceSearchLoading && !sourceSearchError && availableSources && availableSources.length > 0 && (
            <>
              {availableSources.map((sourceVideo) => {
                const firstSource = sourceVideo.sources?.[0];
                if (!firstSource) return null;

                const isCurrent = firstSource.sourceId === currentApiSource;

                return (
                  <div
                    key={`${firstSource.sourceId}-${sourceVideo.id}`}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer",
                      isCurrent
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-accent"
                    )}
                    onClick={() =>
                      !isCurrent && onApiSourceSwitch?.(firstSource.sourceId, sourceVideo.id)
                    }
                  >
                    {/* Cover */}
                    <div className="flex-shrink-0 w-12 h-16 bg-muted rounded overflow-hidden">
                      {sourceVideo.cover && (
                        <img
                          src={sourceVideo.cover}
                          alt={sourceVideo.title}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">
                        {sourceVideo.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-0.5 border border-border rounded">
                          {firstSource.sourceName}
                        </span>
                        {firstSource.episodes && firstSource.episodes.length > 1 && (
                          <span className="text-xs text-muted-foreground">
                            {firstSource.episodes.length} 集
                          </span>
                        )}
                        {isCurrent && (
                          <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
                            当前
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default EpisodeSelector;
