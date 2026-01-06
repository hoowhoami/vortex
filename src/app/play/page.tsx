"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon } from "lucide-react";
import { VideoCard } from "@/components/video/video-card";
import type { Video } from "@/types";

export default function PlayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<Video[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const title = searchParams.get("title");
  const year = searchParams.get("year");
  const source = searchParams.get("source");
  const id = searchParams.get("id");
  const stype = searchParams.get("stype");
  const stitle = searchParams.get("stitle"); // Original search title

  React.useEffect(() => {
    // If we have source and id, redirect to the detail page
    if (source && id) {
      router.replace(`/play/${id}?source=${source}`);
      return;
    }

    // If we have title, perform search and auto-redirect to first result
    if (title) {
      performSearch(title);
    } else {
      // No parameters, redirect to search page
      router.replace("/search");
    }
  }, [title, year, source, id, router]);

  const performSearch = async (searchTitle: string) => {
    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?keyword=${encodeURIComponent(searchTitle)}`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data = await response.json();
      let finalResults = data.videos || [];

      // Filter results by year if provided
      if (year && finalResults.length > 0) {
        const filtered = finalResults.filter((v: Video) => v.year === year);
        if (filtered.length > 0) {
          finalResults = filtered;
        }
      }

      // Auto-redirect to first result
      if (finalResults.length > 0) {
        const firstResult = finalResults[0];
        const idParts = firstResult.id.split("-");
        const resultSource = idParts[0];
        const vodId = idParts.slice(1).join("-");
        router.replace(`/play/${vodId}?source=${resultSource}`);
      } else {
        setError("未找到相关内容");
      }
    } catch (err) {
      console.error("Search error:", err);
      setError("搜索失败，请稍后重试");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {title ? `搜索: ${title}` : "播放"}
          </h1>
          {year && <p className="text-muted-foreground">年份: {year}</p>}
        </div>

        {/* Loading State */}
        {isSearching && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">正在搜索...</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                    <div className="absolute inset-0 bg-muted-foreground/10"></div>
                  </div>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="p-12 text-center text-destructive">
              <p>{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {!isSearching && !error && searchResults.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              找到 {searchResults.length} 个结果
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {searchResults.map((video) => {
                // Parse combined id format: "sourceId-vodId"
                const idParts = video.id.split("-");
                const source = idParts[0];
                const vodId = idParts.slice(1).join("-"); // Handle ids with multiple dashes

                return (
                  <div key={video.id}>
                    <VideoCard
                      id={vodId}
                      source={source}
                      title={video.title}
                      poster={video.cover || ""}
                      year={video.year}
                      episodes={video.sources?.[0]?.episodes?.length || 0}
                      source_name={video.sources?.[0]?.sourceName}
                      from="search"
                      query={title || ""}
                      type={stype || video.type}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && !error && searchResults.length === 0 && title && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <SearchIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>没有找到相关内容</p>
              <p className="text-sm mt-2">请尝试其他关键词</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
