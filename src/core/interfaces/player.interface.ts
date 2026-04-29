export interface IPlayer {
  playerId: string;
  name: string;
  pictureUrl: string;
  joinedAt: string;
}

export interface ILeaguePlayer {
  id: string;
  leagueId: string;
  teamId: string;
  playerId: string;
  status: "active" | "inactive";
  season?: string;
}

import type { ITeam } from "./team.interface";
import type { ILeague } from "./league.interface";

export interface IPlayerProfile {
  player: IPlayer;
  currentTeam: ITeam;
  currentLeague: ILeague;
  statSummary: Record<string, number>;
}

export interface IPlayerGameLog {
  gameId: string;
  opponentName: string;
  date: string;
  stats: Record<string, number>;
}
