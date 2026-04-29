"use client";

import { useCallback } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useLeagueSeasons } from "./useLeagueSeasons";

export function useLeagueSeason(leagueId: string) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: seasons = [], isLoading } = useLeagueSeasons(leagueId);

  const seasonFromUrl = searchParams.get("season");
  const season =
    seasonFromUrl && seasons.includes(seasonFromUrl)
      ? seasonFromUrl
      : (seasons[0] ?? "");

  const setSeason = useCallback(
    (newSeason: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (newSeason) {
        params.set("season", newSeason);
      } else {
        params.delete("season");
      }
      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`);
    },
    [pathname, router, searchParams],
  );

  return {
    season,
    setSeason,
    seasons,
    isLoading,
  };
}
