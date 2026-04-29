import { describe, it, expect } from "vitest";
import {
  aggregatePlayerStats,
  getTopScorers,
  getPlayerOfSeason,
  getTeamRecord,
  getPlayerGameLog,
} from "../stats.util";
import type { IStat, IPlayer, IGame } from "../../interfaces";

const createPlayer = (id: string, name: string): IPlayer => ({
  playerId: id,
  name,
  pictureUrl: "",
  joinedAt: "2024-01-01",
});

describe("aggregatePlayerStats", () => {
  it("returns empty array when no stats", () => {
    const players = [createPlayer("p1", "Alice")];
    const result = aggregatePlayerStats(
      [],
      players,
      [{ playerId: "p1", teamId: "t1" }],
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result).toEqual([]);
  });

  it("aggregates stats correctly per player", () => {
    const players = [createPlayer("p1", "Alice"), createPlayer("p2", "Bob")];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 1,
      },
      {
        statId: "s2",
        gameId: "g2",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 1,
      },
      {
        statId: "s3",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "assist",
        value: 1,
      },
      {
        statId: "s4",
        gameId: "g2",
        playerId: "p2",
        teamId: "t1",
        statType: "goal",
        value: 2,
      },
    ];
    const result = aggregatePlayerStats(
      stats,
      players,
      [
        { playerId: "p1", teamId: "t1" },
        { playerId: "p2", teamId: "t1" },
      ],
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result).toHaveLength(2);
    const alice = result.find((r) => r.playerId === "p1");
    const bob = result.find((r) => r.playerId === "p2");
    expect(alice?.stats.goal).toBe(2);
    expect(alice?.stats.assist).toBe(1);
    expect(bob?.stats.goal).toBe(2);
  });

  it("excludes players not in players list", () => {
    const players = [createPlayer("p1", "Alice")];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p99",
        teamId: "t1",
        statType: "goal",
        value: 5,
      },
    ];
    const result = aggregatePlayerStats(
      stats,
      players,
      [],
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result).toHaveLength(0);
  });
});

describe("getTopScorers", () => {
  it("returns correct ranking by goals", () => {
    const players = [
      createPlayer("p1", "Alice"),
      createPlayer("p2", "Bob"),
      createPlayer("p3", "Charlie"),
    ];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 5,
      },
      {
        statId: "s2",
        gameId: "g1",
        playerId: "p2",
        teamId: "t1",
        statType: "goal",
        value: 3,
      },
      {
        statId: "s3",
        gameId: "g1",
        playerId: "p3",
        teamId: "t1",
        statType: "goal",
        value: 7,
      },
    ];
    const result = getTopScorers(
      stats,
      players,
      [
        { playerId: "p1", teamId: "t1" },
        { playerId: "p2", teamId: "t1" },
        { playerId: "p3", teamId: "t1" },
      ],
      [{ teamId: "t1", name: "Team A" }],
      3,
    );
    expect(result[0].playerName).toBe("Charlie");
    expect(result[0].stats.goal).toBe(7);
    expect(result[1].playerName).toBe("Alice");
    expect(result[2].playerName).toBe("Bob");
  });

  it("respects limit parameter", () => {
    const players = [
      createPlayer("p1", "Alice"),
      createPlayer("p2", "Bob"),
      createPlayer("p3", "Charlie"),
    ];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 5,
      },
      {
        statId: "s2",
        gameId: "g1",
        playerId: "p2",
        teamId: "t1",
        statType: "goal",
        value: 3,
      },
      {
        statId: "s3",
        gameId: "g1",
        playerId: "p3",
        teamId: "t1",
        statType: "goal",
        value: 2,
      },
    ];
    const result = getTopScorers(
      stats,
      players,
      [
        { playerId: "p1", teamId: "t1" },
        { playerId: "p2", teamId: "t1" },
        { playerId: "p3", teamId: "t1" },
      ],
      [{ teamId: "t1", name: "Team A" }],
      2,
    );
    expect(result).toHaveLength(2);
    expect(result[0].playerName).toBe("Alice");
    expect(result[1].playerName).toBe("Bob");
  });

  it("returns empty array when no goal stats", () => {
    const players = [createPlayer("p1", "Alice")];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "assist",
        value: 5,
      },
    ];
    const result = getTopScorers(
      stats,
      players,
      [{ playerId: "p1", teamId: "t1" }],
      [{ teamId: "t1", name: "Team A" }],
      5,
    );
    expect(result).toHaveLength(0);
  });
});

const createGame = (
  gameId: string,
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  status: IGame["status"] = "completed",
  playedAt?: string,
): IGame => ({
  gameId,
  leagueId: "l1",
  homeTeamId,
  awayTeamId,
  homeScore,
  awayScore,
  playedAt: playedAt ?? "2024-01-01T12:00:00Z",
  status,
});

