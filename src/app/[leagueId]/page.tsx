"use client";

import { useState } from "react";
import Link from "next/link";
import { Tv } from "lucide-react";
import { LeagueHeader } from "@/components/league/LeagueHeader";
import { LeagueTabs } from "@/components/league/LeagueTabs";
import { SeasonSelector } from "@/components/league/SeasonSelector";
import { GameCard } from "@/components/game/GameCard";
import { TVScoreboard } from "@/components/game/TVScoreboard";
import { Card, CardContent } from "@/components/ui/Card";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useLeague } from "@/hooks/useLeagues";
import { useGamesByLeague } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useLeaguePlayers } from "@/hooks/usePlayers";
import { usePlayerOfSeason } from "@/hooks/usePlayerOfSeason";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";

export default function LeagueHomePage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { season, setSeason, seasons, isLoading: seasonLoading } = useLeagueSeasonContext();

  const { data: league } = useLeague(leagueId);
  const { data: games } = useGamesByLeague(leagueId, season);
  const { data: teams } = useTeamsByLeague(leagueId, season);
  const { data: leaguePlayers } = useLeaguePlayers(leagueId, season);
  const { data: playerOfSeason } = usePlayerOfSeason(leagueId, season);
  const [tvGameId, setTvGameId] = useState<string | null>(null);

  const teamMap = new Map(teams?.map((t) => [t.teamId, t]) ?? []);

  const liveGames = [...(games ?? [])].filter((g) => g.status === "live");
  const completed = [...(games ?? [])]
    .filter((g) => g.status === "completed")
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  const scheduled = [...(games ?? [])]
    .filter((g) => g.status === "scheduled")
    .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
  const recentResults = completed.slice(0, 3);
  const upcomingFixtures = scheduled.slice(0, 2);

  if (!league) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-4">
      <LeagueHeader league={league} />
      <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
        <SeasonSelector
          leagueId={leagueId}
          selectedSeason={season}
          onSeasonChange={setSeason}
          seasons={seasons}
          isLoading={seasonLoading}
        />
      </div>
      <LeagueTabs leagueId={leagueId} className="sticky top-0 z-10" />

      <div className="p-4 space-y-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {league.name} · {season || league.season} · {teams?.length ?? 0} teams · {leaguePlayers?.length ?? 0} players
        </div>

        {playerOfSeason && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Player of the Season
            </h3>
            <Link href={`/players/${playerOfSeason.playerId}`}>
              <Card className="p-4 hover:opacity-90 transition-opacity">
                <CardContent className="pt-0 flex items-center gap-4">
                  <PlayerAvatar
                    player={{
                      playerId: playerOfSeason.playerId,
                      name: playerOfSeason.playerName,
                      pictureUrl: playerOfSeason.pictureUrl,
                      joinedAt: "",
                    }}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{playerOfSeason.playerName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {playerOfSeason.teamName}
                    </p>
                    <p className="text-sm mt-1">
                      ⚽ {(playerOfSeason.stats.goal ?? 0)} · 🅰️ {(playerOfSeason.stats.assist ?? 0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </section>
        )}

        {liveGames.length > 0 && (
          <section>
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider mb-2 text-red-600 dark:text-red-400">
              <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              Live Now
            </h3>
            <div className="space-y-3">
              {liveGames.map((game) => {
                const homeTeam = teamMap.get(game.homeTeamId);
                const awayTeam = teamMap.get(game.awayTeamId);
                if (!homeTeam || !awayTeam) return null;
                return (
                  <div key={game.gameId} className="relative">
                    <GameCard
                      game={game}
                      homeTeam={homeTeam}
                      awayTeam={awayTeam}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setTvGameId(game.gameId);
                      }}
                      className="absolute top-2 right-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/80 text-white text-xs font-semibold shadow-md hover:bg-black transition-colors"
                      aria-label="Open TV mode"
                    >
                      <Tv className="h-3.5 w-3.5" />
                      TV
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {recentResults.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Recent Results
            </h3>
            <div className="space-y-3">
              {recentResults.map((game) => {
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

        {upcomingFixtures.length > 0 && (
          <section>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Upcoming Fixtures
            </h3>
            <div className="space-y-3">
              {upcomingFixtures.map((game) => {
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
      </div>

      {tvGameId && (() => {
        const tvGame = liveGames.find((g) => g.gameId === tvGameId);
        if (!tvGame) return null;
        const home = teamMap.get(tvGame.homeTeamId);
        const away = teamMap.get(tvGame.awayTeamId);
        if (!home || !away) return null;
        return (
          <TVScoreboard
            game={tvGame}
            homeTeam={home}
            awayTeam={away}
            onClose={() => setTvGameId(null)}
          />
        );
      })()}
    </div>
  );
}
