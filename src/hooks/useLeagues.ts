"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

const FIVE_MIN = 5 * 60 * 1000;

export function useLeagues() {
  return useQuery({
    queryKey: ["leagues"],
    queryFn: () => repositories.league.getAll(),
    staleTime: FIVE_MIN,
  });
}

export function useLeague(leagueId: string) {
  return useQuery({
    queryKey: ["league", leagueId],
    queryFn: () => repositories.league.getById(leagueId),
    enabled: !!leagueId,
    staleTime: FIVE_MIN,
  });
}

export function useLeagueByAccessCode(accessCode: string) {
  return useQuery({
    queryKey: ["league", "accessCode", accessCode],
    queryFn: () => repositories.league.getByAccessCode(accessCode),
    enabled: !!accessCode && accessCode.length === 6,
    staleTime: FIVE_MIN,
  });
}
