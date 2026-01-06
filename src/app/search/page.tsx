"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search as SearchIcon, Clock, X, ChevronUp } from "lucide-react";
import { VideoCard } from "@/components/video/video-card";
import type { Video } from "@/types";
import {
  getSearchHistory,
  addSearchHistory,
  clearSearchHistory,
  deleteSearchHistoryKeyword
} from "@/lib/db.client";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const [results, setResults] = React.useState<Video[]>([]);
  const [showSuggestions, setShowSuggestions] = React.useState(true);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  // Search history
  const [searchHistory, setSearchHistory] = React.useState<string[]>([]);

  // Load search history and handle URL params on mount
  React.useEffect(() => {
    loadSearchHistory();

    // Check for keyword in URL
    const urlKeyword = searchParams.get("q");
    if (urlKeyword) {
      setKeyword(urlKeyword);
      handleSearch(urlKeyword);
    }

    // Scroll handler for back to top button
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen for search history updates
  React.useEffect(() => {
    const handleSearchHistoryUpdate = (e: CustomEvent) => {
      setSearchHistory(e.detail);
    };

    window.addEventListener("searchHistoryUpdated", handleSearchHistoryUpdate as EventListener);

    return () => {
      window.removeEventListener("searchHistoryUpdated", handleSearchHistoryUpdate as EventListener);
    };
  }, []);

  const loadSearchHistory = async () => {
    const history = await getSearchHistory();
    setSearchHistory(history);
  };

  const handleSearch = async (kw?: string) => {
    const searchKeyword = kw || keyword;
    if (!searchKeyword.trim()) return;

    setIsSearching(true);
    setShowSuggestions(false);
    setResults([]); // Clear previous results

    try {
      // Use SSE for streaming search results
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

      // Save to search history (automatically triggers CustomEvent update)
      await addSearchHistory(searchKeyword);
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

  const handleDeleteHistoryItem = async (item: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteSearchHistoryKeyword(item);
  };

  const handleClearHistory = async () => {
    await clearSearchHistory();
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
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
              autoFocus
            />
          </div>
          <Button onClick={() => handleSearch()} disabled={isSearching}>
            {isSearching ? "搜索中..." : "搜索"}
          </Button>
        </div>

        {/* Search History */}
        {showSuggestions && searchHistory.length > 0 && !keyword && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium">搜索历史</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearHistory}
                  className="h-7 text-xs"
                >
                  清空
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <div
                    key={item}
                    className="inline-flex items-center gap-1 h-8 px-3 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm"
                  >
                    <Clock className="h-3 w-3" />
                    <span
                      onClick={() => {
                        setKeyword(item);
                        handleSearch(item);
                      }}
                      className="flex-1"
                    >
                      {item}
                    </span>
                    <button
                      onClick={(e) => handleDeleteHistoryItem(item, e)}
                      className="hover:text-destructive"
                      aria-label="删除"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isSearching && (
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
        )}

        {/* Search Results */}
        {!isSearching && results.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              找到 {results.length} 个结果
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {results.map((video) => (
                <div key={`${video.source}-${video.id}`}>
                  <VideoCard
                    id={video.id}
                    source={video.source}
                    title={video.title}
                    poster={video.cover}
                    year={video.year}
                    episodes={video.episodes?.length || 0}
                    source_name={video.source_name}
                    from="search"
                    query={keyword}
                    type={video.type}
                  />
                </div>
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

        {/* Back to Top Button */}
        {showBackToTop && (
          <Button
            onClick={scrollToTop}
            size="icon"
            className="fixed bottom-8 right-8 rounded-full shadow-lg z-50"
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
