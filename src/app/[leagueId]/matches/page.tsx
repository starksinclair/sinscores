"use client";

import { useState, useMemo } from "react";
import { LeagueHeader } from "@/components/league/LeagueHeader";
import { LeagueTabs } from "@/components/league/LeagueTabs";
import { SeasonSelector } from "@/components/league/SeasonSelector";
import { GameCard } from "@/components/game/GameCard";
import { Tabs } from "@/components/ui/Tabs";
import { useLeague } from "@/hooks/useLeagues";
import { useGamesByLeague } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";

export default function LeagueMatchesPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const [subTab, setSubTab] = useState<"results" | "fixtures">("results");
  const { season, setSeason, seasons, isLoading: seasonLoading } = useLeagueSeasonContext();

  const { data: league } = useLeague(leagueId);
  const { data: games } = useGamesByLeague(leagueId, season);
  const { data: teams } = useTeamsByLeague(leagueId, season);
  const teamMap = new Map(teams?.map((t) => [t.teamId, t]) ?? []);

  const { completed, scheduled } = useMemo(() => {
    const comp =
      [...(games ?? [])]
        .filter((g) => g.status === "completed")
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()) ?? [];
    const sched =
      [...(games ?? [])]
        .filter((g) => g.status === "scheduled")
        .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()) ?? [];
    return { completed: comp, scheduled: sched };
  }, [games]);

  const list = subTab === "results" ? completed : scheduled;

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
      <div className="p-4 space-y-4">
        <Tabs
          tabs={[
            { id: "results", label: "Results" },
            { id: "fixtures", label: "Fixtures" },
          ]}
          activeId={subTab}
          onChange={(id) => setSubTab(id as "results" | "fixtures")}
        />
        <div className="space-y-3">
          {list.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No {subTab === "results" ? "results" : "fixtures"} yet
            </div>
          ) : (
            list.map((game) => {
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
            })
          )}
        </div>
      </div>
    </div>
  );
}
