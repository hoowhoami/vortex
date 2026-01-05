"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Heart, Trash2 } from "lucide-react";
import { StorageService } from "@/lib/storage";
import type { PlayRecord, Favorite } from "@/types";

export default function HomePage() {
  const router = useRouter();
  const [playRecords, setPlayRecords] = React.useState<PlayRecord[]>([]);
  const [favorites, setFavorites] = React.useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    setPlayRecords(StorageService.getPlayRecords());
    setFavorites(StorageService.getFavorites());
    setIsLoading(false);
  }, []);

  const handlePlay = (videoId: string) => {
    router.push(`/play/${videoId}`);
  };

  const handleDeleteRecord = (videoId: string) => {
    StorageService.deletePlayRecord(videoId);
    setPlayRecords(StorageService.getPlayRecords());
  };

  const handleRemoveFavorite = (videoId: string) => {
    StorageService.removeFavorite(videoId);
    setFavorites(StorageService.getFavorites());
  };

  const formatProgress = (progress: number, duration: number) => {
    if (duration === 0) return "0%";
    return `${Math.round((progress / duration) * 100)}%`;
  };

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">首页</h1>
          <p className="text-muted-foreground">
            发现精彩内容
          </p>
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
                  key={record.videoId}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => handlePlay(record.videoId)}
                      className="relative aspect-video bg-muted rounded-t-lg overflow-hidden"
                    >
                      {record.videoCover && (
                        <img
                          src={record.videoCover}
                          alt={record.videoTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                      {record.duration > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                          <div
                            className="h-full bg-primary"
                            style={{
                              width: `${(record.progress / record.duration) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                        {record.videoTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                        {record.episodeName}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRecord(record.videoId);
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
                  key={fav.videoId}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-0">
                    <div
                      onClick={() => handlePlay(fav.videoId)}
                      className="relative aspect-[2/3] bg-muted rounded-t-lg overflow-hidden"
                    >
                      {fav.videoCover && (
                        <img
                          src={fav.videoCover}
                          alt={fav.videoTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-1 mb-1">
                        {fav.videoTitle}
                      </h3>
                      <p className="text-xs text-muted-foreground mb-2">
                        {fav.videoYear} · {fav.videoType}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.videoId);
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
