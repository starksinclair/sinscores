import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q");
    if (!q || q.trim() === "") {
      return NextResponse.json([]);
    }
    const players = await repositories.player.search(q);
    return NextResponse.json(players);
  } catch (e) {
    console.error("[api/players/search GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to search players" },
      { status: 500 }
    );
  }
}
