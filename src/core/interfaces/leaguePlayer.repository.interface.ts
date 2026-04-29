import type { ILeaguePlayer } from "./player.interface";
import type { IRepository } from "./repository.interface";

export interface ILeaguePlayerRepository extends IRepository<ILeaguePlayer> {
  getByLeague(leagueId: string, season: string): Promise<ILeaguePlayer[]>;
  getByPlayer(playerId: string): Promise<ILeaguePlayer[]>;
  getByTeam(
    teamId: string,
    leagueId: string,
    season: string,
  ): Promise<ILeaguePlayer[]>;
  assignPlayer(
    leagueId: string,
    teamId: string,
    playerId: string,
    season?: string,
  ): Promise<ILeaguePlayer>;
}
