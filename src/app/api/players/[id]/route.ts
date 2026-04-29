import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const player = await repositories.player.getById(params.id);
    if (!player) {
      return NextResponse.json({ message: "Player not found" }, { status: 404 });
    }
    return NextResponse.json(player);
  } catch (e) {
    console.error("[api/players/[id] GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch player" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const player = await repositories.player.update(params.id, body);
    return NextResponse.json(player);
  } catch (e) {
    console.error("[api/players/[id] PATCH]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to update player" },
      { status: 500 }
    );
  }
}
