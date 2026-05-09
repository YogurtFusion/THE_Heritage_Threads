import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Product from "@/models/Product";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";

function requireAdmin(session: { user?: { role?: string } } | null) {
  if (!session?.user) return "Unauthorized";
  if (session.user.role !== "admin") return "Forbidden";
  return null;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) {
      return NextResponse.json(
        { success: false, data: null, message: authError },
        { status: authError === "Unauthorized" ? 401 : 403 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, data: null, message: "Product not found" },
        { status: 404 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const description = formData.get("description") as string | null;
    const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined;
    const discountPrice = formData.get("discountPrice")
      ? parseFloat(formData.get("discountPrice") as string)
      : undefined;
    const category = formData.get("category") as string | null;
    const stock = formData.get("stock") ? parseInt(formData.get("stock") as string, 10) : undefined;
    const isFeatured = formData.get("isFeatured") !== null ? formData.get("isFeatured") === "true" : undefined;
    const isTrending = formData.get("isTrending") !== null ? formData.get("isTrending") === "true" : undefined;

    if (name) product.name = name;
    if (description !== null) product.description = description ?? "";
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = stock;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;
    if (isTrending !== undefined) product.isTrending = isTrending;

    // Handle new image uploads
    const imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length > 0 && imageFiles[0].size > 0) {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const newPaths: string[] = [];
      for (const file of imageFiles) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const ext = file.name.split(".").pop() ?? "jpg";
          const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const filePath = path.join(uploadDir, filename);
          await writeFile(filePath, buffer);
          newPaths.push(`/uploads/${filename}`);
        }
      }
      product.images = newPaths;
    }

    await product.save();

    return NextResponse.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("PUT /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const authError = requireAdmin(session);
    if (authError) {
      return NextResponse.json(
        { success: false, data: null, message: authError },
        { status: authError === "Unauthorized" ? 401 : 403 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { success: false, data: null, message: "Product not found" },
        { status: 404 }
      );
    }

    // Delete associated images from disk
    for (const imgPath of product.images) {
      if (imgPath.startsWith("/uploads/")) {
        const fullPath = path.join(process.cwd(), "public", imgPath);
        await unlink(fullPath).catch(() => {/* ignore if file doesn't exist */});
      }
    }

    await product.deleteOne();

    return NextResponse.json({
      success: true,
      data: null,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id] error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
