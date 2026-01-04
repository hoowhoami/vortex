import { invoke } from '@tauri-apps/api/core';
import { useAppStore } from '@/store/appStore';

export class EngineService {
  static async start(): Promise<void> {
    try {
      await invoke('start_engine');
      useAppStore.getState().setEngineRunning(true);
    } catch (error) {
      // If already running, just update state
      if (error === 'Engine is already running') {
        useAppStore.getState().setEngineRunning(true);
      } else {
        throw error;
      }
    }
  }

  static async stop(): Promise<void> {
    try {
      await invoke('stop_engine');
      useAppStore.getState().setEngineRunning(false);
    } catch (error) {
      // If not running, just update state
      if (error === 'Engine is not running') {
        useAppStore.getState().setEngineRunning(false);
      } else {
        throw error;
      }
    }
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
