import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDashboardData } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });

    const data = await getDashboardData();
    return NextResponse.json({ success: true, data, message: "Dashboard data fetched" });
  } catch (error) {
    console.error("GET /api/admin/dashboard error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
