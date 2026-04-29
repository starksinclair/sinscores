import type { IGameRepository } from "@/core/interfaces";
import type { IGame } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { GameMapper } from "./mappers";

const GAMES_TAB = "Games";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsGameRepository implements IGameRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<IGame[]> {
    const rows = await this.client.getRows(GAMES_TAB);
    return rows.filter((_, i) => i > 0).map((row) => GameMapper.fromRow(row));
  }

  async getById(gameId: string): Promise<IGame | null> {
    const all = await this.getAll();
    return all.find((g) => g.gameId === gameId) ?? null;
  }

  async getByLeague(
    leagueId: string,
    season: string | "all",
  ): Promise<IGame[]> {
    const all = await this.getAll();
    return all.filter((g) => {
      if (g.leagueId !== leagueId) return false;
      if (season !== "all" && g.season && g.season !== season) return false;
      return true;
    });
  }

  async getByTeam(teamId: string): Promise<IGame[]> {
    const all = await this.getAll();
    return all.filter(
      (g) => g.homeTeamId === teamId || g.awayTeamId === teamId,
    );
  }

  async getTodaysGames(): Promise<IGame[]> {
    const today = new Date().toISOString().slice(0, 10);
    const all = await this.getAll();
    return all.filter((g) => g.playedAt.startsWith(today));
  }

  async create(data: Partial<IGame>): Promise<IGame> {
    const gameId = data.gameId ?? crypto.randomUUID();
    const game: IGame = {
      gameId,
      leagueId: data.leagueId ?? "",
      homeTeamId: data.homeTeamId ?? "",
      awayTeamId: data.awayTeamId ?? "",
      homeScore: data.homeScore ?? 0,
      awayScore: data.awayScore ?? 0,
      playedAt: data.playedAt ?? "",
      status: data.status ?? "scheduled",
      season: data.season,
    };
    const row = GameMapper.toRow(game);
    await this.client.appendRow(GAMES_TAB, row);
    return game;
  }

  async update(gameId: string, data: Partial<IGame>): Promise<IGame> {
    const rows = await this.client.getRows(GAMES_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === gameId);
    if (rowIndex < 0) {
      throw new Error(`Game not found: ${gameId}`);
    }
    const existing = GameMapper.fromRow(rows[rowIndex]);
    const merged: IGame = {
      ...existing,
      ...data,
      gameId: existing.gameId,
    };
    const row = GameMapper.toRow(merged);
    await this.client.updateRow(GAMES_TAB, rowIndex, row);
    return merged;
  }

  async delete(gameId: string): Promise<void> {
    const rows = await this.client.getRows(GAMES_TAB);
    const rowIndex = rows.findIndex((row, i) => i > 0 && at(row, 0) === gameId);
    if (rowIndex < 0) {
      throw new Error(`Game not found: ${gameId}`);
    }
    await this.client.deleteRow(GAMES_TAB, rowIndex);
  }
}
