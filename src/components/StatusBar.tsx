import { useTranslation } from "react-i18next";
import { Connection } from "@/types";
import { Circle } from "lucide-react";

interface StatusBarProps {
  currentConnection?: Connection | null;
  currentDatabase?: number;
  isConnected?: boolean;
}

export function StatusBar({ currentConnection, currentDatabase, isConnected }: StatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="h-7 bg-muted/30 border-t flex items-center justify-between px-4 text-xs">
      {/* Left - Connection Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Circle
            size={8}
            className={`${
              isConnected ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"
            }`}
          />
          <span className="text-muted-foreground">
            {isConnected
              ? `${t("common.connected")}: ${currentConnection?.host}:${currentConnection?.port}`
              : t("common.disconnect")}
          </span>
        </div>

        {isConnected && currentConnection && (
          <span className="text-muted-foreground">
            DB {currentDatabase ?? currentConnection.database}
          </span>
        )}
      </div>

      {/* Right - Additional Info */}
      <div className="flex items-center gap-4">
        <span className="text-muted-foreground">Vortex Redis v0.1.0</span>
      </div>
    </div>
  );
}
