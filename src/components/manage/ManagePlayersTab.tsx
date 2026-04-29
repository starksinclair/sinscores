"use client";

import { useState, useMemo } from "react";
import { Search, Copy, ExternalLink } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { PlayerAvatar } from "@/components/player/PlayerAvatar";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";
import { useLeaguePlayers, usePlayers } from "@/hooks/usePlayers";
import { useTeamsByLeague } from "@/hooks/useTeams";
import { useStatsByLeague } from "@/hooks/useStats";
import { useAssignPlayer } from "@/hooks/useAssignPlayer";
import { useRemovePlayer } from "@/hooks/useRemovePlayer";
import { usePlayerSearch } from "@/hooks/usePlayerSearch";
import { useToast } from "@/components/ui/Toast";
import { generateFormUrl } from "@/core/utils/formUrl.util";
import { Button } from "@/components/ui/Button";

export function ManagePlayersTabContent({ leagueId }: { leagueId: string }) {
  const { season } = useLeagueSeasonContext();
  const [search, setSearch] = useState("");

  const { data: leaguePlayers } = useLeaguePlayers(leagueId, season);
  const { data: players } = usePlayers();
  const { data: teams } = useTeamsByLeague(leagueId, season);
  const { data: stats } = useStatsByLeague(leagueId, season);
  const { otherPlayers, isLoading } = usePlayerSearch(
    search,
    leagueId,
    season,
    leaguePlayers
  );
  const removePlayer = useRemovePlayer();
  const toast = useToast();

  const assignedPlayerIds = new Set(
    (leaguePlayers ?? []).filter((lp) => lp.status === "active").map((lp) => lp.playerId)
  );
  const squadByTeam = useMemo(() => {
    const map = new Map<string, { playerId: string; playerName: string; pictureUrl: string }[]>();
    const leaguePlayerList = leaguePlayers ?? [];
    const playerMap = new Map(players?.map((p) => [p.playerId, p]) ?? []);
    for (const lp of leaguePlayerList) {
      if (lp.status !== "active") continue;
      const player = playerMap.get(lp.playerId);
      if (!player) continue;
      const list = map.get(lp.teamId) ?? [];
      list.push({
        playerId: player.playerId,
        playerName: player.name,
        pictureUrl: player.pictureUrl ?? "",
      });
      map.set(lp.teamId, list);
    }
    return map;
  }, [leaguePlayers, players]);

  const formUrl = generateFormUrl(leagueId, season);

  const handleCopyLink = async () => {
    if (!formUrl) return;
    try {
      await navigator.clipboard.writeText(formUrl);
      toast.show("Link copied to clipboard");
    } catch {
      toast.show("Failed to copy");
    }
  };


  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Share Player Registration Link
        </h4>
        {formUrl ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-300 break-all">
              {formUrl}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <Button size="sm" variant="secondary" onClick={handleCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
              <a
                href={formUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-3 py-1.5 text-sm rounded-lg font-medium border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                Open Form
              </a>
            </div>
            <div className="pt-2">
              <QRCodeSVG value={formUrl} size={128} level="M" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            Form URL not configured. Set NEXT_PUBLIC_FORM_URL in env.
          </p>
        )}
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Add Existing Player
  
        </h4>
        <p className="text-sm text-gray-500 mb-2">
            Search by name for players not in this league...
          </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
         
          <input
            type="search"
            placeholder="Search by name .."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
          />
        </div>
        {search.trim() && (
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Searching...</p>
            ) : (
              <>
                <div>
                  <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                    OTHER PLAYERS
                  </h5>
                  <div className="space-y-2">
                    {otherPlayers.length === 0 ? (
                      <p className="text-sm text-gray-500 py-2">
                        No other matching players
                      </p>
                    ) : (
                      otherPlayers.map((player) => (
                        <PlayerAssignRow
                          key={player.playerId}
                          player={player}
                          leagueId={leagueId}
                          season={season}
                          teams={teams ?? []}
                          isAssigned={assignedPlayerIds.has(player.playerId)}
                        />
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Unassigned players (in this league)
          </h5>
          <div className="space-y-2">
            {(leaguePlayers ?? []).filter((lp) => lp.status === "inactive").length === 0 ? (
              <p className="text-sm text-gray-500 py-2">No unassigned players</p>
            ) : (
              (leaguePlayers ?? [])
                .filter((lp) => lp.status === "inactive")
                .map((lp) => {
                  const player = players?.find((p) => p.playerId === lp.playerId);
                  if (!player) return null;
                  return (
                    <PlayerAssignRow
                      key={lp.id}
                      player={{
                        playerId: player.playerId,
                        name: player.name,
                        pictureUrl: player.pictureUrl,
                      }}
                      leagueId={leagueId}
                      season={season}
                      teams={teams ?? []}
                      isAssigned={false}
                    />
                  );
                })
            )}
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Active Squad
        </h4>
        <div className="space-y-4">
          {(teams ?? []).map((team) => {
            const squad = squadByTeam.get(team.teamId) ?? [];
            console.log(squad);
            if (squad.length === 0) return null;
            return (
              <div
                key={team.teamId}
                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
              >
                <p className="font-medium mb-2">
                  {team.name} ({squad.length} players)
                </p>
                <div className="space-y-2">
                  {squad.map((p) => {
                    const lp = leaguePlayers?.find(
                      (l) => l.playerId === p.playerId && l.teamId === team.teamId
                    );
                    return (
                      <SquadPlayerRow
                        key={p.playerId}
                        playerId={p.playerId}
                        playerName={p.playerName}
                        pictureUrl={p.pictureUrl}
                        leagueId={leagueId}
                        leaguePlayers={leaguePlayers ?? []}
                        stats={stats ?? []}
                        onRemove={
                          lp
                            ? () => {
                                if (
                                  window.confirm(
                                    `Remove ${p.playerName}? Stats preserved.`
                                  )
                                ) {
                                  removePlayer.mutate(lp.id);
                                  toast.show(`${p.playerName} removed`);
                                }
                              }
                            : () => {}
                        }
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PlayerAssignRow({
  player,
  leagueId,
  season,
  teams,
  isAssigned,
}: {
  player: { playerId: string; name: string; pictureUrl?: string };
  leagueId: string;
  season: string;
  teams: { teamId: string; name: string }[];
  isAssigned: boolean;
}) {
  const [showTeamSelect, setShowTeamSelect] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const assignPlayer = useAssignPlayer(leagueId);

  const handleAssign = async () => {
    if (!selectedTeamId) return;
    try {
      await assignPlayer.mutateAsync({
        playerId: player.playerId,
        teamId: selectedTeamId,
        season: season || undefined,
      });
      setShowTeamSelect(false);
      setSelectedTeamId("");
    } catch {
      // Already assigned
    }
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700">
      <PlayerAvatar
        player={{ ...player, joinedAt: "", pictureUrl: player.pictureUrl ?? "" }}
        size="sm"
      />
      <span className="flex-1 font-medium truncate">{player.name}</span>
      {isAssigned ? (
        <span className="text-sm text-green-600">Assigned ✓</span>
      ) : showTeamSelect ? (
        <div className="flex gap-2">
          <select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="px-2 py-1 rounded border text-sm"
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.teamId} value={t.teamId}>
                {t.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAssign}
            className="text-sm text-accent hover:underline"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={() => setShowTeamSelect(false)}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowTeamSelect(true)}
          className="text-sm text-accent hover:underline"
        >
          Assign
        </button>
      )}
    </div>
  );
}

function SquadPlayerRow({
  playerId,
  playerName,
  pictureUrl,
  stats,
  onRemove,
}: {
  playerId: string;
  playerName: string;
  pictureUrl: string;
  leagueId: string;
  leaguePlayers: { id: string; playerId: string; teamId: string }[];
  stats: { playerId: string; statType: string; value: number }[];
  onRemove: () => void;
}) {
  const playerStats = stats.filter((s) => s.playerId === playerId);
  const goals = playerStats
    .filter((s) => s.statType === "goal")
    .reduce((a, s) => a + s.value, 0);
  const assists = playerStats
    .filter((s) => s.statType === "assist")
    .reduce((a, s) => a + s.value, 0);

  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
      <PlayerAvatar
        player={{ playerId, name: playerName, pictureUrl, joinedAt: "" }}
        size="sm"
      />
      <span className="flex-1 font-medium truncate">{playerName}</span>
      <span className="text-sm">
        ⚽ {goals} 🅰️ {assists}
      </span>
      <button
        type="button"
        onClick={onRemove}
        className="text-sm text-red-500 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
