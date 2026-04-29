import type { ITeam } from "./team.interface";
import type { IRepository } from "./repository.interface";

export interface ITeamRepository extends IRepository<ITeam> {
  getByLeague(leagueId: string, season?: string): Promise<ITeam[]>;
}
