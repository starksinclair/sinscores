"use client";

import { TeamBadge } from "./TeamBadge";

interface TeamRowProps {
  teamName: string;
  teamId: string;
  stats?: {
    played?: number;
    won?: number;
    drawn?: number;
    lost?: number;
    goalsFor?: number;
    goalsAgainst?: number;
    goalDifference?: number;
    points?: number;
  };
  position?: number;
  isHighlighted?: boolean;
}

export function TeamRow({
  teamName,
  teamId,
  stats,
  position,
  isHighlighted,
}: TeamRowProps) {
  return (
    <div
      className={`grid grid-cols-[1.5rem_1fr_2rem_2rem_2rem_2rem_2rem] gap-x-3 items-center py-3 px-4 border-b border-gray-100 dark:border-gray-800 last:border-0 text-sm tabular-nums ${
        isHighlighted ? "bg-accent/5 dark:bg-accent/10" : ""
      } ${position && position <= 3 ? "border-l-4 border-l-accent" : ""}`}
    >
      <span className="text-center font-semibold text-gray-500 dark:text-gray-400">
        {position ?? ""}
      </span>
      <TeamBadge teamId={teamId} name={teamName} />
      <span className="text-center">{stats?.played ?? "-"}</span>
      <span className="text-center">{stats?.won ?? "-"}</span>
      <span className="text-center">{stats?.drawn ?? "-"}</span>
      <span className="text-center">{stats?.lost ?? "-"}</span>
      <span className="text-center font-bold text-accent">{stats?.points ?? "-"}</span>
    </div>
  );
}
