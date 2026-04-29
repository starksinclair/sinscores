export interface ITeam {
  teamId: string;
  leagueId: string;
  name: string;
  season?: string;
}

export interface ITeamRecord {
  teamId: string;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
}
