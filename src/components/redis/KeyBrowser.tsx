import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRedisStore } from "@/stores/redisStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Search, RefreshCw, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function KeyBrowser() {
  const { t } = useTranslation();
  const { keys, fetchKeys, selectedKey, getValue, deleteKey, loading, connectedId } =
    useRedisStore();
  const [searchPattern, setSearchPattern] = useState("*");
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (connectedId) {
      fetchKeys("*");
    }
  }, [connectedId, fetchKeys]);

  const handleSearch = () => {
    fetchKeys(searchPattern || "*");
  };

  const handleKeyClick = (key: string) => {
    getValue(key);
  };

  const handleDeleteClick = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setKeyToDelete(key);
  };

  const confirmDelete = async () => {
    if (keyToDelete) {
      try {
        await deleteKey(keyToDelete);
        setKeyToDelete(null);
      } catch (error) {
        console.error("Failed to delete key:", error);
      }
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center min-h-[60px]">
        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder={t("redis.searchPattern") || "Pattern (e.g., user:*)"}
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="h-8"
          />
          <Button onClick={handleSearch} size="icon" variant="outline" className="h-8 w-8 shrink-0">
            <Search size={16} />
          </Button>
          <Button
            onClick={() => fetchKeys(searchPattern || "*")}
            size="icon"
            variant="outline"
            className="h-8 w-8 shrink-0"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </Button>
          <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {keys.length}
          </div>
        </div>
      </div>

      {/* Keys List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {keys.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-muted-foreground">
              {loading ? t("common.loading") : t("redis.noKeys")}
            </div>
          ) : (
            <div className="space-y-1">
              {keys.map((keyItem) => (
                <div
                  key={keyItem.key}
                  onClick={() => handleKeyClick(keyItem.key)}
                  className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                    selectedKey === keyItem.key
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Badge variant="outline" className="text-xs shrink-0">
                      {keyItem.type}
                    </Badge>
                    <span className="text-sm font-mono break-all">
                      {keyItem.key}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDeleteClick(keyItem.key, e)}
                  >
                    <Trash2 size={14} className="text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!keyToDelete} onOpenChange={() => setKeyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("redis.deleteKey")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("redis.deleteKeyConfirm")}: <strong>{keyToDelete}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
