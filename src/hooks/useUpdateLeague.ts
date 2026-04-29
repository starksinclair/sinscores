"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/infrastructure/container";
import type { ILeague } from "@/core/interfaces";

export function useUpdateLeague() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leagueId,
      data,
    }: {
      leagueId: string;
      data: Partial<ILeague>;
    }) => {
      return repositories.league.update(leagueId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["league", variables.leagueId],
      });
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
    },
  });
}
