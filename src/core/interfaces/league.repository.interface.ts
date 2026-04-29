import type { ILeague } from "./league.interface";
import type { ISeasonEntry } from "./league.interface";
import type { IRepository } from "./repository.interface";

export interface ILeagueRepository extends IRepository<ILeague> {
  getByAccessCode(code: string): Promise<ILeague | null>;
  getSeasons(leagueId: string): Promise<string[]>;
  addSeason(leagueId: string, season: string): Promise<ISeasonEntry>;
  endSeason(leagueId: string, season: string): Promise<void>;
  getSeasonEntries(leagueId: string): Promise<ISeasonEntry[]>;
}
