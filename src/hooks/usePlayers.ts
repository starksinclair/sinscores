"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

const TWO_MIN = 2 * 60 * 1000;

export function usePlayers() {
  return useQuery({
    queryKey: ["players"],
    queryFn: () => repositories.player.getAll(),
    staleTime: TWO_MIN,
  });
}

export function usePlayer(playerId: string) {
  return useQuery({
    queryKey: ["player", playerId],
    queryFn: () => repositories.player.getById(playerId),
    enabled: !!playerId,
    staleTime: TWO_MIN,
  });
}

export function useLeaguePlayers(leagueId: string, season?: string) {
  return useQuery({
    queryKey: ["leaguePlayers", leagueId, season ?? ""],
    queryFn: () =>
      repositories.leaguePlayer.getByLeague(leagueId, season ?? ""),
    enabled: !!leagueId,
    staleTime: TWO_MIN,
  });
}

export function useTeamPlayers(teamId: string) {
  return useQuery({
    queryKey: ["teamPlayers", teamId],
    queryFn: async () => {
      const all = await repositories.leaguePlayer.getAll();
      return all.filter((lp) => lp.teamId === teamId && lp.status === "active");
    },
    enabled: !!teamId,
    staleTime: TWO_MIN,
  });
}

export function usePlayerLeagues(playerId: string) {
  return useQuery({
    queryKey: ["playerLeagues", playerId],
    queryFn: async () => {
      const lps = await repositories.leaguePlayer.getByPlayer(playerId);
      const leagueIds = Array.from(new Set(lps.map((lp) => lp.leagueId)));
      const leagues = await Promise.all(
        leagueIds.map((id) => repositories.league.getById(id)),
      );
      return leagues.filter((l): l is NonNullable<typeof l> => l != null);
    },
    enabled: !!playerId,
    staleTime: TWO_MIN,
  });
}
