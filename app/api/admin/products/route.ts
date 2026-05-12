import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { uploadMedia } from "@/lib/mediaUpload";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session?.user) return "Unauthorized";
  if (session.user.role !== "admin") return "Forbidden";
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) {
      return NextResponse.json(
        { success: false, data: null, message: authError },
        { status: authError === "Unauthorized" ? 401 : 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const discountPrice = formData.get("discountPrice")
      ? parseFloat(formData.get("discountPrice") as string)
      : undefined;
    const category = formData.get("category") as string;
    const stock = parseInt(formData.get("stock") as string, 10);
    const isFeatured = formData.get("isFeatured") === "true";
    const isTrending = formData.get("isTrending") === "true";

    if (!name || !price || !category) {
      return NextResponse.json(
        { success: false, data: null, message: "Name, price, and category are required" },
        { status: 400 }
      );
    }

    // Generate slug
    let slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    await dbConnect();

    // Ensure slug is unique
    const existing = await Product.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }
    // Handle image uploads using the configured media provider
    const imagePaths: string[] = [];
    const imageFiles = formData.getAll("images") as File[];
    for (const file of imageFiles) {
      if (file && file.size > 0) {
        const url = await uploadMedia(file, "products");
        imagePaths.push(url);
      }
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      discountPrice,
      category,
      stock: isNaN(stock) ? 0 : stock,
      isFeatured,
      isTrending,
      images: imagePaths,
    });

    return NextResponse.json(
      { success: true, data: product, message: "Product created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
