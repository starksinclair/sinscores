"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";

export function useDeleteStat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (statId: string) => {
      return repositories.stat.delete(statId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["standings"] });
    },
  });
}
