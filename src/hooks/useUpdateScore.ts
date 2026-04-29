"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import type { IUpdateScoreInput } from "@/core/interfaces";

export function useUpdateScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      gameId,
      homeScore,
      awayScore,
      status,
    }: IUpdateScoreInput) => {
      const game = await repositories.game.getById(gameId);
      if (!game) throw new Error("Game not found");
      return repositories.game.update(gameId, {
        homeScore,
        awayScore,
        status,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["game", variables.gameId] });
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}
