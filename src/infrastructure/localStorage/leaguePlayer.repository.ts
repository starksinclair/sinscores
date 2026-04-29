import type { ILeaguePlayer } from "@/core/interfaces";
import type { ILeaguePlayerRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_league_players";

export class LocalStorageLeaguePlayerRepository
  implements ILeaguePlayerRepository
{
  async getAll(): Promise<ILeaguePlayer[]> {
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

  async getById(id: string): Promise<ILeaguePlayer | null> {
    const list = await this.getAll();
    return list.find((lp) => lp.id === id) ?? null;
  }

  async create(data: Partial<ILeaguePlayer>): Promise<ILeaguePlayer> {
    const list = await this.getAll();
    const lp: ILeaguePlayer = {
      id: data.id ?? localStorageClient.generateId(),
      leagueId: data.leagueId ?? "",
      teamId: data.teamId ?? "",
      playerId: data.playerId ?? "",
      status: data.status ?? "active",
      season: data.season,
    };
    list.push(lp);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
    return lp;
  }

  async update(
    id: string,
    data: Partial<ILeaguePlayer>,
  ): Promise<ILeaguePlayer> {
    const list = await this.getAll();
    const idx = list.findIndex((lp) => lp.id === id);
    if (idx === -1) throw new Error("League player not found");
    list[idx] = { ...list[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
    return list[idx];
  }

  async delete(id: string): Promise<void> {
    const list = (await this.getAll()).filter((lp) => lp.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(list));
    }
  }

  async getByLeague(
    leagueId: string,
    season?: string,
  ): Promise<ILeaguePlayer[]> {
    const list = await this.getAll();
    return list.filter((lp) => {
      if (lp.leagueId !== leagueId) return false;
      if (season && lp.season && lp.season !== season) return false;
      return true;
    });
  }

  async getByPlayer(playerId: string): Promise<ILeaguePlayer[]> {
    const list = await this.getAll();
    return list.filter((lp) => lp.playerId === playerId);
  }

  async getByTeam(
    teamId: string,
    leagueId: string,
    season?: string,
  ): Promise<ILeaguePlayer[]> {
    const list = await this.getAll();
    return list.filter((lp) => {
      if (lp.teamId !== teamId || lp.leagueId !== leagueId) return false;
      if (season && lp.season && lp.season !== season) return false;
      return true;
    });
  }

  async assignPlayer(
    leagueId: string,
    teamId: string,
    playerId: string,
    season?: string,
  ): Promise<ILeaguePlayer> {
    const list = await this.getAll();
    const idx = list.findIndex((lp) => {
      if (lp.leagueId !== leagueId || lp.playerId !== playerId) return false;
      const s = season ?? "";
      const lpS = lp.season ?? "";
      if (!s || s === "all") return true;
      return lpS === s;
    });

    if (idx >= 0) {
      const existing = list[idx];
      if (existing.status === "active" && existing.teamId?.trim()) {
        throw new Error("Player already assigned this season");
      }
      const updated: ILeaguePlayer = {
        ...existing,
        teamId,
        status: "active",
        season: season ?? existing.season,
      };
      list[idx] = updated;
      if (typeof window !== "undefined") {
        localStorage.setItem(KEY, JSON.stringify(list));
      }
      return updated;
    }

    return this.create({
      leagueId,
      teamId,
      playerId,
      status: "active",
      season,
    });
  }
}
