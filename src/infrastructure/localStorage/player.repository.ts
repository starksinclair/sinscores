import type { IPlayer } from "@/core/interfaces";
import type { IPlayerRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_players";

export class LocalStoragePlayerRepository implements IPlayerRepository {
  async getAll(): Promise<IPlayer[]> {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async getById(playerId: string): Promise<IPlayer | null> {
    const players = await this.getAll();
    return players.find((p) => p.playerId === playerId) ?? null;
  }

  async create(data: Partial<IPlayer>): Promise<IPlayer> {
    const players = await this.getAll();
    const player: IPlayer = {
      playerId: data.playerId ?? localStorageClient.generateId(),
      name: data.name ?? "",
      pictureUrl: data.pictureUrl ?? "",
      joinedAt: data.joinedAt ?? new Date().toISOString().slice(0, 10),
    };
    players.push(player);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(players));
    }
    return player;
  }

  async update(playerId: string, data: Partial<IPlayer>): Promise<IPlayer> {
    const players = await this.getAll();
    const idx = players.findIndex((p) => p.playerId === playerId);
    if (idx === -1) throw new Error("Player not found");
    players[idx] = { ...players[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(players));
    }
    return players[idx];
  }

  async delete(playerId: string): Promise<void> {
    const players = (await this.getAll()).filter(
      (p) => p.playerId !== playerId,
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(players));
    }
  }

  async search(query: string): Promise<IPlayer[]> {
    const players = await this.getAll();
    const q = query.trim().toLowerCase();
    if (!q) return players;
    return players.filter((p) => p.name.toLowerCase().includes(q));
  }
}
