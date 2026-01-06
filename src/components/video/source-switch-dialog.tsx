"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Video } from "@/types";
import { cn } from "@/lib/utils/utils";

interface SourceSwitchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableSources: Video[];
  currentSource: string;
  currentId: string;
  onSourceSelect: (source: string, id: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function SourceSwitchDialog({
  open,
  onOpenChange,
  availableSources,
  currentSource,
  currentId,
  onSourceSelect,
  loading = false,
  error = null,
}: SourceSwitchDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>切换播放源</DialogTitle>
        </DialogHeader>

        <div className="max-h-[500px] overflow-y-auto pr-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">搜索中...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-2xl mb-2">⚠️</div>
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          )}

          {!loading && !error && availableSources.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="text-4xl mb-2">📺</div>
                <p className="text-sm text-muted-foreground">暂无可用的播放源</p>
              </div>
            </div>
          )}

          {!loading && !error && availableSources.length > 0 && (
            <div className="space-y-2">
              {availableSources.map((sourceVideo) => {
                // Get the first source from this video
                const firstSource = sourceVideo.sources?.[0];
                if (!firstSource) return null;

                const isCurrent = firstSource.sourceId === currentSource;

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
                      !isCurrent && onSourceSelect(firstSource.sourceId, sourceVideo.id)
                    }
                  >
                    {/* Cover */}
                    <div className="flex-shrink-0 w-12 h-20 bg-muted rounded overflow-hidden">
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
            </div>
          )}
        </div>

        <div className="flex justify-center pt-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`/search?q=${encodeURIComponent(availableSources[0]?.title || "")}`, "_blank")}
          >
            影片匹配有误？去搜索
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
