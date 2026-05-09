import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { apiKey, authToken } = body;

    if (!apiKey?.trim() || !authToken?.trim()) {
      return NextResponse.json(
        { success: false, data: null, message: "API Key and Auth Token are required" },
        { status: 400 }
      );
    }

    // Instamojo only has ONE real API endpoint: www.instamojo.com
    // test.instamojo.com does NOT exist as a public domain
    const endpoint = "https://www.instamojo.com/api/1.1";

    try {
      const res = await fetch(`${endpoint}/payment-requests/?limit=1`, {
        method: "GET",
        headers: {
          "X-Api-Key": apiKey.trim(),
          "X-Auth-Token": authToken.trim(),
        },
      });

      console.log(`Instamojo test → HTTP ${res.status}`);

      if (res.ok) {
        return NextResponse.json({
          success: true,
          data: { endpoint },
          message: "✅ Instamojo credentials are valid! Connected successfully.",
        });
      }

      if (res.status === 401 || res.status === 403) {
        return NextResponse.json({
          success: false,
          data: null,
          message: "❌ Invalid credentials (403). Your API Key or Auth Token is wrong. Get the correct keys from instamojo.com → Settings → API & Plugins.",
        }, { status: 400 });
      }

      const data = await res.json().catch(() => ({}));
      return NextResponse.json({
        success: false,
        data: null,
        message: `❌ Instamojo returned HTTP ${res.status}: ${(data as { message?: string }).message ?? "Unknown error"}`,
      }, { status: 400 });

    } catch (err) {
      return NextResponse.json({
        success: false,
        data: null,
        message: `❌ Network error: ${(err as Error).message}`,
      }, { status: 503 });
    }
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
