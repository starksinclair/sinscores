export interface IGame {
  gameId: string;
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  playedAt: string;
  status: "scheduled" | "live" | "completed";
  season?: string;
}

export interface ICreateGameInput {
  leagueId: string;
  homeTeamId: string;
  awayTeamId: string;
  playedAt: string;
  status: "scheduled" | "live" | "completed";
  homeScore: number;
  awayScore: number;
  season?: string;
}

export interface IUpdateScoreInput {
  gameId: string;
  homeScore: number;
  awayScore: number;
  status: "scheduled" | "live" | "completed";
}
