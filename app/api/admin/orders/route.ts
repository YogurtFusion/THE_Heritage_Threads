import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllOrders } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });

    const orders = await getAllOrders();
    return NextResponse.json({ success: true, data: orders, message: "All orders fetched" });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
