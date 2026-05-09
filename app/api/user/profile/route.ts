import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;

    if (!name?.trim()) {
      return NextResponse.json({ success: false, data: null, message: "Name is required" }, { status: 400 });
    }

    await dbConnect();

    const userId = (session.user as { userId?: string }).userId;
    const user = await User.findByIdAndUpdate(
      userId,
      { name: name.trim() },
      { new: true }
    ).select("-password");

    if (!user) {
      return NextResponse.json({ success: false, data: null, message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { name: user.name }, message: "Profile updated" });
  } catch (error) {
    console.error("PATCH /api/user/profile error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
