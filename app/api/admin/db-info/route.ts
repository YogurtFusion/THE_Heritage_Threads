import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { detectDbType, getDbUri } from "@/lib/dbConnect";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const uri = getDbUri();
    const type = detectDbType(uri);

    // Mask credentials in the URI for display
    let displayUri = uri;
    try {
      if (uri.startsWith("mongodb") || uri.startsWith("mysql")) {
        const url = new URL(uri.replace("mongodb+srv://", "https://").replace("mongodb://", "https://").replace("mysql://", "https://"));
        if (url.password) {
          url.password = "****";
          displayUri = uri
            .replace(/:([^@]+)@/, ":****@")
            .replace("https://", uri.startsWith("mongodb+srv") ? "mongodb+srv://" : uri.startsWith("mongodb") ? "mongodb://" : "mysql://");
        }
      }
    } catch {
      // keep original
    }

    return NextResponse.json({
      success: true,
      data: { type, uri: displayUri },
      message: "DB info fetched",
    });
  } catch (error) {
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
