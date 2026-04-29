import type { ILeague } from "../interfaces";

export function getLeagueById(
  leagues: ILeague[],
  leagueId: string,
): ILeague | undefined {
  return leagues.find((l) => l.leagueId === leagueId);
}

export function getLeaguesBySeason(
  leagues: ILeague[],
  season: string,
): ILeague[] {
  return leagues.filter((l) => l.season === season);
}
