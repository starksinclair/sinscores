"use client";

import { useCallback, useState, useEffect } from "react";

const STORAGE_KEY = "favouriteLeagues";

function loadFavourites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveFavourites(ids: string[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export function useFavourites() {
  const [favourites, setFavourites] = useState<string[]>([]);

  useEffect(() => {
    setFavourites(loadFavourites());
  }, []);

  const getFavourites = useCallback(() => favourites, [favourites]);

  const addFavourite = useCallback((leagueId: string) => {
    setFavourites((prev) => {
      if (prev.includes(leagueId)) return prev;
      const next = [...prev, leagueId];
      saveFavourites(next);
      return next;
    });
  }, []);

  const removeFavourite = useCallback((leagueId: string) => {
    setFavourites((prev) => {
      const next = prev.filter((id) => id !== leagueId);
      saveFavourites(next);
      return next;
    });
  }, []);

  const toggleFavourite = useCallback((leagueId: string) => {
    setFavourites((prev) => {
      const has = prev.includes(leagueId);
      const next = has
        ? prev.filter((id) => id !== leagueId)
        : [...prev, leagueId];
      saveFavourites(next);
      return next;
    });
  }, []);

  const isFavourite = useCallback(
    (leagueId: string) => favourites.includes(leagueId),
    [favourites],
  );

  return {
    getFavourites,
    addFavourite,
    removeFavourite,
    toggleFavourite,
    isFavourite,
    favourites,
  };
}
