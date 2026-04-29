"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import type { ICreateGameInput } from "@/core/interfaces";

export function useAddGame(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<ICreateGameInput, "leagueId">) => {
      return repositories.game.create({
        ...data,
        leagueId,
        homeScore: data.homeScore ?? 0,
        awayScore: data.awayScore ?? 0,
        status: data.status ?? "scheduled",
        season: data.season,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games", leagueId] });
      queryClient.invalidateQueries({ queryKey: ["standings", leagueId] });
    },
  });
}
