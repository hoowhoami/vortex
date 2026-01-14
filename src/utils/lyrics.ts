import { ref, nextTick } from 'vue';
import type { LyricsLine, LyricsCharacter, LyricsMode } from '@/types';
import { searchLyric, getLyric } from '@/api/song';

export class LyricsHandler {
  private lyricsData = ref<LyricsLine[]>([]);
  private originalLyrics = ref<string>('');
  private showLyrics = ref<boolean>(false);
  private scrollAmount = ref<number | null>(null);
  private songTips = ref<string>('暂无歌词');
  private lyricsMode = ref<LyricsMode>('translation');
  private currentLineIndex = 0;

  // 桌面歌词状态
  private currentTime = ref<number>(0);
  private currentSongHash = '';

  // 获取响应式数据的getter
  get data() {
    return {
      lyricsData: this.lyricsData,
      originalLyrics: this.originalLyrics,
      showLyrics: this.showLyrics,
      scrollAmount: this.scrollAmount,
      songTips: this.songTips,
      lyricsMode: this.lyricsMode,
    };
  }

  /**
   * 显示/隐藏歌词
   */
  toggleLyrics(hash?: string, currentTime?: number): boolean {
    this.showLyrics.value = !this.showLyrics.value;
    this.songTips.value = '获取歌词中';

    // 如果显示歌词，滚动到当前播放行
    if (!this.lyricsData.value.length && hash) {
      this.getLyrics(hash);
    } else if (this.showLyrics.value && currentTime !== undefined) {
      nextTick(() => {
        const currentLineIndex = this.getCurrentLineIndex(currentTime);
        if (currentLineIndex !== -1) {
          this.scrollToCurrentLine(currentLineIndex);
        } else {
          this.centerFirstLine();
        }
      });
    }

    return this.showLyrics.value;
  }

  /**
   * 获取歌词
   */
  async getLyrics(hash: string): Promise<boolean> {
    try {
      // 更新当前歌曲哈希
      this.currentSongHash = hash;

      const lyricSearchResponse = await searchLyric({ hash });

      if (!lyricSearchResponse?.candidates?.length) {
        this.songTips.value = '暂无歌词';
        return false;
      }

      // 明确指定使用KRC格式
      const candidate = lyricSearchResponse.candidates[0];

      const lyricResponse = await getLyric({
        id: candidate.id,
        accesskey: candidate.accesskey,
        fmt: 'krc',
        decode: 'true',
      });

      if (!lyricResponse?.decodeContent) {
        this.songTips.value = '获取歌词失败';
        return false;
      }

      this.parseLyrics(lyricResponse.decodeContent, true); // 始终解析翻译
      this.originalLyrics.value = lyricResponse.decodeContent;
      this.centerFirstLine();

      // 更新歌词提示信息
      this.songTips.value = this.lyricsData.value.length > 0 ? '歌词已加载' : '暂无歌词';

      return true;
    } catch (error) {
      console.error('[LyricsHandler] 获取歌词失败:', error);
      this.songTips.value = '获取歌词失败';
      return false;
    }
  }

