"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Heart } from "lucide-react";

interface VideoCardProps {
  id?: string;
  source?: string;
  title: string;
  query?: string;
  poster: string;
  episodes?: number;
  source_name?: string;
  progress?: number;
  year?: string;
  from: "playrecord" | "favorite" | "search" | "douban";
  currentEpisode?: number;
  douban_id?: number;
  rate?: string;
  type?: string;
  isBangumi?: boolean;
}

export function VideoCard({
  id,
  source,
  title,
  poster,
  progress = 0,
  year,
  from,
  currentEpisode,
  douban_id,
  rate,
  type = "",
  isBangumi = false,
}: VideoCardProps) {
  const router = useRouter();
  const [imageError, setImageError] = React.useState(false);

  const handleClick = () => {
    if (from === "douban" && douban_id) {
      router.push(`/douban?id=${douban_id}${type ? `&type=${type}` : ""}`);
    } else if (from === "playrecord" && id && source) {
      router.push(`/play/${id}?source=${source}`);
    } else if (from === "favorite" && id && source) {
      router.push(`/play/${id}?source=${source}`);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group cursor-pointer transition-all duration-200"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-muted">
        {!imageError && poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
            <Heart className="h-12 w-12 opacity-20" />
          </div>
        )}

        {/* Progress bar for play records */}
        {from === "playrecord" && progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/30">
            <div
              className="h-full bg-primary"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Play className="h-12 w-12 text-white mb-2" />
          {from === "playrecord" && currentEpisode && (
            <span className="text-white text-sm">第{currentEpisode}集</span>
          )}
        </div>

        {/* Rate badge for Douban */}
        {from === "douban" && rate && (
          <div className="absolute top-2 right-2 bg-primary/90 text-primary-foreground px-2 py-1 rounded text-xs font-semibold">
            {rate}
          </div>
        )}
      </div>

      {/* Title and info */}
      <div className="mt-2 px-1">
        <h3 className="text-sm font-medium line-clamp-2 leading-tight min-h-[2.5rem]">
          {title}
        </h3>
        {year && (
          <p className="text-xs text-muted-foreground mt-1">{year}</p>
        )}
      </div>
    </div>
  );
}
