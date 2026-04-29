import { apiClient } from "@/lib/apiClient";
import { LocalStorageLeagueRepository } from "./localStorage/league.repository";
import { LocalStorageTeamRepository } from "./localStorage/team.repository";
import { LocalStoragePlayerRepository } from "./localStorage/player.repository";
import { LocalStorageLeaguePlayerRepository } from "./localStorage/leaguePlayer.repository";
import { LocalStorageGameRepository } from "./localStorage/game.repository";
import { LocalStorageStatRepository } from "./localStorage/stat.repository";
import { LocalStorageStatTypeRepository } from "./localStorage/statType.repository";

const isProduction = process.env.NEXT_PUBLIC_PRODUCTION === "true";

const localStorageRepositories = {
  league: new LocalStorageLeagueRepository(),
  team: new LocalStorageTeamRepository(),
  player: new LocalStoragePlayerRepository(),
  leaguePlayer: new LocalStorageLeaguePlayerRepository(),
  game: new LocalStorageGameRepository(),

  stat: new LocalStorageStatRepository(),
  statType: new LocalStorageStatTypeRepository(),
};

/**
 * Production (NEXT_PUBLIC_PRODUCTION=true): Uses API client - data comes from
 * Sheets via API routes (credentials are server-only, not available in browser).
 * Development: Uses LocalStorage for testing.
 */
export const repositories = isProduction ? apiClient : localStorageRepositories;
