import { Button } from "@/components/ui/button";
import { Settings, Database } from "lucide-react";
import { Connection } from "@/types";

interface TitleBarProps {
  onSettings: () => void;
  currentConnection?: Connection | null;
}

export function TitleBar({ onSettings, currentConnection }: TitleBarProps) {
  return (
    <div
      data-tauri-drag-region
      className="h-12 bg-background border-b flex items-center select-none"
      style={{ paddingLeft: '80px', paddingRight: '140px' }}
    >
      {/* Center - Current Connection Info (takes full width) */}
      <div data-tauri-drag-region className="flex-1 flex items-center justify-center gap-2">
        {currentConnection ? (
          <>
            <Database size={14} className="text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium">{currentConnection.name}</span>
            <span className="text-xs text-muted-foreground">
              {currentConnection.host}:{currentConnection.port}
            </span>
            <span className="text-xs text-muted-foreground">
              DB {currentConnection.database}
            </span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Vortex Redis</span>
        )}
      </div>

      {/* Right side - Settings button (positioned absolutely to avoid blocking) */}
      <div className="absolute right-36 flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onSettings}
        >
          <Settings size={16} />
        </Button>
      </div>
    </div>
  );
}
