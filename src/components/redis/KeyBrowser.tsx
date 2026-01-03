import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useRedisStore } from "@/stores/redisStore";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, RefreshCw, Trash2, CheckSquare, Square } from "lucide-react";
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
import { UI_SIZES } from "@/lib/ui-constants";

export function KeyBrowser() {
  const { t } = useTranslation();
  const { keys, fetchKeys, selectedKey, getValue, deleteKey, loading, connectedId, deleteMultipleKeys } =
    useRedisStore();
  const [searchPattern, setSearchPattern] = useState("*");
  const [keyType, setKeyType] = useState<string>("all");
  const [keyToDelete, setKeyToDelete] = useState<string | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);

  // Virtual scrolling
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: keys.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 40,
    overscan: 10,
  });

  useEffect(() => {
    if (connectedId) {
      fetchKeys("*");
    }
  }, [connectedId, fetchKeys]);

  const handleSearch = () => {
    fetchKeys(searchPattern || "*", keyType);
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
        setSelectedKeys(new Set());
      } catch (error) {
        console.error("Failed to delete key:", error);
      }
    }
  };

  const toggleKeySelection = (key: string) => {
    const newSelected = new Set(selectedKeys);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedKeys(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedKeys.size === keys.length) {
      setSelectedKeys(new Set());
    } else {
      setSelectedKeys(new Set(keys.map(k => k.key)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedKeys.size === 0) return;
    setShowBulkDeleteDialog(false);
    try {
      await deleteMultipleKeys(Array.from(selectedKeys));
      setSelectedKeys(new Set());
      setIsBulkMode(false);
      await fetchKeys(searchPattern || "*");
    } catch (error) {
      console.error("Failed to delete keys:", error);
    }
  };

  return (
    <div className="flex flex-col h-full border-r">
      {/* Search Bar */}
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 mb-2">
          <Input
            placeholder={t("redis.searchPattern") || "Pattern (e.g., user:*)"}
            value={searchPattern}
            onChange={(e) => setSearchPattern(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className={`${UI_SIZES.input.className} flex-1`}
          />
          <Select value={keyType} onValueChange={setKeyType}>
            <SelectTrigger className={UI_SIZES.select.narrowClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("redis.allTypes") || "All"}</SelectItem>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="hash">Hash</SelectItem>
              <SelectItem value="list">List</SelectItem>
              <SelectItem value="set">Set</SelectItem>
              <SelectItem value="zset">ZSet</SelectItem>
              <SelectItem value="stream">Stream</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={handleSearch}
            variant="outline"
            className={`${UI_SIZES.button.iconClassName} shrink-0`}
          >
            <Search size={UI_SIZES.icon.small} />
          </Button>
          <Button
            onClick={() => fetchKeys(searchPattern || "*", keyType)}
            variant="outline"
            className={`${UI_SIZES.button.iconClassName} shrink-0`}
          >
            <RefreshCw size={UI_SIZES.icon.small} className={loading ? "animate-spin" : ""} />
          </Button>
        </div>

        {/* Bottom row: count and bulk select */}
        <div className="flex items-center justify-between gap-2">
          <div className="text-xs text-muted-foreground">
            {keys.length} {t("redis.totalKeys") || "keys"}
          </div>
          {keys.length > 0 && (
            <Button
              variant={isBulkMode ? "default" : "outline"}
              onClick={() => {
                setIsBulkMode(!isBulkMode);
                setSelectedKeys(new Set());
              }}
              className={UI_SIZES.button.className}
            >
              {isBulkMode ? (
                <>
                  <CheckSquare size={UI_SIZES.icon.small} className="mr-1" />
                  {t("common.done") || "Done"}
                </>
              ) : (
                <>
                  <Square size={UI_SIZES.icon.small} className="mr-1" />
                  {t("common.bulkSelect") || "Bulk Select"}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {isBulkMode && (
        <div className="px-2 py-2 border-b bg-muted/20">
          <div className="flex items-center gap-2 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={toggleSelectAll}
            >
              {selectedKeys.size === keys.length ? (
                <CheckSquare size={UI_SIZES.icon.small} />
              ) : (
                <Square size={UI_SIZES.icon.small} />
              )}
            </Button>
            <div className="text-xs text-muted-foreground flex-1">
              {selectedKeys.size > 0
                ? `${selectedKeys.size} ${t("common.selected") || "selected"}`
                : `${keys.length} ${t("redis.totalKeys") || "keys"}`}
            </div>
            {selectedKeys.size > 0 && (
              <Button
                variant="destructive"
                onClick={() => setShowBulkDeleteDialog(true)}
                className={UI_SIZES.button.className}
              >
                <Trash2 size={UI_SIZES.icon.small} className="mr-1" />
                {t("common.delete")}
              </Button>
            )}
          </div>
        </div>
      )}
      <div
        ref={parentRef}
        className="flex-1 overflow-auto"
        style={{
          height: keys.length === 0 ? "auto" : "calc(100vh - 240px)",
        }}
      >
        {keys.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-muted-foreground">
            {loading ? t("common.loading") : t("redis.noKeys")}
          </div>
        ) : (
          <div
            className="relative w-full"
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualRow) => {
              const keyItem = keys[virtualRow.index];
              return (
                <div
                  key={virtualRow.key}
                  data-index={virtualRow.index}
                  ref={rowVirtualizer.measureElement}
                  className="absolute left-0 top-0 w-full px-2"
                  style={{
                    transform: `translateY(${virtualRow.start}px)`,
                  }}
                >
                  <div
                    onClick={() => handleKeyClick(keyItem.key)}
                    className={`group flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                      selectedKey === keyItem.key
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {isBulkMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleKeySelection(keyItem.key);
                        }}
                      >
                        {selectedKeys.has(keyItem.key) ? (
                          <CheckSquare size={UI_SIZES.icon.small} className="text-primary" />
                        ) : (
                          <Square size={UI_SIZES.icon.small} />
                        )}
                      </Button>
                    )}
                    <Badge variant="outline" className="text-xs shrink-0">
                      {keyItem.type}
                    </Badge>
                    <span className="text-sm font-mono break-all flex-1 min-w-0">
                      {keyItem.key}
                    </span>
                    {!isBulkMode && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        onClick={(e) => handleDeleteClick(keyItem.key, e)}
                      >
                        <Trash2 size={UI_SIZES.icon.small} className="text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("redis.bulkDelete") || "批量删除"}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("redis.bulkDeleteConfirm") || `确定要删除选中的 ${selectedKeys.size} 个键吗？此操作不可撤销。`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
