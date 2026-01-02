import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConnectionStore } from "@/stores/connectionStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConnectionGroup } from "@/types";

interface GroupFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: ConnectionGroup;
}

const PRESET_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
];

export function GroupFormDialog({
  open,
  onOpenChange,
  group,
}: GroupFormDialogProps) {
  const { t } = useTranslation();
  const { createGroup, updateGroup } = useConnectionStore();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    color: PRESET_COLORS[0],
  });

  useEffect(() => {
    if (group) {
      setFormData({
        name: group.name || "",
        color: group.color || PRESET_COLORS[0],
      });
    } else {
      setFormData({
        name: "",
        color: PRESET_COLORS[0],
      });
    }
  }, [group, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (group) {
        await updateGroup({
          ...group,
          ...formData,
        });
      } else {
        await createGroup({
          name: formData.name,
          color: formData.color,
        });
      }
      onOpenChange(false);
      setFormData({
        name: "",
        color: PRESET_COLORS[0],
      });
    } catch (error) {
      console.error("Failed to save group:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {group ? t("group.editGroup") : t("group.newGroup")}
            </DialogTitle>
            <DialogDescription>
              {group ? t("group.updateGroupDesc") : t("group.addGroupDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="group-name">{t("group.name")}</Label>
              <Input
                id="group-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder={t("group.namePlaceholder")}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>{t("group.color")}</Label>
              <div className="flex gap-2 flex-wrap">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      formData.color === color
                        ? "border-foreground scale-110"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? t("common.saving")
                : group
                ? t("common.update")
                : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
