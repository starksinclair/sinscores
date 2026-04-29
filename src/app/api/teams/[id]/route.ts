import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const team = await repositories.team.getById(params.id);
    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }
    return NextResponse.json(team);
  } catch (e) {
    console.error("[api/teams/[id] GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch team" },
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
    const team = await repositories.team.update(params.id, body);
    return NextResponse.json(team);
  } catch (e) {
    console.error("[api/teams/[id] PATCH]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to update team" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await repositories.team.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/teams/[id] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to delete team" },
      { status: 500 }
    );
  }
}
