import type { IStat } from "@/core/interfaces";
import type { IStatRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_stats";

export class LocalStorageStatRepository implements IStatRepository {
  async getAll(): Promise<IStat[]> {
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

  async getById(statId: string): Promise<IStat | null> {
    const stats = await this.getAll();
    return stats.find((s) => s.statId === statId) ?? null;
  }

  async create(data: Partial<IStat>): Promise<IStat> {
    const stats = await this.getAll();
    const stat: IStat = {
      statId: data.statId ?? localStorageClient.generateId(),
      gameId: data.gameId ?? "",
      playerId: data.playerId ?? "",
      teamId: data.teamId ?? "",
      statType: data.statType ?? "",
      value: data.value ?? 1,
      minute: data.minute,
      leagueId: data.leagueId,
      seasonId: data.seasonId,
    };
    stats.push(stat);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(stats));
    }
    return stat;
  }

  async update(statId: string, data: Partial<IStat>): Promise<IStat> {
    const stats = await this.getAll();
    const idx = stats.findIndex((s) => s.statId === statId);
    if (idx === -1) throw new Error("Stat not found");
    stats[idx] = { ...stats[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(stats));
    }
    return stats[idx];
  }

  async delete(statId: string): Promise<void> {
    const stats = (await this.getAll()).filter((s) => s.statId !== statId);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(stats));
    }
  }

  async getByGame(gameId: string): Promise<IStat[]> {
    const stats = await this.getAll();
    return stats.filter((s) => s.gameId === gameId);
  }

  async deleteByGame(gameId: string): Promise<void> {
    const stats = await this.getByGame(gameId);
    for (const s of stats) {
      await this.delete(s.statId);
    }
  }

  async getByPlayer(
    playerId: string,
    leagueId?: string,
    season?: string,
  ): Promise<IStat[]> {
    void leagueId;
    void season;
    const stats = await this.getAll();
    return stats.filter((s) => s.playerId === playerId);
  }

  async getByLeague(leagueId: string, season?: string): Promise<IStat[]> {
    const stats = await this.getAll();
    const gamesRaw =
      typeof window !== "undefined" ? localStorage.getItem("nl_games") : null;
    const games: { gameId: string; leagueId: string; season?: string }[] =
      gamesRaw ? JSON.parse(gamesRaw) : [];
    const gameIdsInLeague = new Set(
      games
        .filter((g) => {
          if (g.leagueId !== leagueId) return false;
          if (season && season !== "all" && g.season && g.season !== season) {
            return false;
          }
          return true;
        })
        .map((g) => g.gameId),
    );
    return stats.filter((s) => {
      // Prefer explicit league/season on the stat if present, otherwise fall
      // back to the game's league/season via gameId lookup.
      if (s.leagueId && s.leagueId !== leagueId) return false;
      if (!s.leagueId && !gameIdsInLeague.has(s.gameId)) return false;
      if (season && season !== "all" && s.seasonId && s.seasonId !== season) {
        return false;
      }
      return true;
    });
  }
}
