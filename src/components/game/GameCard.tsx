"use client";

import Link from "next/link";
import { Circle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate, formatTime, formatScore } from "@/core/utils/format.util";
import type { IGame } from "@/core/interfaces";
import type { ITeam } from "@/core/interfaces";

interface GameCardProps {
  game: IGame;
  homeTeam: ITeam;
  awayTeam: ITeam;
}

export function GameCard({ game, homeTeam, awayTeam }: GameCardProps) {
  const isLive = game.status === "live";
  const isScheduled = game.status === "scheduled";

  return (
    <Link href={`/${game.leagueId}/games/${game.gameId}`}>
      <Card className="p-4 hover:opacity-90 transition-opacity">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0 text-right">
            <p className="font-medium truncate">{homeTeam.name}</p>
          </div>
          <div className="flex flex-col items-center shrink-0">
            {isScheduled ? (
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDate(game.playedAt)}
                </p>
                <p className="text-sm font-medium">{formatTime(game.playedAt)}</p>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {isLive && (
                  <Badge variant="live" className="flex items-center gap-1">
                    <Circle className="h-1.5 w-1.5 fill-current" />
                    LIVE
                  </Badge>
                )}
                <span className="text-2xl font-bold tabular-nums">
                  {formatScore(game.homeScore, game.awayScore)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="font-medium truncate">{awayTeam.name}</p>
          </div>
        </div>
        {!isScheduled && (
          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {formatDate(game.playedAt)} · {formatTime(game.playedAt)}
            </p>
          </div>
        )}
      </Card>
    </Link>
  );
}
