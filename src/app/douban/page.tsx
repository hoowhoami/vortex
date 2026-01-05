"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Play } from "lucide-react";
import { generateMockDoubanData } from "@/lib/api/douban";
import type { DoubanItem } from "@/types";

export default function DoubanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = React.useState(searchParams.get("tab") || "hot-movies");
  const [hotMovies, setHotMovies] = React.useState<DoubanItem[]>([]);
  const [hotTvs, setHotTvs] = React.useState<DoubanItem[]>([]);
  const [top250, setTop250] = React.useState<DoubanItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    // Load data - using mock data for now
    const loadData = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API calls
        await new Promise((resolve) => setTimeout(resolve, 500));
        setHotMovies(generateMockDoubanData(20));
        setHotTvs(generateMockDoubanData(20));
        setTop250(generateMockDoubanData(50));
      } catch (error) {
        console.error("Failed to load Douban data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleItemClick = (item: DoubanItem) => {
    // 通过豆瓣信息搜索视频源
    router.push(`/search?keyword=${encodeURIComponent(item.title)}`);
  };

  const renderDoubanCard = (item: DoubanItem) => (
    <Card
      key={item.id}
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleItemClick(item)}
    >
      <CardContent className="p-0">
        <div className="relative aspect-[2/3] bg-muted rounded-t-lg overflow-hidden">
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Play className="h-12 w-12 text-white" />
          </div>
          <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {item.rate}
          </div>
        </div>
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-1 mb-1">
            {item.title}
          </h3>
          <p className="text-xs text-muted-foreground mb-1">
            {item.year}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingGrid = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 15 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">豆瓣影视</h1>
          <p className="text-muted-foreground">
            浏览豆瓣高分影视作品
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="hot-movies">热门电影</TabsTrigger>
            <TabsTrigger value="hot-tvs">热门剧集</TabsTrigger>
            <TabsTrigger value="top250">豆瓣Top250</TabsTrigger>
          </TabsList>

          <TabsContent value="hot-movies" className="mt-6">
            {isLoading ? (
              renderLoadingGrid()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {hotMovies.map(renderDoubanCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="hot-tvs" className="mt-6">
            {isLoading ? (
              renderLoadingGrid()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {hotTvs.map(renderDoubanCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="top250" className="mt-6">
            {isLoading ? (
              renderLoadingGrid()
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {top250.map(renderDoubanCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
