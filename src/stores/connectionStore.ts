import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import { Connection, ConnectionGroup } from '../types';

interface ConnectionState {
  connections: Connection[];
  groups: ConnectionGroup[];
  selectedConnection: Connection | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchConnections: () => Promise<void>;
  fetchGroups: () => Promise<void>;
  createConnection: (connection: Omit<Connection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateConnection: (connection: Connection) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  selectConnection: (connection: Connection | null) => void;
  createGroup: (group: Omit<ConnectionGroup, 'id' | 'order'>) => Promise<void>;
  updateGroup: (group: ConnectionGroup) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  connections: [],
  groups: [],
  selectedConnection: null,
  loading: false,
  error: null,

  fetchConnections: async () => {
    set({ loading: true, error: null });
    try {
      const connections = await invoke<Connection[]>('get_connections');
      set({ connections, loading: false });
    } catch (error) {
      set({ error: String(error), loading: false });
    }
  },

  fetchGroups: async () => {
    try {
      const groups = await invoke<ConnectionGroup[]>('get_groups');
      set({ groups });
    } catch (error) {
      set({ error: String(error) });
    }
  },

  createConnection: async (connectionData) => {
    set({ loading: true, error: null });
    try {
      const connection = await invoke<Connection>('create_connection', {
        name: connectionData.name,
        host: connectionData.host,
        port: connectionData.port,
        password: connectionData.password,
        database: connectionData.database,
        groupId: connectionData.groupId,
        tags: connectionData.tags,
        ssl: connectionData.ssl,
      });

      set((state) => ({
        connections: [connection, ...state.connections],
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  updateConnection: async (connection) => {
    set({ loading: true, error: null });
    try {
      await invoke('update_connection', {
        id: connection.id,
        name: connection.name,
        host: connection.host,
        port: connection.port,
        password: connection.password || null,
        database: connection.database,
        groupId: connection.groupId || null,
        tags: connection.tags,
        ssl: connection.ssl,
      });

      set((state) => ({
        connections: state.connections.map((c) =>
          c.id === connection.id ? connection : c
        ),
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  deleteConnection: async (id) => {
    set({ loading: true, error: null });
    try {
      await invoke('delete_connection', { id });

      set((state) => ({
        connections: state.connections.filter((c) => c.id !== id),
        selectedConnection: state.selectedConnection?.id === id ? null : state.selectedConnection,
        loading: false,
      }));
    } catch (error) {
      set({ error: String(error), loading: false });
      throw error;
    }
  },

  selectConnection: (connection) => {
    set({ selectedConnection: connection });
  },

  createGroup: async (groupData) => {
    try {
      const group = await invoke<ConnectionGroup>('create_group', {
        name: groupData.name,
        color: groupData.color,
        order: 0, // Default order
      });

      set((state) => ({
        groups: [...state.groups, group].sort((a, b) => a.order - b.order),
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  updateGroup: async (group) => {
    try {
      await invoke('update_group', {
        id: group.id,
        name: group.name,
        color: group.color,
        order: group.order,
      });

      set((state) => ({
        groups: state.groups.map((g) => (g.id === group.id ? group : g)),
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      await invoke('delete_group', { id });

      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
      }));
    } catch (error) {
      set({ error: String(error) });
      throw error;
    }
  },
}));
