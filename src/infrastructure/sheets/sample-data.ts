/**
 * Sample data for development when Google Sheets is not configured.
 * Mirrors the structure that would come from Sheets (raw row arrays).
 */

import type {
  ILeague,
  ITeam,
  IPlayer,
  ILeaguePlayer,
  IGame,
  IStat,
} from "@/core/interfaces";

export const SAMPLE_LEAGUES: ILeague[] = [
  {
    leagueId: "league1",
    name: "Spring 2024 Neighbourhood League",
    season: "2024",
    accessCode: "ABC123",
    createdAt: "2024-01-01T00:00:00Z",
  },
  {
    leagueId: "league2",
    name: "Summer 2024 Community Cup",
    season: "2024",
    accessCode: "XYZ789",
    createdAt: "2024-06-01T00:00:00Z",
  },
];

export const SAMPLE_TEAMS: ITeam[] = [
  { teamId: "team1", leagueId: "league1", name: "Thunder FC" },
  { teamId: "team2", leagueId: "league1", name: "Storm United" },
  { teamId: "team3", leagueId: "league1", name: "Lightning FC" },
  { teamId: "team4", leagueId: "league1", name: "Rain City" },
  { teamId: "team5", leagueId: "league2", name: "Sunrise FC" },
  { teamId: "team6", leagueId: "league2", name: "Sunset United" },
];

export const SAMPLE_PLAYERS: IPlayer[] = [
  {
    playerId: "player-1",
    name: "Alex Johnson",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-2",
    name: "Sam Williams",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-3",
    name: "Jordan Lee",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-4",
    name: "Casey Brown",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-5",
    name: "Morgan Davis",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-6",
    name: "Taylor Smith",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-7",
    name: "Riley Martinez",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
  {
    playerId: "player-8",
    name: "Quinn Anderson",
    pictureUrl: "",
    joinedAt: "2024-01-01",
  },
];

export const SAMPLE_LEAGUE_PLAYERS: ILeaguePlayer[] = [
  {
    id: "lp-1",
    leagueId: "league1",
    teamId: "team1",
    playerId: "player-1",
    status: "active",
  },
  {
    id: "lp-2",
    leagueId: "league1",
    teamId: "team1",
    playerId: "player-2",
    status: "active",
  },
  {
    id: "lp-3",
    leagueId: "league1",
    teamId: "team1",
    playerId: "player-3",
    status: "active",
  },
  {
    id: "lp-4",
    leagueId: "league1",
    teamId: "team2",
    playerId: "player-4",
    status: "active",
  },
  {
    id: "lp-5",
    leagueId: "league1",
    teamId: "team2",
    playerId: "player-5",
    status: "active",
  },
  {
    id: "lp-6",
    leagueId: "league1",
    teamId: "team2",
    playerId: "player-6",
    status: "active",
  },
  {
    id: "lp-7",
    leagueId: "league1",
    teamId: "team3",
    playerId: "player-7",
    status: "active",
  },
  {
    id: "lp-8",
    leagueId: "league1",
    teamId: "team4",
    playerId: "player-8",
    status: "active",
  },
];

export const SAMPLE_GAMES: IGame[] = [
  {
    gameId: "game-1",
    leagueId: "league1",
    homeTeamId: "team1",
    awayTeamId: "team2",
    homeScore: 2,
    awayScore: 1,
    playedAt: "2024-03-01T14:00:00Z",
    status: "completed",
  },
  {
    gameId: "game-2",
    leagueId: "league1",
    homeTeamId: "team3",
    awayTeamId: "team4",
    homeScore: 0,
    awayScore: 2,
    playedAt: "2024-03-02T15:00:00Z",
    status: "completed",
  },
  {
    gameId: "game-3",
    leagueId: "league1",
    homeTeamId: "team1",
    awayTeamId: "team3",
    homeScore: 3,
    awayScore: 2,
    playedAt: "2024-03-08T14:00:00Z",
    status: "completed",
  },
  {
    gameId: "game-4",
    leagueId: "league1",
    homeTeamId: "team2",
    awayTeamId: "team4",
    homeScore: 1,
    awayScore: 1,
    playedAt: "2024-03-09T16:00:00Z",
    status: "live",
  },
  {
    gameId: "game-5",
    leagueId: "league1",
    homeTeamId: "team1",
    awayTeamId: "team4",
    homeScore: 0,
    awayScore: 0,
    playedAt: "2024-03-15T14:00:00Z",
    status: "scheduled",
  },
  {
    gameId: "game-6",
    leagueId: "league1",
    homeTeamId: "team2",
    awayTeamId: "team3",
    homeScore: 0,
    awayScore: 0,
    playedAt: "2024-03-16T15:00:00Z",
    status: "scheduled",
  },
];

export const SAMPLE_STATS: IStat[] = [
  {
    statId: "stat-1",
    gameId: "game-1",
    playerId: "player-1",
    teamId: "team1",
    statType: "goal",
    value: 2,
  },
  {
    statId: "stat-2",
    gameId: "game-1",
    playerId: "player-2",
    teamId: "team1",
    statType: "assist",
    value: 1,
  },
  {
    statId: "stat-3",
    gameId: "game-1",
    playerId: "player-4",
    teamId: "team2",
    statType: "goal",
    value: 1,
  },
  {
    statId: "stat-4",
    gameId: "game-2",
    playerId: "player-8",
    teamId: "team4",
    statType: "goal",
    value: 2,
  },
  {
    statId: "stat-5",
    gameId: "game-3",
    playerId: "player-1",
    teamId: "team1",
    statType: "goal",
    value: 2,
  },
  {
    statId: "stat-6",
    gameId: "game-3",
    playerId: "player-3",
    teamId: "team1",
    statType: "goal",
    value: 1,
  },
  {
    statId: "stat-7",
    gameId: "game-3",
    playerId: "player-2",
    teamId: "team1",
    statType: "assist",
    value: 2,
  },
  {
    statId: "stat-8",
    gameId: "game-3",
    playerId: "player-7",
    teamId: "team3",
    statType: "goal",
    value: 2,
  },
];
