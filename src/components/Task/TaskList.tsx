import { Table, Button, Space } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useTaskStore } from '@/store/taskStore';
import { TaskService } from '@/services/taskService';
import type { Task } from '@/types';

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
              onClick={() => TaskService.pauseTask(task.gid)}
            />
          ) : (
            <Button
              icon={<PlayCircleOutlined />}
              onClick={() => TaskService.resumeTask(task.gid)}
            />
          )}
          <Button
            icon={<DeleteOutlined />}
            danger
            onClick={() => TaskService.removeTask(task.gid)}
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
