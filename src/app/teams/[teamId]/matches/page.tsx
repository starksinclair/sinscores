"use client";

import { useState, useMemo } from "react";
import { TeamTabs } from "@/components/team/TeamTabs";
import { GameCard } from "@/components/game/GameCard";
import { Tabs } from "@/components/ui/Tabs";
import { useTeam } from "@/hooks/useTeams";
import { useGamesByLeague } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";

export default function TeamMatchesPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const [subTab, setSubTab] = useState<"results" | "fixtures">("results");

  const { data: team } = useTeam(teamId);
  const { data: games } = useGamesByLeague(team?.leagueId ?? "");
  const { data: teams } = useTeamsByLeague(team?.leagueId ?? "");
  const teamMap = new Map(teams?.map((t) => [t.teamId, t]) ?? []);

  const { completed, scheduled } = useMemo(() => {
    const g = games ?? [];
    const teamGames = g.filter(
      (x) => x.homeTeamId === teamId || x.awayTeamId === teamId,
    );
    return {
      completed: teamGames
        .filter((x) => x.status === "completed")
        .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime()),
      scheduled: teamGames
        .filter((x) => x.status === "scheduled")
        .sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime()),
    };
  }, [games, teamId]);

  const list = subTab === "results" ? completed : scheduled;

  if (!team) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="pb-4">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <h2 className="font-semibold text-lg">{team.name}</h2>
      </div>
      <TeamTabs teamId={teamId} className="sticky top-0 z-10" />
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
