"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoCard } from "@/components/video/video-card";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { getDoubanCategories, getDoubanRecommends, GetBangumiCalendarData } from "@/lib/api/douban";
import type { DoubanItem } from "@/types";
import type { BangumiCalendarData } from "@/lib/api/douban";

// Year options
const yearOptions = [
  { label: "全部", value: "" },
  { label: "2025", value: "2025" },
  { label: "2024", value: "2024" },
  { label: "2023", value: "2023" },
  { label: "2022", value: "2022" },
  { label: "2021", value: "2021" },
  { label: "2020", value: "2020" },
  { label: "2010年代", value: "2010s" },
  { label: "2000年代", value: "2000s" },
  { label: "90年代", value: "1990s" },
  { label: "80年代", value: "1980s" },
  { label: "更早", value: "earlier" },
];

// Sort options
const sortOptions = [
  { label: "综合排序", value: "T" },
  { label: "近期热度", value: "U" },
  { label: "首映时间", value: "R" },
  { label: "高分优先", value: "S" },
];

// Weekday options for anime calendar
const weekdayOptions = [
  { label: "周一", value: "Mon" },
  { label: "周二", value: "Tue" },
  { label: "周三", value: "Wed" },
  { label: "周四", value: "Thu" },
  { label: "周五", value: "Fri" },
  { label: "周六", value: "Sat" },
  { label: "周日", value: "Sun" },
];

// Primary and secondary category configurations
const categoryConfigs = {
  movie: {
    title: "电影",
    primaryCategories: [
      { label: "全部", value: "全部" },
      { label: "热门", value: "热门" },
      { label: "最新", value: "最新" },
      { label: "豆瓣高分", value: "豆瓣高分" },
      { label: "冷门佳片", value: "冷门佳片" },
    ],
    secondaryCategories: [
      { label: "全部", value: "全部" },
      { label: "华语", value: "华语" },
      { label: "欧美", value: "欧美" },
      { label: "韩国", value: "韩国" },
      { label: "日本", value: "日本" },
    ],
    typeFilters: [
      { label: "全部", value: "" },
      { label: "剧情", value: "剧情" },
      { label: "喜剧", value: "喜剧" },
      { label: "动作", value: "动作" },
      { label: "爱情", value: "爱情" },
      { label: "科幻", value: "科幻" },
      { label: "悬疑", value: "悬疑" },
      { label: "惊悚", value: "惊悚" },
      { label: "恐怖", value: "恐怖" },
      { label: "犯罪", value: "犯罪" },
      { label: "同性", value: "同性" },
      { label: "音乐", value: "音乐" },
      { label: "歌舞", value: "歌舞" },
      { label: "传记", value: "传记" },
      { label: "历史", value: "历史" },
      { label: "战争", value: "战争" },
      { label: "西部", value: "西部" },
      { label: "奇幻", value: "奇幻" },
      { label: "冒险", value: "冒险" },
      { label: "灾难", value: "灾难" },
      { label: "武侠", value: "武侠" },
    ],
    regionFilters: [
      { label: "全部", value: "" },
      { label: "华语", value: "华语" },
      { label: "欧美", value: "欧美" },
      { label: "韩国", value: "韩国" },
      { label: "日本", value: "日本" },
      { label: "中国大陆", value: "中国大陆" },
      { label: "美国", value: "美国" },
      { label: "中国香港", value: "中国香港" },
      { label: "中国台湾", value: "中国台湾" },
      { label: "英国", value: "英国" },
      { label: "法国", value: "法国" },
      { label: "德国", value: "德国" },
      { label: "意大利", value: "意大利" },
      { label: "西班牙", value: "西班牙" },
      { label: "印度", value: "印度" },
      { label: "泰国", value: "泰国" },
    ],
  },
  tv: {
    title: "剧集",
    primaryCategories: [
      { label: "全部", value: "全部" },
      { label: "最近热门", value: "最近热门" },
    ],
    secondaryCategories: [
      { label: "全部", value: "全部" },
      { label: "国产", value: "tv_domestic" },
      { label: "欧美", value: "tv_american" },
      { label: "日本", value: "tv_japanese" },
      { label: "韩国", value: "tv_korean" },
    ],
    typeFilters: [
      { label: "全部", value: "" },
      { label: "剧情", value: "剧情" },
      { label: "喜剧", value: "喜剧" },
      { label: "动作", value: "动作" },
      { label: "爱情", value: "爱情" },
      { label: "科幻", value: "科幻" },
      { label: "悬疑", value: "悬疑" },
      { label: "惊悚", value: "惊悚" },
      { label: "恐怖", value: "恐怖" },
      { label: "犯罪", value: "犯罪" },
      { label: "武侠", value: "武侠" },
      { label: "古装", value: "古装" },
      { label: "家庭", value: "家庭" },
    ],
    regionFilters: [
      { label: "全部", value: "" },
      { label: "华语", value: "华语" },
      { label: "欧美", value: "欧美" },
      { label: "韩国", value: "韩国" },
      { label: "日本", value: "日本" },
    ],
  },
  anime: {
    title: "动漫",
    primaryCategories: [
      { label: "每日放送", value: "每日放送" },
      { label: "番剧", value: "番剧" },
      { label: "剧场版", value: "剧场版" },
    ],
    secondaryCategories: [],
    typeFilters: [
      { label: "全部", value: "" },
      { label: "黑色幽默", value: "黑色幽默" },
      { label: "历史", value: "历史" },
      { label: "歌舞", value: "歌舞" },
      { label: "励志", value: "励志" },
      { label: "恶搞", value: "恶搞" },
      { label: "治愈", value: "治愈" },
      { label: "运动", value: "运动" },
      { label: "后宫", value: "后宫" },
      { label: "国漫", value: "国漫" },
      { label: "悬疑", value: "悬疑" },
      { label: "恋爱", value: "恋爱" },
      { label: "魔幻", value: "魔幻" },
      { label: "科幻", value: "科幻" },
    ],
    regionFilters: [
      { label: "全部", value: "" },
      { label: "日本", value: "日本" },
      { label: "美国", value: "美国" },
      { label: "中国大陆", value: "中国大陆" },
      { label: "法国", value: "法国" },
      { label: "英国", value: "英国" },
      { label: "德国", value: "德国" },
    ],
  },
  show: {
    title: "综艺",
    primaryCategories: [
      { label: "全部", value: "全部" },
      { label: "最近热门", value: "最近热门" },
    ],
    secondaryCategories: [
      { label: "全部", value: "全部" },
      { label: "国内", value: "show_domestic" },
      { label: "国外", value: "show_foreign" },
    ],
    typeFilters: [
      { label: "全部", value: "" },
      { label: "真人秀", value: "真人秀" },
      { label: "脱口秀", value: "脱口秀" },
      { label: "音乐", value: "音乐" },
      { label: "歌舞", value: "歌舞" },
    ],
    regionFilters: [
      { label: "全部", value: "" },
      { label: "华语", value: "华语" },
      { label: "欧美", value: "欧美" },
      { label: "韩国", value: "韩国" },
      { label: "日本", value: "日本" },
    ],
  },
};

