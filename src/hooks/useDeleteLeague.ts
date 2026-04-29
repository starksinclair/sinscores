"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { repositories } from "@/infrastructure/container";

export function useDeleteLeague() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (leagueId: string) => {
      const games = await repositories.game.getByLeague(leagueId, "all");
      for (const g of games) {
        const stats = await repositories.stat.getByGame(g.gameId);
        for (const s of stats) {
          await repositories.stat.delete(s.statId);
        }
        await repositories.game.delete(g.gameId);
      }
      const leaguePlayers = await repositories.leaguePlayer.getByLeague(
        leagueId,
        "",
      );
      for (const lp of leaguePlayers) {
        await repositories.leaguePlayer.delete(lp.id);
      }
      const teams = await repositories.team.getByLeague(leagueId);
      for (const t of teams) {
        await repositories.team.delete(t.teamId);
      }
      await repositories.league.delete(leagueId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      router.push("/");
    },
  });
}
