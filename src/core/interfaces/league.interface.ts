export interface ILeague {
  leagueId: string;
  name: string;
  season: string;
  description?: string;
  accessCode: string;
  createdAt: string;
}

export interface ILeagueSeason {
  leagueId: string;
  season: string;
}

export interface ISeasonEntry {
  leagueId: string;
  season: string;
  status: "active" | "ended";
  createdAt: string;
}

export interface ICreateLeagueInput {
  name: string;
  season: string;
  description?: string;
  teams: string[];
  accessCode: string;
}
