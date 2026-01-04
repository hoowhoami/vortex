# Vortex Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the remaining features of Vortex, a modern download manager inspired by Motrix.

## Architecture Summary

### Three-Layer Architecture

```
┌─────────────────────────────────────────┐
│         Frontend (React + Antd)         │
│  - UI Components                        │
│  - State Management (Zustand)           │
│  - API Client Layer                     │
└─────────────────┬───────────────────────┘
                  │ Tauri Commands
┌─────────────────▼───────────────────────┐
│         Backend (Rust + Tauri)          │
│  - Engine Manager                       │
│  - Config Manager                       │
│  - IPC Handlers                         │
└─────────────────┬───────────────────────┘
                  │ Process Spawn
┌─────────────────▼───────────────────────┐
│       Download Engine (aria2c)          │
│  - HTTP/FTP/BitTorrent                  │
│  - JSON-RPC Server                      │
└─────────────────────────────────────────┘
```

## Completed Components

### 1. State Management ([src/store/](src/store/))

#### Task Store ([taskStore.ts](src/store/taskStore.ts))
- Manages download tasks state
- Filters tasks by status (active/waiting/stopped)
- Provides CRUD operations
- Tracks selected tasks for batch operations

#### App Store ([appStore.ts](src/store/appStore.ts))
- Manages application configuration
- Tracks engine status
- Controls polling interval

### 2. API Layer ([src/api/](src/api/))

#### Aria2 Client ([aria2.ts](src/api/aria2.ts))
- Complete JSON-RPC client implementation
- All aria2 methods supported:
  - Task management (add/pause/resume/remove)
  - Status queries (tellActive/tellWaiting/tellStopped)
  - Global operations (getGlobalStat/changeGlobalOption)
  - Multicall for batch operations

#### Config Manager ([config.ts](src/api/config.ts))
- Tauri command wrappers for configuration
- Converts between AppConfig and Aria2Config
- Handles config persistence

### 3. Backend ([src-tauri/src/](src-tauri/src/))

#### Engine Manager ([engine.rs](src-tauri/src/engine.rs:1-75))
- Spawns and manages aria2c process
- Start/stop/restart operations
- Process lifecycle management
- Automatic cleanup on drop

#### Config Manager ([config_manager.rs](src-tauri/src/config_manager.rs:1-168))
- Dual-store configuration system
- User config (JSON format)
- System config (aria2.conf format)
- Config parsing and serialization

#### Config Types ([config.rs](src-tauri/src/config.rs:1-150))
- AppConfig: User preferences
- Aria2Config: Engine settings
- Serde serialization support

## Implementation Roadmap

### Phase 1: Task Management System

#### 1.1 Task Service Layer
Create [src/services/taskService.ts](src/services/taskService.ts):

```typescript
import { aria2 } from '@/api/aria2';
import { useTaskStore } from '@/store/taskStore';
import { Task, AddTaskOptions } from '@/types';

export class TaskService {
  // Fetch all tasks
  static async fetchTasks(): Promise<void> {
    const [active, waiting, stopped] = await Promise.all([
      aria2.tellActive(),
      aria2.tellWaiting(0, 1000),
      aria2.tellStopped(0, 1000),
    ]);

    const tasks = [...active, ...waiting, ...stopped];
    useTaskStore.getState().setTasks(tasks);
  }

  // Add new download
  static async addUri(uris: string[], options?: AddTaskOptions): Promise<string> {
    const gid = await aria2.addUri(uris, options);
    await this.fetchTasks();
    return gid;
  }

  // Batch operations
  static async batchPause(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.pause(gid)));
    await this.fetchTasks();
  }

  static async batchResume(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.unpause(gid)));
    await this.fetchTasks();
  }

  static async batchRemove(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.remove(gid)));
    await this.fetchTasks();
  }
}
```

#### 1.2 Polling Hook
Create [src/hooks/useTaskPolling.ts](src/hooks/useTaskPolling.ts):

