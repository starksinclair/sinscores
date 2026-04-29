"use client";

import { PlayerCard } from "@/components/player/PlayerCard";
import { TopScorers } from "@/components/stats/TopScorers";
import { Card, CardContent } from "@/components/ui/Card";
import { useTopScorers } from "@/hooks/useTopScorers";
import { useLeaguePlayers } from "@/hooks/usePlayers";
import { usePlayers } from "@/hooks/usePlayers";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByLeague } from "@/hooks/useStats";
import { aggregatePlayerStats } from "@/core/utils/stats.util";

export default function PlayersPage({
  params,
}: {
  params: { leagueId: string };
}) {
  const { leagueId } = params;
  const { data: topScorers } = useTopScorers(leagueId, 10);
  const { data: leaguePlayers } = useLeaguePlayers(leagueId);
  const { data: players } = usePlayers();
  const { data: teams } = useTeamsByLeague(leagueId);
  const { data: stats } = useStatsByLeague(leagueId);

  const allPlayerStats =
    stats && players && leaguePlayers && teams
      ? aggregatePlayerStats(
          stats,
          players,
          leaguePlayers.map((lp) => ({ playerId: lp.playerId, teamId: lp.teamId })),
          teams.map((t) => ({ teamId: t.teamId, name: t.name }))
        )
      : [];

  return (
    <div className="p-4 space-y-6">
      {topScorers && topScorers.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Top Scorers
          </h3>
          <Card>
            <CardContent className="pt-4">
              <TopScorers scorers={topScorers} leagueId={leagueId} />
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          All Players
        </h3>
        {allPlayerStats.length > 0 ? (
          <div className="space-y-3">
            {allPlayerStats.map((player) => (
              <PlayerCard key={player.playerId} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No players yet
          </div>
        )}
      </section>
    </div>
  );
}
