"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Heart, Trash2 } from "lucide-react";
import {
  getAllPlayRecords,
  deletePlayRecord,
  getAllFavorites,
  deleteFavorite,
} from "@/lib/db.client";
import type { DbPlayRecord, DbFavorite } from "@/lib/db/types";

// Convert DB format to display format
function convertPlayRecords(records: Record<string, DbPlayRecord>) {
  return Object.entries(records)
    .map(([key, record]) => ({
      key,
      ...record,
    }))
    .sort((a, b) => b.save_time - a.save_time);
}

function convertFavorites(favorites: Record<string, DbFavorite>) {
  return Object.entries(favorites)
    .map(([key, fav]) => ({
      key,
      ...fav,
    }))
    .sort((a, b) => b.save_time - a.save_time);
}

export default function HomePage() {
  const router = useRouter();
  const [playRecords, setPlayRecords] = React.useState<Array<DbPlayRecord & { key: string }>>([]);
  const [favorites, setFavorites] = React.useState<Array<DbFavorite & { key: string }>>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data on mount
  React.useEffect(() => {
    loadData();
  }, []);

  // Listen for data updates via CustomEvents
  React.useEffect(() => {
    const handlePlayRecordsUpdate = (e: CustomEvent) => {
      setPlayRecords(convertPlayRecords(e.detail));
    };

    const handleFavoritesUpdate = (e: CustomEvent) => {
      setFavorites(convertFavorites(e.detail));
    };

    window.addEventListener("playRecordsUpdated", handlePlayRecordsUpdate as EventListener);
    window.addEventListener("favoritesUpdated", handleFavoritesUpdate as EventListener);

    return () => {
      window.removeEventListener("playRecordsUpdated", handlePlayRecordsUpdate as EventListener);
      window.removeEventListener("favoritesUpdated", handleFavoritesUpdate as EventListener);
    };
  }, []);

  const loadData = async () => {
    try {
      const [recordsData, favoritesData] = await Promise.all([
        getAllPlayRecords(),
        getAllFavorites(),
      ]);

      setPlayRecords(convertPlayRecords(recordsData));
      setFavorites(convertFavorites(favoritesData));
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (key: string) => {
    // Extract source and id from key (format: source+id)
    const [source, id] = key.split("+");
    router.push(`/play/${id}?source=${source}`);
  };

  const handleDeleteRecord = async (key: string) => {
    try {
      const [source, id] = key.split("+");
      await deletePlayRecord(source, id);
      // UI will update automatically via CustomEvent
    } catch (error) {
      console.error("Failed to delete record:", error);
    }
  };

  const handleRemoveFavorite = async (key: string) => {
    try {
      const [source, id] = key.split("+");
      await deleteFavorite(source, id);
      // UI will update automatically via CustomEvent
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    }
  };

  const formatProgress = (playTime: number, totalTime: number) => {
    if (totalTime === 0) return "0%";
    return `${Math.round((playTime / totalTime) * 100)}%`;
  };

  const formatEpisode = (index: number, totalEpisodes: number) => {
    if (totalEpisodes === 1) return "电影";
    return `第${index}集`;
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">首页</h1>
          <p className="text-muted-foreground">发现精彩内容</p>
        </div>

        {/* Continue Watching */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">继续观看</h2>
          {playRecords.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无播放记录</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {playRecords.slice(0, 10).map((record) => (
                <Card
                  key={record.key}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => handlePlay(record.key)}
                      className="relative aspect-video bg-muted rounded-t-lg overflow-hidden"
                    >
                      {record.cover && (
                        <img
                          src={record.cover}
                          alt={record.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      {record.total_time > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(record.play_time / record.total_time) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                        {record.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {formatEpisode(record.index, record.total_episodes)} ·{" "}
                        {formatProgress(record.play_time, record.total_time)}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record.key);
                        }}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        删除
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Favorites */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">我的收藏</h2>
          {favorites.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>暂无收藏</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((fav) => (
                <Card
                  key={fav.key}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => handlePlay(fav.key)}
                      className="relative aspect-[2/3] bg-muted rounded-t-lg overflow-hidden"
                    >
                      {fav.cover && (
                        <img
                          src={fav.cover}
                          alt={fav.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">{fav.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {fav.year} · {fav.total_episodes > 1 ? `${fav.total_episodes}集` : "电影"}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.key);
                        }}
                      >
                        <Trash2 className="mr-1 h-3 w-3" />
                        取消收藏
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageLayout>
  );
}
