"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStandings } from "@/hooks/useStandings";
import { StatTable } from "@/components/stats/StatTable";

export default function TeamsPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { data: teams } = useTeamsByLeague(leagueId);
  const { data: standings } = useStandings(leagueId);

  return (
    <div className="p-4 space-y-6">
      {standings && standings.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Standings
          </h3>
          <StatTable standings={standings} />
        </section>
      )}

      {teams && teams.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Teams
          </h3>
          <div className="space-y-2">
            {teams.map((team) => (
              <Link key={team.teamId} href={`/${leagueId}/teams/${team.teamId}`}>
                <Card className="p-4 flex items-center justify-between hover:opacity-90 transition-opacity">
                  <span className="font-medium">{team.name}</span>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {(!teams || teams.length === 0) && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No teams yet
        </div>
      )}
    </div>
  );
}
