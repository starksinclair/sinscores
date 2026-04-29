import type { ILeagueRepository } from "@/core/interfaces";
import type { ITeamRepository } from "@/core/interfaces";
import type { IPlayerRepository } from "@/core/interfaces";
import type { ILeaguePlayerRepository } from "@/core/interfaces";
import type { IGameRepository } from "@/core/interfaces";
import type { IStatRepository } from "@/core/interfaces";
import type { IStatTypeRepository } from "@/core/interfaces";

interface Repositories {
  league: ILeagueRepository;
  team: ITeamRepository;
  player: IPlayerRepository;
  leaguePlayer: ILeaguePlayerRepository;
  game: IGameRepository;
  stat: IStatRepository;
  statType: IStatTypeRepository;
}

export async function seedIfEmpty(repos: Repositories): Promise<boolean> {
  const leagues = await repos.league.getAll();
  if (leagues.length > 0) return false;

  const league1 = await repos.league.create({
    leagueId: "league1",
    name: "Spring 2024 Neighbourhood League",
    season: "2024",
    accessCode: "AB12CD",
    createdAt: new Date().toISOString(),
  });

  const league2 = await repos.league.create({
    leagueId: "league2",
    name: "Summer 2024 Community Cup",
    season: "2024",
    accessCode: "XY34ZW",
    createdAt: new Date().toISOString(),
  });

  const team1 = await repos.team.create({
    leagueId: league1.leagueId,
    name: "Thunder FC",
  });
  const team2 = await repos.team.create({
    leagueId: league1.leagueId,
    name: "Storm United",
  });
  const team3 = await repos.team.create({
    leagueId: league2.leagueId,
    name: "Sunrise FC",
  });
  const team4 = await repos.team.create({
    leagueId: league2.leagueId,
    name: "Sunset United",
  });

  const p1 = await repos.player.create({
    name: "Alex Johnson",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });
  const p2 = await repos.player.create({
    name: "Sam Williams",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });
  const p3 = await repos.player.create({
    name: "Jordan Lee",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });
  const p4 = await repos.player.create({
    name: "Casey Brown",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });
  const p5 = await repos.player.create({
    name: "Morgan Davis",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });
  const p6 = await repos.player.create({
    name: "Taylor Smith",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  });

  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team1!.teamId,
    p1.playerId,
  );
  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team1!.teamId,
    p2.playerId,
  );
  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team1!.teamId,
    p3.playerId,
  );
  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team2!.teamId,
    p4.playerId,
  );
  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team2!.teamId,
    p5.playerId,
  );
  await repos.leaguePlayer.assignPlayer(
    league1.leagueId,
    team2!.teamId,
    p6.playerId,
  );

  const g1 = await repos.game.create({
    leagueId: league1.leagueId,
    homeTeamId: team1!.teamId,
    awayTeamId: team2!.teamId,
    homeScore: 2,
    awayScore: 1,
    playedAt: "2024-03-01T14:00:00Z",
    status: "completed",
  });

  const g2 = await repos.game.create({
    leagueId: league1.leagueId,
    homeTeamId: team1!.teamId,
    awayTeamId: team2!.teamId,
    homeScore: 3,
    awayScore: 2,
    playedAt: "2024-03-08T14:00:00Z",
    status: "completed",
  });

  await repos.game.create({
    leagueId: league2.leagueId,
    homeTeamId: team4.teamId,
    awayTeamId: team3.teamId,
    homeScore: 1,
    awayScore: 1,
    playedAt: "2024-03-15T14:00:00Z",
    status: "completed",
  });

  await repos.stat.create({
    gameId: g1.gameId,
    playerId: p1.playerId,
    teamId: team1!.teamId,
    statType: "goal",
    value: 2,
  });
  await repos.stat.create({
    gameId: g1.gameId,
    playerId: p2.playerId,
    teamId: team1!.teamId,
    statType: "assist",
    value: 1,
  });
  await repos.stat.create({
    gameId: g1.gameId,
    playerId: p4.playerId,
    teamId: team2!.teamId,
    statType: "goal",
    value: 1,
  });
  await repos.stat.create({
    gameId: g2.gameId,
    playerId: p1.playerId,
    teamId: team1!.teamId,
    statType: "goal",
    value: 2,
  });
  await repos.stat.create({
    gameId: g2.gameId,
    playerId: p3.playerId,
    teamId: team1!.teamId,
    statType: "goal",
    value: 1,
  });

  const defaultStatTypes = [
    { statType: "goal", label: "Goals", icon: "⚽" },
    { statType: "assist", label: "Assists", icon: "🅰️" },
    { statType: "yellow_card", label: "Yellow Card", icon: "🟨" },
    { statType: "red_card", label: "Red Card", icon: "🟥" },
    { statType: "clean_sheet", label: "Clean Sheet", icon: "🧤" },
  ];

  for (const st of defaultStatTypes) {
    await repos.statType.create(st);
  }

  return true;
}
