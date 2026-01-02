import { useRedisStore } from "@/stores/redisStore";
import { KeyBrowser } from "@/components/redis/KeyBrowser";
import { ValueEditor } from "@/components/redis/ValueEditor";
import { Database } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

export function RedisDataBrowser() {
  const { t } = useTranslation();
  const { connectedId } = useRedisStore();

  if (!connectedId) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Database className="mx-auto mb-4 text-muted-foreground" size={64} />
          <h3 className="text-lg font-semibold mb-2">{t("connection.noConnectionSelected")}</h3>
          <p className="text-sm text-muted-foreground">
            {t("connection.selectConnection")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full">
      {/* Left - Key Browser */}
      <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
        <KeyBrowser />
      </ResizablePanel>

      <ResizableHandle withHandle />

      {/* Right - Value Editor */}
      <ResizablePanel defaultSize={75} minSize={60}>
        <ValueEditor />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
