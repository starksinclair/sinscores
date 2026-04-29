"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

const ONE_MIN = 60 * 1000;

export function useStatsByGame(gameId: string) {
  return useQuery({
    queryKey: ["stats", "game", gameId],
    queryFn: () => repositories.stat.getByGame(gameId),
    enabled: !!gameId,
    staleTime: ONE_MIN,
  });
}

export function useStatsByLeague(leagueId: string, season?: string) {
  return useQuery({
    queryKey: ["stats", "league", leagueId, season ?? ""],
    queryFn: () => repositories.stat.getByLeague(leagueId, season ?? ""),
    enabled: !!leagueId,
    staleTime: ONE_MIN,
  });
}