  /**
   * 解析歌词
   */
  private parseLyrics(text: string, parseTranslation = true): void {
    let translationLyrics: string[][] = [];
    let romanizationLyrics: string[][] = [];
    const lines = text.split('\n');

    try {
      const languageLine = lines.find(line => line.match(/\[language:(.*)\]/));

      if (parseTranslation && languageLine) {
        const languageCode = languageLine.slice(10, -2);

        if (languageCode) {
          try {
            // 确保 languageCode 是有效的 Base64 编码
            const cleanedCode = languageCode.replace(/[^A-Za-z0-9+/=]/g, '');
            // 添加缺失的填充字符
            const paddedCode = cleanedCode.padEnd(
              cleanedCode.length + ((4 - (cleanedCode.length % 4)) % 4),
              '=',
            );
            // 使用参考代码的解码方式
            const decodedData = decodeURIComponent(escape(atob(paddedCode)));
            const languageData = JSON.parse(decodedData);

            // 获取翻译歌词 (type === 1)
            const translation = languageData?.content?.find((section: any) => section.type === 1);
            if (translation?.lyricContent) {
              translationLyrics = translation.lyricContent;
            }

            // 获取音译歌词 (type === 0)
            const romanization = languageData?.content?.find((section: any) => section.type === 0);
            if (romanization?.lyricContent) {
              romanizationLyrics = romanization.lyricContent;
            }
          } catch (decodeError) {
            console.warn('[LyricsHandler] Base64 解码失败:', decodeError);
          }
        }
      }
    } catch (decodeError) {
      console.warn('[LyricsHandler] Base64 解码失败:', decodeError);
    }

    const parsedLyrics: LyricsLine[] = [];
    const charRegex = /<(\d+),(\d+),\d+>([^<]+)/g;

    lines.forEach(line => {
      // 匹配主时间标签 [start,duration]
      const lineMatch = line.match(/^\[(\d+),(\d+)\](.*)/);
      if (!lineMatch) return;

      const start = parseInt(lineMatch[1]);
      const lyricContent = lineMatch[3];
      const characters: LyricsCharacter[] = [];

      // 解析字符级时间标签 <start,duration,unknown>text
      let charMatch;
      const regex = new RegExp(charRegex.source, charRegex.flags);

      while ((charMatch = regex.exec(lyricContent)) !== null) {
        const text = charMatch[3];
        const charDuration = parseInt(charMatch[2]);
        const charStart = start + parseInt(charMatch[1]);

        // 直接使用文本组，不拆分
        characters.push({
          char: text,
          startTime: charStart,
          endTime: charStart + charDuration,
          highlighted: false,
        });
      }

      // 如果没有找到字符级时间标签，使用行级时间标签进行等分
      if (characters.length === 0) {
        const duration = parseInt(lineMatch[2]);
        const lyric = lyricContent.replace(/<.*?>/g, '');
        if (lyric.trim()) {
          for (let index = 0; index < lyric.length; index++) {
            characters.push({
              char: lyric[index],
              startTime: start + (index * duration) / lyric.length,
              endTime: start + ((index + 1) * duration) / lyric.length,
              highlighted: false,
            });
          }
        }
      }

      // 保存有效歌词行
      if (characters.length > 0) {
        parsedLyrics.push({ characters });
      }
    });

    // 添加翻译歌词
    if (translationLyrics.length) {
      parsedLyrics.forEach((line, index) => {
        if (translationLyrics[index] && translationLyrics[index][0]) {
          line.translated = translationLyrics[index][0];
        }
      });
    }

    // 添加音译歌词
    if (romanizationLyrics.length) {
      parsedLyrics.forEach((line, index) => {
        if (romanizationLyrics[index]) {
          // 将音译歌词数组合并为一个字符串
          line.romanized = romanizationLyrics[index].join('');
        }
      });
    }

    this.lyricsData.value = parsedLyrics;
  }

  /**
   * 切换歌词显示模式（翻译/音译）
   */
  toggleLyricsMode(): LyricsMode {
    this.lyricsMode.value =
      this.lyricsMode.value === 'translation' ? 'romanization' : 'translation';
    return this.lyricsMode.value;
  }

  /**
   * 居中显示第一行歌词
   */
  private centerFirstLine(): void {
    // 优先使用 lyrics-scroll-area，如果不存在则使用 lyrics-container
    const scrollArea = document.querySelector('.lyrics-scroll-area') as HTMLElement;
    const lyricsContainer = scrollArea || document.getElementById('lyrics-container');
    if (!lyricsContainer) return;

    const containerHeight = lyricsContainer.offsetHeight;
    const lyricsElement = document.getElementById('lyrics');
    if (!lyricsElement) return;

    const lyricsHeight = lyricsElement.offsetHeight;
    this.scrollAmount.value = (containerHeight - lyricsHeight) / 2;
  }

  /**
   * 滚动到当前歌词行
   */
  scrollToCurrentLine(lineIndex: number): boolean {
    if (this.currentLineIndex === lineIndex) return false;

    this.currentLineIndex = lineIndex;
    // 优先使用 lyrics-scroll-area，如果不存在则使用 lyrics-container
    const scrollArea = document.querySelector('.lyrics-scroll-area') as HTMLElement;
    const lyricsContainer = scrollArea || document.getElementById('lyrics-container');
    if (!lyricsContainer) {
      console.warn('[Lyrics] Scroll container not found!');
      return false;
    }

    const containerHeight = lyricsContainer.offsetHeight;
    const lineElements = document.querySelectorAll('.line-group');
    const lineElement = lineElements[lineIndex] as HTMLElement;

    if (lineElement) {
      const lineHeight = lineElement.offsetHeight;
      const lineOffsetTop = lineElement.offsetTop;

      // 获取 lyrics-wrapper 的当前位置
      const lyricsWrapper = document.getElementById('lyrics');
      const wrapperOffsetTop = lyricsWrapper ? lyricsWrapper.offsetTop : 0;

      // 计算滚动量：目标是让当前行居中显示
      // 公式：容器中心位置 - (wrapper初始位置 + 行相对wrapper的位置 + 行高度的一半)
      const newScrollAmount =
        containerHeight / 2 - (wrapperOffsetTop + lineOffsetTop + lineHeight / 2);

      this.scrollAmount.value = newScrollAmount;
      return true;
    }
    console.warn(
      `[Lyrics] Line element ${lineIndex} not found! Total elements: ${lineElements.length}`,
    );
    return false;
  }

