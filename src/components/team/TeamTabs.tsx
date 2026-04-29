"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface TeamTabsProps {
  teamId: string;
  className?: string;
}

const TABS = [
  { id: "details", label: "Details", href: (id: string) => `/teams/${id}` },
  { id: "matches", label: "Matches", href: (id: string) => `/teams/${id}/matches` },
  { id: "squad", label: "Squad", href: (id: string) => `/teams/${id}/squad` },
  { id: "standings", label: "Standings", href: (id: string) => `/teams/${id}/standings` },
] as const;

export function TeamTabs({ teamId, className }: TeamTabsProps) {
  const pathname = usePathname();

  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto border-b border-gray-200 dark:border-gray-800 bg-card scrollbar-hide",
        className,
      )}
    >
      {TABS.map((tab) => {
        const href = tab.href(teamId);
        const isDetails = tab.id === "details";
        const isActive = isDetails
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
