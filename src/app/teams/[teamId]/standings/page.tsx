"use client";

import { TeamTabs } from "@/components/team/TeamTabs";
import { StatTable } from "@/components/stats/StatTable";
import { useTeam } from "@/hooks/useTeams";
import { useStandings } from "@/hooks/useStandings";

export default function TeamStandingsPage({
  params,
}: {
  params: { teamId: string };
}) {
  const { teamId } = params;
  const { data: team } = useTeam(teamId);
  const { data: standings } = useStandings(team?.leagueId ?? "");

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
      <div className="p-4">
        {standings && standings.length > 0 ? (
          <StatTable
            standings={standings}
            highlightedTeamId={teamId}
            leagueId={team.leagueId}
          />
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No standings yet
          </div>
        )}
      </div>
    </div>
  );
}
