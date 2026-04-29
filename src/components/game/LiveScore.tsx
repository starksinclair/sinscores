"use client";

import { Circle } from "lucide-react";
import { formatScore } from "@/core/utils/format.util";
import type { IGame } from "@/core/interfaces";

interface LiveScoreProps {
  game: IGame;
  homeTeamName: string;
  awayTeamName: string;
}

export function LiveScore({ game, homeTeamName, awayTeamName }: LiveScoreProps) {
  if (game.status !== "live") return null;

  return (
    <div className="flex items-center justify-center gap-2 py-2">
      <Circle className="h-2 w-2 text-red-500 fill-red-500 animate-pulse" />
      <span className="text-sm font-medium text-red-500">LIVE</span>
      <span className="text-lg font-bold tabular-nums mx-2">
        {formatScore(game.homeScore, game.awayScore)}
      </span>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {homeTeamName} vs {awayTeamName}
      </span>
    </div>
  );
}
