/**
 * Admin Panel - Site Configuration Component
 * Handles site-wide settings
 */

'use client';

import { useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AdminConfig } from '@/types';

interface SiteConfigProps {
  config: AdminConfig;
  onUpdate: () => void;
}

export function SiteConfig({ config, onUpdate }: SiteConfigProps) {
  const [siteName, setSiteName] = useState(config.SiteConfig.SiteName);
  const [announcement, setAnnouncement] = useState(config.SiteConfig.Announcement);
  const [maxPage, setMaxPage] = useState(config.SiteConfig.SearchDownstreamMaxPage);
  const [cacheTime, setCacheTime] = useState(config.SiteConfig.SiteInterfaceCacheTime);
  const [disableYellowFilter, setDisableYellowFilter] = useState(config.SiteConfig.DisableYellowFilter);
  const [fluidSearch, setFluidSearch] = useState(config.SiteConfig.FluidSearch);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          SiteName: siteName,
          Announcement: announcement,
          SearchDownstreamMaxPage: maxPage,
          SiteInterfaceCacheTime: cacheTime,
          DisableYellowFilter: disableYellowFilter,
          FluidSearch: fluidSearch,
        }),
      });

      if (res.ok) {
        onUpdate();
        alert('站点配置已保存');
      }
    } catch (error) {
      console.error('Failed to save site config:', error);
      alert('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          站点配置
        </CardTitle>
        <CardDescription>配置站点基本信息和功能开关</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="siteName">站点名称</Label>
          <Input
            id="siteName"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder="请输入站点名称"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="announcement">公告信息</Label>
          <Textarea
            id="announcement"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="请输入公告内容"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="maxPage">搜索最大页数</Label>
            <Input
              id="maxPage"
              type="number"
              value={maxPage}
              onChange={(e) => setMaxPage(Number(e.target.value))}
              min={1}
              max={10}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cacheTime">缓存时间（秒）</Label>
            <Input
              id="cacheTime"
              type="number"
              value={cacheTime}
              onChange={(e) => setCacheTime(Number(e.target.value))}
              min={0}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>禁用黄色过滤器</Label>
              <p className="text-sm text-muted-foreground">
                关闭后将不过滤成人内容
              </p>
            </div>
            <Switch
              checked={disableYellowFilter}
              onCheckedChange={setDisableYellowFilter}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>流式搜索</Label>
              <p className="text-sm text-muted-foreground">
                启用后搜索结果将实时显示
              </p>
            </div>
            <Switch
              checked={fluidSearch}
              onCheckedChange={setFluidSearch}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? '保存中...' : '保存配置'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
