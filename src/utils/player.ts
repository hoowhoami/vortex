import type { Song, PlayMode } from '@/types';
import { Howl, Howler } from 'howler';
import { cloneDeep } from 'lodash-es';
import { usePlayerStore, useSettingStore, useUserStore } from '@/store';
import {
  getCloudSongUrl,
  getSongClimax,
  getSongPrivilege,
  getSongUrl,
  uploadPlayHistory,
} from '@/api';
import { calculateProgress } from './time';
import { getCover } from './music';
import { isDev } from './common';
import { MUSIC_EFFECT_OPTIONS } from '@/constants';
import { lyricsHandler } from './lyrics';
import { nextTick } from 'vue';

// 播放器核心
// Howler.js

// 允许播放格式
const allowPlayFormat = ['mp3', 'flac', 'webm', 'ogg', 'wav'];

class Player {
  // 播放器
  private player: Howl;
  // 定时器
  private playerInterval: ReturnType<typeof setInterval> | undefined;

  // 其他数据
  private testNumber: number = 0;

  constructor() {
    // 创建播放器实例
    this.player = new Howl({ src: [''], format: allowPlayFormat, autoplay: false });
    // 初始化媒体会话
    this.initMediaSession();
    // 初始化后恢复状态
    this.initPlayerOnAppStart();
    // 设置事件监听器
    this.setupEventListeners();
  }
  /**
   * 洗牌数组（Fisher-Yates）
   */
  private shuffleArray<T>(arr: T[]): T[] {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners() {
    // 监听来自桌面歌词的当前歌曲信息请求
    if (typeof window !== 'undefined') {
      window.addEventListener('request-current-song-for-lyrics', () => {
        const currentSong = this.getPlaySongData();
        if (currentSong) {
          this.notifyDesktopLyrics('song', currentSong);
        }
      });
    }
  }
  /**
   * 应用启动时初始化播放器
   * 处理 Pinia 持久化后的状态恢复问题
   */
  private initPlayerOnAppStart() {
    // 使用 nextTick 确保 DOM 已加载且 Pinia 状态已恢复
    nextTick(() => {
      const playerStore = usePlayerStore();
      // 检查是否有播放列表和当前歌曲
      if (playerStore.playlist.length > 0 && playerStore.current && playerStore.index >= 0) {
        console.log('🎵 恢复播放器状态');

        // 重置播放状态，防止状态不一致
        playerStore.isPlaying = false;
        playerStore.loading = false;

        // 重新初始化播放器
        const seek = playerStore.currentTime || 0;
        this.initPlayer(false, seek);
      }
    });
  }

  /**
   * 重置状态
   */
  resetStatus() {
    const playerStore = usePlayerStore();
    // 重置状态
    playerStore.resetPlaybackState();
    // 重置播放器
    this.player.unload();
  }
  /**
   * 获取当前播放歌曲
   * @returns 当前播放歌曲
   */
  private getPlaySongData(): Song | null {
    const playerStore = usePlayerStore();
    // 播放列表
    const playlist = playerStore.playlist;
    if (!playlist?.length || playerStore.index < 0) {
      return null;
    }
    return playlist[playerStore.index];
  }
  /**
   * 获取淡入淡出时间
   * @returns 播放音量
   */
  private getFadeTime(): number {
    const settingStore = useSettingStore();
    const { volumeFade, volumeFadeTime } = settingStore;
    return volumeFade ? volumeFadeTime : 0;
  }
  /**
   * 处理播放状态
   */
  private handlePlayStatus() {
    const playerStore = usePlayerStore();
    // 清理定时器
    clearInterval(this.playerInterval);
    // 更新播放状态
    this.playerInterval = setInterval(() => {
      if (!this.player.playing()) {
        return;
      }
      const currentTime = this.getSeek();
      const duration = this.player.duration();
      // 计算进度条距离
      const progress = calculateProgress(currentTime, duration);
      // 更新歌词高亮（全屏歌词打开时才滚动）
      const shouldScroll = lyricsHandler.data.showLyrics.value;
      lyricsHandler.highlightCurrentChar(currentTime, shouldScroll);

      // 更新状态
      playerStore.$patch({ currentTime, duration, progress });
    }, 250);
  }

  /**
   * 获取在线播放链接（支持音质降级）
   * @param song 歌曲
   * @returns 播放链接
   */
  private async getOnlineUrl(song: Song): Promise<string | null> {
    const userStore = useUserStore();
    if (song.source === 'cloud') {
      try {
        if (!userStore.isAuthenticated) {
          return null;
        }
        const res = await getCloudSongUrl(song.hash);
        if (res.url) {
          return res.url;
        }
      } catch (error) {
        console.error('❌ 获取云盘歌曲URL失败:', error);
      }
      return null;
    }

    const playerStore = usePlayerStore();
    const settingStore = useSettingStore();

    // 获取音乐详情
    const privilege = await getSongPrivilege(song.hash);
    const qualities = privilege?.[0].relate_goods;

    // 音质列表（首选音质 + 备选音质）
    const qualityList = settingStore.compatibilityMode
      ? [playerStore.audioQuality, settingStore.backupQuality]
      : [playerStore.audioQuality];

    // 去重音质列表
    const uniqueQualities = [...new Set(qualityList)];

    for (const quality of uniqueQualities) {
      try {
        console.log(`🎵 尝试获取音质/音效: ${quality}`);
        const effect = !!MUSIC_EFFECT_OPTIONS.filter(item => item.value === quality);
        let hash = song.hash;
        if (!effect) {
          // 获取音质对应的歌曲hash
          hash = qualities.find((item: { quality: string }) => item.quality === quality)?.hash;
          if (!hash) {
            console.warn(`❌ 未找到音质 ${quality} 的 hash`);
            continue;
          }
        }
        const res = await getSongUrl(hash, quality);
        if (res.status === 1) {
          if (res.url && res.url[0]) {
            console.log(`✅ 成功获取音质 ${quality} 的播放链接`);
            return res.url[0];
          }
        } else if (res.status === 2) {
          console.warn(`💰 音质/音效 ${quality} 需要购买，尝试下一个音质`);
        } else if (res.status === 3) {
          console.warn(`🚫 音质/音效 ${quality} 暂无版权，尝试下一个音质`);
        } else {
          console.warn(
            `⚠️ 音质/音效 ${quality} 获取失败 (status: ${res.status})，尝试下一个音质/音效`,
          );
        }
      } catch (error) {
        console.error(`❌ 获取音质/音效 ${quality} 时出错:`, error);
      }
    }

    // 所有音质/音效都失败，尝试不带音质/音效参数作为最后备选
    if (settingStore.compatibilityMode) {
      console.log('🔄 所有音质/音效获取失败，尝试兼容模式');
      try {
        const res = await getSongUrl(song.hash);
        if (res.status === 1 && res.url && res.url[0]) {
          console.log('🎵 兼容模式获取成功');
          return res.url[0];
        }
      } catch (error) {
        console.error('❌ 兼容模式失败:', error);
      }
    }

    // 尝试试听
    if (!userStore.isAuthenticated) {
      try {
        const res = await getSongUrl(song.hash, '', 'true');
        if (res.url) {
          console.log('🎵 获取试听成功');
          return res.url;
        }
      } catch (error) {
        console.error('❌ 获取试听失败:', error);
        window.$message.warning('该歌曲暂时无法试听');
      }
    }

    console.error('❌ 所有音质/音效获取尝试均失败');
    return null;
  }

  /**
   * 创建播放器
   * @param src 播放地址
   * @param autoPlay 是否自动播放
   * @param seek 播放位置
   */
  private async createPlayer(src: string, autoPlay: boolean = true, seek: number = 0) {
    // 获取数据
    const playerStore = usePlayerStore();
    // 清理播放器
    Howler.unload();
    // 清理定时器
    clearInterval(this.playerInterval);
    // 创建播放器
    this.player = new Howl({
      src,
      format: allowPlayFormat,
      html5: true,
      autoplay: false, // 先不自动播放，等待 load 事件
      preload: 'metadata',
      pool: 1,
      volume: playerStore.volume,
      rate: playerStore.rate,
    });

    // 播放器事件
    this.playerEvent({ seek, autoPlay });
    // 获取歌曲附加信息 - 非电台和本地 TODO

    // 定时获取状态
    this.handlePlayStatus();

    // 上传播放历史
    this.uploadPlayHistory(playerStore.current);

    // 获取歌曲封面主色 TODO

    // 更新 MediaSession
    this.updateMediaSession();

    // 开发模式
    if (isDev) {
      window.player = this.player;
    }
  }

  /**
   * 播放器事件
   */
  private playerEvent(
    options: {
      // 恢复进度
      seek?: number;
      // 是否自动播放
      autoPlay?: boolean;
    } = { seek: 0, autoPlay: true },
  ) {
    // 获取数据
    const playerStore = usePlayerStore();
    const playSongData = this.getPlaySongData();
    // 获取配置
    const { seek, autoPlay } = options;
    // 初次加载
    this.player.once('load', () => {
      // 允许跨域
      const audioDom = this.getAudioDom();
      audioDom.crossOrigin = 'anonymous';
      // 恢复进度（ 需距离本曲结束大于 2 秒 ）
      if (seek && playerStore.duration - playerStore.currentTime > 2) {
        this.setSeek(seek);
      }
      // 更新状态
      playerStore.loading = false;
      // 如果需要自动播放，在加载完成后播放
      if (autoPlay) {
        this.play();
      }
      // ipc
    });
    // 播放
    this.player.on('play', () => {
      window.document.title = this.getPlayerInfo() || 'EchoMusic';
      // 更新播放状态
      playerStore.isPlaying = true;
      // 通知桌面歌词播放状态变化
      this.notifyDesktopLyrics('status', true);
      console.log('▶️ song play:', playSongData?.name);
    });
    // 暂停
    this.player.on('pause', () => {
      // 通知桌面歌词播放状态变化
      this.notifyDesktopLyrics('status', false);
      console.log('⏸️ song pause:', playSongData?.name);
    });
    // 结束
    this.player.on('end', () => {
      console.log('⏹️ song end:', playSongData?.name);
      this.nextOrPrev('next');
    });
    // 错误
    this.player.on('loaderror', (sourceid, err: any) => {
      this.errorNext(err);
      console.error('❌ song error:', sourceid, playSongData, err);
    });
  }

  /**
   * 通知桌面歌词
   */
  private notifyDesktopLyrics(type: 'song' | 'status', data: any) {
    if (typeof window !== 'undefined' && window.require) {
      try {
        const { ipcRenderer } = window.require('electron');
        if (type === 'song') {
          // 直接发送歌曲对象，桌面歌词只使用name字段
          const playSongData = typeof data === 'string' ? this.getPlaySongData() : data;
          if (playSongData) {
            const songInfo = {
              name: playSongData.name || '未知歌曲',
            };
            ipcRenderer.send('play-song-change', songInfo);
          }
        } else if (type === 'status') {
          ipcRenderer.send('play-status-change', data);
        }
      } catch (error) {
        console.warn('Failed to notify desktop lyrics:', error);
      }
    }
  }

  /**
   * 初始化 MediaSession
   */
  private initMediaSession() {
    if (!('mediaSession' in navigator)) {
      return;
    }
    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.nextOrPrev('prev'));
    navigator.mediaSession.setActionHandler('nexttrack', () => this.nextOrPrev('next'));
    // 跳转进度
    navigator.mediaSession.setActionHandler('seekto', event => {
      if (event.seekTime) {
        this.setSeek(event.seekTime);
      }
    });
  }

