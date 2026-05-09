import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, sendWhatsApp } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { type, gmailUser, gmailAppPassword, twilioSid, twilioToken, twilioWhatsapp, adminWhatsapp } = body;

    if (type === "email") {
      if (!gmailUser) return NextResponse.json({ success: false, data: null, message: "Gmail address is required" }, { status: 400 });

      // Temporarily set env vars for this request
      if (gmailUser) process.env.GMAIL_USER = gmailUser;
      if (gmailAppPassword && gmailAppPassword !== "••••••••") process.env.GMAIL_APP_PASSWORD = gmailAppPassword;

      try {
        await sendEmail({
          to: gmailUser,
          subject: "✅ Test Email from Your Store",
          html: `<div style="font-family:sans-serif;padding:20px"><h2>Test Email</h2><p>Your email notifications are working correctly! 🎉</p><p style="color:#888;font-size:12px">Sent from your store admin panel.</p></div>`,
        });
        return NextResponse.json({ success: true, data: null, message: `Test email sent to ${gmailUser}` });
      } catch (err) {
        return NextResponse.json({ success: false, data: null, message: `Email failed: ${(err as Error).message}` }, { status: 400 });
      }
    }

    if (type === "whatsapp") {
      if (!twilioSid || !adminWhatsapp) {
        return NextResponse.json({ success: false, data: null, message: "Twilio SID and admin WhatsApp number are required" }, { status: 400 });
      }

      if (twilioSid) process.env.TWILIO_ACCOUNT_SID = twilioSid;
      if (twilioToken && twilioToken !== "••••••••") process.env.TWILIO_AUTH_TOKEN = twilioToken;
      if (twilioWhatsapp) process.env.TWILIO_WHATSAPP_FROM = twilioWhatsapp;

      try {
        await sendWhatsApp(adminWhatsapp, "✅ Test WhatsApp from your store! Notifications are working correctly. 🎉");
        return NextResponse.json({ success: true, data: null, message: `Test WhatsApp sent to ${adminWhatsapp}` });
      } catch (err) {
        return NextResponse.json({ success: false, data: null, message: `WhatsApp failed: ${(err as Error).message}` }, { status: 400 });
      }
    }

    return NextResponse.json({ success: false, data: null, message: "Invalid test type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: (error as Error).message }, { status: 500 });
  }
}
