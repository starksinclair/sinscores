"use client";

import { useMemo } from "react";
import { useGamesByLeague } from "./useGames";
import { getTeamRecord } from "@/core/utils/stats.util";

export function useTeamRecord(teamId: string, leagueId: string) {
  const { data: games } = useGamesByLeague(leagueId);

  const record = useMemo(() => {
    if (!games) return null;
    return getTeamRecord(games, teamId);
  }, [games, teamId]);

  return { data: record };
}
