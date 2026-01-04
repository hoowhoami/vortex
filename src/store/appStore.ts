import { create } from 'zustand';
import type { AppConfig } from '@/types';

interface AppState {
  config: AppConfig;
  isEngineRunning: boolean;
  pollingInterval: number;

  // Actions
  setConfig: (config: Partial<AppConfig>) => void;
  setEngineRunning: (running: boolean) => void;
  setPollingInterval: (interval: number) => void;
}

const defaultConfig: AppConfig = {
  theme: 'auto',
  locale: 'en',
  downloadDir: '',
  maxConcurrentDownloads: 5,
  maxConnectionPerServer: 16,
  split: 16,
  minSplitSize: '1M',
  maxDownloadSpeed: '0',
  maxUploadSpeed: '0',
  autoCheckUpdate: true,
  hideAppOnClose: false,
  enableProxy: false,
  proxyType: 'http',
  proxyHost: '',
  proxyPort: 0,
  enableUPnP: false,
  seedRatio: 1.0,
  seedTime: 60,
};

export const useAppStore = create<AppState>((set) => ({
  config: defaultConfig,
  isEngineRunning: false,
  pollingInterval: 1000,

  setConfig: (config) => set((state) => ({
    config: { ...state.config, ...config }
  })),

  setEngineRunning: (running) => set({ isEngineRunning: running }),

  setPollingInterval: (interval) => set({ pollingInterval: interval }),
}));
