"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search as SearchIcon, Clock, Play } from "lucide-react";
import type { Video } from "@/types";
import { StorageService } from "@/lib/storage";

export default function SearchPage() {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<Video[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(true);

  // 搜索历史（从 StorageService 读取）
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);

  React.useEffect(() => {
    setSearchHistory(StorageService.getSearchHistory());
  }, []);

  const handleSearch = async (kw?: string) => {
    const searchKeyword = kw || keyword;
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);

    try {
      // 使用 SSE 进行搜索
      const response = await fetch(
        `/api/search?keyword=${encodeURIComponent(searchKeyword)}`
      );

      if (!response.ok) throw new Error("Search failed");

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = JSON.parse(line.slice(6));
              if (data.videos) {
                setResults(data.videos);
              }
            }
          }
        }
      }

      // 保存到搜索历史
      StorageService.addSearchHistory(searchKeyword);
      setSearchHistory(StorageService.getSearchHistory());
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleVideoClick = (video: Video) => {
    router.push(`/play/${video.id}`);
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">搜索</h1>
          <p className="text-muted-foreground">搜索视频内容</p>
        </div>

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="输入关键词搜索..."
              value={keyword}
              onChange={(e) => {
                setKeyword(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyPress}
              onFocus={() => setShowSuggestions(true)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={isSearching}>
            {isSearching ? "搜索中..." : "搜索"}
          </Button>
        </div>

        {/* Search Suggestions */}
        {showSuggestions && searchHistory.length > 0 && !keyword && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-sm font-medium mb-3">搜索历史</h3>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <Button
                    key={item}
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setKeyword(item);
                      handleSearch(item);
                    }}
                  >
                    <Clock className="mr-1 h-3 w-3" />
                    {item}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-36 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Search Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              找到 {results.length} 个结果
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results.map((video) => (
                <Card
                  key={video.id}
                  className="group cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleVideoClick(video)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {video.cover && (
                        <div className="w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                          <img
                            src={video.cover}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold line-clamp-2 mb-2">
                          {video.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-1">
                          {video.year} · {video.type}
                        </p>
                        {video.actors && video.actors.length > 0 && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            主演: {video.actors.join(" / ")}
                          </p>
                        )}
                        {video.director && video.director.length > 0 && (
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            导演: {video.director.join(" / ")}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Button size="sm" variant="default" className="h-7">
                            <Play className="mr-1 h-3 w-3" />
                            播放
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && results.length === 0 && keyword && (
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
