import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Database, Settings, ChevronDown, Plug } from "lucide-react";
import { Connection, ConnectionGroup } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavBarProps {
  currentConnection?: Connection | null;
  currentDatabase?: number;
  onSettings: () => void;
  onDatabaseSwitch?: (db: number) => void;
  groups?: ConnectionGroup[];
}

export function NavBar({ currentConnection, currentDatabase, onSettings, onDatabaseSwitch, groups }: NavBarProps) {
  const { t } = useTranslation();

  const getGroupName = (groupId?: string) => {
    if (!groupId || !groups) return null;
    const group = groups.find(g => g.id === groupId);
    return group?.name;
  };

  return (
    <div className="h-14 bg-muted/30 border-b flex items-center justify-between px-4">
      {/* Left - Connection Info */}
      <div className="flex items-center gap-3">
        {currentConnection ? (
          <>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border">
              <Plug size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">
                {getGroupName(currentConnection.groupId) && (
                  <>{getGroupName(currentConnection.groupId)} &gt; </>
                )}
                {currentConnection.name}
              </span>
            </div>

            {/* Database Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Database size={14} />
                  DB {currentDatabase ?? currentConnection.database}
                  <ChevronDown size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {Array.from({ length: 16 }, (_, i) => (
                  <DropdownMenuItem
                    key={i}
                    onClick={() => onDatabaseSwitch?.(i)}
                    className={(currentDatabase ?? currentConnection.database) === i ? "bg-accent" : ""}
                  >
                    Database {i}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 text-muted-foreground">
            <Database size={16} />
            <span className="text-sm">{t("connection.noConnectionSelected")}</span>
          </div>
        )}
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onSettings}>
          <Settings size={18} />
        </Button>
      </div>
    </div>
  );
}
