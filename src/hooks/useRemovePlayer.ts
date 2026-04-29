"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useRemovePlayer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (leaguePlayerId: string) => {
      const lp = await repositories.leaguePlayer.getById(leaguePlayerId);
      if (!lp) throw new Error("League player not found");
      return repositories.leaguePlayer.update(leaguePlayerId, {
        status: "inactive",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaguePlayers"] });
    },
  });
}
