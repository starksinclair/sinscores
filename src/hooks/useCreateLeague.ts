"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { repositories } from "@/infrastructure/container";
import type { ICreateLeagueInput, ILeague } from "@/core/interfaces";

interface UseCreateLeagueOptions {
  onSuccess?: (
    league: Pick<ILeague, "leagueId">,
    input: ICreateLeagueInput,
  ) => void | Promise<void>;
}

export function useCreateLeague(options?: UseCreateLeagueOptions) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: ICreateLeagueInput) => {
      const league = await repositories.league.create({
        leagueId: crypto.randomUUID?.() ?? `league-${Date.now()}`,
        name: data.name,
        season: data.season,
        description: data.description,
        accessCode: data.accessCode,
        createdAt: new Date().toISOString(),
      });

      for (const name of data.teams) {
        await repositories.team.create({
          leagueId: league.leagueId,
          name,
        });
      }

      return league;
    },
    onSuccess: async (league, variables) => {
      await options?.onSuccess?.(league, variables);
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      router.push(`/${league.leagueId}`);
    },
  });
}
