"use client";

import { LeagueHeader } from "@/components/league/LeagueHeader";
import { LeagueTabs } from "@/components/league/LeagueTabs";
import { SeasonSelector } from "@/components/league/SeasonSelector";
import { StatTable } from "@/components/stats/StatTable";
import { useLeague } from "@/hooks/useLeagues";
import { useStandings } from "@/hooks/useStandings";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";

export default function LeagueStandingsPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { season, setSeason, seasons, isLoading: seasonLoading } = useLeagueSeasonContext();

  const { data: league } = useLeague(leagueId);
  const { data: standings } = useStandings(leagueId, season);

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
      <div className="p-4">
        {standings && standings.length > 0 ? (
          <StatTable standings={standings} leagueId={leagueId} />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No standings yet
          </div>
        )}
      </div>
    </div>
  );
}
