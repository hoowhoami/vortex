"use client";

import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StorageService } from "@/lib/storage";

export default function SettingsPage() {
  const handleClearHistory = () => {
    if (confirm("确定要清空播放记录吗？")) {
      StorageService.clearPlayRecords();
      alert("播放记录已清空");
    }
  };

  const handleClearFavorites = () => {
    if (confirm("确定要清空收藏吗？")) {
      StorageService.clearFavorites();
      alert("收藏已清空");
    }
  };

  const handleClearSearchHistory = () => {
    if (confirm("确定要清空搜索历史吗？")) {
      StorageService.clearSearchHistory();
      alert("搜索历史已清空");
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">设置</h1>
          <p className="text-muted-foreground">管理应用设置和数据</p>
        </div>

        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">通用</TabsTrigger>
            <TabsTrigger value="data">数据管理</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>主题设置</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  主题会根据系统设置自动切换，也可以在右上角手动切换
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>清空数据</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">播放记录</p>
                    <p className="text-sm text-muted-foreground">
                      清空所有播放历史记录
                    </p>
                  </div>
                  <Button variant="destructive" onClick={handleClearHistory}>
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
                  <Button variant="destructive" onClick={handleClearFavorites}>
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
                  <Button variant="destructive" onClick={handleClearSearchHistory}>
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>关于 Vortex</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">版本:</span> 1.0.0
                </p>
                <p className="text-sm">
                  <span className="font-medium">技术栈:</span> Next.js 15 + React 19 + ShadcnUI
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                  现代化的视频流媒体聚合平台
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