```typescript
import { useEffect, useRef } from 'react';
import { useTaskStore } from '@/store/taskStore';
import { useAppStore } from '@/store/appStore';
import { TaskService } from '@/services/taskService';
import { aria2 } from '@/api/aria2';

export function useTaskPolling() {
  const { activeTasks } = useTaskStore();
  const { pollingInterval, setPollingInterval, setGlobalStat } = useAppStore();
  const timerRef = useRef<number>();

  useEffect(() => {
    const poll = async () => {
      try {
        // Fetch tasks and global stats
        await Promise.all([
          TaskService.fetchTasks(),
          aria2.getGlobalStat().then(setGlobalStat),
        ]);

        // Adjust polling interval based on activity
        const numActive = activeTasks.length;
        const newInterval = numActive > 0
          ? Math.max(500, 1000 - numActive * 100)
          : Math.min(6000, pollingInterval + 500);

        if (newInterval !== pollingInterval) {
          setPollingInterval(newInterval);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    timerRef.current = window.setInterval(poll, pollingInterval);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [pollingInterval, activeTasks.length]);
}
```

### Phase 2: UI Components

#### 2.1 Main Layout
Create [src/components/Layout/MainLayout.tsx](src/components/Layout/MainLayout.tsx):

```typescript
import { Layout } from 'antd';
import { Sidebar } from './Sidebar';
import { TaskList } from '../Task/TaskList';
import { Speedometer } from '../Speedometer';

const { Sider, Content } = Layout;

export function MainLayout() {
  return (
    <Layout style={{ height: '100vh' }}>
      <Sider width={200} theme="light">
        <Sidebar />
      </Sider>
      <Content>
        <TaskList />
      </Content>
      <Speedometer />
    </Layout>
  );
}
```

#### 2.2 Task List Component
Create [src/components/Task/TaskList.tsx](src/components/Task/TaskList.tsx):

```typescript
import { Table, Button, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTaskStore } from '@/store/taskStore';
import { TaskService } from '@/services/taskService';
import { Task } from '@/types';

export function TaskList() {
  const { tasks, selectedGids, setSelectedGids } = useTaskStore();

  const columns = [
    {
      title: 'Name',
      dataIndex: 'files',
      render: (files: Task['files']) => files[0]?.path.split('/').pop() || 'Unknown',
    },
    {
      title: 'Progress',
      render: (task: Task) => {
        const progress = (parseInt(task.completedLength) / parseInt(task.totalLength)) * 100;
        return `${progress.toFixed(2)}%`;
      },
    },
    {
      title: 'Speed',
      dataIndex: 'downloadSpeed',
      render: (speed: string) => `${(parseInt(speed) / 1024 / 1024).toFixed(2)} MB/s`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
    },
    {
      title: 'Actions',
      render: (task: Task) => (
        <Space>
          {task.status === 'active' ? (
            <Button
              icon={<PauseCircleOutlined />}
              onClick={() => TaskService.batchPause([task.gid])}
            />
          ) : (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => TaskService.batchResume([task.gid])}
            />
          )}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => TaskService.batchRemove([task.gid])}
          />
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={tasks}
      columns={columns}
      rowKey="gid"
      rowSelection={{
        selectedRowKeys: selectedGids,
        onChange: (keys) => setSelectedGids(keys as string[]),
      }}
    />
  );
}
```

#### 2.3 Add Task Dialog
Create [src/components/Task/AddTaskDialog.tsx](src/components/Task/AddTaskDialog.tsx):

```typescript
import { Modal, Tabs, Input, Form, Button } from 'antd';
import { useState } from 'react';
import { TaskService } from '@/services/taskService';

export function AddTaskDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form] = Form.useForm();

  const handleSubmit = async (values: any) => {
    try {
      await TaskService.addUri([values.url], {
        dir: values.dir,
        out: values.filename,
      });
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Failed to add task:', error);
    }
  };

  return (
    <Modal
      title="Add Download"
      open={open}
      onCancel={onClose}
      footer={null}
    >
      <Tabs
        items={[
          {
            key: 'uri',
            label: 'URI',
            children: (
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item name="url" label="URL" rules={[{ required: true }]}>
                  <Input.TextArea rows={4} placeholder="Enter URLs (one per line)" />
                </Form.Item>
                <Form.Item name="dir" label="Save to">
                  <Input placeholder="/path/to/directory" />
                </Form.Item>
                <Form.Item name="filename" label="Filename">
                  <Input placeholder="Optional filename" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Add
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'torrent',
            label: 'Torrent',
            children: <div>Torrent upload (to be implemented)</div>,
          },
        ]}
      />
    </Modal>
  );
}
```

#### 2.4 Settings Page
Create [src/components/Settings/SettingsPage.tsx](src/components/Settings/SettingsPage.tsx):

