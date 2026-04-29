"use client";

import { Trophy, Award, Medal } from "lucide-react";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import type { IPlayerStatSummary } from "@/core/interfaces";

interface TopScorersProps {
  scorers: IPlayerStatSummary[];
  leagueId: string;
  statType?: "goal" | "assist";
}

const positionIcons = [
  <Trophy key="1" className="h-5 w-5 text-amber-500" />,
  <Award key="2" className="h-5 w-5 text-gray-400" />,
  <Medal key="3" className="h-5 w-5 text-amber-700" />,
];

export function TopScorers({ scorers, leagueId, statType = "goal" }: TopScorersProps) {
  const valueKey = statType;
  return (
    <div className="space-y-2">
      {scorers.map((player, index) => (
        <a
          key={player.playerId}
          href={`/${leagueId}/players/${player.playerId}`}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="w-8 flex justify-center">
            {index < 3 ? (
              positionIcons[index]
            ) : (
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-5 text-center">
                {index + 1}
              </span>
            )}
          </div>
          <PlayerAvatar player={player} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{player.playerName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {player.teamName}
            </p>
          </div>
          <span className="font-bold text-accent tabular-nums">
            {player.stats[valueKey] ?? 0}
          </span>
        </a>
      ))}
    </div>
  );
}
