import type { Task, GlobalStat, AddTaskOptions } from '@/types';

export class Aria2Client {
  private rpcUrl: string;
  private secret: string;

  constructor(rpcUrl: string = 'http://localhost:6800/jsonrpc', secret: string = 'vortex') {
    this.rpcUrl = rpcUrl;
    this.secret = secret;
  }

  // Update connection settings from config
  updateConfig(rpcUrl?: string, secret?: string) {
    if (rpcUrl) this.rpcUrl = rpcUrl;
    if (secret !== undefined) this.secret = secret;
  }

  private async call(method: string, params: unknown[] = []): Promise<unknown> {
    const payload = {
      jsonrpc: '2.0',
      id: Date.now().toString(),
      method: `aria2.${method}`,
      params: this.secret ? [`token:${this.secret}`, ...params] : params,
    };

    try {
      const response = await fetch(this.rpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.message);
      }

      return data.result;
    } catch (error) {
      console.error(`Aria2 RPC error (${method}):`, error);
      throw error;
    }
  }

  // Task management methods
  async addUri(uris: string[], options?: AddTaskOptions): Promise<string> {
    return this.call('addUri', [uris, options || {}]) as Promise<string>;
  }

  async addTorrent(torrent: string, options?: AddTaskOptions): Promise<string> {
    return this.call('addTorrent', [torrent, [], options || {}]) as Promise<string>;
  }

  async addMetalink(metalink: string, options?: AddTaskOptions): Promise<string> {
    return this.call('addMetalink', [metalink, options || {}]) as Promise<string>;
  }

  async remove(gid: string): Promise<string> {
    return this.call('remove', [gid]) as Promise<string>;
  }

  async forceRemove(gid: string): Promise<string> {
    return this.call('forceRemove', [gid]) as Promise<string>;
  }

  async pause(gid: string): Promise<string> {
    return this.call('pause', [gid]) as Promise<string>;
  }

  async pauseAll(): Promise<string> {
    return this.call('pauseAll') as Promise<string>;
  }

  async forcePause(gid: string): Promise<string> {
    return this.call('forcePause', [gid]) as Promise<string>;
  }

  async forcePauseAll(): Promise<string> {
    return this.call('forcePauseAll') as Promise<string>;
  }

  async unpause(gid: string): Promise<string> {
    return this.call('unpause', [gid]) as Promise<string>;
  }

  async unpauseAll(): Promise<string> {
    return this.call('unpauseAll') as Promise<string>;
  }

  // Status methods
  async tellStatus(gid: string, keys?: string[]): Promise<Task> {
    return this.call('tellStatus', keys ? [gid, keys] : [gid]) as Promise<Task>;
  }

  async getUris(gid: string): Promise<unknown[]> {
    return this.call('getUris', [gid]) as Promise<unknown[]>;
  }

  async getFiles(gid: string): Promise<unknown[]> {
    return this.call('getFiles', [gid]) as Promise<unknown[]>;
  }

  async getPeers(gid: string): Promise<unknown[]> {
    return this.call('getPeers', [gid]) as Promise<unknown[]>;
  }

  async getServers(gid: string): Promise<unknown[]> {
    return this.call('getServers', [gid]) as Promise<unknown[]>;
  }

  async tellActive(keys?: string[]): Promise<Task[]> {
    return this.call('tellActive', keys ? [keys] : []) as Promise<Task[]>;
  }

  async tellWaiting(offset: number, num: number, keys?: string[]): Promise<Task[]> {
    return this.call('tellWaiting', keys ? [offset, num, keys] : [offset, num]) as Promise<Task[]>;
  }

  async tellStopped(offset: number, num: number, keys?: string[]): Promise<Task[]> {
    return this.call('tellStopped', keys ? [offset, num, keys] : [offset, num]) as Promise<Task[]>;
  }

  async changePosition(gid: string, pos: number, how: string): Promise<number> {
    return this.call('changePosition', [gid, pos, how]) as Promise<number>;
  }

  async changeUri(gid: string, fileIndex: number, delUris: string[], addUris: string[], position?: number): Promise<number[]> {
    return this.call('changeUri', position !== undefined
      ? [gid, fileIndex, delUris, addUris, position]
      : [gid, fileIndex, delUris, addUris]
    ) as Promise<number[]>;
  }

  // Global methods
  async getGlobalOption(): Promise<unknown> {
    return this.call('getGlobalOption');
  }

  async changeGlobalOption(options: unknown): Promise<string> {
    return this.call('changeGlobalOption', [options]) as Promise<string>;
  }

  async getGlobalStat(): Promise<GlobalStat> {
    return this.call('getGlobalStat') as Promise<GlobalStat>;
  }

  async purgeDownloadResult(): Promise<string> {
    return this.call('purgeDownloadResult') as Promise<string>;
  }

  async removeDownloadResult(gid: string): Promise<string> {
    return this.call('removeDownloadResult', [gid]) as Promise<string>;
  }

  async getVersion(): Promise<unknown> {
    return this.call('getVersion');
  }

  async getSessionInfo(): Promise<unknown> {
    return this.call('getSessionInfo');
  }

  async shutdown(): Promise<string> {
    return this.call('shutdown') as Promise<string>;
  }

  async forceShutdown(): Promise<string> {
    return this.call('forceShutdown') as Promise<string>;
  }

  async saveSession(): Promise<string> {
    return this.call('saveSession') as Promise<string>;
  }

  // Multicall for batch operations
  async multicall(methods: Array<{ methodName: string; params: unknown[] }>): Promise<unknown[]> {
    const calls = methods.map(m => ({
      methodName: `aria2.${m.methodName}`,
      params: this.secret ? [`token:${this.secret}`, ...m.params] : m.params,
    }));
    return this.call('system.multicall', [calls]) as Promise<unknown[]>;
  }

  // Get current RPC URL
  getRpcUrl(): string {
    return this.rpcUrl;
  }
}

// Singleton instance - uses default secret which matches backend
export const aria2 = new Aria2Client();
