"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useAssignPlayer(leagueId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      playerId,
      teamId,
      season,
    }: {
      playerId: string;
      teamId: string;
      season?: string;
    }) => {
      return repositories.leaguePlayer.assignPlayer(
        leagueId,
        teamId,
        playerId,
        season,
      );
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["leaguePlayers", leagueId, variables.season ?? ""],
      });
    },
  });
}
