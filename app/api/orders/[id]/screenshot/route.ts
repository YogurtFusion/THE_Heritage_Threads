import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";
import { createNotification } from "@/lib/notify";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, data: null, message: "Order not found" }, { status: 404 });
    }

    // Only the order owner can upload screenshot
    const userId = (session.user as { userId?: string }).userId;
    if (order.userId.toString() !== userId) {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("screenshot") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json({ success: false, data: null, message: "No screenshot provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ success: false, data: null, message: "Only image files are allowed" }, { status: 400 });
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ success: false, data: null, message: "File size must be under 5MB" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "screenshots");
    await mkdir(uploadDir, { recursive: true });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.name.split(".").pop() ?? "jpg";
    const filename = `screenshot-${id}-${Date.now()}.${ext}`;
    await writeFile(path.join(uploadDir, filename), buffer);

    const screenshotPath = `/uploads/screenshots/${filename}`;

    await Order.findByIdAndUpdate(id, {
      paymentScreenshot: screenshotPath,
      paymentMethod: "qr",
      paymentStatus: "pending",
    });

    // Notify admin about new payment receipt
    createNotification({
      type: "payment_receipt",
      title: "New Payment Receipt",
      message: `Order #${id.slice(-8).toUpperCase()} — payment screenshot uploaded, awaiting verification`,
      link: "/admin/payments",
      data: { orderId: id },
    });

    return NextResponse.json({
      success: true,
      data: { screenshotPath },
      message: "Screenshot uploaded. Your payment is pending verification.",
    });
  } catch (error) {
    console.error("POST /api/orders/[id]/screenshot error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
