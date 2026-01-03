import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { RedisValue, RedisKey } from '../types';

interface RedisState {
  connectedId: string | null;
  currentDatabase: number;
  keys: RedisKey[];
  selectedKey: string | null;
  selectedValue: RedisValue | null;
  loading: boolean;
  error: string | null;

  // Actions
  connect: (connectionId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  selectDatabase: (database: number) => Promise<void>;
  fetchKeys: (pattern: string, keyType?: string) => Promise<void>;
  getValue: (key: string) => Promise<void>;
  setValue: (key: string, value: unknown) => Promise<void>;
  deleteKey: (key: string) => Promise<void>;
  deleteMultipleKeys: (keys: string[]) => Promise<void>;
  executeCommand: (command: string) => Promise<string>;
}

export const useRedisStore = create<RedisState>((set, get) => ({
  connectedId: null,
  currentDatabase: 0,
  keys: [],
  selectedKey: null,
  selectedValue: null,
  loading: false,
  error: null,

  connect: async (connectionId) => {
    set({ loading: true, error: null });
    try {
      await invoke('connect_redis', { connectionId });
      set({ connectedId: connectionId, currentDatabase: 0, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  disconnect: async () => {
    const { connectedId } = get();
    if (!connectedId) return;

    try {
      await invoke('disconnect_redis', { connectionId: connectedId });
      set({
        connectedId: null,
        currentDatabase: 0,
        keys: [],
        selectedKey: null,
        selectedValue: null,
      });
    } catch (error) {
      set({ error: String(error) });
    }
  },

  selectDatabase: async (database) => {
    const { connectedId } = get();
    if (!connectedId) return;

    set({ loading: true, error: null });
    try {
      await invoke('select_database', {
        connectionId: connectedId,
        database,
      });
      set({ currentDatabase: database, keys: [], selectedKey: null, selectedValue: null, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  fetchKeys: async (pattern = '*', keyType?: string) => {
    const { connectedId } = get();
    if (!connectedId) return;

    // Get settings from localStorage
    const scanCount = parseInt(localStorage.getItem('scanCount') || '1000');
    const keysLimit = parseInt(localStorage.getItem('keysLimit') || '10000');

    set({ loading: true, error: null });
    try {
      const keys = await invoke<RedisKey[]>('get_keys', {
        connectionId: connectedId,
        pattern,
        scanCount,
        keysLimit,
        keyType: keyType && keyType !== 'all' ? keyType : null,
      });
      set({ keys, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  getValue: async (key) => {
    const { connectedId } = get();
    if (!connectedId) return;

    set({ loading: true, error: null });
    try {
      const value = await invoke<RedisValue>('get_value', {
        connectionId: connectedId,
        key,
      });
      set({ selectedKey: key, selectedValue: value, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  setValue: async (key, value) => {
    const { connectedId } = get();
    if (!connectedId) return;

    set({ loading: true, error: null });
    try {
      await invoke('set_value', {
        connectionId: connectedId,
        key,
        value,
      });
      set({ loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteKey: async (key) => {
    const { connectedId } = get();
    if (!connectedId) return;

    set({ loading: true, error: null });
    try {
      await invoke('delete_key', {
        connectionId: connectedId,
        key,
      });
      set((state) => ({
        keys: state.keys.filter((k) => k.key !== key),
        selectedKey: state.selectedKey === key ? null : state.selectedKey,
        selectedValue: state.selectedKey === key ? null : state.selectedValue,
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteMultipleKeys: async (keys) => {
    const { connectedId } = get();
    if (!connectedId) return;

    set({ loading: true, error: null });
    try {
      await invoke('delete_multiple_keys', {
        connectionId: connectedId,
        keys,
      });
      set((state) => ({
        keys: state.keys.filter((k) => !keys.includes(k.key)),
        selectedKey: keys.includes(state.selectedKey || '') ? null : state.selectedKey,
        selectedValue: keys.includes(state.selectedKey || '') ? null : state.selectedValue,
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  executeCommand: async (command) => {
    const { connectedId } = get();
    if (!connectedId) throw new Error('Not connected to Redis');

    try {
      const result = await invoke<string>('execute_command', {
        connectionId: connectedId,
        command,
      });
      return result;
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },
}));
