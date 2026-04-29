"use client";

import Link from "next/link";
import { Trophy, Heart } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import type { ILeague } from "@/core/interfaces";

interface LeagueCardProps {
  league: Pick<ILeague, "leagueId" | "name" | "season">;
  teamCount?: number;
  isFavourite?: boolean;
  onToggleFavourite?: (e: React.MouseEvent) => void;
}

export function LeagueCard({
  league,
  teamCount = 0,
  isFavourite = false,
  onToggleFavourite,
}: LeagueCardProps) {
  return (
    <Card className="p-4 flex items-center gap-4 hover:opacity-90 transition-opacity group">
      <Link href={`/${league.leagueId}`} className="flex-1 min-w-0 flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-accent/20">
          <Trophy className="h-6 w-6 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{league.name}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {league.season}
            {teamCount > 0 && ` · ${teamCount} teams`}
          </p>
        </div>
      </Link>
      {onToggleFavourite && (
        <button
          type="button"
          onClick={onToggleFavourite}
          className="p-2 -mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-colors",
              isFavourite
                ? "fill-red-500 text-red-500"
                : "text-gray-400 group-hover:text-red-400"
            )}
          />
        </button>
      )}
    </Card>
  );
}
