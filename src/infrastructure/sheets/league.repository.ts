import type { ILeagueRepository } from "@/core/interfaces";
import type { ILeague, ISeasonEntry } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { LeagueMapper, SeasonMapper } from "./mappers";

const LEAGUES_TAB = "Leagues";
const SEASONS_TAB = "Seasons";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsLeagueRepository implements ILeagueRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<ILeague[]> {
    const rows = await this.client.getRows(LEAGUES_TAB);
    return rows.filter((_, i) => i > 0).map((row) => LeagueMapper.fromRow(row));
  }

  async getById(leagueId: string): Promise<ILeague | null> {
    const all = await this.getAll();
    return all.find((l) => l.leagueId === leagueId) ?? null;
  }

  async getByAccessCode(code: string): Promise<ILeague | null> {
    const all = await this.getAll();
    const lower = code.toLowerCase().trim();
    return all.find((l) => l.accessCode.toLowerCase() === lower) ?? null;
  }

  async create(data: Partial<ILeague>): Promise<ILeague> {
    const leagueId = data.leagueId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const league: ILeague = {
      leagueId,
      name: data.name ?? "",
      season: data.season ?? "",
      description: data.description,
      accessCode: data.accessCode ?? "",
      createdAt: data.createdAt ?? now,
    };
    const row = LeagueMapper.toRow(league);
    const seasonRow = SeasonMapper.toRow({
      leagueId,
      season: data.season ?? "",
      status: "active",
      createdAt: now,
    });
    await Promise.all([
      this.client.appendRow(LEAGUES_TAB, row),
      this.client.appendRow(SEASONS_TAB, seasonRow),
    ]);
    return league;
  }

  async update(leagueId: string, data: Partial<ILeague>): Promise<ILeague> {
    const rows = await this.client.getRows(LEAGUES_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === leagueId,
    );
    if (rowIndex < 0) {
      throw new Error(`League not found: ${leagueId}`);
    }
    const existing = LeagueMapper.fromRow(rows[rowIndex]);
    const merged: ILeague = {
      ...existing,
      ...data,
      leagueId: existing.leagueId,
    };
    const row = LeagueMapper.toRow(merged);
    await this.client.updateRow(LEAGUES_TAB, rowIndex, row);
    return merged;
  }

  async delete(leagueId: string): Promise<void> {
    const rows = await this.client.getRows(LEAGUES_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === leagueId,
    );
    if (rowIndex < 0) {
      throw new Error(`League not found: ${leagueId}`);
    }
    await this.client.deleteRow(LEAGUES_TAB, rowIndex);
  }

  async getSeasons(leagueId: string): Promise<string[]> {
    const entries = await this.getSeasonEntries(leagueId);
    return entries.map((e) => e.season).filter(Boolean);
  }

  async getSeasonEntries(leagueId: string): Promise<ISeasonEntry[]> {
    const rows = await this.client.getRows(SEASONS_TAB);
    const entries = rows
      .filter((_, i) => i > 0)
      .map((row) => SeasonMapper.fromRow(row))
      .filter((e) => e.leagueId === leagueId)
      .map((e) => ({
        leagueId: e.leagueId,
        season: e.season,
        status: e.status,
        createdAt: e.createdAt,
      }));
    return entries.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async addSeason(leagueId: string, season: string): Promise<ISeasonEntry> {
    const now = new Date().toISOString();
    const entry: ISeasonEntry & { seasonId?: string; name?: string } = {
      leagueId,
      season,
      status: "active",
      createdAt: now,
      seasonId: season,
      name: season,
    };
    const row = SeasonMapper.toRow(entry);
    await this.client.appendRow(SEASONS_TAB, row);
    return {
      leagueId,
      season,
      status: "active",
      createdAt: now,
    };
  }

  async endSeason(leagueId: string, seasonId: string): Promise<void> {
    const rows = await this.client.getRows(SEASONS_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 1) === leagueId && at(row, 0) === seasonId,
    );
    if (rowIndex < 0) {
      throw new Error(`Season not found: ${leagueId}/${seasonId}`);
    }
    const existing = SeasonMapper.fromRow(rows[rowIndex]);
    const updated = { ...existing, status: "ended" as const };
    const row = SeasonMapper.toRow(updated);
    await this.client.updateRow(SEASONS_TAB, rowIndex, row);
  }
}
