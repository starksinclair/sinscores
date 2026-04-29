"use client";

import { GameCard } from "@/components/game/GameCard";
import { useGamesByLeague } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";

export default function GamesPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { season } = useLeagueSeasonContext();
  const { data: games } = useGamesByLeague(leagueId, season);
  const { data: teams } = useTeamsByLeague(leagueId, season);

  const teamMap = new Map(teams?.map((t) => [t.teamId, t]) ?? []);

  const completed = (games ?? [])
    .filter((g) => g.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
    );
  const live = (games ?? []).filter((g) => g.status === "live");
  const scheduled = (games ?? [])
    .filter((g) => g.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
    );

  return (
    <div className="p-4 space-y-6">
      {live.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Live
          </h3>
          <div className="space-y-3">
            {live.map((game) => {
              const homeTeam = teamMap.get(game.homeTeamId);
              const awayTeam = teamMap.get(game.awayTeamId);
              if (!homeTeam || !awayTeam) return null;
              return (
                <GameCard
                  key={game.gameId}
                  game={game}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
              );
            })}
          </div>
        </section>
      )}

      {scheduled.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Upcoming
          </h3>
          <div className="space-y-3">
            {scheduled.map((game) => {
              const homeTeam = teamMap.get(game.homeTeamId);
              const awayTeam = teamMap.get(game.awayTeamId);
              if (!homeTeam || !awayTeam) return null;
              return (
                <GameCard
                  key={game.gameId}
                  game={game}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
              );
            })}
          </div>
        </section>
      )}

      {completed.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Results
          </h3>
          <div className="space-y-3">
            {completed.map((game) => {
              const homeTeam = teamMap.get(game.homeTeamId);
              const awayTeam = teamMap.get(game.awayTeamId);
              if (!homeTeam || !awayTeam) return null;
              return (
                <GameCard
                  key={game.gameId}
                  game={game}
                  homeTeam={homeTeam}
                  awayTeam={awayTeam}
                />
              );
            })}
          </div>
        </section>
      )}

      {(!games || games.length === 0) && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No games yet
        </div>
      )}
    </div>
  );
}
