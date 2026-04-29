"use client";

import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { LeagueCard } from "@/components/league/LeagueCard";
import { GameCard } from "@/components/game/GameCard";
import { useLeagues } from "@/hooks/useLeagues";
import { useTeams } from "@/hooks/useTeams";
import { useFavourites } from "@/hooks/useFavourites";
import { useTodayGames } from "@/hooks/useTodayGames";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const { data: leagues, isLoading, error } = useLeagues();
  const { data: teams } = useTeams();
  const { favourites, toggleFavourite, isFavourite } = useFavourites();
  const { games: todayGames, isLoading: todayLoading } = useTodayGames();

  const teamCountByLeague = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of teams ?? []) {
      map.set(t.leagueId, (map.get(t.leagueId) ?? 0) + 1);
    }
    return map;
  }, [teams]);

  const teamMap = useMemo(() => {
    return new Map(teams?.map((t) => [t.teamId, t]) ?? []);
  }, [teams]);

  const filteredLeagues = useMemo(() => {
    if (!leagues) return [];
    const q = search.trim().toLowerCase();
    if (!q) return leagues;
    return leagues.filter((l) => l.name.toLowerCase().includes(q));
  }, [leagues, search]);

  const favouriteLeagues = useMemo(() => {
    if (!leagues) return [];
    const favSet = new Set(favourites);
    return leagues.filter((l) => favSet.has(l.leagueId));
  }, [leagues, favourites]);

  return (
    <PageShell>
      <div className="flex flex-col">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-gray-200 dark:border-gray-800 p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="search"
              placeholder="Search leagues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-foreground placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>
        </div>

        <div className="p-4 space-y-6">
          {isLoading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading leagues...
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-red-500">
              Failed to load leagues
            </div>
          )}

          {favouriteLeagues.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                Favourites
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {favouriteLeagues.map((league) => (
                  <div key={league.leagueId} className="shrink-0 w-[280px]">
                    <LeagueCard
                      league={league}
                      teamCount={teamCountByLeague.get(league.leagueId) ?? 0}
                      isFavourite={true}
                      onToggleFavourite={(e) => {
                        e.preventDefault();
                        toggleFavourite(league.leagueId);
                      }}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              Today&apos;s Games
            </h2>
            {todayLoading ? (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                Loading...
              </div>
            ) : todayGames.length > 0 ? (
              <div className="space-y-3">
                {todayGames.map((game) => {
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
            ) : (
              <div className="text-center py-6 text-gray-500 dark:text-gray-400 text-sm">
                No games scheduled today
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              All Leagues
            </h2>
            {filteredLeagues.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No leagues found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLeagues.map((league) => (
                  <LeagueCard
                    key={league.leagueId}
                    league={league}
                    teamCount={teamCountByLeague.get(league.leagueId) ?? 0}
                    isFavourite={isFavourite(league.leagueId)}
                    onToggleFavourite={(e) => {
                      e.preventDefault();
                      toggleFavourite(league.leagueId);
                    }}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </PageShell>
  );
}
