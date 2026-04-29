import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const game = await repositories.game.getById(params.id);
    if (!game) {
      return NextResponse.json({ message: "Game not found" }, { status: 404 });
    }
    return NextResponse.json(game);
  } catch (e) {
    console.error("[api/games/[id] GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch game" },
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
    const game = await repositories.game.update(params.id, body);
    return NextResponse.json(game);
  } catch (e) {
    console.error("[api/games/[id] PATCH]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to update game" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await repositories.game.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/games/[id] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to delete game" },
      { status: 500 },
    );
  }
}
