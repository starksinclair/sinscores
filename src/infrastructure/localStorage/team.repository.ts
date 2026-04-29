import type { ITeam } from "@/core/interfaces";
import type { ITeamRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_teams";

export class LocalStorageTeamRepository implements ITeamRepository {
  async getAll(): Promise<ITeam[]> {
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

  async getById(teamId: string): Promise<ITeam | null> {
    const teams = await this.getAll();
    return teams.find((t) => t.teamId === teamId) ?? null;
  }

  async create(data: Partial<ITeam>): Promise<ITeam> {
    const teams = await this.getAll();
    const team: ITeam = {
      teamId: data.teamId ?? localStorageClient.generateId(),
      leagueId: data.leagueId ?? "",
      name: data.name ?? "",
      season: data.season,
    };
    teams.push(team);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(teams));
    }
    return team;
  }

  async update(teamId: string, data: Partial<ITeam>): Promise<ITeam> {
    const teams = await this.getAll();
    const idx = teams.findIndex((t) => t.teamId === teamId);
    if (idx === -1) throw new Error("Team not found");
    teams[idx] = { ...teams[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(teams));
    }
    return teams[idx];
  }

  async delete(teamId: string): Promise<void> {
    const teams = (await this.getAll()).filter((t) => t.teamId !== teamId);
    if (typeof window !== "undefined") {
      localStorage.setItem(KEY, JSON.stringify(teams));
    }
  }

  async getByLeague(leagueId: string, season?: string): Promise<ITeam[]> {
    const teams = await this.getAll();
    const filtered = teams.filter((t) => t.leagueId === leagueId);
    if (!season) return filtered;
    return filtered.filter((t) => !t.season || t.season === season);
  }
}
