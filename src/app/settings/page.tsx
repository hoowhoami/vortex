"use client";

import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  clearAllPlayRecords,
  clearAllFavorites,
  clearSearchHistory,
  getAllPlayRecords,
  getAllFavorites,
  getSearchHistory,
} from "@/lib/db.client";
import { Trash2, Download, Upload, RefreshCw } from "lucide-react";

export default function SettingsPage() {
  // 豆瓣设置
  const [doubanDataSource, setDoubanDataSource] = React.useState("direct");
  const [doubanProxyUrl, setDoubanProxyUrl] = React.useState("");
  const [doubanImageProxy, setDoubanImageProxy] = React.useState("direct");

  // 搜索设置
  const [defaultAggregateSearch, setDefaultAggregateSearch] = React.useState(true);
  const [fluidSearch, setFluidSearch] = React.useState(true);
  const [enableOptimization, setEnableOptimization] = React.useState(false);

  // 直播设置
  const [liveDirectConnect, setLiveDirectConnect] = React.useState(true);

  React.useEffect(() => {
    // 加载设置
    const loadSettings = () => {
      setDoubanDataSource(localStorage.getItem("doubanDataSource") || "direct");
      setDoubanProxyUrl(localStorage.getItem("doubanProxyUrl") || "");
      setDoubanImageProxy(localStorage.getItem("doubanImageProxyType") || "direct");
      setDefaultAggregateSearch(localStorage.getItem("defaultAggregateSearch") !== "false");
      setFluidSearch(localStorage.getItem("fluidSearch") !== "false");
      setEnableOptimization(localStorage.getItem("enableOptimization") === "true");
      setLiveDirectConnect(localStorage.getItem("liveDirectConnect") !== "false");
    };
    loadSettings();
  }, []);

  const saveSetting = (key: string, value: string | boolean) => {
    localStorage.setItem(key, String(value));
  };

  const handleClearHistory = async () => {
    if (confirm("确定要清空播放记录吗？")) {
      try {
        await clearAllPlayRecords();
        alert("播放记录已清空");
      } catch (error) {
        console.error("Failed to clear play records:", error);
        alert("清空播放记录失败");
      }
    }
  };

  const handleClearFavorites = async () => {
    if (confirm("确定要清空收藏吗？")) {
      try {
        await clearAllFavorites();
        alert("收藏已清空");
      } catch (error) {
        console.error("Failed to clear favorites:", error);
        alert("清空收藏失败");
      }
    }
  };

  const handleClearSearchHistory = async () => {
    if (confirm("确定要清空搜索历史吗？")) {
      try {
        await clearSearchHistory();
        alert("搜索历史已清空");
      } catch (error) {
        console.error("Failed to clear search history:", error);
        alert("清空搜索历史失败");
      }
    }
  };

  const handleExportData = async () => {
    try {
      const [playRecords, favorites, searchHistory] = await Promise.all([
        getAllPlayRecords(),
        getAllFavorites(),
        getSearchHistory(),
      ]);

      const data = {
        playRecords,
        favorites,
        searchHistory,
        settings: {
          doubanDataSource,
          doubanProxyUrl,
          doubanImageProxy,
          defaultAggregateSearch,
          fluidSearch,
          enableOptimization,
          liveDirectConnect,
        },
        exportTime: Date.now(),
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vortex-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("导出数据失败");
    }
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);

        if (confirm("确定要导入数据吗？这将覆盖当前数据。")) {
          try {
            // Import play records (data format is Record<string, DbPlayRecord>)
            if (data.playRecords && typeof data.playRecords === "object") {
              const promises = Object.entries(data.playRecords).map(([key, record]: [string, any]) => {
                const [source, id] = key.split("+");
                return import("@/lib/db.client").then(({ savePlayRecord }) =>
                  savePlayRecord(source, id, record)
                );
              });
              await Promise.all(promises);
            }

            // Import favorites (data format is Record<string, DbFavorite>)
            if (data.favorites && typeof data.favorites === "object") {
              const promises = Object.entries(data.favorites).map(([key, fav]: [string, any]) => {
                const [source, id] = key.split("+");
                return import("@/lib/db.client").then(({ saveFavorite }) =>
                  saveFavorite(source, id, fav)
                );
              });
              await Promise.all(promises);
            }

            // Import search history (data format is string[])
            if (data.searchHistory && Array.isArray(data.searchHistory)) {
              const promises = data.searchHistory.map((keyword: string) =>
                import("@/lib/db.client").then(({ addSearchHistory }) =>
                  addSearchHistory(keyword)
                )
              );
              await Promise.all(promises);
            }

            // Import settings
            if (data.settings) {
              Object.entries(data.settings).forEach(([key, value]) => {
                localStorage.setItem(key, String(value));
              });
            }

            alert("数据导入成功！页面将刷新。");
            window.location.reload();
          } catch (importError) {
            console.error("Import error:", importError);
            alert("导入失败：数据导入过程中出错");
          }
        }
      } catch (error) {
        console.error("Parse error:", error);
        alert("导入失败：文件格式错误");
      }
    };
    reader.readAsText(file);
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设置</h1>
          <p className="text-muted-foreground">管理应用设置和数据</p>
        </div>

        <Tabs defaultValue="douban">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="douban">豆瓣</TabsTrigger>
            <TabsTrigger value="search">搜索</TabsTrigger>
            <TabsTrigger value="data">数据</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          {/* 豆瓣设置 */}
          <TabsContent value="douban" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>豆瓣数据源</CardTitle>
                <CardDescription>选择豆瓣数据的获取方式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">数据源类型</label>
                  <Select
                    value={doubanDataSource}
                    onValueChange={(value) => {
                      setDoubanDataSource(value);
                      saveSetting("doubanDataSource", value);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="direct">直连豆瓣</SelectItem>
                      <SelectItem value="proxy">服务器代理</SelectItem>
                      <SelectItem value="custom">自定义代理</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {doubanDataSource === "custom" && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">自定义代理地址</label>
                    <Input
                      placeholder="https://your-proxy.com"
                      value={doubanProxyUrl}
                      onChange={(e) => {
                        setDoubanProxyUrl(e.target.value);
                        saveSetting("doubanProxyUrl", e.target.value);
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>豆瓣图片代理</CardTitle>
                <CardDescription>选择豆瓣图片的加载方式</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={doubanImageProxy}
                  onValueChange={(value) => {
                    setDoubanImageProxy(value);
                    saveSetting("doubanImageProxyType", value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">浏览器直连</SelectItem>
                    <SelectItem value="server">服务器代理</SelectItem>
                    <SelectItem value="cdn">官方CDN</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 搜索设置 */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>搜索行为</CardTitle>
                <CardDescription>配置搜索功能的行为</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">默认聚合搜索结果</p>
                    <p className="text-sm text-muted-foreground">
                      自动合并相同标题的视频
                    </p>
                  </div>
                  <Switch
                    checked={defaultAggregateSearch}
                    onCheckedChange={(checked) => {
                      setDefaultAggregateSearch(checked);
                      saveSetting("defaultAggregateSearch", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">流式搜索输出</p>
                    <p className="text-sm text-muted-foreground">
                      实时显示搜索结果
                    </p>
                  </div>
                  <Switch
                    checked={fluidSearch}
                    onCheckedChange={(checked) => {
                      setFluidSearch(checked);
                      saveSetting("fluidSearch", checked);
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">优选和测速</p>
                    <p className="text-sm text-muted-foreground">
                      自动选择最快的播放源
                    </p>
                  </div>
                  <Switch
                    checked={enableOptimization}
                    onCheckedChange={(checked) => {
                      setEnableOptimization(checked);
                      saveSetting("enableOptimization", checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>直播设置</CardTitle>
                <CardDescription>配置直播功能</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">IPTV视频浏览器直连</p>
                    <p className="text-sm text-muted-foreground">
                      直接在浏览器中播放直播流
                    </p>
                  </div>
                  <Switch
                    checked={liveDirectConnect}
                    onCheckedChange={(checked) => {
                      setLiveDirectConnect(checked);
                      saveSetting("liveDirectConnect", checked);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 数据管理 */}
          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>数据迁移</CardTitle>
                <CardDescription>导出或导入您的数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button onClick={handleExportData} className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    导出数据
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => document.getElementById("import-file")?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    导入数据
                  </Button>
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    className="hidden"
                    onChange={handleImportData}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  导出的数据包含播放记录、收藏、搜索历史和设置
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>清空数据</CardTitle>
                <CardDescription>删除本地存储的数据</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">播放记录</p>
                    <p className="text-sm text-muted-foreground">
                      清空所有播放历史记录
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleClearHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    清空
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">收藏</p>
                    <p className="text-sm text-muted-foreground">
                      清空所有收藏的视频
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleClearFavorites}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    清空
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">搜索历史</p>
                    <p className="text-sm text-muted-foreground">
                      清空所有搜索历史记录
                    </p>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleClearSearchHistory}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>关于 Vortex</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">版本</p>
                  <p className="text-sm text-muted-foreground">1.0.0</p>
                </div>
                <div>
                  <p className="text-sm font-medium">技术栈</p>
                  <p className="text-sm text-muted-foreground">
                    Next.js 15 + React 19 + ShadcnUI + TailwindCSS
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">视频播放器</p>
                  <p className="text-sm text-muted-foreground">
                    ArtPlayer 5.x + HLS.js
                  </p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    现代化的视频流媒体聚合平台，完整复刻 LunaTV 功能
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
