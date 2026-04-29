"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import { getTopAssists } from "@/core/utils/stats.util";

export function useTopAssists(
  leagueId: string,
  limit: number = 10,
  season?: string,
) {
  return useQuery({
    queryKey: ["topAssists", leagueId, limit, season ?? ""],
    queryFn: async () => {
      const [stats, players, leaguePlayers, teams] = await Promise.all([
        repositories.stat.getByLeague(leagueId, season ?? ""),
        repositories.player.getAll(),
        repositories.leaguePlayer.getByLeague(leagueId, season ?? ""),
        repositories.team.getByLeague(leagueId, season),
      ]);
      return getTopAssists(
        stats,
        players,
        leaguePlayers.map((lp) => ({
          playerId: lp.playerId,
          teamId: lp.teamId,
        })),
        teams.map((t) => ({ teamId: t.teamId, name: t.name })),
        limit,
      );
    },
    enabled: !!leagueId,
  });
}
