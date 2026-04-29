import type { IGame } from "../interfaces";
import { calculateStandings } from "../utils/standings.util";
import type { ITeam } from "../interfaces";
import type { IStanding } from "../interfaces";

export function getGameById(games: IGame[], gameId: string): IGame | undefined {
  return games.find((g) => g.gameId === gameId);
}

export function getGamesByLeague(games: IGame[], leagueId: string): IGame[] {
  return games.filter((g) => g.leagueId === leagueId);
}

export function getRecentGames(
  games: IGame[],
  leagueId: string,
  limit: number = 5,
): IGame[] {
  return getGamesByLeague(games, leagueId)
    .sort(
      (a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime(),
    )
    .slice(0, limit);
}

export function getUpcomingGames(
  games: IGame[],
  leagueId: string,
  limit: number = 5,
): IGame[] {
  const now = new Date();
  return getGamesByLeague(games, leagueId)
    .filter((g) => g.status === "scheduled" && new Date(g.playedAt) >= now)
    .sort(
      (a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime(),
    )
    .slice(0, limit);
}

export function getStandings(games: IGame[], teams: ITeam[]): IStanding[] {
  return calculateStandings(games, teams);
}