  /**
   * 更新 MediaSession
   */
  private updateMediaSession() {
    if (!('mediaSession' in navigator)) {
      return;
    }
    // 获取播放数据
    const playSongData = this.getPlaySongData();
    if (!playSongData) {
      return;
    }
    // 获取数据
    const metaData = {
      title: playSongData.name,
      artist: Array.isArray(playSongData.singerinfo)
        ? playSongData.singerinfo.map(item => item.name).join(' / ')
        : String(playSongData.singerinfo),
      album:
        typeof playSongData.albuminfo === 'object'
          ? playSongData.albuminfo.name
          : String(playSongData.albuminfo),
      artwork: [
        {
          src: getCover(playSongData.cover, 512),
          sizes: '512x512',
          type: 'image/jpeg',
        },
        {
          src: getCover(playSongData.cover, 100),
          sizes: '100x100',
          type: 'image/jpeg',
        },
        {
          src: getCover(playSongData.cover, 300),
          sizes: '300x300',
          type: 'image/jpeg',
        },
        {
          src: getCover(playSongData.cover, 1024),
          sizes: '1024x1024',
          type: 'image/jpeg',
        },
        {
          src: getCover(playSongData.cover, 1920),
          sizes: '1920x1920',
          type: 'image/jpeg',
        },
      ],
    };
    // 更新数据
    navigator.mediaSession.metadata = new window.MediaMetadata(metaData);
  }

