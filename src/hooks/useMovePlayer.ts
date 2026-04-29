"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useMovePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leaguePlayerId,
      newTeamId,
    }: {
      leaguePlayerId: string;
      newTeamId: string;
    }) => {
      return repositories.leaguePlayer.update(leaguePlayerId, {
        teamId: newTeamId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaguePlayers"] });
    },
  });
}
