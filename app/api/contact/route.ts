import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Contact from "@/models/Contact";
import { createNotification, sendEmail, contactNotificationEmail } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, data: null, message: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const contact = await Contact.create({ name, email, message });

    // Admin notification
    createNotification({
      type: "new_contact",
      title: "New Contact Message",
      message: `${name} (${email}): ${message.slice(0, 80)}${message.length > 80 ? "…" : ""}`,
      link: "/admin/contacts",
      data: { contactId: contact._id.toString(), name, email },
    });

    const adminEmail = process.env.GMAIL_USER;
    if (adminEmail) {
      sendEmail({
        to: adminEmail,
        subject: `New Contact Message from ${name} | ${process.env.SITE_NAME ?? "Heritage Threads"}`,
        html: contactNotificationEmail({ name, email, message }, process.env.SITE_NAME ?? "Heritage Threads"),
      });
    }

    return NextResponse.json(
      { success: true, data: contact, message: "Message sent successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/contact error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
