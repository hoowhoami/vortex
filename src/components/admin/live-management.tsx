/**
 * Live Source Management Component
 * Manages live TV sources with drag-and-drop sorting and refresh functionality
 */

'use client';

import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers';
import { GripVertical, RefreshCw } from 'lucide-react';
import { AdminConfig } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface LiveManagementProps {
  config: AdminConfig;
  onUpdate: () => Promise<void>;
}

interface LiveDataSource {
  key: string;
  name: string;
  url: string;
  ua?: string;
  epg?: string;
  from: 'config' | 'custom';
  channelNumber?: number;
  disabled?: boolean;
}

export function LiveManagement({ config, onUpdate }: LiveManagementProps) {
  const [liveSources, setLiveSources] = useState<LiveDataSource[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLiveSource, setEditingLiveSource] = useState<LiveDataSource | null>(null);
  const [orderChanged, setOrderChanged] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newLiveSource, setNewLiveSource] = useState<LiveDataSource>({
    name: '',
    key: '',
    url: '',
    ua: '',
    epg: '',
    disabled: false,
    from: 'custom',
  });

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  // Initialize live sources from config
  useEffect(() => {
    if (config?.LiveConfig) {
      setLiveSources(config.LiveConfig);
      setOrderChanged(false);
    }
  }, [config]);

  // API call wrapper
  const callLiveSourceApi = async (body: Record<string, any>) => {
    try {
      const resp = await fetch('/api/admin/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `操作失败: ${resp.status}`);
      }

      await onUpdate();
    } catch (err) {
      throw err;
    }
  };

  // Toggle enable/disable
  const handleToggleEnable = async (key: string) => {
    const target = liveSources.find((s) => s.key === key);
    if (!target) return;
    const action = target.disabled ? 'enable' : 'disable';
    setLoading(`toggle_${key}`);
    try {
      await callLiveSourceApi({ action, key });
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Delete live source
  const handleDelete = async (key: string) => {
    setLoading(`delete_${key}`);
    try {
      await callLiveSourceApi({ action: 'delete', key });
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Refresh live sources
  const handleRefreshLiveSources = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    setLoading('refresh');
    try {
      const response = await fetch('/api/admin/live/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || `刷新失败: ${response.status}`);
      }

      await onUpdate();
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(null);
    }
  };

  // Add live source
  const handleAddLiveSource = async () => {
    if (!newLiveSource.name || !newLiveSource.key || !newLiveSource.url) return;
    setLoading('add');
    try {
      await callLiveSourceApi({
        action: 'add',
        key: newLiveSource.key,
        name: newLiveSource.name,
        url: newLiveSource.url,
        ua: newLiveSource.ua,
        epg: newLiveSource.epg,
      });
      setNewLiveSource({
        name: '',
        key: '',
        url: '',
        epg: '',
        ua: '',
        disabled: false,
        from: 'custom',
      });
      setShowAddForm(false);
    } catch (err) {
      console.error('Add failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Edit live source
  const handleEditLiveSource = async () => {
    if (!editingLiveSource || !editingLiveSource.name || !editingLiveSource.url) return;
    setLoading('edit');
    try {
      await callLiveSourceApi({
        action: 'edit',
        key: editingLiveSource.key,
        name: editingLiveSource.name,
        url: editingLiveSource.url,
        ua: editingLiveSource.ua,
        epg: editingLiveSource.epg,
      });
      setEditingLiveSource(null);
    } catch (err) {
      console.error('Edit failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = liveSources.findIndex((s) => s.key === active.id);
    const newIndex = liveSources.findIndex((s) => s.key === over.id);
    setLiveSources((prev) => arrayMove(prev, oldIndex, newIndex));
    setOrderChanged(true);
  };

  // Save order
  const handleSaveOrder = async () => {
    const order = liveSources.map((s) => s.key);
    setLoading('sort');
    try {
      await callLiveSourceApi({ action: 'sort', order });
      setOrderChanged(false);
    } catch (err) {
      console.error('Sort failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Draggable row component
  const DraggableRow = ({ source }: { source: LiveDataSource }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: source.key,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TableRow ref={setNodeRef} style={style} className="select-none">
        <TableCell className="w-8 cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </TableCell>
        <TableCell className="font-medium">{source.name}</TableCell>
        <TableCell className="text-muted-foreground">{source.key}</TableCell>
        <TableCell className="max-w-[200px] truncate" title={source.url}>
          {source.url}
        </TableCell>
        <TableCell className="max-w-[150px] truncate" title={source.epg || '-'}>
          {source.epg || '-'}
        </TableCell>
        <TableCell>
          {source.channelNumber ? (
            <Badge variant="outline">{source.channelNumber} 个频道</Badge>
          ) : (
            <Badge variant="outline">未解析</Badge>
          )}
        </TableCell>
        <TableCell>
          <Badge variant={source.disabled ? 'destructive' : 'success'}>
            {source.disabled ? '已禁用' : '启用中'}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingLiveSource(source)}
          >
            编辑
          </Button>
          <Button
            size="sm"
            variant={source.disabled ? 'default' : 'destructive'}
            onClick={() => handleToggleEnable(source.key)}
            disabled={loading === `toggle_${source.key}`}
          >
            {source.disabled ? '启用' : '禁用'}
          </Button>
          {source.from !== 'config' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(source.key)}
              disabled={loading === `delete_${source.key}`}
            >
              删除
            </Button>
          )}
        </TableCell>
      </TableRow>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">直播源管理</h3>
          <p className="text-sm text-muted-foreground">
            管理直播电视源，支持 M3U 格式和 EPG 节目单
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshLiveSources}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? '刷新中...' : '刷新频道'}
          </Button>
          <Button
            variant={showAddForm ? 'outline' : 'default'}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '取消' : '添加直播源'}
          </Button>
        </div>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">直播源名称</Label>
                  <Input
                    id="name"
                    value={newLiveSource.name}
                    onChange={(e) =>
                      setNewLiveSource((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="例如: IPTV 源"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">直播源标识</Label>
                  <Input
                    id="key"
                    value={newLiveSource.key}
                    onChange={(e) =>
                      setNewLiveSource((prev) => ({ ...prev, key: e.target.value }))
                    }
                    placeholder="例如: iptv"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">M3U 地址</Label>
                <Input
                  id="url"
                  value={newLiveSource.url}
                  onChange={(e) =>
                    setNewLiveSource((prev) => ({ ...prev, url: e.target.value }))
                  }
                  placeholder="https://example.com/live.m3u"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="epg">EPG 地址（可选）</Label>
                <Input
                  id="epg"
                  value={newLiveSource.epg}
                  onChange={(e) =>
                    setNewLiveSource((prev) => ({ ...prev, epg: e.target.value }))
                  }
                  placeholder="https://example.com/epg.xml"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ua">User-Agent（可选）</Label>
                <Input
                  id="ua"
                  value={newLiveSource.ua}
                  onChange={(e) =>
                    setNewLiveSource((prev) => ({ ...prev, ua: e.target.value }))
                  }
                  placeholder="Mozilla/5.0..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleAddLiveSource}
                  disabled={
                    !newLiveSource.name ||
                    !newLiveSource.key ||
                    !newLiveSource.url ||
                    loading === 'add'
                  }
                >
                  {loading === 'add' ? '添加中...' : '添加'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Live sources table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>M3U 地址</TableHead>
                  <TableHead>EPG 地址</TableHead>
                  <TableHead>频道数</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
              >
                <SortableContext
                  items={liveSources.map((s) => s.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {liveSources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          暂无直播源，请添加直播源
                        </TableCell>
                      </TableRow>
                    ) : (
                      liveSources.map((source) => (
                        <DraggableRow key={source.key} source={source} />
                      ))
                    )}
                  </TableBody>
                </SortableContext>
              </DndContext>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Save order button */}
      {orderChanged && (
        <div className="flex justify-end">
          <Button onClick={handleSaveOrder} disabled={loading === 'sort'}>
            {loading === 'sort' ? '保存中...' : '保存排序'}
          </Button>
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editingLiveSource} onOpenChange={() => setEditingLiveSource(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑直播源</DialogTitle>
            <DialogDescription>修改直播源配置信息</DialogDescription>
          </DialogHeader>
          {editingLiveSource && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">直播源名称</Label>
                <Input
                  id="edit-name"
                  value={editingLiveSource.name}
                  onChange={(e) =>
                    setEditingLiveSource((prev) =>
                      prev ? { ...prev, name: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-url">M3U 地址</Label>
                <Input
                  id="edit-url"
                  value={editingLiveSource.url}
                  onChange={(e) =>
                    setEditingLiveSource((prev) =>
                      prev ? { ...prev, url: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-epg">EPG 地址（可选）</Label>
                <Input
                  id="edit-epg"
                  value={editingLiveSource.epg || ''}
                  onChange={(e) =>
                    setEditingLiveSource((prev) =>
                      prev ? { ...prev, epg: e.target.value } : null
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-ua">User-Agent（可选）</Label>
                <Input
                  id="edit-ua"
                  value={editingLiveSource.ua || ''}
                  onChange={(e) =>
                    setEditingLiveSource((prev) =>
                      prev ? { ...prev, ua: e.target.value } : null
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingLiveSource(null)}>
              取消
            </Button>
            <Button onClick={handleEditLiveSource} disabled={loading === 'edit'}>
              {loading === 'edit' ? '保存中...' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
