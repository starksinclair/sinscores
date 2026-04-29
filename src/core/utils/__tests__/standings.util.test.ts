import { describe, it, expect } from "vitest";
import { calculateStandings } from "../standings.util";
import type { IGame, ITeam } from "../../interfaces";

const createTeam = (id: string, name: string): ITeam => ({
  teamId: id,
  leagueId: "league-1",
  name,
});

const createGame = (
  homeId: string,
  awayId: string,
  homeScore: number,
  awayScore: number,
): IGame => ({
  gameId: `game-${homeId}-${awayId}`,
  leagueId: "league-1",
  homeTeamId: homeId,
  awayTeamId: awayId,
  homeScore,
  awayScore,
  playedAt: "2024-01-01T14:00:00Z",
  status: "completed",
});

describe("calculateStandings", () => {
  it("returns empty array when no teams", () => {
    expect(calculateStandings([], [])).toEqual([]);
  });

  it("returns teams with zero stats when no completed games", () => {
    const teams = [createTeam("t1", "Team A"), createTeam("t2", "Team B")];
    const games: IGame[] = [];
    const standings = calculateStandings(games, teams);
    expect(standings).toHaveLength(2);
    expect(standings[0]).toMatchObject({
      teamId: "t1",
      teamName: "Team A",
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      points: 0,
    });
  });

  it("calculates correct points: 3 for win, 1 for draw, 0 for loss", () => {
    const teams = [
      createTeam("t1", "Team A"),
      createTeam("t2", "Team B"),
      createTeam("t3", "Team C"),
    ];
    const games = [
      createGame("t1", "t2", 2, 1), // t1 wins
      createGame("t1", "t3", 1, 1), // draw
      createGame("t2", "t3", 0, 1), // t3 wins
    ];
    const standings = calculateStandings(games, teams);
    expect(standings.find((s) => s.teamId === "t1")?.points).toBe(4); // 3 + 1
    expect(standings.find((s) => s.teamId === "t2")?.points).toBe(0);
    expect(standings.find((s) => s.teamId === "t3")?.points).toBe(4); // 1 + 3
  });

  it("sorts by points, then goal difference, then goals for", () => {
    const teams = [
      createTeam("t1", "Team A"),
      createTeam("t2", "Team B"),
      createTeam("t3", "Team C"),
    ];
    const games = [
      createGame("t1", "t2", 3, 0), // t1 +3 GD
      createGame("t1", "t3", 2, 0), // t1 +5 GD total
      createGame("t2", "t3", 5, 0), // t2 +5 GD, t3 -5
      createGame("t2", "t1", 2, 0), // t2 wins
      createGame("t3", "t1", 0, 1), // t1 wins
      createGame("t3", "t2", 0, 2), // t2 wins
    ];
    // t1: 2W 1L = 6pts, GD +2
    // t2: 3W 0L = 9pts, GD +9
    // t3: 0W 3L = 0pts, GD -11
    const standings = calculateStandings(games, teams);
    expect(standings[0].teamId).toBe("t2");
    expect(standings[1].teamId).toBe("t1");
    expect(standings[2].teamId).toBe("t3");
  });

  it("ignores scheduled games but counts live games", () => {
    const teams = [createTeam("t1", "Team A"), createTeam("t2", "Team B")];
    const games: IGame[] = [
      {
        ...createGame("t1", "t2", 2, 1),
        status: "scheduled",
      },
    ];
    const standings = calculateStandings(games, teams);
    expect(standings[0].played).toBe(0);
    expect(standings[0].points).toBe(0);
  });

  it("counts live games in standings so the table updates in real time", () => {
    const teams = [createTeam("t1", "Team A"), createTeam("t2", "Team B")];
    const games: IGame[] = [
      {
        ...createGame("t1", "t2", 3, 2),
        status: "live",
      },
    ];
    const standings = calculateStandings(games, teams);
    const t1 = standings.find((s) => s.teamId === "t1")!;
    expect(t1.played).toBe(1);
    expect(t1.won).toBe(1);
    expect(t1.points).toBe(3);
  });
});
