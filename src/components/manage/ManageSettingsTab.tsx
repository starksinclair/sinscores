"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLeague } from "@/hooks/useLeagues";
import { useLeagueSeasonContext } from "@/contexts/LeagueSeasonContext";
import { useUpdateLeague } from "@/hooks/useUpdateLeague";
import { useDeleteLeague } from "@/hooks/useDeleteLeague";
import { useToast } from "@/components/ui/Toast";
import { useManageAccess } from "@/hooks/useManageAccess";
import { repositories } from "@/infrastructure/container";
import { generateAccessCode } from "@/core/utils/accessCode.util";

const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === "true";

export function ManageSettingsTabContent({ leagueId }: { leagueId: string }) {
  const { data: league } = useLeague(leagueId);
  const { getAccessCode } = useManageAccess(leagueId);
  const { season, seasons, setSeason } = useLeagueSeasonContext();
  const [name, setName] = useState(league?.name ?? "");
  const [description, setDescription] = useState(league?.description ?? "");
  const [newSeasonName, setNewSeasonName] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const updateLeague = useUpdateLeague();
  const deleteLeague = useDeleteLeague();
  const toast = useToast();

  if (!league) return null;

  const handleSaveLeague = async () => {
    await updateLeague.mutateAsync({ leagueId, data: { name, description } });
    toast.show("League updated");
  };

  const handleAddSeason = async () => {
    if (!newSeasonName.trim() || newSeasonName.length < 2) {
      toast.show("Season name required (min 2 chars)");
      return;
    }
    const existingSeasons = await repositories.league.getSeasons(leagueId);
    if (existingSeasons.includes(newSeasonName.trim())) {
      toast.show("Season already exists");
      return;
    }
    await repositories.league.addSeason(leagueId, newSeasonName.trim());
    const teams = await repositories.team.getByLeague(leagueId, season);
    for (const t of teams) {
      await repositories.team.create({
        leagueId,
        name: t.name,
        season: newSeasonName.trim(),
      });
    }
    setNewSeasonName("");
    setSeason(newSeasonName.trim());
    toast.show(`Season ${newSeasonName.trim()} created`);
  };

  const handleRegenerateCode = async () => {
    if (!window.confirm("The current code will stop working immediately. Continue?")) return;
    const newCode = generateAccessCode();
    await repositories.league.update(leagueId, { accessCode: newCode });
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(`nl_manage_${leagueId}`);
      sessionStorage.removeItem(`nl_manage_code_${leagueId}`);
    }
    toast.show("Code regenerated. Enter new code to continue.");
    window.location.href = `/${leagueId}/manage`;
  };

  const accessCode = isProduction ? getAccessCode() : (league as { accessCode?: string }).accessCode;

  const handleCopyCode = async () => {
    if (navigator.clipboard && accessCode) {
      await navigator.clipboard.writeText(accessCode);
      toast.show("Copied!");
    }
  };

  const handleDeleteLeague = async () => {
    if (deleteConfirm !== league.name) return;
    await deleteLeague.mutateAsync(leagueId);
    toast.show("League deleted");
  };

  return (
    <div className="space-y-8">
      <section>
        <h4 className="font-semibold mb-3">League Info</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">League Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
            />
          </div>
          <Button onClick={handleSaveLeague} disabled={updateLeague.isPending}>
            Save Changes
          </Button>
        </div>
      </section>

      <section>
        <h4 className="font-semibold mb-3">Seasons</h4>
        <div className="space-y-2 mb-4">
          {seasons.map((s) => (
            <div key={s} className="flex items-center justify-between p-2 rounded border">
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 2025/26"
            value={newSeasonName}
            onChange={(e) => setNewSeasonName(e.target.value)}
            className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
          />
          <Button onClick={handleAddSeason}>Add Season</Button>
        </div>
      </section>

      <section>
        <h4 className="font-semibold mb-3">Access Code</h4>
        <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-2xl font-mono tracking-widest mb-2">
            {accessCode ? accessCode.split("").join(" ") : "—"}
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="secondary" onClick={handleCopyCode}>
              Copy Code
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleRegenerateCode}
              className="border-amber-500 text-amber-600"
            >
              Regenerate Code
            </Button>
          </div>
        </div>
      </section>

      <section className="border-2 border-red-500 rounded-lg p-4">
        <h4 className="font-semibold text-red-500 mb-3">Danger Zone</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Type <strong>{league.name}</strong> to confirm deletion
        </p>
        <input
          type="text"
          value={deleteConfirm}
          onChange={(e) => setDeleteConfirm(e.target.value)}
          placeholder="League name"
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background mb-2"
        />
        <Button
          variant="danger"
          onClick={handleDeleteLeague}
          disabled={deleteConfirm !== league.name || deleteLeague.isPending}
        >
          Delete League
        </Button>
      </section>
    </div>
  );
}
