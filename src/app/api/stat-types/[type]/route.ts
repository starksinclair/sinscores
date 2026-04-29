import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    await repositories.statType.delete(params.type);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/stat-types/[type] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    if (e instanceof Error && e.message.includes("Cannot delete default")) {
      return NextResponse.json({ message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to delete stat type" },
      { status: 500 }
    );
  }
}
