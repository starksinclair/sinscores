import type { IGame, ITeam, IStanding } from "../interfaces";

/**
 * Calculate league standings from games and teams.
 * Points: 3 for win, 1 for draw, 0 for loss.
 * Sorted by: points DESC, goal difference DESC, goals for DESC.
 * Includes both "completed" AND "live" games so the table reflects
 * in-progress scores as events happen.
 */
export function calculateStandings(
  games: IGame[],
  teams: ITeam[],
): IStanding[] {
  const countedGames = games.filter(
    (g) => g.status === "completed" || g.status === "live",
  );

  const standingsMap = new Map<
    string,
    {
      teamId: string;
      teamName: string;
      played: number;
      won: number;
      drawn: number;
      lost: number;
      goalsFor: number;
      goalsAgainst: number;
    }
  >();

  for (const team of teams) {
    standingsMap.set(team.teamId, {
      teamId: team.teamId,
      teamName: team.name,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    });
  }

  for (const game of countedGames) {
    const homeTeam = standingsMap.get(game.homeTeamId);
    const awayTeam = standingsMap.get(game.awayTeamId);

    if (!homeTeam || !awayTeam) continue;

    homeTeam.played += 1;
    awayTeam.played += 1;
    homeTeam.goalsFor += game.homeScore;
    homeTeam.goalsAgainst += game.awayScore;
    awayTeam.goalsFor += game.awayScore;
    awayTeam.goalsAgainst += game.homeScore;

    if (game.homeScore > game.awayScore) {
      homeTeam.won += 1;
      awayTeam.lost += 1;
    } else if (game.homeScore < game.awayScore) {
      awayTeam.won += 1;
      homeTeam.lost += 1;
    } else {
      homeTeam.drawn += 1;
      awayTeam.drawn += 1;
    }
  }

  const standings: IStanding[] = Array.from(standingsMap.values()).map((s) => ({
    ...s,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.won * 3 + s.drawn,
  }));

  standings.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference)
      return b.goalDifference - a.goalDifference;
    return b.goalsFor - a.goalsFor;
  });

  return standings;
}
