"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useLeagueForm } from "@/hooks/useLeagueForm";
import { useCreateLeague } from "@/hooks/useCreateLeague";
import { generateAccessCode } from "@/core/utils/accessCode.util";
import { useToast } from "@/components/ui/Toast";
import { leagueInfoSchema } from "@/core/validation/league.schema";

export default function CreateLeaguePage() {
  const toast = useToast();
  const [teamInput, setTeamInput] = useState("");
  const [accessCode] = useState(() => generateAccessCode());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const {
    currentStep,
    formData,
    teamError,
    nextStep,
    prevStep,
    resetForm,
    addTeam,
    removeTeam,
    updateForm,
  } = useLeagueForm();

  const createLeague = useCreateLeague({
    onSuccess: async (_, input) => {
      toast.show(`League created! Code: ${input.accessCode}`);
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(input.accessCode);
      }
    },
  });

  const handleNextStep1 = () => {
    const result = leagueInfoSchema.safeParse({
      name: formData.name,
      season: formData.season,
      description: formData.description || undefined,
    });
    if (!result.success) {
      const errors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const path = issue.path[0]?.toString() ?? "unknown";
        errors[path] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    nextStep();
  };

  const handleAddTeam = () => {
    if (addTeam(teamInput)) {
      setTeamInput("");
    }
  };

  const handleCreate = async () => {
    try {
      await createLeague.mutateAsync({
        name: formData.name,
        season: formData.season,
        description: formData.description || undefined,
        teams: formData.teams,
        accessCode,
      });
      resetForm();
    } catch {
      toast.show("Failed to create league");
    }
  };

  const handleCopyCode = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(accessCode);
      toast.show("Code copied to clipboard");
    }
  };

  const progressPercent = (currentStep / 3) * 100;

  return (
    <PageShell title="Create League" backFallback="/">
      <div className="flex flex-col min-h-[calc(100vh-3.5rem)]">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-800">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep} of 3
          </span>
        </div>
        <div className="h-1 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-accent transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex-1 p-4 overflow-auto">
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">League Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  placeholder="e.g. Spring 2025 League"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-foreground"
                />
                {fieldErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.name}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Season *</label>
                <input
                  type="text"
                  value={formData.season}
                  onChange={(e) => updateForm({ season: e.target.value })}
                  placeholder="e.g. 2025 or 2024/25"
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-foreground"
                />
                {fieldErrors.season && (
                  <p className="text-sm text-red-500 mt-1">{fieldErrors.season}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description (optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="Max 200 characters"
                  maxLength={200}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-foreground resize-none"
                />
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Add Teams (min 2)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={teamInput}
                    onChange={(e) => setTeamInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTeam())}
                    placeholder="Team name"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background text-foreground"
                  />
                  <Button type="button" onClick={handleAddTeam}>
                    Add
                  </Button>
                </div>
                {teamError && <p className="text-sm text-red-500 mt-1">{teamError}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.teams.map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent/20 text-accent text-sm"
                  >
                    {name}
                    <button
                      type="button"
                      onClick={() => removeTeam(name)}
                      className="hover:opacity-80"
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-4">
                  <p className="font-semibold">{formData.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{formData.season}</p>
                  {formData.description && (
                    <p className="text-sm mt-2">{formData.description}</p>
                  )}
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Access code</p>
                    <p className="text-2xl font-bold tracking-widest">{accessCode}</p>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-2 mt-2 text-sm text-accent hover:underline"
                    >
                      <Copy className="h-4 w-4" />
                      Copy code
                    </button>
                  </div>
                  <p className="text-amber-600 dark:text-amber-500 text-sm mt-3">
                    Save this code — it is the only way to manage this league.
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium mb-1">Teams</p>
                    <ul className="text-sm space-y-1">
                      {formData.teams.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-background flex gap-2">
          {currentStep === 1 && (
            <Button onClick={handleNextStep1} className="flex-1">
              Next
            </Button>
          )}
          {currentStep === 2 && (
            <>
              <Button variant="secondary" onClick={prevStep} className="flex-1">
                Back
              </Button>
              <Button onClick={nextStep} className="flex-1" disabled={formData.teams.length < 2}>
                Next
              </Button>
            </>
          )}
          {currentStep === 3 && (
            <>
              <Button variant="secondary" onClick={prevStep} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleCreate}
                className="flex-1"
                disabled={createLeague.isPending}
              >
                {createLeague.isPending ? "Creating..." : "Create League"}
              </Button>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}
