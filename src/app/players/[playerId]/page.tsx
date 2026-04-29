"use client";

import Link from "next/link";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { Card, CardContent } from "@/components/ui/Card";
import { usePlayer, usePlayerLeagues, useLeaguePlayers } from "@/hooks/usePlayers";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByLeague } from "@/hooks/useStats";
import { useGamesByLeague } from "@/hooks/useGames";
import { usePlayers } from "@/hooks/usePlayers";
import { aggregatePlayerStats, getPlayerGameLog } from "@/core/utils/stats.util";
import { getStatType } from "@/core/constants/stat-types";
import { formatDate } from "@/core/utils/format.util";

export default function PlayerDetailPage({
  params,
}: {
  params: { playerId: string };
}) {
  const { playerId } = params;
  const { data: player } = usePlayer(playerId);
  const { data: playerLeagues } = usePlayerLeagues(playerId);
  const leagueId = playerLeagues?.[0]?.leagueId ?? "";

  const { data: leaguePlayers } = useLeaguePlayers(leagueId);
  const { data: players } = usePlayers();
  const { data: teams } = useTeamsByLeague(leagueId);
  const { data: stats } = useStatsByLeague(leagueId);
  const { data: games } = useGamesByLeague(leagueId);

  const allPlayerStats =
    stats && players && leaguePlayers && teams
      ? aggregatePlayerStats(
          stats,
          players,
          leaguePlayers.map((lp) => ({ playerId: lp.playerId, teamId: lp.teamId })),
          teams.map((t) => ({ teamId: t.teamId, name: t.name })),
        )
      : [];

  const playerStats = allPlayerStats.find((p) => p.playerId === playerId);

  const teamMap = new Map(teams?.map((t) => [t.teamId, t.name]) ?? []);
  const gameLog =
    stats && games
      ? getPlayerGameLog(stats, games, playerId, 5, teamMap)
      : [];

  const totalGoals = stats
    ?.filter((s) => s.playerId === playerId && s.statType === "goal")
    .reduce((sum, s) => sum + s.value, 0) ?? 0;
  const totalAssists = stats
    ?.filter((s) => s.playerId === playerId && s.statType === "assist")
    .reduce((sum, s) => sum + s.value, 0) ?? 0;
  const gamesWithStats = new Set(
    stats?.filter((s) => s.playerId === playerId).map((s) => s.gameId) ?? [],
  ).size;

  const league = playerLeagues?.[0];

  if (!player) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="p-4 space-y-6">
        <div className="flex flex-col items-center gap-4">
          <PlayerAvatar player={player} size="lg" />
          <div className="text-center">
            <h2 className="text-xl font-semibold">{player.name}</h2>
            {playerStats && (() => {
              const teamId = leaguePlayers?.find((lp) => lp.playerId === playerId)?.teamId;
              return teamId ? (
                <Link
                  href={`/teams/${teamId}`}
                  className="text-sm text-accent hover:underline mt-1 block"
                >
                  {playerStats.teamName}
                </Link>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {playerStats.teamName}
                </p>
              );
            })()}
            {league && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {league.name} · {league.season}
              </p>
            )}
          </div>
        </div>

        {playerStats && Object.keys(playerStats.stats).length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Statistics
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
              {Object.entries(playerStats.stats).map(([statType, value]) => {
                const config = getStatType(statType);
                return (
                  <Card key={statType} className="shrink-0 min-w-[120px] border-accent/50">
                    <CardContent className="pt-4 text-center">
                      <p className="text-2xl mb-1">{config.icon}</p>
                      <p className="text-lg font-bold">{value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {config.label}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>
        )}

        {gameLog.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Games
            </h3>
            <div className="space-y-2">
              {gameLog.map((log) => (
                <Link
                  key={log.gameId}
                  href={`/${leagueId}/games/${log.gameId}`}
                  className="block"
                >
                  <Card className="p-4 hover:opacity-90 transition-opacity">
                    <CardContent className="pt-0 flex items-center justify-between">
                      <div>
                        <p className="font-medium">vs {log.opponentName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(log.date)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {Object.entries(log.stats).map(([type, val]) => {
                          const config = getStatType(type);
                          return (
                            <span key={type} className="text-sm">
                              {config.icon} {val}
                            </span>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {gameLog.length === 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Games
            </h3>
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No games recorded yet
            </div>
          </section>
        )}

        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Career Summary
          </h3>
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-accent">{totalGoals}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Goals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{totalAssists}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Assists</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-accent">{gamesWithStats}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Games</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
