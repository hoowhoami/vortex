/**
 * Source Management Component
 * Manages video sources with drag-and-drop sorting, batch operations, and validation
 */

'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { GripVertical, AlertCircle } from 'lucide-react';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface SourceManagementProps {
  config: AdminConfig;
  onUpdate: () => Promise<void>;
}

interface DataSource {
  key: string;
  name: string;
  api: string;
  detail?: string;
  from: 'config' | 'custom';
  disabled?: boolean;
}

interface ValidationResult {
  key: string;
  name: string;
  status: 'valid' | 'no_results' | 'invalid' | 'validating';
  message: string;
  resultCount: number;
}

export function SourceManagement({ config, onUpdate }: SourceManagementProps) {
  const [sources, setSources] = useState<DataSource[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(new Set());
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [newSource, setNewSource] = useState<DataSource>({
    name: '',
    key: '',
    api: '',
    detail: '',
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

  // Initialize sources from config
  useEffect(() => {
    if (config?.SourceConfig) {
      setSources(config.SourceConfig);
      setOrderChanged(false);
      setSelectedSources(new Set());
    }
  }, [config]);

  // Select all state
  const selectAll = useMemo(() => {
    return selectedSources.size === sources.length && selectedSources.size > 0;
  }, [selectedSources.size, sources.length]);

  // API call wrapper
  const callSourceApi = async (body: Record<string, any>) => {
    try {
      const resp = await fetch('/api/admin/source', {
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
    const target = sources.find((s) => s.key === key);
    if (!target) return;
    const action = target.disabled ? 'enable' : 'disable';
    setLoading(`toggle_${key}`);
    try {
      await callSourceApi({ action, key });
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Delete source
  const handleDelete = async (key: string) => {
    setLoading(`delete_${key}`);
    try {
      await callSourceApi({ action: 'delete', key });
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Add source
  const handleAddSource = async () => {
    if (!newSource.name || !newSource.key || !newSource.api) return;
    setLoading('add');
    try {
      await callSourceApi({
        action: 'add',
        key: newSource.key,
        name: newSource.name,
        api: newSource.api,
        detail: newSource.detail,
      });
      setNewSource({
        name: '',
        key: '',
        api: '',
        detail: '',
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

  // Drag end handler
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = sources.findIndex((s) => s.key === active.id);
    const newIndex = sources.findIndex((s) => s.key === over.id);
    setSources((prev) => arrayMove(prev, oldIndex, newIndex));
    setOrderChanged(true);
  };

  // Save order
  const handleSaveOrder = async () => {
    const order = sources.map((s) => s.key);
    setLoading('sort');
    try {
      await callSourceApi({ action: 'sort', order });
      setOrderChanged(false);
    } catch (err) {
      console.error('Sort failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Select all/none
  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        const allKeys = sources.map((s) => s.key);
        setSelectedSources(new Set(allKeys));
      } else {
        setSelectedSources(new Set());
      }
    },
    [sources]
  );

  // Select single
  const handleSelectSource = useCallback((key: string, checked: boolean) => {
    setSelectedSources((prev) => {
      const newSelected = new Set(prev);
      if (checked) {
        newSelected.add(key);
      } else {
        newSelected.delete(key);
      }
      return newSelected;
    });
  }, []);

  // Batch operations
  const handleBatchOperation = async (
    action: 'batch_enable' | 'batch_disable' | 'batch_delete'
  ) => {
    if (selectedSources.size === 0) return;
    const keys = Array.from(selectedSources);
    setLoading(action);
    try {
      await callSourceApi({ action, keys });
      setSelectedSources(new Set());
    } catch (err) {
      console.error('Batch operation failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Validate sources
  const handleValidateSources = async () => {
    if (!searchKeyword.trim()) return;
    setIsValidating(true);
    setValidationResults([]);
    setShowValidationModal(false);

    // Initialize all sources as validating
    const initialResults = sources.map((source) => ({
      key: source.key,
      name: source.name,
      status: 'validating' as const,
      message: '检测中...',
      resultCount: 0,
    }));
    setValidationResults(initialResults);

    try {
      const eventSource = new EventSource(
        `/api/admin/source/validate?q=${encodeURIComponent(searchKeyword.trim())}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'start':
              console.log(`开始检测 ${data.totalSources} 个视频源`);
              break;

            case 'source_result':
            case 'source_error':
              setValidationResults((prev) => {
                const existing = prev.find((r) => r.key === data.source);
                if (existing) {
                  return prev.map((r) =>
                    r.key === data.source
                      ? {
                          key: data.source,
                          name:
                            sources.find((s) => s.key === data.source)?.name ||
                            data.source,
                          status: data.status,
                          message:
                            data.status === 'valid'
                              ? '搜索正常'
                              : data.status === 'no_results'
                              ? '无法搜索到结果'
                              : '连接失败',
                          resultCount: data.status === 'valid' ? 1 : 0,
                        }
                      : r
                  );
                } else {
                  return [
                    ...prev,
                    {
                      key: data.source,
                      name:
                        sources.find((s) => s.key === data.source)?.name ||
                        data.source,
                      status: data.status,
                      message:
                        data.status === 'valid'
                          ? '搜索正常'
                          : data.status === 'no_results'
                          ? '无法搜索到结果'
                          : '连接失败',
                      resultCount: data.status === 'valid' ? 1 : 0,
                    },
                  ];
                }
              });
              break;

            case 'complete':
              console.log(`检测完成，共检测 ${data.completedSources} 个视频源`);
              eventSource.close();
              setIsValidating(false);
              break;
          }
        } catch (error) {
          console.error('解析EventSource数据失败:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource错误:', error);
        eventSource.close();
        setIsValidating(false);
      };

      // Timeout after 60 seconds
      setTimeout(() => {
        if (eventSource.readyState === EventSource.OPEN) {
          eventSource.close();
          setIsValidating(false);
        }
      }, 60000);
    } catch (error) {
      setIsValidating(false);
      console.error('Validation failed:', error);
    }
  };

  // Get validation status
  const getValidationStatus = (sourceKey: string) => {
    const result = validationResults.find((r) => r.key === sourceKey);
    if (!result) return null;

    switch (result.status) {
      case 'validating':
        return {
          text: '检测中',
          variant: 'secondary' as const,
          icon: '⟳',
        };
      case 'valid':
        return {
          text: '有效',
          variant: 'success' as const,
          icon: '✓',
        };
      case 'no_results':
        return {
          text: '无法搜索',
          variant: 'warning' as const,
          icon: '⚠',
        };
      case 'invalid':
        return {
          text: '无效',
          variant: 'destructive' as const,
          icon: '✗',
        };
      default:
        return null;
    }
  };

  // Draggable row component
  const DraggableRow = ({ source }: { source: DataSource }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: source.key,
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    const validationStatus = getValidationStatus(source.key);

    return (
      <TableRow ref={setNodeRef} style={style} className="select-none">
        <TableCell className="w-8 cursor-grab" {...attributes} {...listeners}>
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </TableCell>
        <TableCell className="w-12">
          <Checkbox
            checked={selectedSources.has(source.key)}
            onCheckedChange={(checked) =>
              handleSelectSource(source.key, checked as boolean)
            }
          />
        </TableCell>
        <TableCell className="font-medium">{source.name}</TableCell>
        <TableCell className="text-muted-foreground">{source.key}</TableCell>
        <TableCell className="max-w-[200px] truncate" title={source.api}>
          {source.api}
        </TableCell>
        <TableCell className="max-w-[150px] truncate" title={source.detail || '-'}>
          {source.detail || '-'}
        </TableCell>
        <TableCell>
          <Badge variant={source.disabled ? 'destructive' : 'success'}>
            {source.disabled ? '已禁用' : '启用中'}
          </Badge>
        </TableCell>
        <TableCell>
          {validationStatus ? (
            <Badge variant={validationStatus.variant}>
              {validationStatus.icon} {validationStatus.text}
            </Badge>
          ) : (
            <Badge variant="outline">未检测</Badge>
          )}
        </TableCell>
        <TableCell className="text-right space-x-2">
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
          <h3 className="text-lg font-semibold">视频源管理</h3>
          <p className="text-sm text-muted-foreground">
            管理视频采集源，支持拖拽排序和批量操作
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowValidationModal(true)}
            disabled={isValidating}
          >
            {isValidating ? '检测中...' : '有效性检测'}
          </Button>
          <Button
            variant={showAddForm ? 'outline' : 'default'}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? '取消' : '添加视频源'}
          </Button>
        </div>
      </div>

      {/* Batch operations */}
      {selectedSources.size > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                已选择 {selectedSources.size} 个视频源
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => handleBatchOperation('batch_enable')}
                  disabled={loading === 'batch_enable'}
                >
                  批量启用
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBatchOperation('batch_disable')}
                  disabled={loading === 'batch_disable'}
                >
                  批量禁用
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleBatchOperation('batch_delete')}
                  disabled={loading === 'batch_delete'}
                >
                  批量删除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">视频源名称</Label>
                  <Input
                    id="name"
                    value={newSource.name}
                    onChange={(e) =>
                      setNewSource((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="例如: 非凡资源"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="key">视频源标识</Label>
                  <Input
                    id="key"
                    value={newSource.key}
                    onChange={(e) =>
                      setNewSource((prev) => ({ ...prev, key: e.target.value }))
                    }
                    placeholder="例如: ffzy"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api">API 地址</Label>
                <Input
                  id="api"
                  value={newSource.api}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, api: e.target.value }))
                  }
                  placeholder="https://example.com/api.php/provide/vod/"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="detail">详情页地址（可选）</Label>
                <Input
                  id="detail"
                  value={newSource.detail}
                  onChange={(e) =>
                    setNewSource((prev) => ({ ...prev, detail: e.target.value }))
                  }
                  placeholder="https://example.com/detail/"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleAddSource}
                  disabled={
                    !newSource.name || !newSource.key || !newSource.api || loading === 'add'
                  }
                >
                  {loading === 'add' ? '添加中...' : '添加'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sources table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>名称</TableHead>
                  <TableHead>标识</TableHead>
                  <TableHead>API 地址</TableHead>
                  <TableHead>详情页</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>有效性</TableHead>
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
                  items={sources.map((s) => s.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {sources.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">
                          暂无视频源，请添加视频源
                        </TableCell>
                      </TableRow>
                    ) : (
                      sources.map((source) => (
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

      {/* Validation modal */}
      <Dialog open={showValidationModal} onOpenChange={setShowValidationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>视频源有效性检测</DialogTitle>
            <DialogDescription>
              输入搜索关键词，系统将测试所有视频源是否能正常搜索到结果
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="keyword">搜索关键词</Label>
              <Input
                id="keyword"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="例如: 斗罗大陆"
              />
            </div>
            <div className="flex items-start gap-2 text-sm text-muted-foreground">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p>
                检测过程可能需要一些时间，请耐心等待。检测结果将显示在视频源列表的"有效性"列中。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowValidationModal(false)}>
              取消
            </Button>
            <Button
              onClick={handleValidateSources}
              disabled={!searchKeyword.trim() || isValidating}
            >
              开始检测
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
