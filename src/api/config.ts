import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, Aria2Config } from '@/types';
import { aria2 } from './aria2';

export class ConfigManager {
  // Load user configuration
  static async loadUserConfig(): Promise<AppConfig | null> {
    try {
      return await invoke<AppConfig>('load_user_config');
    } catch (error) {
      console.error('Failed to load user config:', error);
      return null;
    }
  }

  // Save user configuration
  static async saveUserConfig(config: Partial<AppConfig>): Promise<void> {
    try {
      await invoke('save_user_config', { config });
    } catch (error) {
      console.error('Failed to save user config:', error);
      throw error;
    }
  }

  // Load system configuration (Aria2)
  static async loadSystemConfig(): Promise<Aria2Config | null> {
    try {
      return await invoke<Aria2Config>('load_system_config');
    } catch (error) {
      console.error('Failed to load system config:', error);
      return null;
    }
  }

  // Save system configuration (Aria2)
  static async saveSystemConfig(config: Partial<Aria2Config>): Promise<void> {
    try {
      await invoke('save_system_config', { config });
    } catch (error) {
      console.error('Failed to save system config:', error);
      throw error;
    }
  }

  // Update aria2 client connection settings from config
  static updateAria2Client(config: Aria2Config) {
    const rpcUrl = `http://localhost:${config['rpc-listen-port']}/jsonrpc`;
    const secret = config['rpc-secret'] || 'vortex';
    aria2.updateConfig(rpcUrl, secret);
  }

  // Convert AppConfig to Aria2Config
  static appConfigToAria2Config(appConfig: AppConfig): Partial<Aria2Config> {
    return {
      dir: appConfig.downloadDir,
      'max-concurrent-downloads': appConfig.maxConcurrentDownloads,
      'max-connection-per-server': appConfig.maxConnectionPerServer,
      split: appConfig.split,
      'min-split-size': appConfig.minSplitSize,
      'max-overall-download-limit': appConfig.maxDownloadSpeed,
      'max-overall-upload-limit': appConfig.maxUploadSpeed,
      'seed-ratio': appConfig.seedRatio,
      'seed-time': appConfig.seedTime,
    };
  }
}
