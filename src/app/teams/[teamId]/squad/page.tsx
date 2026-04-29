"use client";

import Link from "next/link";
import { TeamTabs } from "@/components/team/TeamTabs";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useTeam } from "@/hooks/useTeams";
import { useTeamPlayers } from "@/hooks/usePlayers";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByLeague } from "@/hooks/useStats";
import { usePlayers } from "@/hooks/usePlayers";
import { aggregatePlayerStats } from "@/core/utils/stats.util";

export default function TeamSquadPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const { data: team } = useTeam(teamId);
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
      </div>
      <TeamTabs teamId={teamId} className="sticky top-0 z-10" />
      <div className="p-4">
        {squadStats.length > 0 ? (
          <div className="space-y-3">
            {squadStats.map((player) => (
              <Link
                key={player.playerId}
                href={`/players/${player.playerId}`}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <PlayerAvatar
                  player={{
                    playerId: player.playerId,
                    name: player.playerName,
                    pictureUrl: player.pictureUrl,
                    joinedAt: "",
                  }}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{player.playerName}</p>
                </div>
                <div className="flex gap-2 shrink-0 text-sm">
                  <span>⚽ {player.stats.goal ?? 0}</span>
                  <span>🅰️ {player.stats.assist ?? 0}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No players assigned yet
          </div>
        )}
      </div>
    </div>
  );
}
