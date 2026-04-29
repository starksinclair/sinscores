import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

function stripAccessCode<T extends { accessCode?: string }>(obj: T): Omit<T, "accessCode"> {
  const { accessCode, ...rest } = obj;
  void accessCode;
  return rest;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const league = await repositories.league.getById(id);
    if (!league) {
      return NextResponse.json({ message: "League not found" }, { status: 404 });
    }
    return NextResponse.json(stripAccessCode(league));
  } catch (e) {
    console.error("[api/leagues/[id] GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch league" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const league = await repositories.league.update(id, body);
    return NextResponse.json(stripAccessCode(league));
  } catch (e) {
    console.error("[api/leagues/[id] PATCH]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to update league" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    await repositories.league.delete(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/leagues/[id] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to delete league" },
      { status: 500 }
    );
  }
}
