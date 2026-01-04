import { create } from 'zustand';
import type { Task, GlobalStat } from '@/types';

interface TaskState {
  tasks: Task[];
  activeTasks: Task[];
  waitingTasks: Task[];
  stoppedTasks: Task[];
  selectedGids: string[];
  currentTask: Task | null;
  globalStat: GlobalStat;

  // Actions
  setTasks: (tasks: Task[]) => void;
  setGlobalStat: (stat: GlobalStat) => void;
  setSelectedGids: (gids: string[]) => void;
  setCurrentTask: (task: Task | null) => void;
  addTask: (task: Task) => void;
  updateTask: (gid: string, updates: Partial<Task>) => void;
  removeTask: (gid: string) => void;
  clearTasks: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  activeTasks: [],
  waitingTasks: [],
  stoppedTasks: [],
  selectedGids: [],
  currentTask: null,
  globalStat: {
    downloadSpeed: '0',
    uploadSpeed: '0',
    numActive: '0',
    numWaiting: '0',
    numStopped: '0',
    numStoppedTotal: '0',
  },

  setTasks: (tasks) => {
    const activeTasks = tasks.filter(t => t.status === 'active');
    const waitingTasks = tasks.filter(t => t.status === 'waiting');
    const stoppedTasks = tasks.filter(t =>
      ['paused', 'error', 'complete', 'removed'].includes(t.status)
    );

    set({
      tasks,
      activeTasks,
      waitingTasks,
      stoppedTasks
    });
  },

  setGlobalStat: (stat) => set({ globalStat: stat }),

  setSelectedGids: (gids) => set({ selectedGids: gids }),

  setCurrentTask: (task) => set({ currentTask: task }),

  addTask: (task) => {
    const tasks = [...get().tasks, task];
    get().setTasks(tasks);
  },

  updateTask: (gid, updates) => {
    const tasks = get().tasks.map(t =>
      t.gid === gid ? { ...t, ...updates } : t
    );
    get().setTasks(tasks);
  },

  removeTask: (gid) => {
    const tasks = get().tasks.filter(t => t.gid !== gid);
    get().setTasks(tasks);
  },

  clearTasks: () => set({
    tasks: [],
    activeTasks: [],
    waitingTasks: [],
    stoppedTasks: []
  }),
}));