  /**
   * 高亮当前字符
   */
  highlightCurrentChar(currentTime: number, scroll = true): void {
    const currentTimeMs = currentTime * 1000;
    this.currentTime.value = currentTimeMs; // 保存实际时间用于桌面歌词计算
    let currentActiveLineIndex = -1;

    // 如果没有歌词数据，直接返回
    if (!this.lyricsData.value.length) return;

    this.lyricsData.value.forEach((lineData, lineIndex) => {
      let isLineActive = false;

      lineData.characters.forEach(charData => {
        // 只高亮当前正在播放的字符（在时间范围内）
        if (currentTimeMs >= charData.startTime && currentTimeMs <= charData.endTime) {
          charData.highlighted = true;
          isLineActive = true;
        } else {
          charData.highlighted = false;
        }
      });

      // 如果当前行有活跃字符，记录为当前行
      if (isLineActive) {
        currentActiveLineIndex = lineIndex;
      }
    });

    // 只有当找到活跃行且需要滚动且行索引变化时才滚动和输出日志
    if (
      scroll &&
      currentActiveLineIndex !== -1 &&
      currentActiveLineIndex !== this.currentLineIndex
    ) {
      this.scrollToCurrentLine(currentActiveLineIndex);
    }
  }

  /**
   * 重置歌词高亮状态
   */
  resetLyricsHighlight(currentTime: number): void {
    if (!this.lyricsData.value) return;

    const currentTimeMs = currentTime * 1000;
    let currentActiveLineIndex = -1;

    this.lyricsData.value.forEach((lineData, lineIndex) => {
      let isCurrentLine = false;

      lineData.characters.forEach(charData => {
        // 只高亮当前正在播放的字符（在时间范围内）
        if (currentTimeMs >= charData.startTime && currentTimeMs <= charData.endTime) {
          charData.highlighted = true;
          isCurrentLine = true;
        } else {
          charData.highlighted = false;
        }
      });

      if (isCurrentLine) {
        currentActiveLineIndex = lineIndex;
      }
    });

    // 只有当找到活跃行时才滚动
    if (currentActiveLineIndex !== -1) {
      this.scrollToCurrentLine(currentActiveLineIndex);
    }
  }

  /**
   * 获取当前播放行索引
   */
  getCurrentLineIndex(currentTime: number): number {
    if (!this.lyricsData.value || this.lyricsData.value.length === 0) return -1;

    const currentTimeMs = currentTime * 1000;

    // 先尝试找到时间范围内的行(正在播放的行)
    for (let i = 0; i < this.lyricsData.value.length; i++) {
      const line = this.lyricsData.value[i];
      if (!line?.characters?.length) continue;

      const lineStartTime = line.characters[0].startTime;
      const lineEndTime = line.characters[line.characters.length - 1].endTime;

      // 如果当前时间在这一行的时间范围内，返回这一行
      if (currentTimeMs >= lineStartTime && currentTimeMs <= lineEndTime) {
        return i;
      }
    }

    // 如果没有找到精确匹配，找最接近的已播放行
    let closestLineIndex = -1;
    let minDistance = Infinity;

    for (let i = 0; i < this.lyricsData.value.length; i++) {
      const line = this.lyricsData.value[i];
      if (!line?.characters?.length) continue;

      const lineStartTime = line.characters[0].startTime;

      // 只考虑已经开始的行
      if (currentTimeMs >= lineStartTime) {
        const distance = Math.abs(currentTimeMs - lineStartTime);

        if (distance < minDistance) {
          minDistance = distance;
          closestLineIndex = i;
        }
      }
    }

    return closestLineIndex;
  }

  /**
   * 获取当前行歌词文本
   */
  getCurrentLineText(currentTime: number): string {
    if (!this.lyricsData.value || this.lyricsData.value.length === 0) return '';

    for (const lineData of this.lyricsData.value) {
      const firstChar = lineData.characters[0];
      const lastChar = lineData.characters[lineData.characters.length - 1];

      if (
        firstChar &&
        lastChar &&
        currentTime * 1000 >= firstChar.startTime &&
        currentTime * 1000 <= lastChar.endTime
      ) {
        return lineData.characters.map(char => char.char).join('');
      }
    }
    return '';
  }

  /**
   * 清空歌词数据
   */
  clearLyrics(resetShowLyrics = true): void {
    this.lyricsData.value = [];
    this.originalLyrics.value = '';
    if (resetShowLyrics) {
      this.showLyrics.value = false;
    }
    this.scrollAmount.value = null;
    this.songTips.value = '暂无歌词';
    this.currentLineIndex = 0;
  }

  /**
   * 获取当前活跃的歌词行
   */
  getCurrentActiveLine(): LyricsLine | null {
    if (!this.lyricsData.value.length) return null;

    for (const line of this.lyricsData.value) {
      const hasHighlightedChar = line.characters.some(char => char.highlighted);
      if (hasHighlightedChar) {
        return line;
      }
    }

    return null;
  }
}

// 创建全局单例实例
export const lyricsHandler = new LyricsHandler();
