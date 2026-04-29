const KEYS = {
  leagues: "nl_leagues",
  teams: "nl_teams",
  players: "nl_players",
  leaguePlayers: "nl_league_players",
  games: "nl_games",
  stats: "nl_stats",
  statTypes: "nl_stat_types",
} as const;

export class LocalStorageClient {
  private getKey<K extends keyof typeof KEYS>(key: K): string {
    return KEYS[key];
  }

  get<T>(key: keyof typeof KEYS): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEYS[key]);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  set<T>(key: keyof typeof KEYS, data: T[]): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(KEYS[key], JSON.stringify(data));
  }

  generateId(): string {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  }
}

export const localStorageClient = new LocalStorageClient();
