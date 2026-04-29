import type { ITeamRepository } from "@/core/interfaces";
import type { ITeam } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { TeamMapper } from "./mappers";

const TEAMS_TAB = "Teams";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsTeamRepository implements ITeamRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<ITeam[]> {
    const rows = await this.client.getRows(TEAMS_TAB);
    return rows.filter((_, i) => i > 0).map((row) => TeamMapper.fromRow(row));
  }

  async getById(teamId: string): Promise<ITeam | null> {
    const all = await this.getAll();
    return all.find((t) => t.teamId === teamId) ?? null;
  }

  async getByLeague(leagueId: string, season?: string): Promise<ITeam[]> {
    const all = await this.getAll();
    const filtered = all.filter((t) => t.leagueId === leagueId);
    if (season && season !== "all") {
      return filtered.filter((t) => !t.season || t.season === season);
    }
    return filtered;
  }

  async create(data: Partial<ITeam>): Promise<ITeam> {
    const teamId = data.teamId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const team: ITeam & { createdAt?: string } = {
      teamId,
      leagueId: data.leagueId ?? "",
      name: data.name ?? "",
      season: data.season,
      createdAt: now,
    };
    const row = TeamMapper.toRow(team);
    await this.client.appendRow(TEAMS_TAB, row);
    return {
      teamId,
      leagueId: team.leagueId,
      name: team.name,
      season: team.season,
    };
  }

  async update(teamId: string, data: Partial<ITeam>): Promise<ITeam> {
    const rows = await this.client.getRows(TEAMS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === teamId);
    if (rowIndex < 0) {
      throw new Error(`Team not found: ${teamId}`);
    }
    const existing = TeamMapper.fromRow(rows[rowIndex]);
    const merged: ITeam & { createdAt?: string } = {
      ...existing,
      ...data,
      teamId: existing.teamId,
    };
    const row = TeamMapper.toRow(merged);
    await this.client.updateRow(TEAMS_TAB, rowIndex, row);
    return {
      teamId: merged.teamId,
      leagueId: merged.leagueId,
      name: merged.name,
      season: merged.season,
    };
  }

  async delete(teamId: string): Promise<void> {
    const rows = await this.client.getRows(TEAMS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === teamId);
    if (rowIndex < 0) {
      throw new Error(`Team not found: ${teamId}`);
    }
    await this.client.deleteRow(TEAMS_TAB, rowIndex);
  }
}
