import { LiveChannel, LiveGroup } from "@/types";

export interface M3UPlaylist {
  channels: LiveChannel[];
  groups: Map<string, LiveChannel[]>;
}

/**
 * 解析M3U格式的直播源
 */
export function parseM3U(content: string): M3UPlaylist {
  const lines = content.split("\n").map((line) => line.trim());
  const channels: LiveChannel[] = [];
  const groupsMap = new Map<string, LiveChannel[]>();

  let currentChannel: Partial<LiveChannel> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Skip empty lines and comments (except EXTINF)
    if (!line || (line.startsWith("#") && !line.startsWith("#EXTINF"))) {
      continue;
    }

    // Parse EXTINF line
    if (line.startsWith("#EXTINF")) {
      const match = line.match(/#EXTINF:-?\d+\s*(.*?),(.+)/);
      if (match) {
        const attributes = match[1];
        const name = match[2].trim();

        // Extract attributes
        const groupMatch = attributes.match(/group-title="([^"]*)"/);
        const logoMatch = attributes.match(/tvg-logo="([^"]*)"/);
        const epgIdMatch = attributes.match(/tvg-id="([^"]*)"/);

        currentChannel = {
          id: `live-${channels.length + 1}`,
          name,
          group: groupMatch ? groupMatch[1] : "其他",
          logo: logoMatch ? logoMatch[1] : undefined,
          epgId: epgIdMatch ? epgIdMatch[1] : undefined,
        };
      }
    } else if (currentChannel && (line.startsWith("http") || line.startsWith("rtmp"))) {
      // URL line
      const channel: LiveChannel = {
        id: currentChannel.id!,
        name: currentChannel.name!,
        group: currentChannel.group!,
        url: line,
        logo: currentChannel.logo,
        epgId: currentChannel.epgId,
      };

      channels.push(channel);

      // Group by category
      const groupChannels = groupsMap.get(channel.group) || [];
      groupChannels.push(channel);
      groupsMap.set(channel.group, groupChannels);

      currentChannel = null;
    }
  }

  return {
    channels,
    groups: groupsMap,
  };
}

/**
 * 获取直播源列表
 */
export async function fetchLiveChannels(url: string): Promise<M3UPlaylist> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    return parseM3U(content);
  } catch (error) {
    console.error("Failed to fetch live channels:", error);
    return {
      channels: [],
      groups: new Map(),
    };
  }
}

/**
 * 生成Mock直播数据用于开发
 */
export function generateMockLiveChannels(): M3UPlaylist {
  const groups = [
    { name: "央视", count: 15 },
    { name: "卫视", count: 30 },
    { name: "地方台", count: 20 },
    { name: "体育", count: 10 },
    { name: "少儿", count: 8 },
  ];

  const channels: LiveChannel[] = [];
  const groupsMap = new Map<string, LiveChannel[]>();

  groups.forEach((group, groupIndex) => {
    const groupChannels: LiveChannel[] = [];

    for (let i = 0; i < group.count; i++) {
      const channel: LiveChannel = {
        id: `live-${groupIndex}-${i}`,
        name: `${group.name}${i + 1}`,
        group: group.name,
        url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8", // Mock HLS URL
        logo: `https://picsum.photos/100/100?random=${groupIndex * 100 + i}`,
      };

      channels.push(channel);
      groupChannels.push(channel);
    }

    groupsMap.set(group.name, groupChannels);
  });

  return {
    channels,
    groups: groupsMap,
  };
}
