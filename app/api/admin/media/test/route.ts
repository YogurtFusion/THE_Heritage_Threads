import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { testMediaConnection } from "@/lib/mediaUpload";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const result = await testMediaConnection(body);

    return NextResponse.json({ success: result.success, data: null, message: result.message });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: (error as Error).message }, { status: 500 });
  }
}
