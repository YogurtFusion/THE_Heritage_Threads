import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyOrderPayment, getOrderById } from "@/lib/db";
import { createNotification, sendEmail, orderStatusEmail } from "@/lib/notify";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as { role?: string }).role !== "admin") {
      return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await req.json();

    if (!["verify", "decline"].includes(action)) {
      return NextResponse.json({ success: false, data: null, message: "action must be 'verify' or 'decline'" }, { status: 400 });
    }

    const order = await verifyOrderPayment(id, action as "verify" | "decline");
    if (!order) return NextResponse.json({ success: false, data: null, message: "Order not found" }, { status: 404 });

    const siteName = process.env.SITE_NAME ?? "Heritage Threads";
    const userEmail = (order as { userId?: { email?: string } }).userId?.email ?? "";
    const userName = (order as { userId?: { name?: string } }).userId?.name ?? "Customer";
    const totalAmount = (order as { totalAmount?: number }).totalAmount ?? 0;
    const status = (order as { status?: string }).status ?? "pending";

    createNotification({
      type: "order_updated",
      title: action === "verify" ? "Payment Verified" : "Payment Declined",
      message: `Order #${id.slice(-8).toUpperCase()} payment ${action === "verify" ? "verified" : "declined"}`,
      link: "/admin/orders",
      data: { orderId: id, action },
    });

    if (userEmail) {
      const subject = action === "verify"
        ? `Payment Confirmed — Order #${id.slice(-8).toUpperCase()} | ${siteName}`
        : `Payment Not Verified — Order #${id.slice(-8).toUpperCase()} | ${siteName}`;
      const html = action === "verify"
        ? orderStatusEmail({ _id: id, status, shippingAddress: { fullName: userName }, totalAmount }, siteName)
        : `<div style="font-family:sans-serif;padding:20px"><h2>Payment Not Verified</h2><p>Hi ${userName}, we could not verify your payment for order #${id.slice(-8).toUpperCase()}. Your order has been converted to Cash on Delivery.</p></div>`;
      sendEmail({ to: userEmail, subject, html });
    }

    return NextResponse.json({
      success: true,
      data: { paymentStatus: action === "verify" ? "paid" : "pending", status },
      message: action === "verify" ? "Payment verified" : "Payment declined — order reverted to COD",
    });
  } catch (error) {
    console.error("POST /api/admin/orders/[id]/verify-payment error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
