import type { IGame } from "@/core/interfaces";
import type { IGameRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_games";

export class LocalStorageGameRepository implements IGameRepository {
  async getAll(): Promise<IGame[]> {
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

  async getById(gameId: string): Promise<IGame | null> {
    const games = await this.getAll();
    return games.find((g) => g.gameId === gameId) ?? null;
  }

  async create(data: Partial<IGame>): Promise<IGame> {
    const games = await this.getAll();
    const game: IGame = {
      gameId: data.gameId ?? localStorageClient.generateId(),
      leagueId: data.leagueId ?? "",
      homeTeamId: data.homeTeamId ?? "",
      awayTeamId: data.awayTeamId ?? "",
      homeScore: data.homeScore ?? 0,
      awayScore: data.awayScore ?? 0,
      playedAt: data.playedAt ?? new Date().toISOString(),
      status: data.status ?? "scheduled",
      season: data.season,
    };
    games.push(game);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(games));
    }
    return game;
  }

  async update(gameId: string, data: Partial<IGame>): Promise<IGame> {
    const games = await this.getAll();
    const idx = games.findIndex((g) => g.gameId === gameId);
    if (idx === -1) throw new Error("Game not found");
    games[idx] = { ...games[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(games));
    }
    return games[idx];
  }

  async delete(gameId: string): Promise<void> {
    const games = (await this.getAll()).filter((g) => g.gameId !== gameId);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(games));
    }
  }

  async getByLeague(
    leagueId: string,
    season?: string | "all",
  ): Promise<IGame[]> {
    const games = await this.getAll();
    const filtered = games.filter((g) => g.leagueId === leagueId);
    if (season === "all" || !season) return filtered;
    return filtered.filter((g) => !g.season || g.season === season);
  }

  async getByTeam(teamId: string): Promise<IGame[]> {
    const games = await this.getAll();
    return games.filter(
      (g) => g.homeTeamId === teamId || g.awayTeamId === teamId,
    );
  }

  async getTodaysGames(): Promise<IGame[]> {
    const today = new Date().toISOString().slice(0, 10);
    const games = await this.getAll();
    return games.filter((g) => g.playedAt.startsWith(today));
  }
}
