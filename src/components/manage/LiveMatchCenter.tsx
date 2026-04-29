"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Undo2, Minus, Plus } from "lucide-react";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useLeaguePlayers, usePlayers } from "@/hooks/usePlayers";
import { useStatsByGame } from "@/hooks/useStats";
import { useAddStat } from "@/hooks/useAddStat";
import { useDeleteStat } from "@/hooks/useDeleteStat";
import { useUpdateScore } from "@/hooks/useUpdateScore";
import { useToast } from "@/components/ui/Toast";
import { getStatType } from "@/core/constants/stat-types";
import type { IGame, ITeam, IPlayer } from "@/core/interfaces";

type ScoringMode = "event" | "manual";

interface Props {
  game: IGame;
  homeTeam: ITeam;
  awayTeam: ITeam;
  leagueId: string;
  season?: string;
  onClose: () => void;
}

/**
 * Full-screen panel for live match event entry.
 * Designed for an admin standing at the sideline holding a phone/tablet:
 * - Huge scoreboard at the top
 * - One tap on a player opens an event chooser
 * - In "event" mode, goals & own-goals update the score automatically
 * - Undo-last-event button for mistakes
 */
export function LiveMatchCenter({
  game,
  homeTeam,
  awayTeam,
  leagueId,
  season,
  onClose,
}: Props) {
  const { data: players } = usePlayers();
  const { data: leaguePlayers } = useLeaguePlayers(leagueId, season);
  const { data: stats } = useStatsByGame(game.gameId);
  const addStat = useAddStat(game.gameId, leagueId, season);
  const deleteStat = useDeleteStat();
  const updateScore = useUpdateScore();
  const toast = useToast();

  const [mode, setMode] = useState<ScoringMode>("event");
  const [pendingPlayer, setPendingPlayer] = useState<{
    player: IPlayer;
    teamId: string;
  } | null>(null);

  const playerMap = useMemo(
    () => new Map((players ?? []).map((p) => [p.playerId, p])),
    [players],
  );

  const homeSquad = useMemo(() => {
    return (leaguePlayers ?? [])
      .filter(
        (lp) => lp.teamId === homeTeam.teamId && lp.status === "active",
      )
      .map((lp) => playerMap.get(lp.playerId))
      .filter((p): p is IPlayer => !!p);
  }, [leaguePlayers, playerMap, homeTeam.teamId]);

  const awaySquad = useMemo(() => {
    return (leaguePlayers ?? [])
      .filter(
        (lp) => lp.teamId === awayTeam.teamId && lp.status === "active",
      )
      .map((lp) => playerMap.get(lp.playerId))
      .filter((p): p is IPlayer => !!p);
  }, [leaguePlayers, playerMap, awayTeam.teamId]);

  const events = useMemo(() => {
    const sorted = [...(stats ?? [])].sort((a, b) => {
      const aMin = a.minute ?? 0;
      const bMin = b.minute ?? 0;
      return bMin - aMin;
    });
    return sorted;
  }, [stats]);

  const playerStatCounts = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (const s of stats ?? []) {
      const curr = map.get(s.playerId) ?? {};
      curr[s.statType] = (curr[s.statType] ?? 0) + s.value;
      map.set(s.playerId, curr);
    }
    return map;
  }, [stats]);

  const handleAddEvent = async (statType: string) => {
    if (!pendingPlayer) return;
    const { player, teamId } = pendingPlayer;

    try {
      await addStat.mutateAsync({
        gameId: game.gameId,
        playerId: player.playerId,
        teamId,
        statType,
        value: 1,
      });

      if (mode === "event" && (statType === "goal" || statType === "own_goal")) {
        let nextHome = game.homeScore;
        let nextAway = game.awayScore;
        if (statType === "goal") {
          if (teamId === game.homeTeamId) nextHome += 1;
          else nextAway += 1;
        } else {
          if (teamId === game.homeTeamId) nextAway += 1;
          else nextHome += 1;
        }
        await updateScore.mutateAsync({
          gameId: game.gameId,
          homeScore: nextHome,
          awayScore: nextAway,
          status: "live",
        });
      }

      const cfg = getStatType(statType);
      toast.show(`${cfg.icon} ${cfg.label.replace(/s$/, "")} — ${player.name}`);
    } catch {
      toast.show("Failed to record event");
    } finally {
      setPendingPlayer(null);
    }
  };

  const handleUndoLast = async () => {
    const last = [...(stats ?? [])].sort(
      (a, b) => (b.minute ?? 0) - (a.minute ?? 0),
    )[0];
    if (!last) return;
    if (!window.confirm("Undo the last recorded event?")) return;

    try {
      await deleteStat.mutateAsync(last.statId);

      if (mode === "event" && (last.statType === "goal" || last.statType === "own_goal")) {
        let nextHome = game.homeScore;
        let nextAway = game.awayScore;
        if (last.statType === "goal") {
          if (last.teamId === game.homeTeamId) nextHome = Math.max(0, nextHome - 1);
          else nextAway = Math.max(0, nextAway - 1);
        } else {
          if (last.teamId === game.homeTeamId) nextAway = Math.max(0, nextAway - 1);
          else nextHome = Math.max(0, nextHome - 1);
        }
        await updateScore.mutateAsync({
          gameId: game.gameId,
          homeScore: nextHome,
          awayScore: nextAway,
          status: "live",
        });
      }
      toast.show("Event removed");
    } catch {
      toast.show("Failed to undo");
    }
  };

  const handleManualScoreChange = async (team: "home" | "away", delta: number) => {
    const nextHome =
      team === "home"
        ? Math.max(0, game.homeScore + delta)
        : game.homeScore;
    const nextAway =
      team === "away"
        ? Math.max(0, game.awayScore + delta)
        : game.awayScore;
    await updateScore.mutateAsync({
      gameId: game.gameId,
      homeScore: nextHome,
      awayScore: nextAway,
      status: game.status === "scheduled" ? "live" : game.status,
    });
  };

  const handleEndMatch = async () => {
    if (!window.confirm("End this match? Scores are locked until reopened.")) {
      return;
    }
    await updateScore.mutateAsync({
      gameId: game.gameId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      status: "completed",
    });
    toast.show("Match completed");
    onClose();
  };

  const handleStartLive = async () => {
    await updateScore.mutateAsync({
      gameId: game.gameId,
      homeScore: game.homeScore,
      awayScore: game.awayScore,
      status: "live",
    });
    toast.show("Match started");
  };

  const isLive = game.status === "live";
  const isScheduled = game.status === "scheduled";

  return (
    <div className="fixed top-0 left-0 right-0 bottom-16 z-40 bg-background flex flex-col max-w-phone mx-auto">
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400">
              <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE
            </span>
          )}
          {isScheduled && (
            <button
              type="button"
              onClick={handleStartLive}
              className="px-3 py-1.5 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600"
            >
              Start Match
            </button>
          )}
          <button
            type="button"
            onClick={handleUndoLast}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:pointer-events-none"
          >
            <Undo2 className="h-4 w-4" />
            Undo
          </button>
        </div>
      </header>

      <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-background dark:from-gray-900">
        <div className="flex items-center justify-center gap-4">
          <TeamScoreBlock
            name={homeTeam.name}
            score={game.homeScore}
            mode={mode}
            onDecrement={() => handleManualScoreChange("home", -1)}
            onIncrement={() => handleManualScoreChange("home", +1)}
          />
          <div className="text-4xl font-bold text-gray-300 dark:text-gray-700 px-2">
            :
          </div>
          <TeamScoreBlock
            name={awayTeam.name}
            score={game.awayScore}
            mode={mode}
            onDecrement={() => handleManualScoreChange("away", -1)}
            onIncrement={() => handleManualScoreChange("away", +1)}
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Scoring:</span>
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("event")}
              className={`px-3 py-1 text-xs font-semibold ${
                mode === "event"
                  ? "bg-accent text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              Auto (goal = +1)
            </button>
            <button
              type="button"
              onClick={() => setMode("manual")}
              className={`px-3 py-1 text-xs font-semibold ${
                mode === "manual"
                  ? "bg-accent text-white"
                  : "bg-transparent text-gray-500"
              }`}
            >
              Manual
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid grid-cols-2 gap-3">
          <SquadColumn
            teamName={homeTeam.name}
            side="home"
            players={homeSquad}
            playerStatCounts={playerStatCounts}
            onSelectPlayer={(player) =>
              setPendingPlayer({ player, teamId: homeTeam.teamId })
            }
          />
          <SquadColumn
            teamName={awayTeam.name}
            side="away"
            players={awaySquad}
            playerStatCounts={playerStatCounts}
            onSelectPlayer={(player) =>
              setPendingPlayer({ player, teamId: awayTeam.teamId })
            }
          />
        </div>

        {events.length > 0 && (
          <section className="mt-6">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Recent Events
            </h4>
            <div className="space-y-1">
              {events.slice(0, 8).map((ev) => {
                const player = playerMap.get(ev.playerId);
                const cfg = getStatType(ev.statType);
                const isHome = ev.teamId === game.homeTeamId;
                return (
                  <div
                    key={ev.statId}
                    className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
                  >
                    <span className="text-lg">{cfg.icon}</span>
                    <span className="font-medium flex-1 truncate">
                      {player?.name ?? "Unknown"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {isHome ? homeTeam.name : awayTeam.name}
                    </span>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!window.confirm("Remove this event?")) return;
                        await deleteStat.mutateAsync(ev.statId);
                        if (
                          mode === "event" &&
                          (ev.statType === "goal" || ev.statType === "own_goal")
                        ) {
                          let nh = game.homeScore;
                          let na = game.awayScore;
                          if (ev.statType === "goal") {
                            if (ev.teamId === game.homeTeamId)
                              nh = Math.max(0, nh - 1);
                            else na = Math.max(0, na - 1);
                          } else {
                            if (ev.teamId === game.homeTeamId)
                              na = Math.max(0, na - 1);
                            else nh = Math.max(0, nh - 1);
                          }
                          await updateScore.mutateAsync({
                            gameId: game.gameId,
                            homeScore: nh,
                            awayScore: na,
                            status: game.status as
                              | "scheduled"
                              | "live"
                              | "completed",
                          });
                        }
                      }}
                      className="text-red-400 hover:text-red-600 p-1"
                      aria-label="Remove event"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2">
        <button
          type="button"
          onClick={handleEndMatch}
          className="flex-1 px-4 py-3 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700"
        >
          End Match
        </button>
      </div>

      <AnimatePresence>
        {pendingPlayer && (
          <EventPickerSheet
            player={pendingPlayer.player}
            onPick={handleAddEvent}
            onCancel={() => setPendingPlayer(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamScoreBlock({
  name,
  score,
  mode,
  onDecrement,
  onIncrement,
}: {
  name: string;
  score: number;
  mode: ScoringMode;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="flex-1 flex flex-col items-center min-w-0">
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 truncate max-w-full px-2">
        {name}
      </p>
      <div className="flex items-center gap-2">
        {mode === "manual" && (
          <button
            type="button"
            onClick={onDecrement}
            className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Decrease score"
          >
            <Minus className="h-4 w-4" />
          </button>
        )}
        <span className="text-6xl font-bold tabular-nums min-w-[4rem] text-center">
          {score}
        </span>
        {mode === "manual" && (
          <button
            type="button"
            onClick={onIncrement}
            className="h-10 w-10 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Increase score"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function SquadColumn({
  teamName,
  side,
  players,
  playerStatCounts,
  onSelectPlayer,
}: {
  teamName: string;
  side: "home" | "away";
  players: IPlayer[];
  playerStatCounts: Map<string, Record<string, number>>;
  onSelectPlayer: (player: IPlayer) => void;
}) {
  return (
    <div>
      <div
        className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
          side === "home" ? "text-left" : "text-right"
        } text-gray-500 dark:text-gray-400 truncate`}
      >
        {teamName}
      </div>
      <div className="space-y-2">
        {players.length === 0 ? (
          <p className="text-xs text-gray-400 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
            No active squad. Assign players first.
          </p>
        ) : (
          players.map((p) => {
            const counts = playerStatCounts.get(p.playerId) ?? {};
            return (
              <button
                key={p.playerId}
                type="button"
                onClick={() => onSelectPlayer(p)}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-accent hover:bg-accent/5 text-left transition-colors"
              >
                <PlayerAvatar
                  player={{ ...p, pictureUrl: p.pictureUrl ?? "" }}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  {(counts.goal || counts.assist || counts.own_goal) && (
                    <p className="text-xs text-gray-500 truncate">
                      {counts.goal ? `⚽${counts.goal} ` : ""}
                      {counts.assist ? `🅰️${counts.assist} ` : ""}
                      {counts.own_goal ? `🥅${counts.own_goal}` : ""}
                    </p>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

function EventPickerSheet({
  player,
  onPick,
  onCancel,
}: {
  player: IPlayer;
  onPick: (statType: string) => void;
  onCancel: () => void;
}) {
  const options: { statType: string; color: string }[] = [
    { statType: "goal", color: "bg-green-500" },
    { statType: "assist", color: "bg-blue-500" },
    { statType: "own_goal", color: "bg-orange-500" },
    { statType: "yellow", color: "bg-yellow-500" },
    { statType: "red", color: "bg-red-500" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] bg-black/40 flex items-end sm:items-center justify-center pb-16 sm:pb-0"
      onClick={onCancel}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-phone sm:max-w-md mx-auto bg-card rounded-t-2xl sm:rounded-2xl p-4 shadow-xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <PlayerAvatar
            player={{ ...player, pictureUrl: player.pictureUrl ?? "" }}
            size="md"
          />
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{player.name}</p>
            <p className="text-xs text-gray-500">What happened?</p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Cancel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {options.map((o) => {
            const cfg = getStatType(o.statType);
            return (
              <button
                key={o.statType}
                type="button"
                onClick={() => onPick(o.statType)}
                className="flex items-center gap-3 px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent hover:bg-accent/5 active:scale-[0.98] transition-all"
              >
                <span
                  className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${o.color}/10`}
                >
                  {cfg.icon}
                </span>
                <span className="font-medium">{cfg.label.replace(/s$/, "")}</span>
              </button>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