describe("getPlayerOfSeason", () => {
  it("returns player with highest GA", () => {
    const players = [
      createPlayer("p1", "Alice"),
      createPlayer("p2", "Bob"),
      createPlayer("p3", "Charlie"),
    ];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 5,
      },
      {
        statId: "s2",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "assist",
        value: 2,
      },
      {
        statId: "s3",
        gameId: "g1",
        playerId: "p2",
        teamId: "t1",
        statType: "goal",
        value: 6,
      },
      {
        statId: "s4",
        gameId: "g1",
        playerId: "p3",
        teamId: "t1",
        statType: "goal",
        value: 4,
      },
      {
        statId: "s5",
        gameId: "g1",
        playerId: "p3",
        teamId: "t1",
        statType: "assist",
        value: 4,
      },
    ];
    const result = getPlayerOfSeason(
      stats,
      [
        { playerId: "p1", teamId: "t1" },
        { playerId: "p2", teamId: "t1" },
        { playerId: "p3", teamId: "t1" },
      ],
      players,
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result?.playerName).toBe("Charlie");
    expect(result?.stats.goal).toBe(4);
    expect(result?.stats.assist).toBe(4);
  });

  it("breaks tie by goals when GA is equal", () => {
    const players = [createPlayer("p1", "Alice"), createPlayer("p2", "Bob")];
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 5,
      },
      {
        statId: "s2",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "assist",
        value: 2,
      },
      {
        statId: "s3",
        gameId: "g1",
        playerId: "p2",
        teamId: "t1",
        statType: "goal",
        value: 6,
      },
      {
        statId: "s4",
        gameId: "g1",
        playerId: "p2",
        teamId: "t1",
        statType: "assist",
        value: 1,
      },
    ];
    const result = getPlayerOfSeason(
      stats,
      [
        { playerId: "p1", teamId: "t1" },
        { playerId: "p2", teamId: "t1" },
      ],
      players,
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result?.playerName).toBe("Bob");
    expect(result?.stats.goal).toBe(6);
  });

  it("returns null when no stats", () => {
    const result = getPlayerOfSeason(
      [],
      [],
      [createPlayer("p1", "Alice")],
      [{ teamId: "t1", name: "Team A" }],
    );
    expect(result).toBeNull();
  });
});

describe("getTeamRecord", () => {
  it("calculates all wins", () => {
    const games: IGame[] = [
      createGame("g1", "t1", "t2", 2, 1),
      createGame("g2", "t3", "t1", 0, 3),
    ];
    const result = getTeamRecord(games, "t1");
    expect(result).toEqual({
      teamId: "t1",
      won: 2,
      drawn: 0,
      lost: 0,
      goalsFor: 5,
      goalsAgainst: 1,
    });
  });

  it("calculates all losses", () => {
    const games: IGame[] = [
      createGame("g1", "t1", "t2", 0, 2),
      createGame("g2", "t1", "t3", 1, 3),
    ];
    const result = getTeamRecord(games, "t1");
    expect(result).toEqual({
      teamId: "t1",
      won: 0,
      drawn: 0,
      lost: 2,
      goalsFor: 1,
      goalsAgainst: 5,
    });
  });

  it("calculates mixed W/D/L", () => {
    const games: IGame[] = [
      createGame("g1", "t1", "t2", 2, 1),
      createGame("g2", "t1", "t3", 1, 1),
      createGame("g3", "t4", "t1", 3, 0),
    ];
    const result = getTeamRecord(games, "t1");
    expect(result).toEqual({
      teamId: "t1",
      won: 1,
      drawn: 1,
      lost: 1,
      goalsFor: 3,
      goalsAgainst: 5,
    });
  });

  it("ignores scheduled games but counts live games so records update in real time", () => {
    const games: IGame[] = [
      createGame("g1", "t1", "t2", 2, 1, "completed"),
      createGame("g2", "t1", "t3", 0, 0, "scheduled"),
      createGame("g3", "t1", "t4", 1, 1, "live"),
    ];
    const result = getTeamRecord(games, "t1");
    expect(result.won).toBe(1);
    expect(result.drawn).toBe(1);
    expect(result.lost).toBe(0);
  });
});

describe("getPlayerGameLog", () => {
  it("returns correct limit and order", () => {
    const stats: IStat[] = [
      {
        statId: "s1",
        gameId: "g1",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 1,
      },
      {
        statId: "s2",
        gameId: "g2",
        playerId: "p1",
        teamId: "t1",
        statType: "goal",
        value: 2,
      },
      {
        statId: "s3",
        gameId: "g3",
        playerId: "p1",
        teamId: "t1",
        statType: "assist",
        value: 1,
      },
    ];
    const games: IGame[] = [
      createGame("g1", "t1", "t2", 2, 1, "completed", "2024-01-01T12:00:00Z"),
      createGame("g2", "t1", "t3", 3, 0, "completed", "2024-01-02T12:00:00Z"),
      createGame("g3", "t1", "t4", 1, 1, "completed", "2024-01-03T12:00:00Z"),
    ];
    const teamMap = new Map([
      ["t1", "Team A"],
      ["t2", "Team B"],
      ["t3", "Team C"],
      ["t4", "Team D"],
    ]);
    const result = getPlayerGameLog(stats, games, "p1", 2, teamMap);
    expect(result).toHaveLength(2);
    expect(result[0].gameId).toBe("g3");
    expect(result[1].gameId).toBe("g2");
    expect(result[0].opponentName).toBe("Team D");
    expect(result[0].stats).toEqual({ assist: 1 });
  });

  it("returns empty when no stats for player", () => {
    const result = getPlayerGameLog(
      [],
      [createGame("g1", "t1", "t2", 1, 0)],
      "p99",
      5,
      new Map([
        ["t1", "A"],
        ["t2", "B"],
      ]),
    );
    expect(result).toHaveLength(0);
  });
});
