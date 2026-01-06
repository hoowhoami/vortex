/**
 * Admin Panel - Main Page
 * Modular, maintainable admin interface using shadcn/ui components
 */

'use client';

import { Suspense, useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageLayout } from '@/components/layout/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AdminConfig, AdminConfigResult } from '@/types';
import { getAuthInfoFromBrowserCookie } from '@/lib/auth';

// Lazy load admin components
import { UserManagement } from '@/components/admin/user-management';
import { SiteConfig } from '@/components/admin/site-config';
import { SourceManagement } from '@/components/admin/source-management';
import { CategoryManagement } from '@/components/admin/category-management';
import { LiveManagement } from '@/components/admin/live-management';
import { ConfigFile } from '@/components/admin/config-file';
import DataMigration from '@/components/admin-data-migration';

function AdminPageClient() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [role, setRole] = useState<'owner' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageType, setStorageType] = useState<'localstorage' | 'redis' | 'upstash' | 'kvrocks'>('localstorage');

  // Initialize storage type on client side only
  useEffect(() => {
    const raw =
      (window as any).RUNTIME_CONFIG?.STORAGE_TYPE ||
      process.env.NEXT_PUBLIC_STORAGE_TYPE ||
      'localstorage';
    setStorageType(raw as 'localstorage' | 'redis' | 'upstash' | 'kvrocks');
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config');
      if (!res.ok) {
        throw new Error('Failed to fetch config');
      }
      const data: AdminConfigResult = await res.json();
      setConfig(data.Config);
      setRole(data.Role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Check storage type - block access if using localstorage
  if (storageType === 'localstorage') {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-2xl border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300">
                  管理面板不可用
                </h2>
              </div>
              <div className="space-y-3 text-yellow-700 dark:text-yellow-400">
                <p>
                  LocalStorage 模式不支持管理面板功能。管理面板需要数据库后端来存储配置和用户数据。
                </p>
                <p className="font-medium">请配置数据库后端：</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Redis (本地开发推荐)</li>
                  <li>Upstash (云端 Redis，有免费套餐)</li>
                  <li>Kvrocks (Redis 兼容)</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-700">
                  <p className="text-sm">
                    修改 <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">.env.local</code> 文件中的{' '}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">NEXT_PUBLIC_STORAGE_TYPE</code> 为{' '}
                    <code className="bg-yellow-100 dark:bg-yellow-900 px-2 py-1 rounded">redis</code> 或其他数据库类型。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (loading) {
    return (
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    );
  }

  if (error || !config) {
    return (
      <PageLayout>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              <p>加载配置失败: {error}</p>
            </div>
          </CardContent>
        </Card>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">管理面板</h1>
          <p className="text-muted-foreground">
            系统配置和管理 · 当前角色: {role === 'owner' ? '所有者' : '管理员'}
          </p>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          {/* Mobile: Scrollable tabs */}
          <div className="lg:hidden">
            <TabsList className="inline-flex h-10 items-center justify-start rounded-md bg-muted p-1 text-muted-foreground w-full overflow-x-auto">
              <TabsTrigger value="users" className="whitespace-nowrap">用户</TabsTrigger>
              <TabsTrigger value="sources" className="whitespace-nowrap">视频源</TabsTrigger>
              <TabsTrigger value="categories" className="whitespace-nowrap">分类</TabsTrigger>
              <TabsTrigger value="live" className="whitespace-nowrap">直播</TabsTrigger>
              <TabsTrigger value="site" className="whitespace-nowrap">站点</TabsTrigger>
              <TabsTrigger value="config" className="whitespace-nowrap">配置</TabsTrigger>
              <TabsTrigger value="migration" className="whitespace-nowrap">迁移</TabsTrigger>
              {role === 'owner' && <TabsTrigger value="advanced" className="whitespace-nowrap">高级</TabsTrigger>}
            </TabsList>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden lg:block">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="users">用户</TabsTrigger>
              <TabsTrigger value="sources">视频源</TabsTrigger>
              <TabsTrigger value="categories">分类</TabsTrigger>
              <TabsTrigger value="live">直播</TabsTrigger>
              <TabsTrigger value="site">站点</TabsTrigger>
              <TabsTrigger value="config">配置</TabsTrigger>
              <TabsTrigger value="migration">迁移</TabsTrigger>
              {role === 'owner' && <TabsTrigger value="advanced">高级</TabsTrigger>}
            </TabsList>
          </div>

          <TabsContent value="users" className="space-y-4">
            <UserManagement config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="sources" className="space-y-4">
            <SourceManagement config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <CategoryManagement config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="live" className="space-y-4">
            <LiveManagement config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="site" className="space-y-4">
            <SiteConfig config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="config" className="space-y-4">
            <ConfigFile config={config} onUpdate={fetchConfig} />
          </TabsContent>

          <TabsContent value="migration" className="space-y-4">
            <DataMigration onRefreshConfig={fetchConfig} />
          </TabsContent>

          {role === 'owner' && (
            <TabsContent value="advanced" className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">高级设置模块开发中...</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <PageLayout>
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </PageLayout>
    }>
      <AdminPageClient />
    </Suspense>
  );
}
