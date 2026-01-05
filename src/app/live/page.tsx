"use client";

import * as React from "react";
import { PageLayout } from "@/components/layout/page-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/video/video-player";
import { Play, X } from "lucide-react";
import { generateMockLiveChannels } from "@/lib/api/live";
import type { LiveChannel } from "@/types";

export default function LivePage() {
  const [channels, setChannels] = React.useState<LiveChannel[]>([]);
  const [groups, setGroups] = React.useState<string[]>([]);
  const [activeGroup, setActiveGroup] = React.useState<string>("");
  const [currentChannel, setCurrentChannel] = React.useState<LiveChannel | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPlayer, setShowPlayer] = React.useState(false);

  React.useEffect(() => {
    // Load live channels
    const loadChannels = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        const data = generateMockLiveChannels();

        setChannels(data.channels);
        const groupNames = Array.from(data.groups.keys());
        setGroups(groupNames);

        if (groupNames.length > 0) {
          setActiveGroup(groupNames[0]);
        }
      } catch (error) {
        console.error("Failed to load live channels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadChannels();
  }, []);

  const handleChannelClick = (channel: LiveChannel) => {
    setCurrentChannel(channel);
    setShowPlayer(true);
  };

  const handleClosePlayer = () => {
    setShowPlayer(false);
    setCurrentChannel(null);
  };

  const getChannelsByGroup = (group: string) => {
    return channels.filter((ch) => ch.group === group);
  };

  const renderChannelCard = (channel: LiveChannel) => (
    <Card
      key={channel.id}
      className="group cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => handleChannelClick(channel)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col items-center gap-2">
          <div className="relative w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <Play className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
          </div>
          <p className="text-sm font-medium text-center line-clamp-1">
            {channel.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const renderLoadingGrid = () => (
    <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <Skeleton className="w-16 h-16 rounded-full" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">直播电视</h1>
          <p className="text-muted-foreground">
            观看实时直播频道
          </p>
        </div>

        {/* Player Modal */}
        {showPlayer && currentChannel && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-6xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {currentChannel.name}
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClosePlayer}
                  className="text-white hover:bg-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="bg-black rounded-lg overflow-hidden">
                <VideoPlayer
                  url={currentChannel.url}
                  poster={currentChannel.logo}
                  title={currentChannel.name}
                  autoPlay={true}
                  startTime={0}
                  onTimeUpdate={() => {}}
                />
              </div>
            </div>
          </div>
        )}

        {/* Channel Groups */}
        {isLoading ? (
          renderLoadingGrid()
        ) : (
          <Tabs value={activeGroup} onValueChange={setActiveGroup}>
            <div className="overflow-x-auto">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                {groups.map((group) => (
                  <TabsTrigger key={group} value={group}>
                    {group}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {groups.map((group) => (
              <TabsContent key={group} value={group} className="mt-6">
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                  {getChannelsByGroup(group).map(renderChannelCard)}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </PageLayout>
  );
}
