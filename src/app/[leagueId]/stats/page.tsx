"use client";

import { useState } from "react";
import { LeagueHeader } from "@/components/league/LeagueHeader";
import { LeagueTabs } from "@/components/league/LeagueTabs";
import { SeasonSelector } from "@/components/league/SeasonSelector";
import { TopScorers } from "@/components/stats/TopScorers";
import { Tabs } from "@/components/ui/Tabs";
import { useLeague } from "@/hooks/useLeagues";
import { useTopScorers } from "@/hooks/useTopScorers";
import { useTopAssists } from "@/hooks/useTopAssists";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";

export default function LeagueStatsPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const [subTab, setSubTab] = useState<"scorers" | "assists">("scorers");
  const { season, setSeason, seasons, isLoading: seasonLoading } = useLeagueSeasonContext();

  const { data: league } = useLeague(leagueId);
  const { data: topScorers } = useTopScorers(leagueId, 10, season);
  const { data: topAssists } = useTopAssists(leagueId, 10, season);

  const scorers = subTab === "scorers" ? topScorers : topAssists;

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
            { id: "scorers", label: "Top Scorers" },
            { id: "assists", label: "Top Assists" },
          ]}
          activeId={subTab}
          onChange={(id) => setSubTab(id as "scorers" | "assists")}
        />
        {scorers && scorers.length > 0 ? (
          <TopScorers
            scorers={scorers}
            leagueId={leagueId}
            statType={subTab === "scorers" ? "goal" : "assist"}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No stats yet
          </div>
        )}
      </div>
    </div>
  );
}