  /**
   * 获取歌曲高潮部分
   * @param song 歌曲
   */
  private async getClimax(song: Song) {
    const playerStore = usePlayerStore();
    const result = await getSongClimax(song.hash);
    if (result && result.length) {
      const climaxs: { [key: number]: string } = {};
      const songDuration = song.timelen / 1000;
      for (const item of result) {
        const startTime =
          typeof item.start_time === 'string' ? parseInt(item.start_time) : item.start_time;
        if (startTime > 0) {
          const start = startTime / 1000;
          const startProgress = calculateProgress(start, songDuration);
          climaxs[startProgress] = '';
        }
        const endTime = typeof item.end_time === 'string' ? parseInt(item.end_time) : item.end_time;
        if (endTime > 0) {
          const end = endTime / 1000;
          const endProgress = calculateProgress(end, songDuration);
          climaxs[endProgress] = '';
        }
      }
      playerStore.setClimax(climaxs);
    }
  }

  /**
   * 获取歌词
   * @param song 歌曲
   */
  private async getSongLyric(song: Song) {
    try {
      await lyricsHandler.getLyrics(song.hash);
    } catch (error) {
      console.error('获取歌词失败:', error);
    }
  }

  /**
   * 上传播放历史
   * @param song 歌曲
   */
  private async uploadPlayHistory(song?: Song) {
    const userStore = useUserStore();
    if (!userStore.isAuthenticated) {
      return;
    }
    if (!song || !song.mixsongid) {
      return;
    }
    await uploadPlayHistory(song.mixsongid);
  }

