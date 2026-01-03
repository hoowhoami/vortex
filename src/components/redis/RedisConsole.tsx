import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRedisStore } from "@/stores/redisStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Terminal, Trash2 } from "lucide-react";
import { UI_SIZES } from "@/lib/ui-constants";

interface CommandHistory {
  command: string;
  result: string;
  timestamp: number;
  isError?: boolean;
}

export function RedisConsole() {
  const { t } = useTranslation();
  const { executeCommand, connectedId } = useRedisStore();
  const [command, setCommand] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleExecute = async () => {
    if (!command.trim() || !connectedId) return;

    const cmd = command.trim();
    setCommand("");
    setHistoryIndex(-1);

    try {
      const result = await executeCommand(cmd);
      setHistory((prev) => [
        ...prev,
        { command: cmd, result, timestamp: Date.now() },
      ]);
    } catch (error) {
      setHistory((prev) => [
        ...prev,
        {
          command: cmd,
          result: String(error),
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleExecute();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const commands = history.map((h) => h.command);
      if (commands.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commands.length) {
          setHistoryIndex(newIndex);
          setCommand(commands[commands.length - 1 - newIndex]);
        }
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        const commands = history.map((h) => h.command);
        setCommand(commands[commands.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommand("");
      }
    }
  };

  return (
    <div className="flex flex-col h-full bg-black text-green-400 font-mono">
      <div className="flex items-center justify-between px-4 py-2 border-b border-green-900/30 bg-black/50">
        <div className="flex items-center gap-2 text-green-500">
          <Terminal size={UI_SIZES.icon.medium} />
          <span className="text-sm font-semibold">Redis CLI</span>
        </div>
        <Button
          variant="ghost"
          onClick={() => setHistory([])}
          disabled={history.length === 0}
          className={`${UI_SIZES.button.className} text-green-500 hover:text-green-400 hover:bg-green-900/20`}
        >
          <Trash2 size={UI_SIZES.icon.small} className="mr-1" />
          {t("console.clear")}
        </Button>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-2 text-sm">
          {history.length === 0 ? (
            <div className="text-green-600 text-center py-8">
              {t("console.empty")}
            </div>
          ) : (
            history.map((item, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 select-none">redis&gt;</span>
                  <span className="text-green-300">{item.command}</span>
                </div>
                <div
                  className={`pl-8 whitespace-pre-wrap ${
                    item.isError ? "text-red-400" : "text-green-400"
                  }`}
                >
                  {item.result}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-green-900/30 bg-black/50">
        <div className="flex items-center gap-2">
          <span className="text-green-500 select-none">redis&gt;</span>
          <Input
            ref={inputRef}
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={!connectedId ? "Not connected" : ""}
            disabled={!connectedId}
            className="flex-1 bg-transparent border-none text-green-300 placeholder:text-green-700 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
          />
        </div>
        <div className="text-xs text-green-700 mt-2">
          {t("console.hint")}
        </div>
      </div>
    </div>
  );
}
