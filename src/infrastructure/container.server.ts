import "server-only";
import { SheetsLeagueRepository } from "./sheets/league.repository";
import { SheetsTeamRepository } from "./sheets/team.repository";
import { SheetsPlayerRepository } from "./sheets/player.repository";
import { SheetsLeaguePlayerRepository } from "./sheets/leaguePlayer.repository";
import { SheetsGameRepository } from "./sheets/game.repository";
import { SheetsStatRepository } from "./sheets/stat.repository";
import { SheetsStatTypeRepository } from "./sheets/statType.repository";
import { LocalStorageLeagueRepository } from "./localStorage/league.repository";
import { LocalStorageTeamRepository } from "./localStorage/team.repository";
import { LocalStoragePlayerRepository } from "./localStorage/player.repository";
import { LocalStorageLeaguePlayerRepository } from "./localStorage/leaguePlayer.repository";
import { LocalStorageGameRepository } from "./localStorage/game.repository";
import { LocalStorageStatRepository } from "./localStorage/stat.repository";
import { LocalStorageStatTypeRepository } from "./localStorage/statType.repository";

function getRepositories() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
  const key =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ??
    process.env.GOOGLE_SERVICE_ACCOUNT;
  if (spreadsheetId && key) {
    return {
      league: new SheetsLeagueRepository(spreadsheetId),
      team: new SheetsTeamRepository(spreadsheetId),
      player: new SheetsPlayerRepository(spreadsheetId),
      leaguePlayer: new SheetsLeaguePlayerRepository(spreadsheetId),
      game: new SheetsGameRepository(spreadsheetId),
      stat: new SheetsStatRepository(spreadsheetId),
      statType: new SheetsStatTypeRepository(spreadsheetId),
    };
  }
  return {
    league: new LocalStorageLeagueRepository(),
    team: new LocalStorageTeamRepository(),
    player: new LocalStoragePlayerRepository(),
    leaguePlayer: new LocalStorageLeaguePlayerRepository(),
    game: new LocalStorageGameRepository(),
    stat: new LocalStorageStatRepository(),
    statType: new LocalStorageStatTypeRepository(),
  };
}

export const repositories = getRepositories();
