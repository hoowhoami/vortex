import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system");
  const [scanCount, setScanCount] = useState<string>("1000");
  const [keysLimit, setKeysLimit] = useState<string>("10000");

  useEffect(() => {
    // Load settings from localStorage
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | "system" | null;
    const savedScanCount = localStorage.getItem("scanCount");
    const savedKeysLimit = localStorage.getItem("keysLimit");

    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    }
    if (savedScanCount) {
      setScanCount(savedScanCount);
    }
    if (savedKeysLimit) {
      setKeysLimit(savedKeysLimit);
    }
  }, []);

  const applyTheme = (newTheme: "light" | "dark" | "system") => {
    const root = document.documentElement;

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.toggle("dark", systemTheme === "dark");
    } else {
      root.classList.toggle("dark", newTheme === "dark");
    }
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    applyTheme(newTheme);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const handleScanCountChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 10000) {
      setScanCount(value);
      localStorage.setItem("scanCount", value);
    }
  };

  const handleKeysLimitChange = (value: string) => {
    const num = parseInt(value);
    if (!isNaN(num) && num > 0 && num <= 100000) {
      setKeysLimit(value);
      localStorage.setItem("keysLimit", value);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
          <DialogDescription>{t("settings.description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Redis Settings */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t("settings.redis") || "Redis 设置"}</h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.redisDesc") || "配置 Redis 客户端行为"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-normal">{t("settings.scanCount") || "SCAN 计数"}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.scanCountDesc") || "每次 SCAN 命令返回的键数量"}
                  </p>
                </div>
                <Input
                  type="number"
                  value={scanCount}
                  onChange={(e) => handleScanCountChange(e.target.value)}
                  className="w-[120px]"
                  min="100"
                  max="10000"
                />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-normal">{t("settings.keysLimit") || "键数量限制"}</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("settings.keysLimitDesc") || "最多显示的键数量"}
                  </p>
                </div>
                <Input
                  type="number"
                  value={keysLimit}
                  onChange={(e) => handleKeysLimitChange(e.target.value)}
                  className="w-[120px]"
                  min="1000"
                  max="100000"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Appearance Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t("settings.appearance")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.appearanceDesc") || "自定义应用外观"}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">{t("settings.theme")}</Label>
                <Select value={theme} onValueChange={(value) => handleThemeChange(value as "light" | "dark" | "system")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t("settings.themeLight")}</SelectItem>
                    <SelectItem value="dark">{t("settings.themeDark")}</SelectItem>
                    <SelectItem value="system">{t("settings.themeSystem")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label className="text-sm font-normal">{t("settings.language")}</Label>
                <Select value={i18n.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="zh">中文</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* About Section */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium">{t("settings.about")}</h3>
              <p className="text-sm text-muted-foreground">
                {t("settings.aboutDesc") || "应用信息"}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t("settings.version")}</span>
                <span className="font-mono">1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
