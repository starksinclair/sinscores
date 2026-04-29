import type { IStat } from "./stat.interface";
import type { IRepository } from "./repository.interface";

export interface IStatRepository extends IRepository<IStat> {
  getByGame(gameId: string): Promise<IStat[]>;
  deleteByGame(gameId: string): Promise<void>;
  getByPlayer(
    playerId: string,
    leagueId?: string,
    season?: string,
  ): Promise<IStat[]>;
  getByLeague(leagueId: string, season: string): Promise<IStat[]>;
}
