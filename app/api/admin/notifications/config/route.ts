import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

async function readEnv(): Promise<Record<string, string>> {
  const envPath = path.join(process.cwd(), ".env.local");
  if (!existsSync(envPath)) return {};
  const content = await readFile(envPath, "utf-8");
  const result: Record<string, string> = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    result[trimmed.slice(0, eqIdx).trim()] = trimmed.slice(eqIdx + 1).trim();
  }
  return result;
}

async function updateEnv(updates: Record<string, string>) {
  const envPath = path.join(process.cwd(), ".env.local");
  const existing = await readEnv();
  const merged = { ...existing, ...updates };
  const lines = Object.entries(merged).map(([k, v]) => `${k}=${v}`);
  await writeFile(envPath, lines.join("\n"), "utf-8");
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const env = await readEnv();
    return NextResponse.json({
      success: true,
      data: {
        gmailUser: env.GMAIL_USER ?? "",
        gmailAppPassword: env.GMAIL_APP_PASSWORD ? "••••••••" : "",
        twilioSid: env.TWILIO_ACCOUNT_SID ?? "",
        twilioToken: env.TWILIO_AUTH_TOKEN ? "••••••••" : "",
        twilioWhatsapp: env.TWILIO_WHATSAPP_FROM ?? "whatsapp:+14155238886",
        adminWhatsapp: env.ADMIN_WHATSAPP ?? "",
      },
      message: "Config fetched",
    });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const updates: Record<string, string> = {};

    if (body.gmailUser !== undefined) updates.GMAIL_USER = body.gmailUser;
    if (body.gmailAppPassword && body.gmailAppPassword !== "••••••••") updates.GMAIL_APP_PASSWORD = body.gmailAppPassword;
    if (body.twilioSid !== undefined) updates.TWILIO_ACCOUNT_SID = body.twilioSid;
    if (body.twilioToken && body.twilioToken !== "••••••••") updates.TWILIO_AUTH_TOKEN = body.twilioToken;
    if (body.twilioWhatsapp !== undefined) updates.TWILIO_WHATSAPP_FROM = body.twilioWhatsapp;
    if (body.adminWhatsapp !== undefined) updates.ADMIN_WHATSAPP = body.adminWhatsapp;

    await updateEnv(updates);

    return NextResponse.json({ success: true, data: null, message: "Notification config saved. Restart server to apply." });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: (error as Error).message }, { status: 500 });
  }
}
