// Task types based on Aria2 download status
export interface Task {
  gid: string;
  status: 'active' | 'waiting' | 'paused' | 'error' | 'complete' | 'removed';
  totalLength: string;
  completedLength: string;
  uploadLength: string;
  downloadSpeed: string;
  uploadSpeed: string;
  connections: string;
  numSeeders?: string;
  seeder?: string;
  files: TaskFile[];
  bittorrent?: {
    info?: {
      name: string;
    };
  };
  dir: string;
  errorCode?: string;
  errorMessage?: string;
}

export interface TaskFile {
  index: string;
  path: string;
  length: string;
  completedLength: string;
  selected: string;
  uris: Array<{
    uri: string;
    status: string;
  }>;
}

export interface GlobalStat {
  downloadSpeed: string;
  uploadSpeed: string;
  numActive: string;
  numWaiting: string;
  numStopped: string;
  numStoppedTotal: string;
}

export interface AddTaskOptions {
  dir?: string;
  out?: string;
  split?: string;
  maxConnectionPerServer?: string;
  header?: string[];
  httpUser?: string;
  httpPasswd?: string;
  referer?: string;
  userAgent?: string;
}

export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  locale: string;
  downloadDir: string;
  maxConcurrentDownloads: number;
  maxConnectionPerServer: number;
  split: number;
  minSplitSize: string;
  maxDownloadSpeed: string;
  maxUploadSpeed: string;
  autoCheckUpdate: boolean;
  hideAppOnClose: boolean;
  enableProxy: boolean;
  proxyType: 'http' | 'https' | 'socks5';
  proxyHost: string;
  proxyPort: number;
  enableUPnP: boolean;
  seedRatio: number;
  seedTime: number;
}

export interface Aria2Config {
  dir: string;
  'max-concurrent-downloads': number;
  'max-connection-per-server': number;
  split: number;
  'min-split-size': string;
  'max-overall-download-limit': string;
  'max-overall-upload-limit': string;
  'enable-rpc': boolean;
  'rpc-listen-port': number;
  'rpc-secret': string;
  'continue': boolean;
  'file-allocation': string;
  'enable-dht': boolean;
  'bt-enable-lpd': boolean;
  'enable-peer-exchange': boolean;
  'seed-ratio': number;
  'seed-time': number;
}
