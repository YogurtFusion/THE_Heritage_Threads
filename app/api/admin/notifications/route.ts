import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotifications, markAllNotificationsRead } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    const data = await getNotifications();
    return NextResponse.json({ success: true, data, message: "Notifications fetched" });
  } catch (error) {
    console.error("GET /api/admin/notifications error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    await markAllNotificationsRead();
    return NextResponse.json({ success: true, data: null, message: "All notifications marked as read" });
  } catch (error) {
    console.error("PATCH /api/admin/notifications error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
