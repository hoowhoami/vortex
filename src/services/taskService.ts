import { aria2 } from '@/api/aria2';
import { useTaskStore } from '@/store/taskStore';
import type { AddTaskOptions } from '@/types';

export class TaskService {
  static async fetchTasks(): Promise<void> {
    const [active, waiting, stopped] = await Promise.all([
      aria2.tellActive(),
      aria2.tellWaiting(0, 1000),
      aria2.tellStopped(0, 1000),
    ]);

    const tasks = [...active, ...waiting, ...stopped];
    useTaskStore.getState().setTasks(tasks);
  }

  static async addUri(uris: string[], options?: AddTaskOptions): Promise<string> {
    const gid = await aria2.addUri(uris, options);
    await this.fetchTasks();
    return gid;
  }

  static async pauseTask(gid: string): Promise<void> {
    await aria2.pause(gid);
    await this.fetchTasks();
  }

  static async resumeTask(gid: string): Promise<void> {
    await aria2.unpause(gid);
    await this.fetchTasks();
  }

  static async removeTask(gid: string): Promise<void> {
    await aria2.remove(gid);
    await this.fetchTasks();
  }

  static async batchPause(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.pause(gid)));
    await this.fetchTasks();
  }

  static async batchResume(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.unpause(gid)));
    await this.fetchTasks();
  }

  static async batchRemove(gids: string[]): Promise<void> {
    await Promise.all(gids.map(gid => aria2.remove(gid)));
    await this.fetchTasks();
  }
}
