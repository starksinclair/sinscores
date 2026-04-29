"use client";

import { useMemo } from "react";
import { useGames } from "./useGames";

function isToday(dateStr: string): boolean {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

export function useTodayGames() {
  const { data: games, isLoading, error } = useGames();

  const todayGames = useMemo(() => {
    if (!games) return [];
    return games.filter((g) => isToday(g.playedAt));
  }, [games]);

  return { games: todayGames, isLoading, error };
}
