"use client";

import { useTheme } from "next-themes";
import { usePathname } from "next/navigation";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useLeague } from "@/hooks/useLeagues";
import { BackButton } from "@/components/ui/BackButton";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "sinscores";

interface HeaderProps {
  title?: string;
  leagueId?: string;
  showThemeToggle?: boolean;
  showBack?: boolean;
  backFallback?: string;
}

export function Header({ title, leagueId, showThemeToggle = true, showBack = false, backFallback }: HeaderProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { data: league } = useLeague(leagueId ?? "");
  const isManage = pathname?.includes("/manage");
  const isGameDetail = pathname?.match(/\/[^/]+\/games\/[^/]+$/);

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayTitle =
    title ??
    (isManage ? "Manage League" : isGameDetail ? "Match Details" : (league?.name ?? appName));

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800 bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 max-w-phone mx-auto">
      <div className="flex items-center justify-between h-14 px-4 gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack && <BackButton fallback={backFallback} />}
          <h1 className="text-lg font-semibold truncate">
            {displayTitle}
          </h1>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {showThemeToggle && mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
