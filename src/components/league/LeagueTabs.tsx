"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface LeagueTabsProps {
  leagueId: string;
  className?: string;
}

const TABS = [
  { id: "overview", label: "Overview", href: (id: string) => `/${id}` },
  { id: "matches", label: "Matches", href: (id: string) => `/${id}/matches` },
  { id: "standings", label: "Standings", href: (id: string) => `/${id}/standings` },
  { id: "stats", label: "Stats", href: (id: string) => `/${id}/stats` },
] as const;

export function LeagueTabs({ leagueId, className }: LeagueTabsProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-card scrollbar-hide",
        className,
      )}
    >
      {TABS.map((tab) => {
        const href = tab.href(leagueId);
        const isOverview = tab.id === "overview";
        const isActive = isOverview
          ? pathname === href
          : pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={tab.id}
            href={href}
            className={cn(
              "px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px",
              isActive
                ? "border-accent text-accent"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-foreground",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
