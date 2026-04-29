import type {
  IStat,
  IPlayer,
  IPlayerStatSummary,
  IPlayerGameLog,
  ITeamRecord,
  IGame,
} from "../interfaces";

/**
 * Aggregate player stats from individual stat records.
 */
export function aggregatePlayerStats(
  stats: IStat[],
  players: IPlayer[],
  leaguePlayers: { playerId: string; teamId: string }[],
  teams: { teamId: string; name: string }[],
): IPlayerStatSummary[] {
  const playerMap = new Map(players.map((p) => [p.playerId, p]));
  const teamMap = new Map(teams.map((t) => [t.teamId, t.name]));
  const leaguePlayerMap = new Map(
    leaguePlayers.map((lp) => [lp.playerId, lp.teamId]),
  );

  const statsByPlayer = new Map<
    string,
    { player: IPlayer; teamId: string; stats: Record<string, number> }
  >();

  for (const stat of stats) {
    const player = playerMap.get(stat.playerId);
    const teamId = leaguePlayerMap.get(stat.playerId) ?? stat.teamId;

    if (!player) continue;

    if (!statsByPlayer.has(stat.playerId)) {
      statsByPlayer.set(stat.playerId, {
        player,
        teamId,
        stats: {},
      });
    }

    const entry = statsByPlayer.get(stat.playerId)!;
    entry.stats[stat.statType] = (entry.stats[stat.statType] ?? 0) + stat.value;
  }

  return Array.from(statsByPlayer.entries()).map(
    ([playerId, { player, teamId, stats }]) => ({
      playerId,
      playerName: player.name,
      pictureUrl: player.pictureUrl,
      teamName: teamMap.get(teamId) ?? "Unknown",
      stats,
    }),
  );
}

/**
 * Get top scorers by goal count.
 */
export function getTopScorers(
  stats: IStat[],
  players: IPlayer[],
  leaguePlayers: { playerId: string; teamId: string }[],
  teams: { teamId: string; name: string }[],
  limit: number,
): IPlayerStatSummary[] {
  const leaguePlayerIds = new Set(leaguePlayers.map((lp) => lp.playerId));
  const summaries = aggregatePlayerStats(
    stats.filter((s) => s.statType === "goal"),
    players,
    leaguePlayers,
    teams,
  );

  return summaries
    .filter((s) => leaguePlayerIds.has(s.playerId))
    .sort((a, b) => (b.stats.goal ?? 0) - (a.stats.goal ?? 0))
    .slice(0, limit);
}

/**
 * Get top assisters by assist count.
 */
export function getTopAssists(
  stats: IStat[],
  players: IPlayer[],
  leaguePlayers: { playerId: string; teamId: string }[],
  teams: { teamId: string; name: string }[],
  limit: number,
): IPlayerStatSummary[] {
  const leaguePlayerIds = new Set(leaguePlayers.map((lp) => lp.playerId));
  const summaries = aggregatePlayerStats(
    stats.filter((s) => s.statType === "assist"),
    players,
    leaguePlayers,
    teams,
  );

  return summaries
    .filter((s) => leaguePlayerIds.has(s.playerId))
    .sort((a, b) => (b.stats.assist ?? 0) - (a.stats.assist ?? 0))
    .slice(0, limit);
}

/**
 * Get the player of the season (highest goals + assists).
 * When tied, first by goals, then by assists.
 */
export function getPlayerOfSeason(
  stats: IStat[],
  leaguePlayers: { playerId: string; teamId: string }[],
  players: IPlayer[],
  teams: { teamId: string; name: string }[],
): IPlayerStatSummary | null {
  const leaguePlayerIds = new Set(leaguePlayers.map((lp) => lp.playerId));
  const summaries = aggregatePlayerStats(
    stats,
    players,
    leaguePlayers,
    teams,
  );

  const inThisLeague = summaries.filter((s) => leaguePlayerIds.has(s.playerId));
  if (inThisLeague.length === 0) return null;

  const withGA = inThisLeague.map((s) => ({
    ...s,
    ga: (s.stats.goal ?? 0) + (s.stats.assist ?? 0),
  }));

  const sorted = withGA.sort((a, b) => {
    if (b.ga !== a.ga) return b.ga - a.ga;
    return (b.stats.goal ?? 0) - (a.stats.goal ?? 0);
  });

  return sorted[0] ?? null;
}

/**
 * Calculate team W/D/L record from games.
 */
export function getTeamRecord(games: IGame[], teamId: string): ITeamRecord {
  const record: ITeamRecord = {
    teamId,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };

  const counted = games.filter(
    (g) => g.status === "completed" || g.status === "live",
  );
  for (const game of counted) {
    const isHome = game.homeTeamId === teamId;
    const isAway = game.awayTeamId === teamId;
    if (!isHome && !isAway) continue;

    const gf = isHome ? game.homeScore : game.awayScore;
    const ga = isHome ? game.awayScore : game.homeScore;

    record.goalsFor += gf;
    record.goalsAgainst += ga;

    if (gf > ga) record.won++;
    else if (gf < ga) record.lost++;
    else record.drawn++;
  }

  return record;
}

/**
 * Get player's game log (games they had stats in), most recent first.
 */
export function getPlayerGameLog(
  stats: IStat[],
  games: IGame[],
  playerId: string,
  limit: number,
  teamMap: Map<string, string>,
): IPlayerGameLog[] {
  const playerStatsByGame = new Map<
    string,
    { teamId: string; stats: Record<string, number> }
  >();

  for (const stat of stats) {
    if (stat.playerId !== playerId) continue;
    if (!playerStatsByGame.has(stat.gameId)) {
      playerStatsByGame.set(stat.gameId, { teamId: stat.teamId, stats: {} });
    }
    const entry = playerStatsByGame.get(stat.gameId)!;
    entry.stats[stat.statType] = (entry.stats[stat.statType] ?? 0) + stat.value;
  }

  const gameMap = new Map(games.map((g) => [g.gameId, g]));
  const logs: IPlayerGameLog[] = [];

  for (const [gameId, { teamId, stats }] of Array.from(playerStatsByGame)) {
    const game = gameMap.get(gameId);
    if (!game) continue;
    const opponentId =
      game.homeTeamId === teamId ? game.awayTeamId : game.homeTeamId;
    const opponentName = teamMap.get(opponentId) ?? "Unknown";
    logs.push({
      gameId,
      opponentName,
      date: game.playedAt,
      stats,
    });
  }

  return logs
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}
