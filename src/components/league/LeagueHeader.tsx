"use client";

import { Trophy } from "lucide-react";
import type { ILeague } from "@/core/interfaces";

interface LeagueHeaderProps {
  league: Pick<ILeague, "leagueId" | "name" | "season">;
}

export function LeagueHeader({ league }: LeagueHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-gray-200 dark:border-gray-800">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/20">
        <Trophy className="h-5 w-5 text-accent" />
      </div>
      <div>
        <h2 className="font-semibold">{league.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{league.season}</p>
      </div>
    </div>
  );
}
