import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;
    const search = searchParams.get("search") ?? undefined;
    const featured = searchParams.get("featured") === "true";
    const trending = searchParams.get("trending") === "true";
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const result = await getProducts({ category, search, featured, trending, page, limit });

    return NextResponse.json({
      success: true,
      data: result,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("GET /api/products error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
