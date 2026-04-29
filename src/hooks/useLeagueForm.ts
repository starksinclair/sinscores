"use client";

import { useState, useCallback } from "react";
import {
  leagueInfoSchema,
  teamNameSchema,
} from "@/core/validation/league.schema";

export interface LeagueFormData {
  name: string;
  season: string;
  description: string;
  teams: string[];
  accessCode: string;
}

const initialFormData: LeagueFormData = {
  name: "",
  season: "",
  description: "",
  teams: [],
  accessCode: "",
};

export function useLeagueForm() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<LeagueFormData>(initialFormData);
  const [teamError, setTeamError] = useState<string | null>(null);

  const nextStep = useCallback((): boolean => {
    if (currentStep === 1) {
      const result = leagueInfoSchema.safeParse({
        name: formData.name,
        season: formData.season,
        description: formData.description || undefined,
      });
      if (!result.success) return false;
      setCurrentStep(2);
      return true;
    }
    if (currentStep === 2) {
      if (formData.teams.length < 2) return false;
      setTeamError(null);
      setCurrentStep(3);
      return true;
    }
    return false;
  }, [currentStep, formData]);

  const prevStep = useCallback(() => {
    setTeamError(null);
    setCurrentStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : 1));
  }, []);

  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setCurrentStep(1);
    setTeamError(null);
  }, []);

  const addTeam = useCallback(
    (name: string): boolean => {
      const result = teamNameSchema.safeParse(name.trim());
      if (!result.success) {
        setTeamError(result.error.issues[0]?.message ?? "Invalid name");
        return false;
      }
      const trimmed = name.trim();
      const exists = formData.teams.some(
        (t) => t.toLowerCase() === trimmed.toLowerCase(),
      );
      if (exists) {
        setTeamError("Team name already added");
        return false;
      }
      if (formData.teams.length >= 20) {
        setTeamError("Maximum 20 teams");
        return false;
      }
      setTeamError(null);
      setFormData((prev) => ({ ...prev, teams: [...prev.teams, trimmed] }));
      return true;
    },
    [formData.teams],
  );

  const removeTeam = useCallback((name: string) => {
    setFormData((prev) => ({
      ...prev,
      teams: prev.teams.filter((t) => t !== name),
    }));
    setTeamError(null);
  }, []);

  const updateForm = useCallback((data: Partial<LeagueFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  }, []);

  return {
    currentStep,
    formData,
    teamError,
    nextStep,
    prevStep,
    resetForm,
    addTeam,
    removeTeam,
    updateForm,
  };
}
