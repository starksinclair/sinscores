import type { ITeam } from "../interfaces";

export function getTeamById(teams: ITeam[], teamId: string): ITeam | undefined {
  return teams.find((t) => t.teamId === teamId);
}

export function getTeamsByLeague(teams: ITeam[], leagueId: string): ITeam[] {
  return teams.filter((t) => t.leagueId === leagueId);
}
