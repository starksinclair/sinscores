import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await repositories.stat.delete(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("[api/stats/[id] DELETE]", e);
    if (e instanceof Error && e.message.includes("not found")) {
      return NextResponse.json({ message: e.message }, { status: 404 });
    }
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to delete stat" },
      { status: 500 }
    );
  }
}