  /**
   * 播放错误
   * 在播放错误时，播放下一首
   */
  private async errorNext(errCode?: number) {
    const playerStore = usePlayerStore();
    const settingStore = useSettingStore();
    if (settingStore.autoNextOnError) {
      window.$message.error('该歌曲无法播放，跳至下一首');
      setTimeout(async () => {
        // 次数加一
        this.testNumber++;
        if (this.testNumber > 5) {
          this.testNumber = 0;
          this.resetStatus();
          window.$message.error('当前重试次数过多，请稍后再试');
          return;
        }
        // 错误 2 通常为网络地址过期
        if (errCode === 2) {
          // 重载播放器
          await this.initPlayer(true, this.getSeek());
          return;
        }
        // 播放下一曲
        if (playerStore.playlist.length > 1) {
          await this.nextOrPrev('next');
        } else {
          window.$message.error('当前列表暂无可播放歌曲');
          this.cleanPlayList();
        }
      }, settingStore.autoNextOnErrorTime);
    } else {
      window.$message.error('该歌曲暂无法播放');
    }
  }

  /**
   * 获取 Audio Dom
   */
  private getAudioDom() {
    const audioDom = (this.player as any)._sounds[0]._node;
    if (!audioDom) {
      throw new Error('Audio Dom is null');
    }
    return audioDom;
  }

