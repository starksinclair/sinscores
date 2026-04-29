import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const entries = request.nextUrl.searchParams.get("entries") === "true";
    if (entries) {
      const list = await repositories.league.getSeasonEntries(id);
      return NextResponse.json(list);
    }
    const seasons = await repositories.league.getSeasons(id);
    return NextResponse.json(seasons);
  } catch (e) {
    console.error("[api/leagues/[id]/seasons GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch seasons" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const season = request.nextUrl.searchParams.get("season");
    if (!season) {
      return NextResponse.json(
        { message: "season query param is required" },
        { status: 400 },
      );
    }
    await repositories.league.endSeason(id, season);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/leagues/[id]/seasons DELETE]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to end season" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { id } = params;
    const { season } = await request.json();
    if (!season || typeof season !== "string") {
      return NextResponse.json(
        { message: "season is required" },
        { status: 400 },
      );
    }
    const entry = await repositories.league.addSeason(id, season);
    return NextResponse.json(entry, { status: 201 });
  } catch (e) {
    console.error("[api/leagues/[id]/seasons POST]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to add season" },
      { status: 500 },
    );
  }
}
