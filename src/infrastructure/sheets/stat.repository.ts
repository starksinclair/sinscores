import type { IStatRepository } from "@/core/interfaces";
import type { IStat } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { StatMapper } from "./mappers";

const STATS_TAB = "Stats";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsStatRepository implements IStatRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<IStat[]> {
    const rows = await this.client.getRows(STATS_TAB);
    return rows.filter((_, i) => i > 0).map((row) => StatMapper.fromRow(row));
  }

  async getById(statId: string): Promise<IStat | null> {
    const all = await this.getAll();
    return all.find((s) => s.statId === statId) ?? null;
  }

  async getByGame(gameId: string): Promise<IStat[]> {
    const all = await this.getAll();
    return all.filter((s) => s.gameId === gameId);
  }

  async getByPlayer(
    playerId: string,
    leagueId?: string,
    season?: string,
  ): Promise<IStat[]> {
    const rows = await this.client.getRows(STATS_TAB);
    const stats = rows
      .filter((_, i) => i > 0)
      .map((row) => StatMapper.fromRow(row));
    return stats.filter((s) => {
      if (s.playerId !== playerId) return false;
      if (leagueId && s.leagueId !== leagueId) return false;
      if (season && s.seasonId !== season) return false;
      return true;
    });
  }

  async getByLeague(leagueId: string, season: string): Promise<IStat[]> {
    const rows = await this.client.getRows(STATS_TAB);
    const stats = rows
      .filter((_, i) => i > 0)
      .map((row) => StatMapper.fromRow(row));

    // If stats have leagueId populated, filter by it. For stats missing
    // leagueId (older records), fall back to resolving via gameId.
    const withLeague = stats.filter((s) => s.leagueId === leagueId);
    const missingLeague = stats.filter((s) => !s.leagueId);

    let fromGames: typeof stats = [];
    if (missingLeague.length > 0) {
      // Look up games to resolve leagueId/season for orphaned stats.
      const gameRows = await this.client.getRows("Games");
      const gameIdToMeta = new Map<
        string,
        { leagueId: string; season?: string }
      >();
      for (let i = 1; i < gameRows.length; i++) {
        const row = gameRows[i];
        const gameId = (row[0] ?? "").trim();
        const gLeagueId = (row[1] ?? "").trim();
        const gSeason = (row[2] ?? "").trim() || undefined;
        if (gameId) gameIdToMeta.set(gameId, { leagueId: gLeagueId, season: gSeason });
      }
      fromGames = missingLeague.filter((s) => {
        const meta = gameIdToMeta.get(s.gameId);
        return meta?.leagueId === leagueId;
      });
    }

    const combined = [...withLeague, ...fromGames];

    if (!season || season === "all") return combined;
    return combined.filter((s) => !s.seasonId || s.seasonId === season);
  }

  async deleteByGame(gameId: string): Promise<void> {
    const stats = await this.getByGame(gameId);
    for (const stat of stats) {
      await this.delete(stat.statId);
    }
  }

  async create(data: Partial<IStat>): Promise<IStat> {
    const statId = data.statId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const stat: IStat & { createdAt?: string } = {
      statId,
      gameId: data.gameId ?? "",
      playerId: data.playerId ?? "",
      teamId: data.teamId ?? "",
      statType: data.statType ?? "",
      value: data.value ?? 1,
      minute: data.minute,
      leagueId: data.leagueId,
      seasonId: data.seasonId,
      createdAt: now,
    };
    const row = StatMapper.toRow(stat);
    await this.client.appendRow(STATS_TAB, row);
    return {
      statId,
      gameId: stat.gameId,
      playerId: stat.playerId,
      teamId: stat.teamId,
      statType: stat.statType,
      value: stat.value,
      minute: stat.minute,
      leagueId: stat.leagueId,
      seasonId: stat.seasonId,
    };
  }

  async update(statId: string, data: Partial<IStat>): Promise<IStat> {
    const rows = await this.client.getRows(STATS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === statId);
    if (rowIndex < 0) {
      throw new Error(`Stat not found: ${statId}`);
    }
    const existing = StatMapper.fromRow(rows[rowIndex]);
    const merged: IStat & { createdAt?: string } = {
      ...existing,
      ...data,
      statId: existing.statId,
    };
    const row = StatMapper.toRow(merged);
    await this.client.updateRow(STATS_TAB, rowIndex, row);
    return {
      statId: merged.statId,
      gameId: merged.gameId,
      playerId: merged.playerId,
      teamId: merged.teamId,
      statType: merged.statType,
      value: merged.value,
      minute: merged.minute,
      leagueId: merged.leagueId,
      seasonId: merged.seasonId,
    };
  }

  async delete(statId: string): Promise<void> {
    const rows = await this.client.getRows(STATS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === statId);
    if (rowIndex < 0) {
      throw new Error(`Stat not found: ${statId}`);
    }
    await this.client.deleteRow(STATS_TAB, rowIndex);
  }
}
