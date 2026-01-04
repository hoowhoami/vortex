import { Layout, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { TaskList } from '../Task/TaskList';
import { AddTaskDialog } from '../Task/AddTaskDialog';

const { Content } = Layout;

export function MainLayout() {
  const [addTaskOpen, setAddTaskOpen] = useState(false);

  return (
    <Layout style={{ height: '100vh' }}>
      <Content style={{ padding: '20px' }}>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h1 style={{ margin: 0 }}>Vortex Download Manager</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAddTaskOpen(true)}
            >
              Add Task
            </Button>
          </div>
          <TaskList />
        </Space>
      </Content>
      <AddTaskDialog open={addTaskOpen} onClose={() => setAddTaskOpen(false)} />
    </Layout>
  );
}
