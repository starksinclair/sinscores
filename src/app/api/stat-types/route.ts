import { NextRequest, NextResponse } from "next/server";
import { repositories } from "@/infrastructure/container.server";

export async function GET() {
  try {
    const statTypes = await repositories.statType.getAll();
    return NextResponse.json(statTypes);
  } catch (e) {
    console.error("[api/stat-types GET]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to fetch stat types" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const statType = await repositories.statType.create(body);
    return NextResponse.json(statType, { status: 201 });
  } catch (e) {
    console.error("[api/stat-types POST]", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Failed to create stat type" },
      { status: 500 }
    );
  }
}
