/**
 * Category Management Component
 * Manages custom categories with drag-and-drop sorting
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
import { GripVertical } from 'lucide-react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CategoryManagementProps {
  config: AdminConfig;
  onUpdate: () => Promise<void>;
}

interface CustomCategory {
  name?: string;
  type: 'movie' | 'tv';
  query: string;
  from: 'config' | 'custom';
  disabled?: boolean;
}

export function CategoryManagement({ config, onUpdate }: CategoryManagementProps) {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<CustomCategory>({
    name: '',
    type: 'movie',
    query: '',
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

  // Initialize categories from config
  useEffect(() => {
    if (config?.CustomCategories) {
      setCategories(config.CustomCategories);
      setOrderChanged(false);
    }
  }, [config]);

  // API call wrapper
  const callCategoryApi = async (body: Record<string, any>) => {
    try {
      const resp = await fetch('/api/admin/category', {
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
  const handleToggleEnable = async (query: string, type: 'movie' | 'tv') => {
    const target = categories.find((c) => c.query === query && c.type === type);
    if (!target) return;
    const action = target.disabled ? 'enable' : 'disable';
    setLoading(`toggle_${query}_${type}`);
    try {
      await callCategoryApi({ action, query, type });
    } catch (err) {
      console.error('Toggle failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Delete category
  const handleDelete = async (query: string, type: 'movie' | 'tv') => {
    setLoading(`delete_${query}_${type}`);
    try {
      await callCategoryApi({ action: 'delete', query, type });
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Add category
  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.query) return;
    setLoading('add');
    try {
      await callCategoryApi({
        action: 'add',
        name: newCategory.name,
        type: newCategory.type,
        query: newCategory.query,
      });
      setNewCategory({
        name: '',
        type: 'movie',
        query: '',
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
    const oldIndex = categories.findIndex((c) => `${c.query}:${c.type}` === active.id);
    const newIndex = categories.findIndex((c) => `${c.query}:${c.type}` === over.id);
    setCategories((prev) => arrayMove(prev, oldIndex, newIndex));
    setOrderChanged(true);
  };

  // Save order
  const handleSaveOrder = async () => {
    const order = categories.map((c) => `${c.query}:${c.type}`);
    setLoading('sort');
    try {
      await callCategoryApi({ action: 'sort', order });
      setOrderChanged(false);
    } catch (err) {
      console.error('Sort failed:', err);
    } finally {
      setLoading(null);
    }
  };

  // Draggable row component
  const DraggableRow = ({ category }: { category: CustomCategory }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: `${category.query}:${category.type}`,
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
        <TableCell className="font-medium">{category.name || '-'}</TableCell>
        <TableCell>
          <Badge variant={category.type === 'movie' ? 'default' : 'secondary'}>
            {category.type === 'movie' ? '电影' : '电视剧'}
          </Badge>
        </TableCell>
        <TableCell className="max-w-[200px] truncate" title={category.query}>
          {category.query}
        </TableCell>
        <TableCell>
          <Badge variant={category.disabled ? 'destructive' : 'success'}>
            {category.disabled ? '已禁用' : '启用中'}
          </Badge>
        </TableCell>
        <TableCell className="text-right space-x-2">
          <Button
            size="sm"
            variant={category.disabled ? 'default' : 'destructive'}
            onClick={() => handleToggleEnable(category.query, category.type)}
            disabled={loading === `toggle_${category.query}_${category.type}`}
          >
            {category.disabled ? '启用' : '禁用'}
          </Button>
          {category.from !== 'config' && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDelete(category.query, category.type)}
              disabled={loading === `delete_${category.query}_${category.type}`}
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
          <h3 className="text-lg font-semibold">自定义分类管理</h3>
          <p className="text-sm text-muted-foreground">
            管理自定义分类，支持拖拽排序
          </p>
        </div>
        <Button
          variant={showAddForm ? 'outline' : 'default'}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? '取消' : '添加分类'}
        </Button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">分类名称</Label>
                  <Input
                    id="name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="例如: 热门电影"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">类型</Label>
                  <Select
                    value={newCategory.type}
                    onValueChange={(value: 'movie' | 'tv') =>
                      setNewCategory((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="movie">电影</SelectItem>
                      <SelectItem value="tv">电视剧</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="query">搜索关键词</Label>
                <Input
                  id="query"
                  value={newCategory.query}
                  onChange={(e) =>
                    setNewCategory((prev) => ({ ...prev, query: e.target.value }))
                  }
                  placeholder="例如: 科幻"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddForm(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleAddCategory}
                  disabled={!newCategory.name || !newCategory.query || loading === 'add'}
                >
                  {loading === 'add' ? '添加中...' : '添加'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories table */}
      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8"></TableHead>
                  <TableHead>分类名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>搜索关键词</TableHead>
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
                  items={categories.map((c) => `${c.query}:${c.type}`)}
                  strategy={verticalListSortingStrategy}
                >
                  <TableBody>
                    {categories.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          暂无自定义分类，请添加分类
                        </TableCell>
                      </TableRow>
                    ) : (
                      categories.map((category) => (
                        <DraggableRow
                          key={`${category.query}:${category.type}`}
                          category={category}
                        />
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
    </div>
  );
}
