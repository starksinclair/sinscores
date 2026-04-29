"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gameId: string) => {
      const stats = await repositories.stat.getByGame(gameId);
      for (const s of stats) {
        await repositories.stat.delete(s.statId);
      }
      await repositories.game.delete(gameId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}
