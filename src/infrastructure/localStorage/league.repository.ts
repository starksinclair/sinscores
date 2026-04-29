import type { ILeague, ISeasonEntry } from "@/core/interfaces";
import type { ILeagueRepository } from "@/core/interfaces";
import { localStorageClient } from "./localStorage.client";

const KEY = "nl_leagues" as const;
const SEASON_KEY = "nl_season_entries" as const;

function getKey(): string {
  return KEY;
}

async function loadSeasonEntries(): Promise<ISeasonEntry[]> {
  const raw =
    typeof window !== "undefined" ? localStorage.getItem(SEASON_KEY) : null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveSeasonEntries(entries: ISeasonEntry[]): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.setItem(SEASON_KEY, JSON.stringify(entries));
  }
}

export class LocalStorageLeagueRepository implements ILeagueRepository {
  async getAll(): Promise<ILeague[]> {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(getKey()) : null;
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  async getById(leagueId: string): Promise<ILeague | null> {
    const leagues = await this.getAll();
    return leagues.find((l) => l.leagueId === leagueId) ?? null;
  }

  async create(data: Partial<ILeague>): Promise<ILeague> {
    const leagues = await this.getAll();
    const league: ILeague = {
      leagueId: data.leagueId ?? localStorageClient.generateId(),
      name: data.name ?? "",
      season: data.season ?? "",
      accessCode: data.accessCode ?? "",
      createdAt: data.createdAt ?? new Date().toISOString(),
    };
    leagues.push(league);
    if (typeof window !== "undefined") {
      localStorage.setItem(getKey(), JSON.stringify(leagues));
    }
    return league;
  }

  async update(leagueId: string, data: Partial<ILeague>): Promise<ILeague> {
    const leagues = await this.getAll();
    const idx = leagues.findIndex((l) => l.leagueId === leagueId);
    if (idx === -1) throw new Error("League not found");
    leagues[idx] = { ...leagues[idx], ...data };
    if (typeof window !== "undefined") {
      localStorage.setItem(getKey(), JSON.stringify(leagues));
    }
    return leagues[idx];
  }

  async delete(leagueId: string): Promise<void> {
    const leagues = (await this.getAll()).filter(
      (l) => l.leagueId !== leagueId,
    );
    if (typeof window !== "undefined") {
      localStorage.setItem(getKey(), JSON.stringify(leagues));
    }
  }

  async getByAccessCode(code: string): Promise<ILeague | null> {
    const leagues = await this.getAll();
    return leagues.find((l) => l.accessCode === code) ?? null;
  }

  async getSeasons(leagueId: string): Promise<string[]> {
    const league = await this.getById(leagueId);
    const entries = await loadSeasonEntries();
    const fromLeague = league?.season ? [league.season] : [];
    const fromEntries = entries
      .filter((e) => e.leagueId === leagueId)
      .map((e) => e.season);
    const all = Array.from(new Set([...fromLeague, ...fromEntries]));
    return all.sort().reverse();
  }

  async addSeason(leagueId: string, season: string): Promise<ISeasonEntry> {
    const entries = await loadSeasonEntries();
    const exists = entries.some(
      (e) => e.leagueId === leagueId && e.season === season,
    );
    if (exists) throw new Error("Season already exists");
    const entry: ISeasonEntry = {
      leagueId,
      season,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    entries.push(entry);
    await saveSeasonEntries(entries);
    return entry;
  }

  async endSeason(leagueId: string, season: string): Promise<void> {
    const entries = await loadSeasonEntries();
    const idx = entries.findIndex(
      (e) => e.leagueId === leagueId && e.season === season,
    );
    if (idx >= 0) {
      entries[idx] = { ...entries[idx], status: "ended" };
      await saveSeasonEntries(entries);
    }
  }

  async getSeasonEntries(leagueId: string): Promise<ISeasonEntry[]> {
    const entries = await loadSeasonEntries();
    const league = await this.getById(leagueId);
    const result: ISeasonEntry[] = entries.filter(
      (e) => e.leagueId === leagueId,
    );
    if (league?.season && !result.some((e) => e.season === league.season)) {
      result.unshift({
        leagueId,
        season: league.season,
        status: "active",
        createdAt: league.createdAt,
      });
    }
    return result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }
}
