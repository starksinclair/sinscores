"use client";

import Link from "next/link";
import { PlayerAvatar } from "./PlayerAvatar";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CircleDot, Target } from "lucide-react";
import type { IPlayerStatSummary } from "@/core/interfaces";

interface PlayerCardProps {
  player: IPlayerStatSummary;
  leagueId?: string;
}

export function PlayerCard({ player }: PlayerCardProps) {
  const goals = player.stats.goal ?? 0;
  const assists = player.stats.assist ?? 0;

  return (
    <Link href={`/players/${player.playerId}`}>
      <Card className="p-4 flex items-center gap-4 hover:opacity-90 transition-opacity">
        <PlayerAvatar player={player} size="md" />
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{player.playerName}</p>
          <Badge variant="default" className="text-xs mt-0.5">
            {player.teamName}
          </Badge>
        </div>
        <div className="flex gap-2 shrink-0">
          <span className="flex items-center gap-1 text-sm">
            <Target className="h-4 w-4 text-accent" />
            <span className="font-semibold">{goals}</span>
          </span>
          <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
            <CircleDot className="h-4 w-4" />
            <span>{assists}</span>
          </span>
        </div>
      </Card>
    </Link>
  );
}
