"use client";

import { useState } from "react";
import { X, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useLeagueForm } from "@/hooks/useLeagueForm";
import { useCreateLeague } from "@/hooks/useCreateLeague";
import { generateAccessCode } from "@/core/utils/accessCode.util";
import { useToast } from "@/components/ui/Toast";

interface CreateLeagueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateLeagueModal({ isOpen, onClose }: CreateLeagueModalProps) {
  const toast = useToast();
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

  const [teamInput, setTeamInput] = useState("");
  const [accessCode] = useState(() => generateAccessCode());

  const createLeague = useCreateLeague();

  const handleClose = () => {
    resetForm();
    setTeamInput("");
    onClose();
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
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(accessCode);
      }
      toast.show(`League created! Code: ${accessCode} (copied)`);
      handleClose();
    } catch {
      toast.show("Failed to create league");
    }
  };

  const handleAddTeam = () => {
    if (addTeam(teamInput)) {
      setTeamInput("");
    }
  };

  const handleCopyCode = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(accessCode);
      toast.show("Code copied to clipboard");
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
        onClick={handleClose}
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="bg-background w-full max-w-lg max-h-[90vh] overflow-auto rounded-t-2xl sm:rounded-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-background border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Create League</h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Step {currentStep} of 3
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">League Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm({ name: e.target.value })}
                    placeholder="e.g. Spring 2025 League"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Season *</label>
                  <input
                    type="text"
                    value={formData.season}
                    onChange={(e) => updateForm({ season: e.target.value })}
                    placeholder="e.g. 2025 or 2024/25"
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description (optional)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder="Max 200 characters"
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" onClick={handleClose} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    Next
                  </Button>
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
                      className="flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-background"
                    />
                    <Button type="button" onClick={handleAddTeam}>
                      Add Team
                    </Button>
                  </div>
                  {teamError && (
                    <p className="text-sm text-red-500 mt-1">{teamError}</p>
                  )}
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
                <div className="flex gap-2 pt-4">
                  <Button variant="secondary" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1" disabled={formData.teams.length < 2}>
                    Next
                  </Button>
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
                    <div className="mt-2">
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
                    <p className="text-amber-600 dark:text-amber-500 text-sm mt-2">
                      Save this code — it&apos;s the only way to manage this league.
                    </p>
                    <ul className="mt-2 text-sm space-y-1">
                      {formData.teams.map((name) => (
                        <li key={name}>{name}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <div className="flex gap-2 pt-4">
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
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
