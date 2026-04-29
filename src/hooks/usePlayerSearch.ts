"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import type { IPlayer } from "@/core/interfaces";
import type { ILeaguePlayer } from "@/core/interfaces";

interface PlayerSearchResult {
  inThisLeague: IPlayer[];
  otherPlayers: IPlayer[];
}

async function fetchPlayerSearch(query: string): Promise<IPlayer[]> {
  if (!query.trim()) return [];
  const res = await fetch(
    `/api/players/search?q=${encodeURIComponent(query.trim())}`,
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
}

export function usePlayerSearch(
  query: string,
  leagueId: string,
  seasonId: string,
  leaguePlayers: ILeaguePlayer[] | undefined,
): PlayerSearchResult & { isLoading: boolean } {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["playerSearch", debouncedQuery],
    queryFn: () => fetchPlayerSearch(debouncedQuery),
    enabled: debouncedQuery.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const inLeagueIds = new Set(
    (leaguePlayers ?? [])
      .filter((lp) => lp.status === "active")
      .map((lp) => lp.playerId),
  );

  const inThisLeague = searchResults.filter((p) => inLeagueIds.has(p.playerId));
  const otherPlayers = searchResults.filter(
    (p) => !inLeagueIds.has(p.playerId),
  );

  return {
    inThisLeague,
    otherPlayers,
    isLoading,
  };
}
