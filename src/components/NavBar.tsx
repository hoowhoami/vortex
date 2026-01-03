import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, Settings, ChevronDown, Plug, Terminal } from "lucide-react";
import { Connection, ConnectionGroup } from "@/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UI_SIZES } from "@/lib/ui-constants";

interface NavBarProps {
  currentConnection?: Connection | null;
  currentDatabase?: number;
  onSettings: () => void;
  onDatabaseSwitch?: (db: number) => void;
  groups?: ConnectionGroup[];
}

export function NavBar({ currentConnection, currentDatabase, onSettings, onDatabaseSwitch, groups }: NavBarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const getGroupName = (groupId?: string) => {
    if (!groupId || !groups) return null;
    const group = groups.find(g => g.id === groupId);
    return group?.name;
  };

  return (
    <div className="h-14 bg-muted/30 border-b flex items-center justify-between px-4">
      {/* Left - Connection Info & Navigation */}
      <div className="flex items-center gap-3">
        {currentConnection ? (
          <>
            <div className="flex items-center gap-2 px-3 h-7 bg-background rounded-md border">
              <Plug size={16} className="text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium">
                {getGroupName(currentConnection.groupId) && (
                  <>{getGroupName(currentConnection.groupId)} &gt; </>
                )}
                {currentConnection.name}
              </span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className={`${UI_SIZES.button.className} gap-1`}>
                  <Database size={UI_SIZES.icon.small} />
                  DB {currentDatabase ?? currentConnection.database}
                  <ChevronDown size={UI_SIZES.icon.small} />
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

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-1">
              <Button
                variant={location.pathname === "/browser" ? "default" : "ghost"}
                onClick={() => navigate("/browser")}
                className={`${UI_SIZES.button.className} gap-2`}
              >
                <Database size={UI_SIZES.icon.medium} />
                数据浏览器
              </Button>
              <Button
                variant={location.pathname === "/console" ? "default" : "ghost"}
                onClick={() => navigate("/console")}
                className={`${UI_SIZES.button.className} gap-2`}
              >
                <Terminal size={UI_SIZES.icon.medium} />
                命令行
              </Button>
            </div>
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
        <Button variant="ghost" onClick={onSettings} className={UI_SIZES.button.iconClassName}>
          <Settings size={UI_SIZES.icon.medium} />
        </Button>
      </div>
    </div>
  );
}

