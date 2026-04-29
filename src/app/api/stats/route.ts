import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(request: NextRequest) {
  try {
    const gameId = request.nextUrl.searchParams.get("gameId");
    const leagueId = request.nextUrl.searchParams.get("leagueId");
    const season = request.nextUrl.searchParams.get("season") ?? undefined;
    const playerId = request.nextUrl.searchParams.get("playerId");
    if (gameId) {
      const stats = await repositories.stat.getByGame(gameId);
      return NextResponse.json(stats);
    }
    if (leagueId && season) {
      const stats = await repositories.stat.getByLeague(leagueId, season);
      return NextResponse.json(stats);
    }
    if (playerId) {
      const stats = await repositories.stat.getByPlayer(
        playerId,
        leagueId ?? undefined,
        season
      );
      return NextResponse.json(stats);
    }
    const all = await repositories.stat.getAll();
    return NextResponse.json(all);
  } catch (e) {
    console.error("[api/stats GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const stat = await repositories.stat.create(body);
    return NextResponse.json(stat, { status: 201 });
  } catch (e) {
    console.error("[api/stats POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create stat" },
      { status: 500 }
    );
  }
}
