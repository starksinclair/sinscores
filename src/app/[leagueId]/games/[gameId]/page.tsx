"use client";

import { GameDetail } from "@/components/game/GameDetail";
import { useGame } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByGame } from "@/hooks/useStats";
import { usePlayers } from "@/hooks/usePlayers";

export default function GameDetailPage({
  params,
}: {
  params: { leagueId: string; gameId: string };
}) {
  const { leagueId, gameId } = params;
  const { data: game } = useGame(gameId);
  const { data: teams } = useTeamsByLeague(leagueId);
  const { data: stats } = useStatsByGame(gameId);
  const { data: players } = usePlayers();

  const teamMap = new Map(teams?.map((t) => [t.teamId, t]) ?? []);

  if (!game) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  const homeTeam = teamMap.get(game.homeTeamId);
  const awayTeam = teamMap.get(game.awayTeamId);

  if (!homeTeam || !awayTeam) {
    return (
      <div className="p-4 text-center text-red-500">
        Team not found
      </div>
    );
  }

  return (
    <div className="pb-4">
      <GameDetail
        game={game}
        homeTeam={homeTeam}
        awayTeam={awayTeam}
        stats={stats ?? []}
        players={players ?? []}
      />
    </div>
  );
}
