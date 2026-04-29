/**
 * Mappers for converting between Google Sheets rows (string[]) and domain objects.
 * All values stored as strings in Sheets — mappers handle type conversion.
 */

import type {
  ILeague,
  ISeasonEntry,
  ITeam,
  IPlayer,
  ILeaguePlayer,
  IGame,
  IStat,
  IStatType,
} from "@/core/interfaces";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

function num(val: string, fallback: number): number {
  const n = parseInt(val, 10);
  return Number.isNaN(n) ? fallback : n;
}

function parseGameStatus(val: string): IGame["status"] {
  if (val === "live" || val === "completed") return val;
  return "scheduled";
}

// LeagueMapper: leagueId, name, description, accessCode, createdAt
export const LeagueMapper = {
  fromRow(row: string[]): ILeague {
    return {
      leagueId: at(row, 0),
      name: at(row, 1),
      season: "",
      description: at(row, 2) || undefined,
      accessCode: at(row, 3),
      createdAt: at(row, 4),
    };
  },
  toRow(obj: ILeague): string[] {
    return [
      obj.leagueId,
      obj.name,
      obj.description ?? "",
      obj.accessCode,
      obj.createdAt,
    ];
  },
};

// SeasonMapper: seasonId, leagueId, name, status, createdAt
export const SeasonMapper = {
  fromRow(row: string[]): ISeasonEntry & { seasonId: string; name: string } {
    return {
      seasonId: at(row, 0),
      leagueId: at(row, 1),
      season: at(row, 0),
      name: at(row, 2),
      status: (at(row, 3) === "ended" ? "ended" : "active") as
        | "active"
        | "ended",
      createdAt: at(row, 4),
    };
  },
  toRow(obj: ISeasonEntry & { seasonId?: string; name?: string }): string[] {
    return [
      obj.seasonId ?? obj.season,
      obj.leagueId,
      obj.name ?? obj.season,
      obj.status,
      obj.createdAt,
    ];
  },
};

// TeamMapper: teamId, leagueId, name, createdAt
export const TeamMapper = {
  fromRow(row: string[]): ITeam & { createdAt?: string } {
    return {
      teamId: at(row, 0),
      leagueId: at(row, 1),
      name: at(row, 2),
      createdAt: at(row, 3) || undefined,
    };
  },
  toRow(obj: ITeam & { createdAt?: string }): string[] {
    return [obj.teamId, obj.leagueId, obj.name, obj.createdAt ?? ""];
  },
};

// PlayerMapper: playerId, name, pictureUrl, joinedAt
export const PlayerMapper = {
  fromRow(row: string[]): IPlayer {
    return {
      playerId: at(row, 0),
      name: at(row, 1),
      pictureUrl: at(row, 2),
      joinedAt: at(row, 3),
    };
  },
  toRow(obj: IPlayer): string[] {
    return [obj.playerId, obj.name, obj.pictureUrl, obj.joinedAt];
  },
};

// LeaguePlayerMapper: id, leagueId, seasonId, teamId, playerId, status, joinedAt
// Must handle empty teamId gracefully
export const LeaguePlayerMapper = {
  fromRow(
    row: string[],
  ): ILeaguePlayer & { seasonId?: string; joinedAt?: string } {
    const teamId = at(row, 3);
    return {
      id: at(row, 0),
      leagueId: at(row, 1),
      seasonId: at(row, 2),
      season: at(row, 2) || undefined,
      teamId: teamId || "",
      playerId: at(row, 4),
      status: (at(row, 5) === "unassigned" ? "inactive" : "active") as
        | "active"
        | "inactive",
      joinedAt: at(row, 6) || undefined,
    };
  },
  toRow(
    obj: ILeaguePlayer & { seasonId?: string; joinedAt?: string },
  ): string[] {
    return [
      obj.id,
      obj.leagueId,
      obj.seasonId ?? obj.season ?? "",
      obj.teamId ?? "",
      obj.playerId,
      obj.status,
      obj.joinedAt ?? "",
    ];
  },
};

// GameMapper: gameId, leagueId, seasonId, homeTeamId, awayTeamId, homeScore, awayScore, playedAt, status
// Convert score strings to numbers
export const GameMapper = {
  fromRow(row: string[]): IGame {
    return {
      gameId: at(row, 0),
      leagueId: at(row, 1),
      homeTeamId: at(row, 3),
      awayTeamId: at(row, 4),
      homeScore: num(at(row, 5), 0),
      awayScore: num(at(row, 6), 0),
      playedAt: at(row, 7),
      status: parseGameStatus(at(row, 8)),
      season: at(row, 2) || undefined,
    };
  },
  toRow(obj: IGame): string[] {
    return [
      obj.gameId,
      obj.leagueId,
      obj.season ?? "",
      obj.homeTeamId,
      obj.awayTeamId,
      String(obj.homeScore),
      String(obj.awayScore),
      obj.playedAt,
      obj.status,
    ];
  },
};

// StatMapper: statId, gameId, playerId, teamId, leagueId, seasonId, statType, value, createdAt
// Default value to 1 when empty
export const StatMapper = {
  fromRow(row: string[]): IStat & { createdAt?: string } {
    const valueStr = at(row, 7);
    return {
      statId: at(row, 0),
      gameId: at(row, 1),
      playerId: at(row, 2),
      teamId: at(row, 3),
      leagueId: at(row, 4) || undefined,
      seasonId: at(row, 5) || undefined,
      statType: at(row, 6),
      value: valueStr ? num(valueStr, 1) : 1,
      createdAt: at(row, 8) || undefined,
    };
  },
  toRow(obj: IStat & { createdAt?: string }): string[] {
    return [
      obj.statId,
      obj.gameId,
      obj.playerId,
      obj.teamId,
      obj.leagueId ?? "",
      obj.seasonId ?? "",
      obj.statType,
      String(obj.value),
      obj.createdAt ?? "",
    ];
  },
};

// StatTypeMapper: statType, label, icon, isDefault (TRUE/FALSE string)
export const StatTypeMapper = {
  fromRow(row: string[]): IStatType & { isDefault: boolean } {
    return {
      statType: at(row, 0),
      label: at(row, 1),
      icon: at(row, 2),
      isDefault: at(row, 3).toUpperCase() === "TRUE",
    };
  },
  toRow(obj: IStatType & { isDefault?: boolean }): string[] {
    return [
      obj.statType,
      obj.label,
      obj.icon,
      obj.isDefault === true ? "TRUE" : "FALSE",
    ];
  },
};
