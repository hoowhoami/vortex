"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { ScrollableRow } from "@/components/ui/scrollable-row";
import { VideoCard } from "@/components/video/video-card";
import {
  getAllPlayRecords,
  clearAllPlayRecords,
  subscribeToDataUpdates,
} from "@/lib/db.client";
import type { DbPlayRecord } from "@/lib/db/types";

interface ContinueWatchingProps {
  className?: string;
}

export function ContinueWatching({ className }: ContinueWatchingProps) {
  const [playRecords, setPlayRecords] = React.useState<
    Array<DbPlayRecord & { key: string }>
  >([]);
  const [loading, setLoading] = React.useState(true);

  // Process play records data update
  const updatePlayRecords = React.useCallback((allRecords: Record<string, DbPlayRecord>) => {
    const recordsArray = Object.entries(allRecords).map(([key, record]) => ({
      ...record,
      key,
    }));

    // Sort by save_time descending (most recent first)
    const sortedRecords = recordsArray.sort(
      (a, b) => b.save_time - a.save_time
    );

    setPlayRecords(sortedRecords);
  }, []);

  React.useEffect(() => {
    const fetchPlayRecords = async () => {
      try {
        setLoading(true);
        const allRecords = await getAllPlayRecords();
        updatePlayRecords(allRecords);
      } catch (error) {
        console.error("Failed to fetch play records:", error);
        setPlayRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayRecords();

    // Listen for play records update events
    const unsubscribe = subscribeToDataUpdates(
      "playRecordsUpdated",
      (newRecords: Record<string, DbPlayRecord>) => {
        updatePlayRecords(newRecords);
      }
    );

    return unsubscribe;
  }, [updatePlayRecords]);

  // Don't render if no play records
  if (!loading && playRecords.length === 0) {
    return null;
  }

  // Calculate play progress percentage
  const getProgress = (record: DbPlayRecord) => {
    if (record.total_time === 0) return 0;
    return (record.play_time / record.total_time) * 100;
  };

  // Parse source and id from key
  const parseKey = (key: string) => {
    const [source, id] = key.split("+");
    return { source, id };
  };

  return (
    <section className={`mb-8 ${className || ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold">继续观看</h2>
        {!loading && playRecords.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await clearAllPlayRecords();
              setPlayRecords([]);
            }}
          >
            清空
          </Button>
        )}
      </div>

      <ScrollableRow>
        {loading
          ? // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                  <div className="absolute inset-0 bg-muted-foreground/10"></div>
                </div>
                <div className="mt-2 h-4 bg-muted rounded animate-pulse"></div>
                <div className="mt-1 h-3 bg-muted rounded animate-pulse"></div>
              </div>
            ))
          : // Real data
            playRecords.map((record) => {
              const { source, id } = parseKey(record.key);
              return (
                <div
                  key={record.key}
                  className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                >
                  <VideoCard
                    id={id}
                    title={record.title}
                    poster={record.cover}
                    year={record.year}
                    source={source}
                    source_name={record.source_name}
                    progress={getProgress(record)}
                    episodes={record.total_episodes}
                    currentEpisode={record.index}
                    query={record.search_title}
                    from="playrecord"
                    type={record.total_episodes > 1 ? "tv" : ""}
                  />
                </div>
              );
            })}
      </ScrollableRow>
    </section>
  );
}
