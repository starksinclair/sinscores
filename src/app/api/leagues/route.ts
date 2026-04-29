import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

function stripAccessCode<T extends { accessCode?: string }>(
  obj: T,
): Omit<T, "accessCode"> {
  const { accessCode, ...rest } = obj;
  void accessCode;
  return rest;
}

export async function GET(request: NextRequest) {
  try {
    const accessCode = request.nextUrl.searchParams.get("accessCode");
    if (accessCode) {
      const league = await repositories.league.getByAccessCode(accessCode);
      return NextResponse.json(league ? stripAccessCode(league) : null);
    }
    const leagues = await repositories.league.getAll();
    return NextResponse.json(leagues.map(stripAccessCode));
  } catch (e) {
    console.error("[api/leagues GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch leagues" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const league = await repositories.league.create(body);
    return NextResponse.json(stripAccessCode(league), { status: 201 });
  } catch (e) {
    console.error("[api/leagues POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create league" },
      { status: 500 },
    );
  }
}