  /**
   * 获取播放信息
   * @param song 歌曲
   * @param sep 分隔符
   * @returns 播放信息
   */
  getPlayerInfo(song?: Song, sep: string = '/'): string | null {
    const playSongData = song || this.getPlaySongData();
    if (!playSongData) {
      return null;
    }
    // 标题
    const title = `${playSongData.name || '未知歌曲'}`;
    // 歌手
    const artist = Array.isArray(playSongData.singerinfo)
      ? playSongData.singerinfo.map((artists: { name: string }) => artists.name).join(sep)
      : String(playSongData?.singerinfo || '未知歌手');
    return `${title} - ${artist}`;
  }

  /**
   * 初始化播放器
   * 核心外部调用
   * @param autoPlay 是否自动播放
   * @param seek 播放位置
   */
  async initPlayer(autoPlay: boolean = true, seek: number = 0) {
    const playerStore = usePlayerStore();
    const settingStore = useSettingStore();
    try {
      // 获取播放数据
      const playSongData = this.getPlaySongData();
      if (!playSongData) {
        return;
      }
      const { hash } = playSongData;
      // 更改当前播放歌曲
      playerStore.current = playSongData;
      // 通知桌面歌词歌曲变化
      this.notifyDesktopLyrics('song', playSongData);
      // 更改状态
      playerStore.loading = true;
      // 重置播放状态，防止状态不一致
      playerStore.isPlaying = false;
      // 在线歌曲
      if (hash && playerStore.playlist.length) {
        // 歌曲信息
        console.log('歌曲信息', playSongData.name, 'hash', hash);
        const url = await this.getOnlineUrl(playSongData);
        // 正常播放地址
        if (url) {
          // 获取歌曲高潮部分
          this.getClimax(playSongData);
          // 获取歌词
          this.getSongLyric(playSongData);
          // 创建播放器
          await this.createPlayer(url, autoPlay, seek);
        }
        // 尝试解灰
        else if (settingStore.unblock) {
          // TODO
        } else {
          this.resetStatus();
          if (playerStore.playlist.length === 1) {
            window.$message.warning('当前播放列表已无可播放歌曲');
            return;
          } else {
            this.errorNext();
            return;
          }
        }
      }
    } catch (error) {
      console.error('❌ 初始化音乐播放器出错：', error);
      window.$message.error('播放器遇到错误，请尝试重启应用');
      this.errorNext();
    } finally {
      playerStore.loading = false;
    }
  }

  /**
   * 播放
   */
  async play() {
    const playerStore = usePlayerStore();
    // 已在播放
    if (this.player.playing()) {
      playerStore.isPlaying = true;
      return;
    }
    // 如果播放器未正确初始化，重新初始化
    if (!playerStore.current || playerStore.index < 0) {
      console.warn('⚠️ 播放器未正确初始化，重新初始化');
      await this.initPlayer(true);
      return;
    }
    // 播放
    this.player.play();
    playerStore.isPlaying = true;
    // 淡入
    await new Promise<void>(resolve => {
      this.player.once('play', () => {
        this.player.fade(0, playerStore.volume, this.getFadeTime());
        resolve();
      });
    });
  }

