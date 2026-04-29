"use client";

import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { IStanding } from "@/core/interfaces";
import { TeamRow } from "@/components/team/TeamRow";

interface StatTableProps {
  standings: IStanding[];
  highlightedTeamId?: string;
  leagueId?: string;
}

export function StatTable({ standings, highlightedTeamId, leagueId }: StatTableProps) {
  return (
    <Card>
      <div className="grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_2rem_2rem] gap-x-3 px-4 py-2 border-b border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-500 dark:text-gray-400">
        <span className="text-center">#</span>
        <span>Team</span>
        <span className="text-center">P</span>
        <span className="text-center">W</span>
        <span className="text-center">D</span>
        <span className="text-center">L</span>
        <span className="text-center font-semibold">Pts</span>
      </div>
      <div>
        {standings.map((standing, index) => {
          const row = (
            <TeamRow
              teamName={standing.teamName}
              teamId={standing.teamId}
              position={index + 1}
              stats={{
                played: standing.played,
                won: standing.won,
                drawn: standing.drawn,
                lost: standing.lost,
                goalsFor: standing.goalsFor,
                goalsAgainst: standing.goalsAgainst,
                goalDifference: standing.goalDifference,
                points: standing.points,
              }}
              isHighlighted={standing.teamId === highlightedTeamId}
            />
          );
          return leagueId ? (
            <Link key={standing.teamId} href={`/teams/${standing.teamId}`} className="block hover:bg-gray-50 dark:hover:bg-gray-800/50">
              {row}
            </Link>
          ) : (
            <div key={standing.teamId}>{row}</div>
          );
        })}
      </div>
    </Card>
  );
}
