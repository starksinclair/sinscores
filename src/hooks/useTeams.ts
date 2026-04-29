"use client";

import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

const FIVE_MIN = 5 * 60 * 1000;

export function useTeams() {
  return useQuery({
    queryKey: ["teams"],
    queryFn: () => repositories.team.getAll(),
    staleTime: FIVE_MIN,
  });
}

export function useTeam(teamId: string) {
  return useQuery({
    queryKey: ["team", teamId],
    queryFn: () => repositories.team.getById(teamId),
    enabled: !!teamId,
    staleTime: FIVE_MIN,
  });
}

export function useTeamsByLeague(leagueId: string, season?: string) {
  return useQuery({
    queryKey: ["teams", leagueId, season ?? ""],
    queryFn: () => repositories.team.getByLeague(leagueId, season),
    enabled: !!leagueId,
    staleTime: FIVE_MIN,
  });
}
