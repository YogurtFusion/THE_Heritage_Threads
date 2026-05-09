import { NextResponse } from "next/server";
import { existsSync } from "fs";
import path from "path";

export async function GET() {
  try {
    // ONLY show setup when .env.local file is physically missing
    const envPath = path.join(process.cwd(), ".env.local");
    const envExists = existsSync(envPath);

    if (!envExists) {
      return NextResponse.json({
        success: true,
        data: { setupComplete: false, reason: "no_env_file" },
        message: ".env.local file not found — setup required",
      });
    }

    // .env.local exists → setup is complete (user manages env manually)
    return NextResponse.json({
      success: true,
      data: { setupComplete: true },
      message: ".env.local exists",
    });
  } catch (err) {
    // On any error, assume setup is done to avoid redirect loops
    return NextResponse.json({
      success: true,
      data: { setupComplete: true },
      message: (err as Error).message,
    });
  }
}
