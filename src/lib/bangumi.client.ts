'use client';

export interface BangumiCalendarData {
  weekday: {
    en: string;
  };
  items: {
    id: number;
    name: string;
    name_cn: string;
    rating: {
      score: number;
    };
    air_date: string;
    images: {
      large: string;
      common: string;
      medium: string;
      small: string;
      grid: string;
    };
  }[];
}

export async function GetBangumiCalendarData(): Promise<BangumiCalendarData[]> {
  try {
    const response = await fetch('https://api.bgm.tv/calendar');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const filteredData = data.map((item: BangumiCalendarData) => ({
      ...item,
      items: item.items.filter(bangumiItem => bangumiItem.images)
    }));

    return filteredData;
  } catch (error) {
    console.error('Failed to fetch Bangumi calendar:', error);
    return [];
  }
}
