import type { ILeaguePlayerRepository } from "@/core/interfaces";
import type { ILeaguePlayer } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { LeaguePlayerMapper } from "./mappers";

const LEAGUE_PLAYERS_TAB = "League_Players";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsLeaguePlayerRepository implements ILeaguePlayerRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<ILeaguePlayer[]> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    return rows
      .filter((_, i) => i > 0)
      .map((row) => LeaguePlayerMapper.fromRow(row));
  }

  async getById(id: string): Promise<ILeaguePlayer | null> {
    const all = await this.getAll();
    return all.find((lp) => lp.id === id) ?? null;
  }

  async getByLeague(
    leagueId: string,
    season: string,
  ): Promise<ILeaguePlayer[]> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    return rows
      .filter((_, i) => i > 0)
      .map((row) => LeaguePlayerMapper.fromRow(row))
      .filter((lp) => {
        if (lp.leagueId !== leagueId) return false;
        if (season !== "all" && lp.season && lp.season !== season) return false;
        return true;
      });
  }

  async getByPlayer(playerId: string): Promise<ILeaguePlayer[]> {
    const all = await this.getAll();
    return all.filter((lp) => lp.playerId === playerId);
  }

  async getByTeam(
    teamId: string,
    leagueId: string,
    season: string,
  ): Promise<ILeaguePlayer[]> {
    const all = await this.getAll();
    return all.filter(
      (lp) =>
        lp.teamId === teamId &&
        lp.leagueId === leagueId &&
        (season === "all" || !lp.season || lp.season === season) &&
        lp.status === "active",
    );
  }

  async getUnassigned(
    leagueId: string,
    seasonId: string,
  ): Promise<ILeaguePlayer[]> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    return rows
      .filter(
        (row, i) =>
          i > 0 &&
          at(row, 1) === leagueId &&
          at(row, 2) === seasonId &&
          at(row, 5) === "unassigned",
      )
      .map((row) => LeaguePlayerMapper.fromRow(row));
  }

  async create(data: Partial<ILeaguePlayer>): Promise<ILeaguePlayer> {
    const id = data.id ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const lp: ILeaguePlayer & { seasonId?: string; joinedAt?: string } = {
      id,
      leagueId: data.leagueId ?? "",
      teamId: data.teamId ?? "",
      playerId: data.playerId ?? "",
      status: data.status ?? "active",
      season: data.season,
      seasonId: data.season,
      joinedAt: now,
    };
    const row = LeaguePlayerMapper.toRow(lp);
    await this.client.appendRow(LEAGUE_PLAYERS_TAB, row);
    return {
      id,
      leagueId: lp.leagueId,
      teamId: lp.teamId,
      playerId: lp.playerId,
      status: lp.status,
      season: lp.season,
    };
  }

  async update(
    id: string,
    data: Partial<ILeaguePlayer>,
  ): Promise<ILeaguePlayer> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === id);
    if (rowIndex < 0) {
      throw new Error(`League player not found: ${id}`);
    }
    const existing = LeaguePlayerMapper.fromRow(rows[rowIndex]);
    const merged: ILeaguePlayer & { seasonId?: string; joinedAt?: string } = {
      ...existing,
      ...data,
      id: existing.id,
    };
    const row = LeaguePlayerMapper.toRow(merged);
    await this.client.updateRow(LEAGUE_PLAYERS_TAB, rowIndex, row);
    return {
      id: merged.id,
      leagueId: merged.leagueId,
      teamId: merged.teamId,
      playerId: merged.playerId,
      status: merged.status,
      season: merged.season,
    };
  }

  async delete(id: string): Promise<void> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === id);
    if (rowIndex < 0) {
      throw new Error(`League player not found: ${id}`);
    }
    await this.client.deleteRow(LEAGUE_PLAYERS_TAB, rowIndex);
  }

  async assignPlayer(
    leagueId: string,
    teamId: string,
    playerId: string,
    season?: string,
  ): Promise<ILeaguePlayer> {
    const rows = await this.client.getRows(LEAGUE_PLAYERS_TAB);
    const seasonId = season ?? "";
    const rowIndex = rows.findIndex(
      (row, i) =>
        i > 0 &&
        at(row, 1) === leagueId &&
        at(row, 4) === playerId &&
        at(row, 2) === seasonId,
    );

    if (rowIndex >= 0) {
      const rawStatus = at(rows[rowIndex], 5);
      const rawTeamId = at(rows[rowIndex], 3);
      const alreadyAssigned =
        rawStatus === "active" && rawTeamId.trim() !== "";
      if (alreadyAssigned) {
        throw new Error("Player already assigned this season");
      }
      const existing = LeaguePlayerMapper.fromRow(rows[rowIndex]);
      const merged: ILeaguePlayer & { seasonId?: string; joinedAt?: string } = {
        ...existing,
        teamId,
        status: "active",
        season: season || existing.season,
        seasonId: season ?? existing.seasonId ?? existing.season,
      };
      const updatedRow = LeaguePlayerMapper.toRow(merged);
      await this.client.updateRow(LEAGUE_PLAYERS_TAB, rowIndex, updatedRow);
      return {
        id: merged.id,
        leagueId: merged.leagueId,
        teamId: merged.teamId,
        playerId: merged.playerId,
        status: "active",
        season: merged.season,
      };
    }

    const now = new Date().toISOString();
    const lp: ILeaguePlayer & { seasonId?: string; joinedAt?: string } = {
      id: crypto.randomUUID(),
      leagueId,
      teamId,
      playerId,
      status: "active",
      season: season || undefined,
      seasonId: season,
      joinedAt: now,
    };
    const row = LeaguePlayerMapper.toRow(lp);
    await this.client.appendRow(LEAGUE_PLAYERS_TAB, row);
    return {
      id: lp.id,
      leagueId,
      teamId,
      playerId,
      status: "active",
      season: lp.season,
    };
  }
}