  /**
   * 暂停
   * @param changeStatus 是否更改播放状态
   */
  async pause(changeStatus: boolean = true) {
    const playerStore = usePlayerStore();

    // 播放器未加载完成
    if (this.player.state() !== 'loaded') {
      return;
    }

    // 淡出
    await new Promise<void>(resolve => {
      this.player.fade(playerStore.volume, 0, this.getFadeTime());
      this.player.once('fade', () => {
        this.player.pause();
        if (changeStatus) {
          playerStore.isPlaying = false;
        }
        resolve();
      });
    });
  }

  /**
   * 播放或暂停
   */
  async playOrPause() {
    const playerStore = usePlayerStore();
    if (playerStore.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * 下一首或上一首
   * @param type 切换类别 next 下一首 prev 上一首
   * @param play 是否立即播放
   */
  async nextOrPrev(type: 'next' | 'prev' = 'next', play: boolean = true) {
    try {
      const playerStore = usePlayerStore();
      // 获取数据
      const playlist = playerStore.playlist;
      const mode = playerStore.mode;
      // 列表长度
      const playlistLength = playlist.length;
      // 播放列表是否为空
      if (playlistLength === 0) {
        throw new Error('Play list is empty');
      }
      // 只有一首歌的特殊处理
      if (playlistLength === 1) {
        this.setSeek(0);
        await this.play();
      }
      // 列表循环或随机模式
      if (mode === 'repeat' || mode === 'shuffle') {
        playerStore.index += type === 'next' ? 1 : -1;
      }
      // 单曲循环
      else if (mode === 'repeat-once') {
        this.setSeek(0);
        await this.play();
        return;
      } else {
        throw new Error('The play mode is not supported');
      }
      // 索引是否越界
      if (playerStore.index < 0) {
        playerStore.index = playlistLength - 1;
      } else if (playerStore.index >= playlistLength) {
        playerStore.index = 0;
      }
      // 暂停
      await this.pause(false);
      // 初始化播放器
      await this.initPlayer(play);
    } catch (error) {
      console.error('Error in nextOrPrev:', error);
      throw error;
    }
  }

  /**
   * 切换播放模式
   * @param mode 播放模式 repeat / repeat-once / shuffle
   */
  async togglePlayMode(mode: PlayMode | false) {
    const playerStore = usePlayerStore();
    // 计算目标模式
    let targetMode: PlayMode;
    if (mode) {
      targetMode = mode;
    } else {
      switch (playerStore.mode) {
        case 'repeat':
          targetMode = 'repeat-once';
          break;
        case 'shuffle':
          targetMode = 'repeat';
          break;
        case 'repeat-once':
          targetMode = 'shuffle';
          break;
        default:
          targetMode = 'repeat';
      }
    }
    // 进入随机模式：保存原顺序并打乱当前歌单
    if (targetMode === 'shuffle' && playerStore.mode !== 'shuffle') {
      const currentList = playerStore.playlist;
      if (currentList && currentList.length > 1) {
        const currentSongHash = playerStore.current?.hash;
        playerStore.setOriginalPlaylist(currentList);
        const shuffled = this.shuffleArray(currentList);
        playerStore.setPlaylist(shuffled);
        if (currentSongHash) {
          const newIndex = shuffled.findIndex((s: any) => s?.hash === currentSongHash);
          if (newIndex !== -1) {
            playerStore.index = newIndex;
          }
        }
      }
    }
    // 离开随机模式：恢复到原顺序
    if (
      playerStore.mode === 'shuffle' &&
      (targetMode === 'repeat' || targetMode === 'repeat-once')
    ) {
      const original = playerStore.originalPlaylist;
      if (original && original.length) {
        const currentSongHash = playerStore.current?.hash;
        playerStore.setPlaylist(original);
        if (currentSongHash) {
          const origIndex = original.findIndex((s: any) => s?.hash === currentSongHash);
          playerStore.index = origIndex !== -1 ? origIndex : 0;
        } else {
          playerStore.index = 0;
        }
        await playerStore.clearOriginalPlaylist();
      }
    }
    // 应用模式
    playerStore.mode = targetMode;
  }

  /**
   * 设置播放进度
   * @param time 播放进度
   */
  setSeek(time: number) {
    const playerStore = usePlayerStore();
    this.player.seek(time);
    playerStore.currentTime = time;
  }
  /**
   * 获取播放进度
   * @returns 播放进度
   */
  getSeek(): number {
    return this.player.seek();
  }
  /**
   * 检查是否正在播放
   * @returns 是否正在播放
   */
  playing(): boolean {
    return this.player.playing();
  }
  /**
   * 设置播放速率
   * @param rate 播放速率
   */
  setRate(rate: number) {
    const playerStore = usePlayerStore();
    this.player.rate(rate);
    playerStore.rate = rate;
  }

  /**
   * 设置播放音量
   * @param actions 音量
   */
  setVolume(actions: number | 'up' | 'down' | WheelEvent) {
    const playerStore = usePlayerStore();
    const increment = 0.05;
    // 直接设置
    if (typeof actions === 'number') {
      actions = Math.max(0, Math.min(actions, 1));
    }
    // 分类调节
    else if (actions === 'up' || actions === 'down') {
      playerStore.volume = Math.max(
        0,
        Math.min(playerStore.volume + (actions === 'up' ? increment : -increment), 1),
      );
    }
    // 鼠标滚轮
    else {
      const deltaY = actions.deltaY;
      const volumeChange = deltaY > 0 ? -increment : increment;
      playerStore.volume = Math.max(0, Math.min(playerStore.volume + volumeChange, 1));
    }
    // 调整音量
    this.player.volume(playerStore.volume);
  }

  /**
   * 切换静音
   */
  toggleMute() {
    const playerStore = usePlayerStore();
    // 是否静音
    const isMuted = playerStore.volume === 0;
    // 恢复音量
    if (isMuted) {
      playerStore.volume = playerStore.mute;
    }
    // 保存当前音量并静音
    else {
      playerStore.mute = this.player.volume();
      playerStore.volume = 0;
    }
    this.player.volume(playerStore.volume);
  }

  /**
   * 更新播放列表
   * @param data 播放列表
   * @param song 当前播放歌曲
   * @param options 配置
   * @param options.showTip 是否显示提示
   * @param options.scrobble 是否打卡
   * @param options.play 是否直接播放
   */
  async updatePlayList(
    data: Song[],
    song?: Song,
    options: {
      showTip?: boolean;
      scrobble?: boolean;
      play?: boolean;
      replace?: boolean;
    } = {
      showTip: true,
      scrobble: true,
      play: true,
      replace: false,
    },
  ) {
    if (!data || !data.length) {
      return;
    }
    const playerStore = usePlayerStore();
    // 获取配置
    const { showTip, play } = options;
    // 更新列表
    if (options.replace) {
      playerStore.setPlaylist(cloneDeep(data));
    } else {
      playerStore.appendToPlaylist(data, true);
    }
    // 是否直接播放
    if (song && typeof song === 'object' && 'hash' in song) {
      // 是否为当前播放歌曲
      if (playerStore.current?.hash === song.hash) {
        if (play) {
          await this.play();
        }
      } else {
        // 查找索引
        playerStore.index = data.findIndex(item => item.hash === song.hash);
        // 播放
        await this.pause(false);
        await this.initPlayer();
      }
    } else {
      playerStore.index =
        playerStore.mode === 'shuffle' ? Math.floor(Math.random() * data.length) : 0;
      // 播放
      await this.pause(false);
      await this.initPlayer();
    }
    if (showTip) {
      console.log('已开始播放');
      window.$message.success('已开始播放');
    }
  }

  /**
   * 添加下一首歌曲
   * @param song 歌曲
   * @param play 是否立即播放
   */
  async addNextSong(song: Song, play: boolean = false) {
    const playerStore = usePlayerStore();
    // 是否为当前播放歌曲
    if (playerStore.current?.hash === song.hash) {
      this.play();
      window.$message.success('已开始播放');
      return;
    }
    // 尝试添加
    const songIndex = await playerStore.setNextPlaySong(song, playerStore.index);
    // 播放歌曲
    if (songIndex < 0) {
      return;
    }
    if (play) {
      this.togglePlayIndex(songIndex, true);
    } else {
      window.$message.success('已添加至下一首播放');
    }
  }

  /**
   * 播放指定歌曲
   * @param song 歌曲
   */
  async playSong(song: Song) {
    const playerStore = usePlayerStore();
    // 是否为当前播放歌曲
    if (playerStore.current?.hash === song.hash) {
      this.play();
      window.$message.success('已开始播放');
      return;
    }
    // 查找歌曲
    let songIndex = playerStore.playlist.findIndex(item => item.hash === song.hash);
    if (songIndex < 0) {
      // 添加歌曲到播放列表
      songIndex = playerStore.addToPlaylist(song, true);
    }
    if (songIndex < 0) {
      return;
    }
    await this.togglePlayIndex(songIndex, true);
  }

  /**
   * 切换播放索引
   * @param index 播放索引
   * @param play 是否立即播放
   */
  async togglePlayIndex(index: number, play: boolean = false) {
    const playerStore = usePlayerStore();
    // 获取数据
    const playlist = playerStore.playlist;
    // 若超出播放列表
    if (index >= playlist.length) {
      return;
    }
    // 相同
    if (!play && playerStore.index === index) {
      this.play();
      return;
    }
    // 更改状态
    playerStore.index = index;
    // 清理并播放
    this.resetStatus();
    await this.initPlayer();
  }

  /**
   * 移除指定歌曲
   * @param index 歌曲索引
   */
  removeSongIndex(index: number) {
    const playerStore = usePlayerStore();
    // 获取数据
    const playlist = playerStore.playlist;
    // 若超出播放列表
    if (index >= playlist?.length) {
      return;
    }
    // 仅剩一首
    if (playlist?.length === 1) {
      this.cleanPlayList();
      return;
    }
    // 是否为当前播放歌曲
    const isCurrentPlay = playerStore.index === index;
    // 深拷贝，防止影响原数据
    const newPlaylist = cloneDeep(playlist);
    // 若将移除最后一首
    if (index === playlist?.length - 1) {
      playerStore.index = 0;
    }
    // 若为当前播放之后
    else if (playerStore.index > index) {
      playerStore.index--;
    }
    // 移除指定歌曲
    newPlaylist.splice(index, 1);
    playerStore.setPlaylist(newPlaylist);
    // 若为当前播放
    if (isCurrentPlay) {
      this.initPlayer(playerStore.isPlaying);
    }
  }

  /**
   * 清空播放列表
   */
  async cleanPlayList() {
    // 清空数据
    this.resetStatus();
    // 清空歌词
    lyricsHandler.clearLyrics();
    // 清空播放列表
    const playerStore = usePlayerStore();
    playerStore.clearPlaylist();
  }

  // 歌词相关方法
  /**
   * 获取歌词处理器
   */
  getLyricsHandler() {
    return lyricsHandler;
  }

  /**
   * 切换歌词显示
   */
  toggleLyrics() {
    const current = this.getPlaySongData();
    const currentTime = this.getSeek();
    return lyricsHandler.toggleLyrics(current?.hash, currentTime);
  }

  /**
   * 切换歌词模式
   */
  toggleLyricsMode() {
    return lyricsHandler.toggleLyricsMode();
  }

  /**
   * 获取当前行歌词
   */
  getCurrentLyricText() {
    const currentTime = this.getSeek();
    return lyricsHandler.getCurrentLineText(currentTime);
  }
}

export default new Player();
