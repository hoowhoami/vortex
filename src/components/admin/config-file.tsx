/**
 * Config File Management Component
 * Manages configuration file and subscription
 */

'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Download } from 'lucide-react';
import { AdminConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfigFileProps {
  config: AdminConfig;
  onUpdate: () => Promise<void>;
}

export function ConfigFile({ config, onUpdate }: ConfigFileProps) {
  const [configContent, setConfigContent] = useState('');
  const [subscriptionUrl, setSubscriptionUrl] = useState('');
  const [autoUpdate, setAutoUpdate] = useState(false);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    if (config?.ConfigFile) {
      setConfigContent(config.ConfigFile);
    }
    if (config?.ConfigSubscription) {
      setSubscriptionUrl(config.ConfigSubscription.URL);
      setAutoUpdate(config.ConfigSubscription.AutoUpdate);
      setLastCheckTime(config.ConfigSubscription.LastCheck || '');
    }
  }, [config]);

  // Fetch config from subscription
  const handleFetchConfig = async () => {
    if (!subscriptionUrl.trim()) return;
    setLoading('fetch');
    try {
      const resp = await fetch('/api/admin/config_subscription/fetch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: subscriptionUrl }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `拉取失败: ${resp.status}`);
      }

      const data = await resp.json();
      if (data.configContent) {
        setConfigContent(data.configContent);
        const currentTime = new Date().toISOString();
        setLastCheckTime(currentTime);
      }
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Save config file
  const handleSave = async () => {
    setLoading('save');
    try {
      const resp = await fetch('/api/admin/config_file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          configFile: configContent,
          subscriptionUrl,
          autoUpdate,
          lastCheckTime: lastCheckTime || new Date().toISOString(),
        }),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `保存失败: ${resp.status}`);
      }

      await onUpdate();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Subscription section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>配置订阅</CardTitle>
              <CardDescription>
                从远程 URL 拉取配置文件，支持自动更新
              </CardDescription>
            </div>
            {lastCheckTime && (
              <div className="text-sm text-muted-foreground">
                最后更新: {new Date(lastCheckTime).toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subscription-url">订阅 URL</Label>
            <Input
              id="subscription-url"
              type="url"
              value={subscriptionUrl}
              onChange={(e) => setSubscriptionUrl(e.target.value)}
              placeholder="https://example.com/config.json"
            />
            <p className="text-xs text-muted-foreground">
              输入配置文件的订阅地址，要求 JSON 格式，且使用 Base58 编码
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleFetchConfig}
            disabled={!subscriptionUrl.trim() || loading === 'fetch'}
          >
            <Download className="h-4 w-4 mr-2" />
            {loading === 'fetch' ? '拉取中...' : '拉取配置'}
          </Button>

          <div className="flex items-center justify-between pt-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update">自动更新</Label>
              <p className="text-xs text-muted-foreground">
                启用后系统将定期自动拉取最新配置
              </p>
            </div>
            <Switch
              id="auto-update"
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
            />
          </div>
        </CardContent>
      </Card>

      {/* Config file editor */}
      <Card>
        <CardHeader>
          <CardTitle>配置文件编辑</CardTitle>
          <CardDescription>
            直接编辑配置文件内容（JSON 格式）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              value={configContent}
              onChange={(e) => setConfigContent(e.target.value)}
              rows={20}
              placeholder="请输入配置文件内容（JSON 格式）..."
              className="font-mono text-sm"
              spellCheck={false}
            />
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              支持 JSON 格式，用于配置视频源和自定义分类。修改后请点击保存按钮。
            </p>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading === 'save'}>
              {loading === 'save' ? '保存中...' : '保存配置'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
