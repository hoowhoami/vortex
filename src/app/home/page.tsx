"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageLayout } from "@/components/layout/page-layout";
import { CapsuleSwitch } from "@/components/ui/capsule-switch";
import { ScrollableRow } from "@/components/ui/scrollable-row";
import { VideoCard } from "@/components/video/video-card";
import { ContinueWatching } from "@/components/video/continue-watching";
import { getDoubanCategories } from "@/lib/douban.client";
import { GetBangumiCalendarData, BangumiCalendarData } from "@/lib/bangumi.client";
import {
  getAllFavorites,
  clearAllFavorites,
  subscribeToDataUpdates,
  getAllPlayRecords,
} from "@/lib/db.client";
import type { DoubanItem } from "@/types";
import type { DbFavorite } from "@/lib/db/types";

function HomePageClient() {
  const [activeTab, setActiveTab] = React.useState<"home" | "favorites">("home");
  const [hotMovies, setHotMovies] = React.useState<DoubanItem[]>([]);
  const [hotTvShows, setHotTvShows] = React.useState<DoubanItem[]>([]);
  const [hotVarietyShows, setHotVarietyShows] = React.useState<DoubanItem[]>([]);
  const [bangumiCalendarData, setBangumiCalendarData] = React.useState<BangumiCalendarData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [favoriteItems, setFavoriteItems] = React.useState<
    Array<DbFavorite & { key: string }>
  >([]);

  // Fetch Douban and Bangumi data on mount
  React.useEffect(() => {
    let isMounted = true;

    const fetchRecommendData = async () => {
      try {
        setLoading(true);

        // Fetch data independently to avoid one failure blocking all
        const [moviesData, tvShowsData, varietyShowsData, bangumiData] =
          await Promise.allSettled([
            getDoubanCategories({
              kind: "movie",
              category: "热门",
              type: "全部",
            }),
            getDoubanCategories({ kind: "tv", category: "tv", type: "tv" }),
            getDoubanCategories({ kind: "tv", category: "show", type: "show" }),
            GetBangumiCalendarData(),
          ]);

        if (!isMounted) return;

        if (moviesData.status === "fulfilled" && moviesData.value.code === 200) {
          setHotMovies(moviesData.value.list);
        }

        if (tvShowsData.status === "fulfilled" && tvShowsData.value.code === 200) {
          setHotTvShows(tvShowsData.value.list);
        }

        if (varietyShowsData.status === "fulfilled" && varietyShowsData.value.code === 200) {
          setHotVarietyShows(varietyShowsData.value.list);
        }

        if (bangumiData.status === "fulfilled") {
          setBangumiCalendarData(bangumiData.value);
        }
      } catch (error) {
        console.error("Failed to fetch recommended data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchRecommendData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Process favorites data update
  const updateFavoriteItems = React.useCallback(async (allFavorites: Record<string, DbFavorite>) => {
    const allPlayRecords = await getAllPlayRecords();

    // Sort by save_time (most recent first)
    const sorted = Object.entries(allFavorites)
      .sort(([, a], [, b]) => b.save_time - a.save_time)
      .map(([key, fav]) => {
        // Find corresponding play record to get current episode
        const playRecord = allPlayRecords[key];
        const currentEpisode = playRecord?.index;

        return {
          ...fav,
          key,
          currentEpisode,
        };
      });

    setFavoriteItems(sorted);
  }, []);

  // Load favorites when switching to favorites tab
  React.useEffect(() => {
    if (activeTab !== "favorites") return;

    const loadFavorites = async () => {
      const allFavorites = await getAllFavorites();
      await updateFavoriteItems(allFavorites);
    };

    loadFavorites();

    // Listen for favorites update events
    const unsubscribe = subscribeToDataUpdates(
      "favoritesUpdated",
      (newFavorites: Record<string, DbFavorite>) => {
        updateFavoriteItems(newFavorites);
      }
    );

    return unsubscribe;
  }, [activeTab, updateFavoriteItems]);

  // Parse source and id from key
  const parseKey = (key: string) => {
    const [source, id] = key.split("+");
    return { source, id };
  };

  return (
    <PageLayout>
      <div className="px-2 sm:px-10 py-4 sm:py-8">
        {/* Tab switcher */}
        <div className="mb-8 flex justify-center">
          <CapsuleSwitch
            options={[
              { label: "首页", value: "home" },
              { label: "收藏夹", value: "favorites" },
            ]}
            active={activeTab}
            onChange={(value) => setActiveTab(value as "home" | "favorites")}
          />
        </div>

        <div className="max-w-[95%] mx-auto">
          {activeTab === "favorites" ? (
            // Favorites view
            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">我的收藏</h2>
                {favoriteItems.length > 0 && (
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={async () => {
                      await clearAllFavorites();
                      setFavoriteItems([]);
                    }}
                  >
                    清空
                  </button>
                )}
              </div>
              <div className="justify-start grid grid-cols-3 gap-x-2 gap-y-14 sm:gap-y-20 px-0 sm:px-2 sm:grid-cols-[repeat(auto-fill,_minmax(11rem,_1fr))] sm:gap-x-8">
                {favoriteItems.map((item) => {
                  const { source, id } = parseKey(item.key);
                  return (
                    <div key={item.key} className="w-full">
                      <VideoCard
                        id={id}
                        source={source}
                        title={item.title}
                        poster={item.cover}
                        year={item.year}
                        episodes={item.total_episodes}
                        source_name={item.source_name}
                        currentEpisode={item.currentEpisode}
                        query={item.search_title}
                        from="favorite"
                        type={item.total_episodes > 1 ? "tv" : ""}
                      />
                    </div>
                  );
                })}
                {favoriteItems.length === 0 && (
                  <div className="col-span-full text-center text-muted-foreground py-8">
                    暂无收藏内容
                  </div>
                )}
              </div>
            </section>
          ) : (
            // Home view
            <>
              {/* Continue watching */}
              <ContinueWatching />

              {/* Hot movies */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">热门电影</h2>
                  <Link
                    href="/douban?type=movie"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? // Loading skeleton
                      Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                            <div className="absolute inset-0 bg-muted-foreground/10"></div>
                          </div>
                          <div className="mt-2 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))
                    : // Real data
                      hotMovies.map((movie, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <VideoCard
                            from="douban"
                            title={movie.title}
                            poster={movie.poster}
                            douban_id={Number(movie.id)}
                            rate={movie.rate}
                            year={movie.year}
                            type="movie"
                          />
                        </div>
                      ))}
                </ScrollableRow>
              </section>

              {/* Hot TV shows */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">热门剧集</h2>
                  <Link
                    href="/douban?type=tv"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                            <div className="absolute inset-0 bg-muted-foreground/10"></div>
                          </div>
                          <div className="mt-2 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))
                    : hotTvShows.map((show, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <VideoCard
                            from="douban"
                            title={show.title}
                            poster={show.poster}
                            douban_id={Number(show.id)}
                            rate={show.rate}
                            year={show.year}
                          />
                        </div>
                      ))}
                </ScrollableRow>
              </section>

              {/* Anime schedule */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">新番放送</h2>
                  <Link
                    href="/douban?type=anime"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                            <div className="absolute inset-0 bg-muted-foreground/10"></div>
                          </div>
                          <div className="mt-2 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))
                    : (() => {
                        // Get current day of the week
                        const today = new Date();
                        const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                        const currentWeekday = weekdays[today.getDay()];

                        // Find today's anime
                        const todayAnimes =
                          bangumiCalendarData.find(
                            (item) => item.weekday.en === currentWeekday
                          )?.items || [];

                        return todayAnimes.map((anime, index) => (
                          <div
                            key={`${anime.id}-${index}`}
                            className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                          >
                            <VideoCard
                              from="douban"
                              title={anime.name_cn || anime.name}
                              poster={
                                anime.images.large ||
                                anime.images.common ||
                                anime.images.medium ||
                                anime.images.small ||
                                anime.images.grid
                              }
                              douban_id={anime.id}
                              rate={anime.rating?.score?.toFixed(1) || ""}
                              year={anime.air_date?.split("-")?.[0] || ""}
                              isBangumi={true}
                            />
                          </div>
                        ));
                      })()}
                </ScrollableRow>
              </section>

              {/* Hot variety shows */}
              <section className="mb-8">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-bold">热门综艺</h2>
                  <Link
                    href="/douban?type=show"
                    className="flex items-center text-sm text-muted-foreground hover:text-foreground"
                  >
                    查看更多
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
                <ScrollableRow>
                  {loading
                    ? Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted animate-pulse">
                            <div className="absolute inset-0 bg-muted-foreground/10"></div>
                          </div>
                          <div className="mt-2 h-4 bg-muted rounded animate-pulse"></div>
                        </div>
                      ))
                    : hotVarietyShows.map((show, index) => (
                        <div
                          key={index}
                          className="min-w-[96px] w-24 sm:min-w-[180px] sm:w-44"
                        >
                          <VideoCard
                            from="douban"
                            title={show.title}
                            poster={show.poster}
                            douban_id={Number(show.id)}
                            rate={show.rate}
                            year={show.year}
                          />
                        </div>
                      ))}
                </ScrollableRow>
              </section>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<PageLayout>Loading...</PageLayout>}>
      <HomePageClient />
    </Suspense>
  );
}
