import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { leagueId, code } = body;
    if (!leagueId || !code) {
      return NextResponse.json(
        { message: "leagueId and code required" },
        { status: 400 },
      );
    }
    const league = await repositories.league.getByAccessCode(
      String(code).trim(),
    );
    if (!league || league.leagueId !== leagueId) {
      return NextResponse.json({ success: false }, { status: 401 });
    }
    return NextResponse.json({
      success: true,
      accessCode: league.accessCode,
    });
  } catch (e) {
    console.error("[api/manage/verify POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to verify" },
      { status: 500 },
    );
  }
}
