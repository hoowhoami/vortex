import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useRedisStore } from "@/stores/redisStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatJSON, isValidJSON } from "@/lib/json-utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, Plus, Trash2, RefreshCw, Database, Code } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { UI_SIZES } from "@/lib/ui-constants";

export function ValueEditor() {
  const { t } = useTranslation();
  const { selectedKey, selectedValue, setValue, getValue } = useRedisStore();
  const { toast } = useToast();
  const [editedValue, setEditedValue] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [ttlDialogOpen, setTtlDialogOpen] = useState(false);
  const [newTtl, setNewTtl] = useState<string>("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (selectedValue) {
      setEditedValue(selectedValue.value);
      setIsEditing(false);
    }
  }, [selectedValue]);

  const handleSave = async () => {
    if (!selectedKey || !selectedValue) return;

    try {
      await setValue(selectedKey, editedValue);
      toast({
        title: t("common.success"),
        description: t("redis.valueSaved"),
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: String(error),
      });
    }
  };

  const handleRefresh = async () => {
    if (!selectedKey) return;

    setRefreshing(true);
    try {
      await getValue(selectedKey);
      toast({
        title: t("common.success"),
        description: t("redis.valueRefreshed"),
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: String(error),
      });
    } finally {
      setRefreshing(false);
    }
  };

  const handleTtlSave = async () => {
    if (!selectedKey) return;

    // TODO: Implement TTL update via backend
    toast({
      title: "TTL Update",
      description: `TTL will be set to ${newTtl} seconds`,
    });
    setTtlDialogOpen(false);
  };

  if (!selectedKey || !selectedValue) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {t("redis.selectKey")}
      </div>
    );
  }

  const renderStringEditor = () => {
    const isJson = typeof editedValue === "string" && isValidJSON(editedValue);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          {isJson && (
            <Badge variant="secondary" className="text-xs">
              <Code size={12} className="mr-1" />
              JSON
            </Badge>
          )}
          {isJson && (
            <Button
              variant="outline"
              onClick={() => {
                setEditedValue(formatJSON(editedValue as string));
                setIsEditing(true);
              }}
              className={UI_SIZES.button.className}
            >
              <Code size={UI_SIZES.icon.small} className="mr-1" />
              {t("common.format") || "Format"}
            </Button>
          )}
        </div>
        <Textarea
          value={editedValue as string}
          onChange={(e) => {
            setEditedValue(e.target.value);
            setIsEditing(true);
          }}
          className={`font-mono h-[calc(100vh-280px)] resize-none ${isJson ? "text-xs" : ""}`}
          spellCheck={false}
        />
      </div>
    );
  };

  const renderListEditor = () => {
    const list = editedValue as string[];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("redis.listValues")} ({list.length})</Label>
          <Button
            onClick={() => {
              setEditedValue([...list, ""]);
              setIsEditing(true);
            }}
            className={UI_SIZES.button.className}
          >
            <Plus size={UI_SIZES.icon.small} className="mr-1" />
            {t("common.add")}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {list.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newList = [...list];
                    newList[index] = e.target.value;
                    setEditedValue(newList);
                    setIsEditing(true);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newList = list.filter((_, i) => i !== index);
                    setEditedValue(newList);
                    setIsEditing(true);
                  }}
                >
                  <Trash2 size={UI_SIZES.icon.small} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderSetEditor = () => {
    const set = editedValue as string[];
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("redis.setMembers")} ({set.length})</Label>
          <Button
            onClick={() => {
              setEditedValue([...set, ""]);
              setIsEditing(true);
            }}
            className={UI_SIZES.button.className}
          >
            <Plus size={UI_SIZES.icon.small} className="mr-1" />
            {t("common.add")}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {set.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={item}
                  onChange={(e) => {
                    const newSet = [...set];
                    newSet[index] = e.target.value;
                    setEditedValue(newSet);
                    setIsEditing(true);
                  }}
                  className="flex-1"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newSet = set.filter((_, i) => i !== index);
                    setEditedValue(newSet);
                    setIsEditing(true);
                  }}
                >
                  <Trash2 size={UI_SIZES.icon.small} />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  const renderHashEditor = () => {
    const hash = editedValue as Record<string, string>;
    const entries = Object.entries(hash);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("redis.hashFields")} ({entries.length})</Label>
          <Button
            onClick={() => {
              setEditedValue({ ...hash, "": "" });
              setIsEditing(true);
            }}
            className={UI_SIZES.button.className}
          >
            <Plus size={UI_SIZES.icon.small} className="mr-1" />
            {t("common.add")}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("redis.field")}</TableHead>
                <TableHead>{t("redis.value")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map(([field, value], index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={field}
                      onChange={(e) => {
                        const newHash = { ...hash };
                        delete newHash[field];
                        newHash[e.target.value] = value;
                        setEditedValue(newHash);
                        setIsEditing(true);
                      }}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      value={value}
                      onChange={(e) => {
                        setEditedValue({ ...hash, [field]: e.target.value });
                        setIsEditing(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newHash = { ...hash };
                        delete newHash[field];
                        setEditedValue(newHash);
                        setIsEditing(true);
                      }}
                    >
                      <Trash2 size={UI_SIZES.icon.small} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  const renderZSetEditor = () => {
    const zset = editedValue as Array<[string, number]>;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>{t("redis.zsetMembers")} ({zset.length})</Label>
          <Button
            onClick={() => {
              setEditedValue([...zset, ["", 0]]);
              setIsEditing(true);
            }}
            className={UI_SIZES.button.className}
          >
            <Plus size={UI_SIZES.icon.small} className="mr-1" />
            {t("common.add")}
          </Button>
        </div>
        <ScrollArea className="h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("redis.member")}</TableHead>
                <TableHead>{t("redis.score")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zset.map(([member, score], index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Input
                      value={member}
                      onChange={(e) => {
                        const newZSet = [...zset];
                        newZSet[index] = [e.target.value, score];
                        setEditedValue(newZSet);
                        setIsEditing(true);
                      }}
                      className="font-mono"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={score}
                      onChange={(e) => {
                        const newZSet = [...zset];
                        newZSet[index] = [member, parseFloat(e.target.value)];
                        setEditedValue(newZSet);
                        setIsEditing(true);
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newZSet = zset.filter((_, i) => i !== index);
                        setEditedValue(newZSet);
                        setIsEditing(true);
                      }}
                    >
                      <Trash2 size={UI_SIZES.icon.small} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  const renderEditor = () => {
    switch (selectedValue.type) {
      case "string":
        return renderStringEditor();
      case "list":
        return renderListEditor();
      case "set":
        return renderSetEditor();
      case "hash":
        return renderHashEditor();
      case "zset":
        return renderZSetEditor();
      default:
        return <div>{t("redis.unsupportedType")}</div>;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b bg-muted/30 flex items-center min-h-[60px]">
        <div className="flex items-center justify-between w-full gap-4">
          <div className="font-mono text-sm flex-1 min-w-0 break-all">
            {selectedKey}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="secondary"
            >
              <Database size={12} className="mr-1" />
              {selectedValue.type}
            </Badge>
            {selectedValue.ttl !== null && selectedValue.ttl !== undefined && (
              <Badge
                variant="outline"
                className="cursor-pointer hover:bg-accent"
                onClick={() => {
                  setNewTtl(selectedValue.ttl?.toString() || "-1");
                  setTtlDialogOpen(true);
                }}
              >
                TTL: {selectedValue.ttl}s
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className={UI_SIZES.button.iconClassName}
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <RefreshCw size={UI_SIZES.icon.medium} className={refreshing ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">{renderEditor()}</div>
      </ScrollArea>

      {/* Footer Actions */}
      {isEditing && (
        <div className="p-4 border-t flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setEditedValue(selectedValue.value);
              setIsEditing(false);
            }}
            className={UI_SIZES.button.className}
          >
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} className={UI_SIZES.button.className}>
            <Save size={UI_SIZES.icon.small} className="mr-2" />
            {t("common.save")}
          </Button>
        </div>
      )}

      {/* TTL Edit Dialog */}
      <Dialog open={ttlDialogOpen} onOpenChange={setTtlDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("redis.editTtl")}</DialogTitle>
            <DialogDescription>
              {t("redis.editTtlDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ttl">{t("redis.ttlSeconds")}</Label>
              <Input
                id="ttl"
                type="number"
                value={newTtl}
                onChange={(e) => setNewTtl(e.target.value)}
                placeholder="-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTtlDialogOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleTtlSave}>
              {t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
