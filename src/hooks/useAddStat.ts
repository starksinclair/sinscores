"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import type { IStat } from "@/core/interfaces";

export function useAddStat(gameId: string, leagueId?: string, season?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<IStat, "statId">) => {
      return repositories.stat.create({
        ...data,
        leagueId: data.leagueId ?? leagueId,
        seasonId: data.seasonId ?? season,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats", "game", gameId] });
      queryClient.invalidateQueries({ queryKey: ["stats", "league"] });
      queryClient.invalidateQueries({ queryKey: ["topScorers"] });
      queryClient.invalidateQueries({ queryKey: ["topAssists"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}
