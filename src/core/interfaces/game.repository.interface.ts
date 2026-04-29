import type { IGame } from "./game.interface";
import type { IRepository } from "./repository.interface";

export interface IGameRepository extends IRepository<IGame> {
  getByLeague(leagueId: string, season: string | "all"): Promise<IGame[]>;
  getByTeam(teamId: string): Promise<IGame[]>;
  getTodaysGames(): Promise<IGame[]>;
}
