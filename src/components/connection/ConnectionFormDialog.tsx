import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useConnectionStore } from "@/stores/connectionStore";
import { invoke } from "@tauri-apps/api/core";
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Connection } from "@/types";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface ConnectionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  connection?: Connection;
  preselectedGroupId?: string;
}

export function ConnectionFormDialog({
  open,
  onOpenChange,
  connection,
  preselectedGroupId,
}: ConnectionFormDialogProps) {
  const { t } = useTranslation();
  const { createConnection, updateConnection, groups, fetchConnections } = useConnectionStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"success" | "error" | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    host: "",
    port: "" as string | number,
    password: "",
    database: 0,
    ssl: false,
    groupId: preselectedGroupId || "",
  });

  // Update form data when connection prop changes
  useEffect(() => {
    if (connection) {
      setFormData({
        name: connection.name || "",
        host: connection.host || "",
        port: connection.port || "",
        password: connection.password || "",
        database: connection.database ?? 0,
        ssl: connection.ssl || false,
        groupId: connection.groupId || "",
      });
    } else {
      setFormData({
        name: "",
        host: "",
        port: "",
        password: "",
        database: 0,
        ssl: false,
        groupId: preselectedGroupId || "",
      });
    }
    setTestResult(null);
  }, [connection, open, preselectedGroupId]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const result = await invoke<boolean>("test_connection", {
        host: formData.host || "localhost",
        port: formData.port || 6379,
        password: formData.password || null,
      });

      setTestResult(result ? "success" : "error");
      toast({
        title: result ? t("common.success") : t("common.error"),
        description: result ? t("connection.testSuccess") : t("connection.testFailed"),
        variant: result ? "default" : "destructive",
      });
    } catch (error) {
      setTestResult("error");
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: String(error),
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (connection) {
        await updateConnection({
          id: connection.id,
          name: formData.name,
          host: formData.host || "localhost",
          port: Number(formData.port) || 6379,
          password: formData.password,
          database: formData.database,
          ssl: formData.ssl,
          groupId: formData.groupId === "" ? undefined : formData.groupId,
          tags: connection.tags || [],
          createdAt: connection.createdAt,
          updatedAt: connection.updatedAt,
        });
        // Refresh connections to get updated data from database
        await fetchConnections();
      } else {
        await createConnection({
          ...formData,
          host: formData.host || "localhost",
          port: Number(formData.port) || 6379,
          tags: [],
          groupId: formData.groupId || undefined,
        });
      }
      onOpenChange(false);
      toast({
        title: t("common.success"),
        description: connection ? t("connection.updateSuccess") : t("connection.createSuccess"),
      });
    } catch (error) {
      console.error("Failed to save connection:", error);
      toast({
        variant: "destructive",
        title: t("common.error"),
        description: String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {connection ? t("connection.editConnection") : t("connection.newConnection")}
            </DialogTitle>
            <DialogDescription>
              {connection ? t("connection.updateConnectionDesc") : t("connection.addConnectionDesc")}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Connection Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">{t("connection.name")}</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  setTestResult(null);
                }}
                placeholder={t("connection.namePlaceholder")}
                required
              />
            </div>

            {/* Host and Port */}
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="grid gap-2">
                <Label htmlFor="host">{t("connection.host")}</Label>
                <Input
                  id="host"
                  value={formData.host}
                  onChange={(e) => {
                    setFormData({ ...formData, host: e.target.value });
                    setTestResult(null);
                  }}
                  placeholder={t("connection.hostPlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="port">{t("connection.port")}</Label>
                <Input
                  id="port"
                  type="number"
                  value={formData.port}
                  onChange={(e) => {
                    setFormData({ ...formData, port: e.target.value });
                    setTestResult(null);
                  }}
                  placeholder={t("connection.portPlaceholder")}
                  className="w-24"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={testing || loading}
              className="w-fit"
            >
              {testing ? (
                <>
                  <Loader2 size={14} className="mr-2 animate-spin" />
                  {t("connection.testing")}
                </>
              ) : testResult === "success" ? (
                <>
                  <CheckCircle2 size={14} className="mr-2 text-green-600" />
                  {t("connection.testSuccess")}
                </>
              ) : testResult === "error" ? (
                <>
                  <XCircle size={14} className="mr-2 text-destructive" />
                  {t("connection.testFailed")}
                </>
              ) : (
                t("connection.testConnection")
              )}
            </Button>

            {/* Password */}
            <div className="grid gap-2">
              <Label htmlFor="password">{t("connection.passwordOptional")}</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  setTestResult(null);
                }}
                placeholder={t("connection.passwordPlaceholder")}
              />
            </div>

            {/* Database and Group */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="database">{t("connection.database")}</Label>
                <Input
                  id="database"
                  type="number"
                  min="0"
                  max="15"
                  value={formData.database}
                  onChange={(e) =>
                    setFormData({ ...formData, database: parseInt(e.target.value) || 0 })
                  }
                  placeholder={t("connection.databasePlaceholder")}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="group">{t("connection.group")}</Label>
                <Select
                  value={formData.groupId || "none"}
                  onValueChange={(value) => setFormData({ ...formData, groupId: value === "none" ? "" : value })}
                >
                  <SelectTrigger id="group">
                    <SelectValue placeholder={t("connection.noGroup")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t("connection.noGroup")}</SelectItem>
                    {groups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: group.color }}
                          />
                          {group.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SSL Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="ssl">{t("connection.ssl")}</Label>
              <Switch
                id="ssl"
                checked={formData.ssl}
                onCheckedChange={(checked) => setFormData({ ...formData, ssl: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              {t("common.cancel")}
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? t("common.saving") : connection ? t("common.update") : t("common.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