```typescript
import { Form, Input, InputNumber, Switch, Button, message } from 'antd';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { ConfigManager } from '@/api/config';

export function SettingsPage() {
  const { config, setConfig } = useAppStore();
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(config);
  }, [config]);

  const handleSave = async (values: any) => {
    try {
      await ConfigManager.saveUserConfig(values);
      setConfig(values);
      message.success('Settings saved');
    } catch (error) {
      message.error('Failed to save settings');
    }
  };

  return (
    <Form form={form} onFinish={handleSave} layout="vertical">
      <Form.Item name="downloadDir" label="Download Directory">
        <Input />
      </Form.Item>
      <Form.Item name="maxConcurrentDownloads" label="Max Concurrent Downloads">
        <InputNumber min={1} max={20} />
      </Form.Item>
      <Form.Item name="maxConnectionPerServer" label="Max Connections Per Server">
        <InputNumber min={1} max={32} />
      </Form.Item>
      <Form.Item name="autoCheckUpdate" label="Auto Check Updates" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          Save Settings
        </Button>
      </Form.Item>
    </Form>
  );
}
```

### Phase 3: Engine Integration

#### 3.1 Engine Service
Create [src/services/engineService.ts](src/services/engineService.ts):

```typescript
import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/store/appStore';

export class EngineService {
  static async start(): Promise<void> {
    await invoke('start_engine');
    useAppStore.getState().setEngineRunning(true);
  }

  static async stop(): Promise<void> {
    await invoke('stop_engine');
    useAppStore.getState().setEngineRunning(false);
  }

  static async restart(): Promise<void> {
    await invoke('restart_engine');
  }

  static async checkStatus(): Promise<boolean> {
    const running = await invoke<boolean>('is_engine_running');
    useAppStore.getState().setEngineRunning(running);
    return running;
  }
}
```

#### 3.2 App Initialization
Update [src/App.tsx](src/App.tsx):

```typescript
import { useEffect, useState } from 'react';
import { ConfigProvider, theme } from 'antd';
import { MainLayout } from './components/Layout/MainLayout';
import { useTaskPolling } from './hooks/useTaskPolling';
import { EngineService } from './services/engineService';
import { ConfigManager } from './api/config';
import { useAppStore } from './store/appStore';

function App() {
  const [loading, setLoading] = useState(true);
  const { config, setConfig } = useAppStore();

  useEffect(() => {
    const init = async () => {
      try {
        // Load configuration
        const userConfig = await ConfigManager.loadUserConfig();
        if (userConfig) {
          setConfig(userConfig);
        }

        // Start engine
        await EngineService.start();

        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    init();

    return () => {
      EngineService.stop();
    };
  }, []);

  // Start polling
  useTaskPolling();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: config.theme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <MainLayout />
    </ConfigProvider>
  );
}

export default App;
```

## Next Steps

1. **Implement Task Management**
   - Create TaskService
   - Add polling hook
   - Test CRUD operations

2. **Build UI Components**
   - MainLayout with Sidebar
   - TaskList with selection
   - AddTaskDialog
   - SettingsPage

3. **Add Real-time Features**
   - Dynamic polling
   - Progress updates
   - Global statistics

4. **Protocol Handling**
   - Magnet link support
   - Custom URI schemes
   - Drag-drop support

5. **System Integration**
   - System tray
   - Notifications
   - Auto-launch

## Testing

### Manual Testing
1. Start the app: `npm run tauri:dev`
2. Check engine status
3. Add a download
4. Test pause/resume/remove
5. Verify configuration persistence

### Unit Testing
- Test Zustand stores
- Test API client methods
- Test utility functions

## Deployment

### Build for Production
```bash
npm run tauri:build
```

### Platform-Specific Notes
- **macOS**: Requires code signing for distribution
- **Windows**: Requires installer configuration
- **Linux**: AppImage or DEB package

## Resources

- [Tauri Documentation](https://tauri.app/v2/)
- [Ant Design Components](https://ant.design/components/overview/)
- [Aria2 Manual](https://aria2.github.io/manual/en/html/)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

## Troubleshooting

### Engine Won't Start
- Check if aria2c is installed: `which aria2c`
- Check config file permissions
- Review Tauri logs

### RPC Connection Failed
- Verify aria2c is running
- Check RPC port (default: 6800)
- Verify RPC secret matches

### Build Errors
- Clear node_modules and reinstall
- Clear Rust target directory
- Update dependencies
