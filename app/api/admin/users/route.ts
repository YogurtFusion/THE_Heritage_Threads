import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllUsers, updateUserRole } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    const users = await getAllUsers();
    return NextResponse.json({ success: true, data: users, message: "Users fetched" });
  } catch (error) {
    console.error("GET /api/admin/users error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    const { userId, role } = await req.json();
    if (!userId || !["admin", "user"].includes(role)) {
      return NextResponse.json({ success: false, data: null, message: "Invalid request" }, { status: 400 });
    }
    const user = await updateUserRole(userId, role);
    if (!user) return NextResponse.json({ success: false, data: null, message: "User not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: user, message: "User role updated" });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
