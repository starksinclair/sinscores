import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET() {
  try {
    const players = await repositories.player.getAll();
    return NextResponse.json(players);
  } catch (e) {
    console.error("[api/players GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch players" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const player = await repositories.player.create(body);
    return NextResponse.json(player, { status: 201 });
  } catch (e) {
    console.error("[api/players POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create player" },
      { status: 500 },
    );
  }
}
