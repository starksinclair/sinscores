"use client";

import { useMemo } from "react";
import { useStatsByLeague } from "./useStats";
import { useLeaguePlayers } from "./usePlayers";
import { usePlayers } from "./usePlayers";
import { useTeamsByLeague } from "./useTeams";
import { getPlayerOfSeason } from "@/core/utils/stats.util";

export function usePlayerOfSeason(leagueId: string, season?: string) {
  const { data: stats } = useStatsByLeague(leagueId, season);
  const { data: leaguePlayers } = useLeaguePlayers(leagueId, season);
  const { data: players } = usePlayers();
  const { data: teams } = useTeamsByLeague(leagueId, season);

  const playerOfSeason = useMemo(() => {
    if (!stats || !leaguePlayers || !players || !teams) return null;
    return getPlayerOfSeason(
      stats,
      leaguePlayers.map((lp) => ({ playerId: lp.playerId, teamId: lp.teamId })),
      players,
      teams.map((t) => ({ teamId: t.teamId, name: t.name })),
    );
  }, [stats, leaguePlayers, players, teams]);

  return { data: playerOfSeason };
}
