/**
 * API client for production mode (Sheets backend).
 * Used when NEXT_PUBLIC_PRODUCTION is true - client fetches via API routes
 * instead of using repositories directly (credentials are server-only).
 */

import type {
  ILeague,
  ILeaguePlayer,
  IPlayer,
  ITeam,
  IGame,
  IStat,
  IStatType,
  ISeasonEntry,
} from "@/core/interfaces";

async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `API error: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function apiPost<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `API error: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

async function apiPatch<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `API error: ${res.status}`);
  }
  return res.json();
}

async function apiDelete(url: string): Promise<void> {
  const res = await fetch(url, { method: "DELETE" });
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message ?? `API error: ${res.status}`);
  }
}

export const apiClient = {
  league: {
    getAll: () => apiGet<Omit<ILeague, "accessCode">[]>("/api/leagues"),
    getById: (id: string) =>
      apiGet<Omit<ILeague, "accessCode"> | null>(`/api/leagues/${id}`),
    getByAccessCode: (code: string) =>
      apiGet<Omit<ILeague, "accessCode"> | null>(
        `/api/leagues?accessCode=${encodeURIComponent(code)}`,
      ),
    create: (data: unknown) =>
      apiPost<Omit<ILeague, "accessCode">>(`/api/leagues`, data),
    update: (id: string, data: unknown) => apiPatch(`/api/leagues/${id}`, data),
    delete: (id: string) => apiDelete(`/api/leagues/${id}`),
    getSeasons: (id: string) => apiGet<string[]>(`/api/leagues/${id}/seasons`),
    getSeasonEntries: (id: string) =>
      apiGet<ISeasonEntry[]>(`/api/leagues/${id}/seasons?entries=true`),
    addSeason: (id: string, season: string) =>
      apiPost(`/api/leagues/${id}/seasons`, { season }),
    endSeason: (id: string, season: string) =>
      apiDelete(
        `/api/leagues/${id}/seasons?season=${encodeURIComponent(season)}`,
      ),
  },
  team: {
    getAll: () => apiGet<ITeam[]>("/api/teams"),
    getById: (id: string) => apiGet<ITeam | null>(`/api/teams/${id}`),
    getByLeague: (leagueId: string, season?: string) =>
      apiGet<ITeam[]>(
        `/api/teams?leagueId=${encodeURIComponent(leagueId)}${season ? `&season=${encodeURIComponent(season)}` : ""}`,
      ),
    create: (data: unknown) => apiPost("/api/teams", data),
    update: (id: string, data: unknown) => apiPatch(`/api/teams/${id}`, data),
    delete: (id: string) => apiDelete(`/api/teams/${id}`),
  },
  player: {
    getAll: () => apiGet<IPlayer[]>("/api/players"),
    getById: (id: string) => apiGet<IPlayer | null>(`/api/players/${id}`),
    search: (q: string) =>
      apiGet<IPlayer[]>(`/api/players/search?q=${encodeURIComponent(q)}`),
    create: (data: unknown) => apiPost("/api/players", data),
    update: (id: string, data: unknown) => apiPatch(`/api/players/${id}`, data),
    delete: (id: string) => apiDelete(`/api/players/${id}`),
  },
  leaguePlayer: {
    getAll: () => apiGet<ILeaguePlayer[]>("/api/league-players"),
    getById: (id: string) =>
      apiGet<ILeaguePlayer | null>(`/api/league-players/${id}`),
    getByLeague: (leagueId: string, season?: string) =>
      apiGet<ILeaguePlayer[]>(
        `/api/league-players?leagueId=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season ?? "all")}`,
      ),
    getByPlayer: (playerId: string) =>
      apiGet<ILeaguePlayer[]>(
        `/api/league-players?playerId=${encodeURIComponent(playerId)}`,
      ),
    create: (data: unknown) => apiPost("/api/league-players", data),
    update: (id: string, data: unknown) =>
      apiPatch(`/api/league-players/${id}`, data),
    delete: (id: string) => apiDelete(`/api/league-players/${id}`),
    assignPlayer: (
      leagueId: string,
      teamId: string,
      playerId: string,
      season?: string,
    ) =>
      apiPost<ILeaguePlayer>("/api/league-players", {
        leagueId,
        teamId,
        playerId,
        status: "active",
        season,
      }),
  },
  game: {
    getAll: () => apiGet<IGame[]>("/api/games"),
    getById: (id: string) => apiGet<IGame | null>(`/api/games/${id}`),
    getByLeague: (leagueId: string, season?: string) =>
      apiGet<IGame[]>(
        `/api/games?leagueId=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season ?? "all")}`,
      ),
    getByTeam: (teamId: string) =>
      apiGet<IGame[]>(`/api/games?teamId=${encodeURIComponent(teamId)}`),
    getTodaysGames: () => apiGet<IGame[]>("/api/games/today"),
    create: (data: unknown) => apiPost("/api/games", data),
    update: (id: string, data: unknown) => apiPatch(`/api/games/${id}`, data),
    delete: (id: string) => apiDelete(`/api/games/${id}`),
  },
  stat: {
    getAll: () => apiGet<IStat[]>("/api/stats"),
    getById: (id: string) => apiGet<IStat | null>(`/api/stats/${id}`),
    getByGame: (gameId: string) =>
      apiGet<IStat[]>(`/api/stats?gameId=${encodeURIComponent(gameId)}`),
    getByLeague: (leagueId: string, season?: string) =>
      apiGet<IStat[]>(
        `/api/stats?leagueId=${encodeURIComponent(leagueId)}&season=${encodeURIComponent(season ?? "")}`,
      ),
    getByPlayer: (playerId: string, leagueId?: string, season?: string) =>
      apiGet<IStat[]>(
        `/api/stats?playerId=${encodeURIComponent(playerId)}${leagueId ? `&leagueId=${encodeURIComponent(leagueId)}` : ""}${season ? `&season=${encodeURIComponent(season)}` : ""}`,
      ),
    create: (data: unknown) => apiPost("/api/stats", data),
    update: (id: string, data: unknown) => apiPatch(`/api/stats/${id}`, data),
    delete: (id: string) => apiDelete(`/api/stats/${id}`),
  },
  statType: {
    getAll: () => apiGet<IStatType[]>("/api/stat-types"),
    getById: (id: string) => apiGet<IStatType | null>(`/api/stat-types/${id}`),
    create: (data: unknown) => apiPost("/api/stat-types", data),
    update: (id: string, data: unknown) =>
      apiPatch(`/api/stat-types/${id}`, data),
    delete: (id: string) => apiDelete(`/api/stat-types/${id}`),
  },
};
