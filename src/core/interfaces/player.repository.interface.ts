import type { IPlayer } from "./player.interface";
import type { IRepository } from "./repository.interface";

export interface IPlayerRepository extends IRepository<IPlayer> {
  search(query: string): Promise<IPlayer[]>;
}
