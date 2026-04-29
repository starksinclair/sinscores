import { NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET() {
  try {
    const games = await repositories.game.getTodaysGames();
    return NextResponse.json(games);
  } catch (e) {
    console.error("[api/games/today GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch today's games" },
      { status: 500 }
    );
  }
}