export default function DoubanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "movie") as keyof typeof categoryConfigs;

  const config = categoryConfigs[type] || categoryConfigs.movie;

  const [primarySelection, setPrimarySelection] = React.useState(
    config.primaryCategories[0].value
  );
  const [secondarySelection, setSecondarySelection] = React.useState(
    config.secondaryCategories[0]?.value || "全部"
  );

  // Multi-level filter states (for "全部" selection)
  const [selectedType, setSelectedType] = React.useState("");
  const [selectedRegion, setSelectedRegion] = React.useState("");
  const [selectedYear, setSelectedYear] = React.useState("");
  const [selectedSort, setSelectedSort] = React.useState("T");

  // Weekday selection for anime calendar
  const getCurrentWeekday = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };
  const [selectedWeekday, setSelectedWeekday] = React.useState(getCurrentWeekday());

  const [items, setItems] = React.useState<DoubanItem[]>([]);
  const [bangumiData, setBangumiData] = React.useState<BangumiCalendarData[]>([]);
  const [currentWeekdayData, setCurrentWeekdayData] = React.useState<BangumiCalendarData | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Load data when selections change
  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Special case: Anime "每日放送" uses Bangumi calendar
        if (type === "anime" && primarySelection === "每日放送") {
          const data = await GetBangumiCalendarData();
          setBangumiData(data);

          // Filter by selected weekday
          const weekdayData = data.find((item) => item.weekday.en === selectedWeekday);
          setCurrentWeekdayData(weekdayData || null);
          setItems([]);
          return;
        }

        // Special case: Anime "番剧" or "剧场版" uses recommends with filters
        if (type === "anime" && (primarySelection === "番剧" || primarySelection === "剧场版")) {
          const kind = primarySelection === "番剧" ? "tv" : "movie";
          const format = primarySelection === "番剧" ? "电视剧" : "";

          const result = await getDoubanRecommends({
            kind,
            format,
            category: "动画",
            region: selectedRegion,
            year: selectedYear,
            sort: selectedSort,
            limit: 25,
            start: 0,
          });

          if (result.code === 200) {
            setItems(result.list);
          } else {
            setItems([]);
          }
          setBangumiData([]);
          return;
        }

        // Case 1: Primary is "全部" - use recommends endpoint with multi-level filters
        if (primarySelection === "全部") {
          const kind = type === "movie" ? "movie" : "tv";
          const format = type === "tv" ? "电视剧" : type === "show" ? "综艺" : undefined;

          const result = await getDoubanRecommends({
            kind,
            format,
            category: selectedType,
            region: selectedRegion,
            year: selectedYear,
            sort: selectedSort,
            limit: 25,
            start: 0,
          });

          if (result.code === 200) {
            setItems(result.list);
          } else {
            setItems([]);
          }
          setBangumiData([]);
          return;
        }

        // Case 2: Use categories endpoint for specific primary selections
        const kind = type === "movie" ? "movie" : "tv";
        let apiType = secondarySelection;
        if (type === "movie") {
          apiType = secondarySelection === "全部" ? "全部" : secondarySelection;
        }

        const result = await getDoubanCategories({
          kind,
          category: primarySelection,
          type: apiType,
        });

        if (result.code === 200) {
          setItems(result.list);
        } else {
          setItems([]);
        }
        setBangumiData([]);
      } catch (error) {
        console.error("Failed to load Douban data:", error);
        setItems([]);
        setBangumiData([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [type, primarySelection, secondarySelection, selectedType, selectedRegion, selectedYear, selectedSort, selectedWeekday]);

  // Reset selections when type changes
  React.useEffect(() => {
    setPrimarySelection(config.primaryCategories[0].value);
    setSecondarySelection(config.secondaryCategories[0]?.value || "全部");
    setSelectedType("");
    setSelectedRegion("");
    setSelectedYear("");
    setSelectedSort("T");
    setSelectedWeekday(getCurrentWeekday());
    // Clear previous data immediately to prevent stale data from showing
    setItems([]);
    setBangumiData([]);
    setCurrentWeekdayData(null);
  }, [type, config]);

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

  // Determine what to show
  const showSecondary = primarySelection !== "全部" &&
                        config.secondaryCategories.length > 0 &&
                        type !== "anime";
  const showMultiLevel = (primarySelection === "全部" && type !== "anime") ||
                         (type === "anime" && (primarySelection === "番剧" || primarySelection === "剧场版"));

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{config.title}</h1>
          <p className="text-muted-foreground">
            浏览豆瓣高分{config.title}作品
          </p>
        </div>

        {/* Category Selection Card */}
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Primary Category Tabs */}
            <div className="space-y-3">
              <span className="text-sm font-medium">分类</span>
              <Tabs value={primarySelection} onValueChange={setPrimarySelection}>
                <div className="overflow-x-auto">
                  <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
                    {config.primaryCategories.map((cat) => (
                      <TabsTrigger key={cat.value} value={cat.value} className="whitespace-nowrap">
                        {cat.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Secondary Category Tabs (shown when primary is NOT "全部") */}
            {showSecondary && (
              <div className="space-y-3">
                <span className="text-sm font-medium">
                  {type === "movie" ? "地区" : "类型"}
                </span>
                <Tabs value={secondarySelection} onValueChange={setSecondarySelection}>
                  <div className="overflow-x-auto">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
                      {config.secondaryCategories.map((cat) => (
                        <TabsTrigger key={cat.value} value={cat.value} className="whitespace-nowrap">
                          {cat.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            )}

            {/* Weekday Selector (shown for anime "每日放送") */}
            {type === "anime" && primarySelection === "每日放送" && (
              <div className="space-y-3">
                <span className="text-sm font-medium">星期</span>
                <Tabs value={selectedWeekday} onValueChange={setSelectedWeekday}>
                  <div className="overflow-x-auto">
                    <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground">
                      {weekdayOptions.map((day) => (
                        <TabsTrigger key={day.value} value={day.value} className="whitespace-nowrap">
                          {day.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>
                </Tabs>
              </div>
            )}

            {/* Multi-level Filters (shown when primary is "全部") */}
            {showMultiLevel && (
              <div className="space-y-3">
                <span className="text-sm font-medium">筛选</span>
                <div className="flex flex-wrap items-start gap-4">
                  {/* Type Filter */}
                  {config.typeFilters.length > 0 && (
                    <FilterDropdown
                      label="类型"
                      options={config.typeFilters}
                      value={selectedType}
                      onChange={setSelectedType}
                      placeholder="全部"
                    />
                  )}

                  {/* Region Filter */}
                  {config.regionFilters.length > 0 && (
                    <FilterDropdown
                      label="地区"
                      options={config.regionFilters}
                      value={selectedRegion}
                      onChange={setSelectedRegion}
                      placeholder="全部"
                    />
                  )}

                  {/* Year Filter */}
                  <FilterDropdown
                    label="年代"
                    options={yearOptions}
                    value={selectedYear}
                    onChange={setSelectedYear}
                    placeholder="全部"
                  />

                  {/* Sort Filter */}
                  <FilterDropdown
                    label="排序"
                    options={sortOptions}
                    value={selectedSort}
                    onChange={setSelectedSort}
                    placeholder="综合排序"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Grid */}
        {isLoading ? (
          renderLoadingGrid()
        ) : currentWeekdayData ? (
          // Bangumi calendar view for anime "每日放送" - single weekday
          <div className="space-y-4">
            <h2 className="text-xl font-bold">
              {currentWeekdayData.weekday.cn} ({currentWeekdayData.items.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {currentWeekdayData.items.map((item) => (
                <VideoCard
                  key={item.id}
                  title={item.name_cn || item.name}
                  poster={item.images?.large || item.images?.common || ""}
                  year={item.air_date}
                  from="douban"
                />
              ))}
            </div>
          </div>
        ) : (
          // Regular Douban items
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map((item) => (
              <VideoCard
                key={item.id}
                title={item.title}
                poster={item.poster}
                year={item.year}
                rate={item.rate}
                from="douban"
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && items.length === 0 && !currentWeekdayData && (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <p>暂无数据</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
