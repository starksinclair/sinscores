"use client";

import Link from "next/link";
import { TeamTabs } from "@/components/team/TeamTabs";
import { Card, CardContent } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useTeam } from "@/hooks/useTeams";
import { useLeague } from "@/hooks/useLeagues";
import { useTeamRecord } from "@/hooks/useTeamRecord";
import { useTeamPlayers } from "@/hooks/usePlayers";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByLeague } from "@/hooks/useStats";
import { usePlayers } from "@/hooks/usePlayers";
import { aggregatePlayerStats } from "@/core/utils/stats.util";

export default function TeamDetailsPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const { data: team } = useTeam(teamId);
  const { data: league } = useLeague(team?.leagueId ?? "");
  const { data: record } = useTeamRecord(teamId, team?.leagueId ?? "");
  const { data: teamPlayers } = useTeamPlayers(teamId);
  const { data: teams } = useTeamsByLeague(team?.leagueId ?? "");
  const { data: stats } = useStatsByLeague(team?.leagueId ?? "");
  const { data: players } = usePlayers();

  const leaguePlayers =
    teamPlayers?.map((lp) => ({ playerId: lp.playerId, teamId: lp.teamId })) ?? [];
  const allPlayerStats =
    stats && players && teams
      ? aggregatePlayerStats(
          stats,
          players,
          leaguePlayers,
          teams.map((t) => ({ teamId: t.teamId, name: t.name })),
        )
      : [];
  const squadStats = allPlayerStats.filter((p) =>
    teamPlayers?.some((tp) => tp.playerId === p.playerId),
  );
  const topPlayer =
    squadStats.length > 0
      ? [...squadStats].sort(
          (a, b) =>
            (b.stats.goal ?? 0) +
            (b.stats.assist ?? 0) -
            ((a.stats.goal ?? 0) + (a.stats.assist ?? 0)),
        )[0]
      : null;

  if (!team) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-lg">{team.name}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {league?.name} · {league?.season}
        </p>
      </div>
      <TeamTabs teamId={teamId} className="sticky top-0 z-10" />
      <div className="p-4 space-y-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{team.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {league?.name} · {league?.season}
          </p>
        </div>

        {record && (
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {record.won}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">W</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {record.drawn}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">D</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {record.lost}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">L</p>
              </CardContent>
            </Card>
          </div>
        )}

        {record && (
          <div className="flex gap-4 justify-center">
            <span className="text-sm">
              Goals: <strong>{record.goalsFor}</strong>
            </span>
            <span className="text-sm text-gray-500">—</span>
            <span className="text-sm">
              Conceded: <strong>{record.goalsAgainst}</strong>
            </span>
          </div>
        )}

        {topPlayer && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Top Player
            </h3>
            <Link href={`/players/${topPlayer.playerId}`}>
              <Card className="p-4 hover:opacity-90 transition-opacity">
                <CardContent className="pt-0 flex items-center gap-4">
                  <PlayerAvatar
                    player={{
                      playerId: topPlayer.playerId,
                      name: topPlayer.playerName,
                      pictureUrl: topPlayer.pictureUrl,
                      joinedAt: "",
                    }}
                    size="lg"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{topPlayer.playerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ⚽ {(topPlayer.stats.goal ?? 0)} · 🅰️ {(topPlayer.stats.assist ?? 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
