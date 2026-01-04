import { Modal, Tabs, Input, Form, Button, message } from 'antd';
import { useState } from 'react';
import { TaskService } from '@/services/taskService';

interface AddTaskDialogProps {
  open: boolean;
  onClose: () => void;
}

export function AddTaskDialog({ open, onClose }: AddTaskDialogProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { url: string; dir?: string; filename?: string }) => {
    setLoading(true);
    try {
      const urls = values.url.split('\n').filter(url => url.trim());
      await TaskService.addUri(urls, {
        dir: values.dir,
        out: values.filename,
      });
      message.success(`Successfully added ${urls.length} download(s)`);
      onClose();
      form.resetFields();
    } catch (error) {
      message.error('Failed to add download');
      console.error('Failed to add task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Add Download"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Tabs
        items={[
          {
            key: 'uri',
            label: 'URI',
            children: (
              <Form form={form} onFinish={handleSubmit} layout="vertical">
                <Form.Item
                  name="url"
                  label="URL"
                  rules={[{ required: true, message: 'Please enter at least one URL' }]}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder="Enter URLs (one per line)&#10;http://example.com/file1.zip&#10;http://example.com/file2.zip"
                  />
                </Form.Item>
                <Form.Item name="dir" label="Save to">
                  <Input placeholder="/path/to/directory (optional)" />
                </Form.Item>
                <Form.Item name="filename" label="Filename">
                  <Input placeholder="Optional filename (only for single URL)" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" loading={loading} block>
                    Add Download
                  </Button>
                </Form.Item>
              </Form>
            ),
          },
          {
            key: 'torrent',
            label: 'Torrent',
            children: (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Torrent upload feature coming soon...
              </div>
            ),
          },
          {
            key: 'metalink',
            label: 'Metalink',
            children: (
              <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                Metalink support coming soon...
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}
