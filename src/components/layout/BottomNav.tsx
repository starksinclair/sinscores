"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Plus, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  leagueId?: string;
}

export function BottomNav({ leagueId }: BottomNavProps) {
  const pathname = usePathname();
  const pathParts = pathname.split("/").filter(Boolean);
  const effectiveLeagueId = leagueId ?? (pathParts[0] && pathParts[0] !== "manage" && pathParts[0] !== "create" ? pathParts[0] : null);
  const isOnLeaguePage = effectiveLeagueId && (pathname === `/${effectiveLeagueId}` || pathname.startsWith(`/${effectiveLeagueId}/`));

  const isHomeActive = pathname === "/";
  const isCreateActive = pathname === "/create";
  const isManageActive = isOnLeaguePage && pathname.startsWith(`/${effectiveLeagueId}/manage`);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 dark:border-gray-800 bg-card max-w-phone mx-auto">
      <div className="flex justify-around items-center h-16">
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-2 transition-colors",
            isHomeActive
              ? "text-accent border-t-2 border-accent"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-0.5">Home</span>
        </Link>
        <Link
          href="/create"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-2 transition-colors",
            isCreateActive
              ? "text-accent border-t-2 border-accent"
              : "text-gray-500 dark:text-gray-400 hover:text-foreground"
          )}
        >
          <Plus className="h-5 w-5" />
          <span className="text-xs mt-0.5">Create</span>
        </Link>
        {isOnLeaguePage && effectiveLeagueId && (
          <Link
            href={`/${effectiveLeagueId}/manage`}
            className={cn(
              "flex flex-col items-center justify-center flex-1 py-2 transition-colors",
              isManageActive
                ? "text-accent border-t-2 border-accent"
                : "text-gray-500 dark:text-gray-400 hover:text-foreground"
            )}
          >
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-0.5">Manage</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
