import { useEffect, useState, useRef } from 'react';
import { ConfigProvider, theme, Spin } from 'antd';
import { MainLayout } from './components/Layout/MainLayout';
import { useTaskPolling } from './hooks/useTaskPolling';
import { EngineService } from './services/engineService';
import { ConfigManager } from './api/config';
import { useAppStore } from './store/appStore';
import './App.css';

function App() {
  const [loading, setLoading] = useState(true);
  const { config, setConfig } = useAppStore();
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double initialization in React StrictMode
    if (initialized.current) return;
    initialized.current = true;

    const init = async () => {
      try {
        const userConfig = await ConfigManager.loadUserConfig();
        if (userConfig) {
          setConfig(userConfig);
        }

        await EngineService.start();
        setLoading(false);
      } catch (error) {
        console.error('Initialization error:', error);
        setLoading(false);
      }
    };

    init();

    return () => {
      // Only stop if we actually started it
      if (initialized.current) {
        EngineService.stop().catch(console.error);
      }
    };
  }, [setConfig]);

  useTaskPolling();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
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
