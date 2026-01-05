"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";
import { Home, Search, Tv, Radio, Settings, User } from "lucide-react";

const navItems = [
  { icon: Home, label: "首页", href: "/home" },
  { icon: Search, label: "搜索", href: "/search" },
  { icon: Tv, label: "豆瓣", href: "/douban" },
  { icon: Radio, label: "直播", href: "/live" },
  { icon: Settings, label: "管理", href: "/admin", requiresAdmin: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const [user, setUser] = React.useState<{ role: string } | null>(null);

  React.useEffect(() => {
    const userData = localStorage.getItem("vortex_user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const filteredNavItems = navItems.filter(
    (item) => !item.requiresAdmin || user?.role === "owner" || user?.role === "admin"
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t lg:hidden">
      <div className="flex items-center justify-around h-16">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center space-y-1 flex-1 h-full",
                "transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
