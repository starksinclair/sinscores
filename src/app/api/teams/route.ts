import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(request: NextRequest) {
  try {
    const leagueId = request.nextUrl.searchParams.get("leagueId");
    const season = request.nextUrl.searchParams.get("season") ?? undefined;
    if (leagueId) {
      const teams = await repositories.team.getByLeague(leagueId, season);
      return NextResponse.json(teams);
    }
    const all = await repositories.team.getAll();
    return NextResponse.json(all);
  } catch (e) {
    console.error("[api/teams GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const team = await repositories.team.create(body);
    return NextResponse.json(team, { status: 201 });
  } catch (e) {
    console.error("[api/teams POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create team" },
      { status: 500 }
    );
  }
}
