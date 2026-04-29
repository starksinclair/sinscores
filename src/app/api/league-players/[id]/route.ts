import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const lp = await repositories.leaguePlayer.getById(params.id);
    if (!lp) {
      return NextResponse.json(
        { message: "League player not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(lp);
  } catch (e) {
    console.error("[api/league-players/[id] GET]", e);
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "Failed to fetch league player",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json();
    const lp = await repositories.leaguePlayer.update(params.id, body);
    return NextResponse.json(lp);
  } catch (e) {
    console.error("[api/league-players/[id] PATCH]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "Failed to update league player",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await repositories.leaguePlayer.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/league-players/[id] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      {
        message:
          e instanceof Error ? e.message : "Failed to delete league player",
      },
      { status: 500 },
    );
  }
}
