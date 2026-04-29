"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Circle,
  Trash2,
  Play,
  Radio,
  CalendarClock,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";
import { useGamesByLeague } from "@/hooks/useGames";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useAddGame } from "@/hooks/useAddGame";
import { useUpdateScore } from "@/hooks/useUpdateScore";
import { useDeleteGame } from "@/hooks/useDeleteGame";
import { useToast } from "@/components/ui/Toast";
import { addGameSchema } from "@/core/validation/game.schema";
import { formatDate, formatTime, formatScore } from "@/core/utils/format.util";
import { LiveMatchCenter } from "@/components/manage/LiveMatchCenter";
import type { IGame, ITeam } from "@/core/interfaces";

export function ManageGamesTabContent({ leagueId }: { leagueId: string }) {
  const { season } = useLeagueSeasonContext();
  const [showAddForm, setShowAddForm] = useState(false);
  const [openGameId, setOpenGameId] = useState<string | null>(null);
  const [editScoreGameId, setEditScoreGameId] = useState<string | null>(null);

  const { data: games } = useGamesByLeague(leagueId, season);
  const { data: teams } = useTeamsByLeague(leagueId, season);
  const addGame = useAddGame(leagueId);
  const updateScore = useUpdateScore();
  const deleteGame = useDeleteGame();
  const toast = useToast();

  const teamMap = new Map<string, ITeam>(
    (teams ?? []).map((t) => [t.teamId, t]),
  );

  const live = (games ?? []).filter((g) => g.status === "live");
  const upcoming = (games ?? [])
    .filter((g) => g.status === "scheduled")
    .sort(
      (a, b) =>
        new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
    );
  const completed = (games ?? [])
    .filter((g) => g.status === "completed")
    .sort(
      (a, b) =>
        new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
    );

  const openGame = games?.find((g) => g.gameId === openGameId) ?? null;
  const openHome = openGame ? teamMap.get(openGame.homeTeamId) : null;
  const openAway = openGame ? teamMap.get(openGame.awayTeamId) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg">Match Center</h3>
          <p className="text-xs text-gray-500">
            Manage fixtures, score live games, and review results.
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-accent border-accent text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          New Game
        </Button>
      </div>

      <AnimatePresence>
        {showAddForm && (
          <AddGameForm
            teams={teams ?? []}
            onSave={async (data) => {
              await addGame.mutateAsync({
                ...data,
                homeScore: 0,
                awayScore: 0,
                status: "scheduled",
                season: season || undefined,
              });
              toast.show("Game added");
              setShowAddForm(false);
            }}
            onCancel={() => setShowAddForm(false)}
            isLoading={addGame.isPending}
          />
        )}
      </AnimatePresence>

      {/* LIVE */}
      {live.length > 0 && (
        <section>
          <SectionHeader
            icon={<Radio className="h-4 w-4 text-red-500" />}
            label="Live Now"
            count={live.length}
            accent="red"
          />
          <div className="space-y-3">
            {live.map((game) => (
              <LiveGameCard
                key={game.gameId}
                game={game}
                homeTeam={teamMap.get(game.homeTeamId)}
                awayTeam={teamMap.get(game.awayTeamId)}
                onOpen={() => setOpenGameId(game.gameId)}
              />
            ))}
          </div>
        </section>
      )}

      {/* UPCOMING */}
      <section>
        <SectionHeader
          icon={<CalendarClock className="h-4 w-4 text-gray-500" />}
          label="Upcoming"
          count={upcoming.length}
        />
        {upcoming.length === 0 ? (
          <EmptyState text="No upcoming games. Tap New Game to schedule one." />
        ) : (
          <div className="space-y-2">
            {upcoming.map((game) => (
              <ScheduledGameRow
                key={game.gameId}
                game={game}
                homeTeam={teamMap.get(game.homeTeamId)}
                awayTeam={teamMap.get(game.awayTeamId)}
                onStart={async () => {
                  await updateScore.mutateAsync({
                    gameId: game.gameId,
                    homeScore: 0,
                    awayScore: 0,
                    status: "live",
                  });
                  toast.show("Match started");
                  setOpenGameId(game.gameId);
                }}
                onDelete={async () => {
                  if (
                    window.confirm(
                      "Delete this scheduled game? All stats will also be deleted.",
                    )
                  ) {
                    await deleteGame.mutateAsync(game.gameId);
                    toast.show("Game deleted");
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* COMPLETED */}
      <section>
        <SectionHeader
          icon={<CheckCircle2 className="h-4 w-4 text-gray-500" />}
          label="Results"
          count={completed.length}
        />
        {completed.length === 0 ? (
          <EmptyState text="No completed games yet." />
        ) : (
          <div className="space-y-2">
            {completed.map((game) => (
              <CompletedGameRow
                key={game.gameId}
                game={game}
                homeTeam={teamMap.get(game.homeTeamId)}
                awayTeam={teamMap.get(game.awayTeamId)}
                onEdit={() => setEditScoreGameId(game.gameId)}
                isEditing={editScoreGameId === game.gameId}
                onCancelEdit={() => setEditScoreGameId(null)}
                onReopen={async () => {
                  if (
                    !window.confirm(
                      "Reopen this match? Its status will change to live.",
                    )
                  )
                    return;
                  await updateScore.mutateAsync({
                    gameId: game.gameId,
                    homeScore: game.homeScore,
                    awayScore: game.awayScore,
                    status: "live",
                  });
                  toast.show("Match reopened");
                  setOpenGameId(game.gameId);
                }}
                onSaveScore={async (homeScore, awayScore) => {
                  await updateScore.mutateAsync({
                    gameId: game.gameId,
                    homeScore,
                    awayScore,
                    status: "completed",
                  });
                  toast.show("Score updated");
                  setEditScoreGameId(null);
                }}
                onDelete={async () => {
                  if (
                    window.confirm(
                      "Delete this game? All stats will also be deleted.",
                    )
                  ) {
                    await deleteGame.mutateAsync(game.gameId);
                    toast.show("Game deleted");
                  }
                }}
              />
            ))}
          </div>
        )}
      </section>

      {(!games || games.length === 0) && !showAddForm && (
        <div className="text-center py-10 text-gray-500 dark:text-gray-400">
          <p className="mb-2">No games yet.</p>
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add your first game
          </Button>
        </div>
      )}

      {openGame && openHome && openAway && (
        <LiveMatchCenter
          game={openGame}
          homeTeam={openHome}
          awayTeam={openAway}
          leagueId={leagueId}
          season={season || undefined}
          onClose={() => setOpenGameId(null)}
        />
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  label,
  count,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  accent?: "red";
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        {icon}
        <h4
          className={`text-sm font-semibold uppercase tracking-wider ${
            accent === "red" ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-300"
          }`}
        >
          {label}
        </h4>
        {count > 0 && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {count}
          </span>
        )}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-6 text-sm text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
      {text}
    </div>
  );
}

function LiveGameCard({
  game,
  homeTeam,
  awayTeam,
  onOpen,
}: {
  game: IGame;
  homeTeam?: ITeam;
  awayTeam?: ITeam;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-xl border-2 border-red-500/40 bg-gradient-to-br from-red-50 to-transparent dark:from-red-950/30 p-4 hover:border-red-500 transition-colors active:scale-[0.995]"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-red-500 text-white uppercase tracking-wider">
          <Circle className="h-1.5 w-1.5 fill-white" />
          Live
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
          <Zap className="h-3.5 w-3.5" />
          Open match center
        </span>
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0 text-right">
          <p className="font-semibold text-base truncate">
            {homeTeam?.name ?? "—"}
          </p>
        </div>
        <div className="shrink-0 text-center">
          <span className="text-3xl font-extrabold tabular-nums text-red-600 dark:text-red-400">
            {formatScore(game.homeScore, game.awayScore)}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="font-semibold text-base truncate">
            {awayTeam?.name ?? "—"}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
        Started {formatTime(game.playedAt)} · {formatDate(game.playedAt)}
      </p>
    </button>
  );
}

function ScheduledGameRow({
  game,
  homeTeam,
  awayTeam,
  onStart,
  onDelete,
}: {
  game: IGame;
  homeTeam?: ITeam;
  awayTeam?: ITeam;
  onStart: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
        <p className="font-medium truncate text-right">{homeTeam?.name ?? "—"}</p>
        <span className="text-xs text-gray-500 px-2">vs</span>
        <p className="font-medium truncate text-left">{awayTeam?.name ?? "—"}</p>
      </div>
      <div className="shrink-0 text-right hidden sm:block">
        <p className="text-xs text-gray-500">{formatDate(game.playedAt)}</p>
        <p className="text-sm font-medium">{formatTime(game.playedAt)}</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={onStart}
          className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
        >
          <Play className="h-3.5 w-3.5" />
          Start
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
          aria-label="Delete game"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CompletedGameRow({
  game,
  homeTeam,
  awayTeam,
  isEditing,
  onEdit,
  onCancelEdit,
  onReopen,
  onSaveScore,
  onDelete,
}: {
  game: IGame;
  homeTeam?: ITeam;
  awayTeam?: ITeam;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onReopen: () => void;
  onSaveScore: (homeScore: number, awayScore: number) => Promise<void>;
  onDelete: () => void;
}) {
  const [homeScore, setHomeScore] = useState(game.homeScore);
  const [awayScore, setAwayScore] = useState(game.awayScore);

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0 grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
          <p className="font-medium truncate text-right">
            {homeTeam?.name ?? "—"}
          </p>
          <span className="font-bold tabular-nums px-2">
            {formatScore(game.homeScore, game.awayScore)}
          </span>
          <p className="font-medium truncate text-left">
            {awayTeam?.name ?? "—"}
          </p>
        </div>
        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-xs text-gray-500">{formatDate(game.playedAt)}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isEditing && (
            <>
              <button
                type="button"
                onClick={onReopen}
                className="p-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                title="Reopen match"
              >
                <Radio className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={onEdit}
                className="px-2 py-1 text-xs font-medium text-accent hover:underline"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                aria-label="Delete game"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
      {isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-center gap-2">
          <input
            type="number"
            min={0}
            value={homeScore}
            onChange={(e) => setHomeScore(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded border text-center"
          />
          <span>—</span>
          <input
            type="number"
            min={0}
            value={awayScore}
            onChange={(e) => setAwayScore(Number(e.target.value))}
            className="w-16 px-2 py-1 rounded border text-center"
          />
          <Button size="sm" onClick={() => onSaveScore(homeScore, awayScore)}>
            Save
          </Button>
          <button
            type="button"
            onClick={onCancelEdit}
            className="text-xs text-gray-500 hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}

function AddGameForm({
  teams,
  onSave,
  onCancel,
  isLoading,
}: {
  teams: { teamId: string; name: string }[];
  onSave: (data: {
    homeTeamId: string;
    awayTeamId: string;
    playedAt: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}) {
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async () => {
    const playedAt = date && time ? `${date}T${time}:00` : "";
    const result = addGameSchema.safeParse({
      homeTeamId,
      awayTeamId,
      playedAt,
    });
    if (!result.success) {
      const errs: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0]?.toString() ?? "unknown";
        errs[path] = issue.message;
      }
      setErrors(errs);
      return;
    }
    setErrors({});
    await onSave({ homeTeamId, awayTeamId, playedAt });
  };

  const awayTeamOptions = teams.filter((t) => t.teamId !== homeTeamId);

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Home Team</label>
            <select
              value={homeTeamId}
              onChange={(e) => {
                setHomeTeamId(e.target.value);
                if (awayTeamId === e.target.value) setAwayTeamId("");
              }}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            >
              <option value="">Select team</option>
              {teams.map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.homeTeamId && (
              <p className="text-sm text-red-500 mt-1">{errors.homeTeamId}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Away Team</label>
            <select
              value={awayTeamId}
              onChange={(e) => setAwayTeamId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            >
              <option value="">Select team</option>
              {awayTeamOptions.map((t) => (
                <option key={t.teamId} value={t.teamId}>
                  {t.name}
                </option>
              ))}
            </select>
            {errors.awayTeamId && (
              <p className="text-sm text-red-500 mt-1">{errors.awayTeamId}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            />
          </div>
        </div>
        {errors.playedAt && (
          <p className="text-sm text-red-500">{errors.playedAt}</p>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSubmit} disabled={isLoading}>
            Save Game
          </Button>
          <button
            type="button"
            onClick={onCancel}
            className="text-sm text-gray-500 hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}
