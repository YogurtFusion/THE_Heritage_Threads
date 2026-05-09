import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllContacts, deleteContact } from "@/lib/db";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    const contacts = await getAllContacts();
    return NextResponse.json({ success: true, data: contacts, message: "Contacts fetched" });
  } catch (error) {
    console.error("GET /api/admin/contacts error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, data: null, message: "ID required" }, { status: 400 });
    await deleteContact(id);
    return NextResponse.json({ success: true, data: null, message: "Contact deleted" });
  } catch (error) {
    console.error("DELETE /api/admin/contacts error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
