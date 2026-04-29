"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import { calculateStandings } from "@/core/utils/standings.util";

export function useStandings(leagueId: string, season?: string) {
  return useQuery({
    queryKey: ["standings", leagueId, season ?? ""],
    queryFn: async () => {
      const [games, teams] = await Promise.all([
        repositories.game.getByLeague(leagueId, season ?? "all"),
        repositories.team.getByLeague(leagueId, season),
      ]);
      return calculateStandings(games, teams);
    },
    enabled: !!leagueId,
  });
}
