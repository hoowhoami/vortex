"use client";

import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_CONFIG, SITE_CONFIG } from "@/lib/config";
import { Plus, Trash2 } from "lucide-react";

export default function AdminPage() {
  const [siteConfig, setSiteConfig] = React.useState(SITE_CONFIG);
  const [sources, setSources] = React.useState(DEFAULT_CONFIG.sources);
  const users = DEFAULT_CONFIG.users;

  return (
    <PageLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理后台</h1>
          <p className="text-muted-foreground">
            配置和管理系统
          </p>
        </div>

        <Tabs defaultValue="site">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="site">站点配置</TabsTrigger>
            <TabsTrigger value="sources">视频源</TabsTrigger>
            <TabsTrigger value="users">用户管理</TabsTrigger>
            <TabsTrigger value="about">关于</TabsTrigger>
          </TabsList>

          {/* 站点配置 */}
          <TabsContent value="site" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>站点信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2">站点名称</label>
                  <Input
                    value={siteConfig.name}
                    onChange={(e) => setSiteConfig({ ...siteConfig, name: e.target.value })}
                    placeholder="Vortex"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2">站点公告</label>
                  <Textarea
                    value={siteConfig.announcement}
                    onChange={(e) => setSiteConfig({ ...siteConfig, announcement: e.target.value })}
                    placeholder="输入站点公告..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">流式搜索</p>
                    <p className="text-xs text-muted-foreground">实时显示搜索结果</p>
                  </div>
                  <Switch
                    checked={siteConfig.fluidSearch}
                    onCheckedChange={(checked) => setSiteConfig({ ...siteConfig, fluidSearch: checked })}
                  />
                </div>

                <Button onClick={() => alert("配置已保存（本地演示）")}>
                  保存配置
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 视频源管理 */}
          <TabsContent value="sources" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>视频源管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sources.map((source, index) => (
                    <div key={source.id} className="flex items-center gap-2 p-4 border rounded-lg">
                      <div className="flex-1">
                        <Input
                          value={source.name}
                          onChange={(e) => {
                            const newSources = [...sources];
                            newSources[index] = { ...source, name: e.target.value };
                            setSources(newSources);
                          }}
                        />
                        <Input
                          className="mt-2"
                          value={source.api}
                          onChange={(e) => {
                            const newSources = [...sources];
                            newSources[index] = { ...source, api: e.target.value };
                            setSources(newSources);
                          }}
                          placeholder="API 地址"
                        />
                      </div>
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={(checked) => {
                          const newSources = [...sources];
                          newSources[index] = { ...source, enabled: checked };
                          setSources(newSources);
                        }}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm("确定删除此视频源？")) {
                            setSources(sources.filter((s) => s.id !== source.id));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const newSource = {
                        id: `source-${Date.now()}`,
                        name: `新视频源 ${sources.length + 1}`,
                        enabled: true,
                        api: "https://example.com/api",
                        type: "applev10" as const,
                        priority: sources.length + 1,
                      };
                      setSources([...sources, newSource]);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    添加视频源
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 用户管理 */}
          <TabsContent value="users" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>用户管理</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((user: { username: string; role: string }, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.role === "owner" ? "所有者" : user.role === "admin" ? "管理员" : "用户"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.role === "owner" ? "bg-red-500 text-white" :
                          user.role === "admin" ? "bg-blue-500 text-white" :
                          "bg-gray-500 text-white"
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </div>
                  ))}
                  <p className="text-sm text-muted-foreground">
                    管理员账号由环境变量配置
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 关于 */}
          <TabsContent value="about" className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>关于</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">版本</p>
                  <p className="text-sm text-muted-foreground">{DEFAULT_CONFIG.version}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">技术栈</p>
                  <p className="text-sm text-muted-foreground">
                    Next.js 15 + React 19 + ShadcnUI + TailwindCSS
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">容器化支持</p>
                  <p className="text-sm text-muted-foreground">
                    Docker + Zeabur 部署就绪
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">多存储支持</p>
                  <p className="text-sm text-sm text-muted-foreground">
                    LocalStorage / Redis / Upstash / Kvrocks
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
