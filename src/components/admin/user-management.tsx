/**
 * Admin Panel - User Management Component
 * Handles all user-related operations
 */

'use client';

import { useState } from 'react';
import { Users, UserPlus, Shield, Ban, Key, Trash2, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AdminConfig } from '@/types';

interface UserManagementProps {
  config: AdminConfig;
  onUpdate: () => void;
}

export function UserManagement({ config, onUpdate }: UserManagementProps) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!newUsername || !newPassword) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/user?action=add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });

      if (res.ok) {
        setShowAddUser(false);
        setNewUsername('');
        setNewPassword('');
        onUpdate();
      }
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (username: string) => {
    if (!confirm(`确定要封禁用户 ${username} 吗？`)) return;

    try {
      const res = await fetch('/api/admin/user?action=ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleUnbanUser = async (username: string) => {
    try {
      const res = await fetch('/api/admin/user?action=unban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const handleDeleteUser = async (username: string) => {
    if (!confirm(`确定要删除用户 ${username} 吗？此操作不可恢复！`)) return;

    try {
      const res = await fetch('/api/admin/user?action=deleteUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Failed to delete user:', error);
    }
  };

  const handleSetAdmin = async (username: string) => {
    try {
      const res = await fetch('/api/admin/user?action=setAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Failed to set admin:', error);
    }
  };

  const handleCancelAdmin = async (username: string) => {
    try {
      const res = await fetch('/api/admin/user?action=cancelAdmin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (res.ok) onUpdate();
    } catch (error) {
      console.error('Failed to cancel admin:', error);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser || !newPassword) return;

    setLoading(true);
    try {
      const res = await fetch('/api/admin/user?action=changePassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUser, newPassword }),
      });

      if (res.ok) {
        setShowChangePassword(false);
        setSelectedUser('');
        setNewPassword('');
      }
    } catch (error) {
      console.error('Failed to change password:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                用户管理
              </CardTitle>
              <CardDescription>管理系统用户和权限</CardDescription>
            </div>
            <Button onClick={() => setShowAddUser(true)}>
              <UserPlus className="mr-2 h-4 w-4" />
              添加用户
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">用户名</TableHead>
                    <TableHead className="min-w-[100px]">角色</TableHead>
                    <TableHead className="min-w-[100px]">状态</TableHead>
                    <TableHead className="min-w-[150px]">标签</TableHead>
                    <TableHead className="text-right min-w-[140px]">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {config.UserConfig.Users.map((user) => (
                <TableRow key={user.username}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'owner' ? 'default' : user.role === 'admin' ? 'secondary' : 'outline'}>
                      {user.role === 'owner' ? '所有者' : user.role === 'admin' ? '管理员' : '用户'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.banned ? (
                      <Badge variant="destructive">已封禁</Badge>
                    ) : (
                      <Badge variant="success">正常</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.tags && user.tags.length > 0 ? (
                      <div className="flex gap-1 flex-wrap">
                        {user.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">无</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {user.role !== 'owner' && (
                        <>
                          {user.banned ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnbanUser(user.username)}
                            >
                              解封
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleBanUser(user.username)}
                            >
                              <Ban className="mr-1 h-3 w-3" />
                              封禁
                            </Button>
                          )}

                          {user.role === 'admin' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelAdmin(user.username)}
                            >
                              取消管理员
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetAdmin(user.username)}
                            >
                              <Shield className="mr-1 h-3 w-3" />
                              设为管理员
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user.username);
                              setShowChangePassword(true);
                            }}
                          >
                            <Key className="mr-1 h-3 w-3" />
                            改密
                          </Button>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            <Trash2 className="mr-1 h-3 w-3" />
                            删除
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>添加新用户</DialogTitle>
            <DialogDescription>创建一个新的系统用户账号</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUser(false)}>
              取消
            </Button>
            <Button onClick={handleAddUser} disabled={loading || !newUsername || !newPassword}>
              {loading ? '添加中...' : '确认添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>为用户 {selectedUser} 设置新密码</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">新密码</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="请输入新密码"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePassword(false)}>
              取消
            </Button>
            <Button onClick={handleChangePassword} disabled={loading || !newPassword}>
              {loading ? '修改中...' : '确认修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
