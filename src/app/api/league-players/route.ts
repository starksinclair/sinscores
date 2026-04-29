import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(request: NextRequest) {
  try {
    const leagueId = request.nextUrl.searchParams.get("leagueId");
    const season = request.nextUrl.searchParams.get("season") ?? "all";
    const playerId = request.nextUrl.searchParams.get("playerId");
    if (playerId) {
      const list = await repositories.leaguePlayer.getByPlayer(playerId);
      return NextResponse.json(list);
    }
    if (leagueId) {
      const list = await repositories.leaguePlayer.getByLeague(
        leagueId,
        season,
      );
      return NextResponse.json(list);
    }
    const all = await repositories.leaguePlayer.getAll();
    return NextResponse.json(all);
  } catch (e) {
    console.error("[api/league-players GET]", e);
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "Failed to fetch league players",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      leagueId?: string;
      teamId?: string;
      playerId?: string;
      season?: string;
      [key: string]: unknown;
    };
    if (body.leagueId && body.teamId && body.playerId) {
      const lp = await repositories.leaguePlayer.assignPlayer(
        body.leagueId,
        body.teamId,
        body.playerId,
        body.season,
      );
      return NextResponse.json(lp, { status: 201 });
    }
    const lp = await repositories.leaguePlayer.create(body);
    return NextResponse.json(lp, { status: 201 });
  } catch (e) {
    console.error("[api/league-players POST]", e);
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "Failed to create league player",
      },
      { status: 500 },
    );
  }
}
