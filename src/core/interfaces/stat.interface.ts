export interface IStat {
  statId: string;
  gameId: string;
  playerId: string;
  teamId: string;
  statType: string;
  value: number;
  minute?: number;
  leagueId?: string;
  seasonId?: string;
}

export interface IStatType {
  statType: string;
  label: string;
  icon: string;
}

export interface IPlayerStatSummary {
  playerId: string;
  playerName: string;
  pictureUrl: string;
  teamName: string;
  stats: Record<string, number>;
}

export interface IStanding {
  teamId: string;
  teamName: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}
