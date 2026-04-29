import type { IPlayer, ILeaguePlayer } from "../interfaces";

export function getPlayerById(
  players: IPlayer[],
  playerId: string,
): IPlayer | undefined {
  return players.find((p) => p.playerId === playerId);
}

export function getLeaguePlayersByTeam(
  leaguePlayers: ILeaguePlayer[],
  teamId: string,
): ILeaguePlayer[] {
  return leaguePlayers.filter(
    (lp) => lp.teamId === teamId && lp.status === "active",
  );
}

export function getLeaguePlayersByLeague(
  leaguePlayers: ILeaguePlayer[],
  leagueId: string,
): ILeaguePlayer[] {
  return leaguePlayers.filter(
    (lp) => lp.leagueId === leagueId && lp.status === "active",
  );
}
