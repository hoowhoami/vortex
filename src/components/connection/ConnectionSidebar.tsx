import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useConnectionStore } from "@/stores/connectionStore";
import { useRedisStore } from "@/stores/redisStore";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Connection, ConnectionGroup } from "@/types";
import {
  ChevronRight,
  ChevronDown,
  Database,
  MoreVertical,
  FolderOpen,
  Folder,
  Plus,
  Edit,
  Trash2,
  Power,
} from "lucide-react";

interface ConnectionSidebarProps {
  onAddConnection: (groupId?: string) => void;
  onEditConnection: (connection: Connection) => void;
  onDeleteConnection: (id: string) => void;
  onSelectConnection: (connection: Connection) => void;
  selectedConnection: Connection | null;
  onAddGroup: () => void;
  onEditGroup: (group: ConnectionGroup) => void;
}

export function ConnectionSidebar({
  onAddConnection,
  onEditConnection,
  onDeleteConnection,
  onSelectConnection,
  selectedConnection,
  onAddGroup,
  onEditGroup,
}: ConnectionSidebarProps) {
  const { t } = useTranslation();
  const { connections, groups, deleteGroup } = useConnectionStore();
  const { connectedId, connect, disconnect } = useRedisStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  // Group connections
  const ungroupedConnections = connections.filter((c) => !c.groupId);
  const groupedConnections = groups.map((group) => ({
    group,
    connections: connections.filter((c) => c.groupId === group.id),
  }));

  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };

  const handleConnect = async (connection: Connection) => {
    setConnectingId(connection.id);
    try {
      if (connectedId === connection.id) {
        await disconnect();
      } else {
        await connect(connection.id);
      }
    } catch (error) {
      console.error("Connection failed:", error);
    } finally {
      setConnectingId(null);
    }
  };

  const renderConnection = (connection: Connection, indent = false) => {
    const isConnected = connectedId === connection.id;
    const isSelected = selectedConnection?.id === connection.id;
    const isConnecting = connectingId === connection.id;

    return (
      <div
        key={connection.id}
        className={`group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer transition-colors ${
          indent ? "ml-6" : ""
        } ${
          isSelected
            ? "bg-accent"
            : "hover:bg-accent/50"
        }`}
        onClick={() => onSelectConnection(connection)}
      >
        <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`} />
        <Database size={14} className={isConnected ? "text-green-600 dark:text-green-400" : "text-muted-foreground"} />
        <span className="flex-1 text-sm truncate">{connection.name}</span>

        {isConnected && (
          <Badge variant="outline" className="text-xs px-1 py-0">
            Active
          </Badge>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                handleConnect(connection);
              }}
              disabled={isConnecting}
            >
              <Power size={14} className="mr-2" />
              {isConnecting ? "Connecting..." : isConnected ? "Disconnect" : "Connect"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onEditConnection(connection);
              }}
            >
              <Edit size={14} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConnection(connection.id);
              }}
              className="text-destructive"
            >
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center min-h-[60px]">
        <div className="flex items-center justify-between w-full">
          <h2 className="font-semibold">{t("sidebar.connections")}</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                <Plus size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onAddConnection()}>
                <Database size={14} className="mr-2" />
                {t("sidebar.addConnection")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onAddGroup}>
                <Folder size={14} className="mr-2" />
                {t("sidebar.addGroup")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Connection Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Ungrouped Connections */}
          {ungroupedConnections.length > 0 && (
            <div className="mb-2">
              {ungroupedConnections.map((conn) => renderConnection(conn, false))}
            </div>
          )}

          {/* Grouped Connections */}
          {groupedConnections.map(({ group, connections: groupConns }) => (
            <div key={group.id} className="mb-2">
              <div className="group flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-accent/50 transition-colors">
                <div className="flex-1 flex items-center gap-2" onClick={() => toggleGroup(group.id)}>
                  {expandedGroups.has(group.id) ? (
                    <ChevronDown size={14} className="text-muted-foreground" />
                  ) : (
                    <ChevronRight size={14} className="text-muted-foreground" />
                  )}
                  {expandedGroups.has(group.id) ? (
                    <FolderOpen size={14} style={{ color: group.color }} />
                  ) : (
                    <Folder size={14} style={{ color: group.color }} />
                  )}
                  <span className="flex-1 text-sm font-medium">{group.name}</span>
                  <span className="text-xs text-muted-foreground">{groupConns.length}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical size={14} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddConnection(group.id);
                      }}
                    >
                      <Plus size={14} className="mr-2" />
                      {t("sidebar.addConnection")}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditGroup(group);
                      }}
                    >
                      <Edit size={14} className="mr-2" />
                      {t("common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(t("group.deleteConfirm"))) {
                          deleteGroup(group.id);
                        }
                      }}
                      className="text-destructive"
                    >
                      <Trash2 size={14} className="mr-2" />
                      {t("common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {expandedGroups.has(group.id) && (
                <div className="mt-1">
                  {groupConns.map((conn) => renderConnection(conn, true))}
                </div>
              )}
            </div>
          ))}

          {/* Empty State */}
          {connections.length === 0 && (
            <div className="text-center py-12 px-4">
              <Database className="mx-auto mb-3 text-muted-foreground" size={32} />
              <p className="text-sm text-muted-foreground mb-4">{t("sidebar.noConnections")}</p>
              <Button size="sm" onClick={() => onAddConnection()}>
                <Plus size={14} className="mr-2" />
                {t("sidebar.addConnection")}
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
