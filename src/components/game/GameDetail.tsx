"use client";

import Link from "next/link";
import { Circle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { formatDate, formatTime, formatScore } from "@/core/utils/format.util";
import { getStatType } from "@/core/constants/stat-types";
import type { IGame } from "@/core/interfaces";
import type { ITeam } from "@/core/interfaces";
import type { IStat } from "@/core/interfaces";
import type { IPlayer } from "@/core/interfaces";

interface GameDetailProps {
  game: IGame;
  homeTeam: ITeam;
  awayTeam: ITeam;
  stats?: IStat[];
  players?: IPlayer[];
}

interface GameEvent {
  statId: string;
  minute?: number;
  playerId: string;
  playerName: string;
  teamId: string;
  teamName: string;
  statType: string;
  icon: string;
  value: number;
}

function buildEventsTimeline(
  stats: IStat[],
  players: IPlayer[],
  teamMap: Map<string, string>,
): GameEvent[] {
  const playerMap = new Map(players.map((p) => [p.playerId, p]));
  const events: GameEvent[] = [];
  for (const s of stats) {
    if (
      s.statType !== "goal" &&
      s.statType !== "own_goal" &&
      s.statType !== "assist"
    )
      continue;
    const config = getStatType(s.statType);
    events.push({
      statId: s.statId,
      minute: s.minute,
      playerId: s.playerId,
      playerName: playerMap.get(s.playerId)?.name ?? "Unknown",
      teamId: s.teamId,
      teamName: teamMap.get(s.teamId) ?? "Unknown",
      statType: s.statType,
      icon: config.icon,
      value: s.value,
    });
  }
  events.sort((a, b) => (a.minute ?? 999) - (b.minute ?? 999));
  return events;
}

export function GameDetail({
  game,
  homeTeam,
  awayTeam,
  stats = [],
  players = [],
}: GameDetailProps) {
  const isLive = game.status === "live";
  const isScheduled = game.status === "scheduled";

  const teamMap = new Map([
    [homeTeam.teamId, homeTeam.name],
    [awayTeam.teamId, awayTeam.name],
  ]);

  const events = buildEventsTimeline(stats, players, teamMap);

  const homePlayerStats = stats.filter((s) => s.teamId === homeTeam.teamId);
  const awayPlayerStats = stats.filter((s) => s.teamId === awayTeam.teamId);
  const playerMap = new Map(players.map((p) => [p.playerId, p]));

  const getPlayerStatPills = (playerId: string, teamStats: IStat[]) => {
    const playerStats = teamStats.filter((s) => s.playerId === playerId);
    const byType = new Map<string, number>();
    for (const s of playerStats) {
      byType.set(s.statType, (byType.get(s.statType) ?? 0) + s.value);
    }
    return Array.from(byType.entries()).map(([type, val]) => {
      const config = getStatType(type);
      return { icon: config.icon, value: val };
    });
  };

  const homePlayerIds = Array.from(new Set(homePlayerStats.map((s) => s.playerId)));
  const awayPlayerIds = Array.from(new Set(awayPlayerStats.map((s) => s.playerId)));

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          {isLive && (
            <Badge variant="live" className="inline-flex items-center gap-1">
              <Circle className="h-1.5 w-1.5 fill-current" />
              LIVE
            </Badge>
          )}
          {game.status === "completed" && (
            <Badge variant="default">Completed</Badge>
          )}
          {isScheduled && (
            <Badge variant="default">Scheduled</Badge>
          )}
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(game.playedAt)} · {formatTime(game.playedAt)}
        </p>
        <div className="flex items-center justify-center gap-6 my-6">
          <div className="flex-1 text-right">
            <p className="font-semibold text-xl">{homeTeam.name}</p>
          </div>
          <div className="text-5xl font-bold tabular-nums shrink-0 px-4">
            {isScheduled ? "vs" : formatScore(game.homeScore, game.awayScore)}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold text-xl">{awayTeam.name}</p>
          </div>
        </div>
      </div>

      {!isScheduled && (
        <>
          <section>
            <h4 className="font-semibold mb-3">Events</h4>
            {events.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 py-4">
                No match events recorded yet
              </p>
            ) : (
              <div className="space-y-2">
                {events.map((e) => (
                  <div
                    key={e.statId}
                    className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <span className="text-lg">{e.icon}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-10">
                      {e.minute != null ? `${e.minute}'` : "—"}
                    </span>
                    <span className="font-medium flex-1">{e.playerName}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      ({e.teamName})
                    </span>
                    {e.value > 1 && (
                      <span className="text-sm font-semibold">×{e.value}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h4 className="font-semibold mb-3">Players</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {homeTeam.name}
                </p>
                <div className="space-y-2">
                  {homePlayerIds.length === 0 ? (
                    <p className="text-sm text-gray-500">—</p>
                  ) : (
                    homePlayerIds.map((playerId) => {
                      const player = playerMap.get(playerId);
                      const pills = getPlayerStatPills(playerId, homePlayerStats);
                      return (
                        <Link
                          key={playerId}
                          href={`/players/${playerId}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <PlayerAvatar
                            player={{
                              playerId,
                              name: player?.name ?? "Unknown",
                              pictureUrl: player?.pictureUrl ?? "",
                              joinedAt: "",
                            }}
                            size="sm"
                          />
                          <span className="text-sm font-medium truncate flex-1">
                            {player?.name ?? "Unknown"}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            {pills.map((p) => (
                              <span key={p.icon} className="text-xs">
                                {p.icon} {p.value}
                              </span>
                            ))}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  {awayTeam.name}
                </p>
                <div className="space-y-2">
                  {awayPlayerIds.length === 0 ? (
                    <p className="text-sm text-gray-500">—</p>
                  ) : (
                    awayPlayerIds.map((playerId) => {
                      const player = playerMap.get(playerId);
                      const pills = getPlayerStatPills(playerId, awayPlayerStats);
                      return (
                        <Link
                          key={playerId}
                          href={`/players/${playerId}`}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <PlayerAvatar
                            player={{
                              playerId,
                              name: player?.name ?? "Unknown",
                              pictureUrl: player?.pictureUrl ?? "",
                              joinedAt: "",
                            }}
                            size="sm"
                          />
                          <span className="text-sm font-medium truncate flex-1">
                            {player?.name ?? "Unknown"}
                          </span>
                          <div className="flex gap-1 shrink-0">
                            {pills.map((p) => (
                              <span key={p.icon} className="text-xs">
                                {p.icon} {p.value}
                              </span>
                            ))}
                          </div>
                        </Link>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
