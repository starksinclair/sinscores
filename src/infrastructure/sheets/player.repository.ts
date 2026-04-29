import type { IPlayerRepository } from "@/core/interfaces";
import type { IPlayer } from "@/core/interfaces";
import { SheetsClient } from "./sheets.client";
import { PlayerMapper } from "./mappers";

const PLAYERS_TAB = "Players";

function at(row: string[], i: number): string {
  return (row[i] ?? "").trim();
}

export class SheetsPlayerRepository implements IPlayerRepository {
  private client: SheetsClient;

  constructor(spreadsheetId?: string) {
    this.client = new SheetsClient(spreadsheetId);
  }

  async getAll(): Promise<IPlayer[]> {
    const rows = await this.client.getRows(PLAYERS_TAB);
    return rows.filter((_, i) => i > 0).map((row) => PlayerMapper.fromRow(row));
  }

  async getById(playerId: string): Promise<IPlayer | null> {
    const all = await this.getAll();
    return all.find((p) => p.playerId === playerId) ?? null;
  }

  async search(query: string): Promise<IPlayer[]> {
    const all = await this.getAll();
    const lower = query.toLowerCase().trim();
    if (!lower) return all;
    return all.filter((p) => p.name.toLowerCase().includes(lower));
  }

  async create(data: Partial<IPlayer>): Promise<IPlayer> {
    const playerId = data.playerId ?? crypto.randomUUID();
    const now = new Date().toISOString();
    const player: IPlayer = {
      playerId,
      name: data.name ?? "",
      pictureUrl: data.pictureUrl ?? "",
      joinedAt: data.joinedAt ?? now,
    };
    const row = PlayerMapper.toRow(player);
    await this.client.appendRow(PLAYERS_TAB, row);
    return player;
  }

  async update(playerId: string, data: Partial<IPlayer>): Promise<IPlayer> {
    const rows = await this.client.getRows(PLAYERS_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === playerId,
    );
    if (rowIndex < 0) {
      throw new Error(`Player not found: ${playerId}`);
    }
    const existing = PlayerMapper.fromRow(rows[rowIndex]);
    const merged: IPlayer = {
      ...existing,
      ...data,
      playerId: existing.playerId,
    };
    const row = PlayerMapper.toRow(merged);
    await this.client.updateRow(PLAYERS_TAB, rowIndex, row);
    return merged;
  }

  async delete(playerId: string): Promise<void> {
    const rows = await this.client.getRows(PLAYERS_TAB);
    const rowIndex = rows.findIndex(
      (row, i) => i > 0 && at(row, 0) === playerId,
    );
    if (rowIndex < 0) {
      throw new Error(`Player not found: ${playerId}`);
    }
    await this.client.deleteRow(PLAYERS_TAB, rowIndex);
  }
}
