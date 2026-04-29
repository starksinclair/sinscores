"use client";

import {
  createContext,
  useContext,
  ReactNode,
} from "react";
import { useLeagueSeason } from "@/hooks/useLeagueSeason";

interface LeagueSeasonContextValue {
  season: string;
  setSeason: (season: string) => void;
  seasons: string[];
  isLoading: boolean;
}

const LeagueSeasonContext = createContext<LeagueSeasonContextValue | null>(null);

export function LeagueSeasonProvider({
  leagueId,
  children,
}: {
  leagueId: string;
  children: ReactNode;
}) {
  const value = useLeagueSeason(leagueId);
  return (
    <LeagueSeasonContext.Provider value={value}>
      {children}
    </LeagueSeasonContext.Provider>
  );
}

export function useLeagueSeasonContext() {
  const ctx = useContext(LeagueSeasonContext);
  if (!ctx) {
    return {
      season: "",
      setSeason: () => {},
      seasons: [] as string[],
      isLoading: false,
    };
  }
  return ctx;
}
