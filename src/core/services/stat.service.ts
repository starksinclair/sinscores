import type { IStat, IPlayer } from "../interfaces";
import {
  aggregatePlayerStats,
  getTopScorers as getTopScorersUtil,
} from "../utils/stats.util";
import type { IPlayerStatSummary } from "../interfaces";

export function getStatsByGame(stats: IStat[], gameId: string): IStat[] {
  return stats.filter((s) => s.gameId === gameId);
}

export function getStatsByPlayer(stats: IStat[], playerId: string): IStat[] {
  return stats.filter((s) => s.playerId === playerId);
}

// Note: Stats don't have leagueId - filtering by league happens at repository
// level by joining stats with games. Services receive pre-filtered data.

export function aggregateStats(
  stats: IStat[],
  players: IPlayer[],
  leaguePlayers: { playerId: string; teamId: string }[],
  teams: { teamId: string; name: string }[],
): IPlayerStatSummary[] {
  return aggregatePlayerStats(stats, players, leaguePlayers, teams);
}

export function getTopScorers(
  stats: IStat[],
  players: IPlayer[],
  leaguePlayers: { playerId: string; teamId: string }[],
  teams: { teamId: string; name: string }[],
  limit: number,
): IPlayerStatSummary[] {
  return getTopScorersUtil(stats, players, leaguePlayers, teams, limit);
}
