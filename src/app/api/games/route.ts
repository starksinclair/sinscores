import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(request: NextRequest) {
  try {
    const leagueId = request.nextUrl.searchParams.get("leagueId");
    const season = request.nextUrl.searchParams.get("season") ?? "all";
    const teamId = request.nextUrl.searchParams.get("teamId");
    if (teamId) {
      const games = await repositories.game.getByTeam(teamId);
      return NextResponse.json(games);
    }
    if (leagueId) {
      const games = await repositories.game.getByLeague(leagueId, season);
      return NextResponse.json(games);
    }
    const all = await repositories.game.getAll();
    return NextResponse.json(all);
  } catch (e) {
    console.error("[api/games GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch games" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const game = await repositories.game.create(body);
    return NextResponse.json(game, { status: 201 });
  } catch (e) {
    console.error("[api/games POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create game" },
      { status: 500 },
    );
  }
}
