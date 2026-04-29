"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useLeagueSeasons(leagueId: string) {
  return useQuery({
    queryKey: ["leagueSeasons", leagueId],
    queryFn: () => repositories.league.getSeasons(leagueId),
    enabled: !!leagueId,
    staleTime: 5 * 60 * 1000,
  });
}
