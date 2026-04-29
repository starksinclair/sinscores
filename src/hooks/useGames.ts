"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

const ONE_MIN = 60 * 1000;

export function useGames() {
  return useQuery({
    queryKey: ["games"],
    queryFn: () => repositories.game.getAll(),
    staleTime: ONE_MIN,
  });
}

export function useGame(gameId: string) {
  return useQuery({
    queryKey: ["game", gameId],
    queryFn: () => repositories.game.getById(gameId),
    enabled: !!gameId,
    staleTime: ONE_MIN,
    refetchInterval: (query) =>
      query.state.data?.status === "live" ? 30000 : false,
  });
}

export function useGamesByLeague(leagueId: string, season?: string) {
  return useQuery({
    queryKey: ["games", leagueId, season ?? "all"],
    queryFn: () => repositories.game.getByLeague(leagueId, season ?? "all"),
    enabled: !!leagueId,
    staleTime: ONE_MIN,
    refetchInterval: (query) =>
      (query.state.data ?? []).some((g) => g.status === "live") ? 30000 : false,
  });
}
