"use client";

import Link from "next/link";
import { PageShell } from "@/components/layout/PageShell";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useLeagues } from "@/hooks/useLeagues";
import { useTopScorers } from "@/hooks/useTopScorers";

export default function PlayersPage() {
  const { data: leagues } = useLeagues();
  const primaryLeagueId = leagues?.[0]?.leagueId ?? "league1";
  const { data: scorers } = useTopScorers(primaryLeagueId, 20);

  return (
    <PageShell title="Players">
      <div className="p-4 space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Top Scorers
          </h3>
          {scorers && scorers.length > 0 ? (
            <div className="space-y-2">
              {scorers.map((player, index) => (
                <Link
                  key={player.playerId}
                  href={`/${primaryLeagueId}/players/${player.playerId}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 flex justify-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {index + 1}
                    </span>
                  </div>
                  <PlayerAvatar player={player} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{player.playerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {player.teamName}
                    </p>
                  </div>
                  <span className="font-bold text-accent tabular-nums">
                    {player.stats.goal ?? 0}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No stats yet
            </div>
          )}
        </section>
      </div>
    </PageShell>
  );
}
