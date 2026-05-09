import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateOrderStatus, getOrderById } from "@/lib/db";
import { createNotification, sendEmail, sendWhatsApp, orderStatusEmail } from "@/lib/notify";

const VALID_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

// Re-export createNotification wrapper
async function notify(params: Parameters<typeof createNotification>[0]) {
  try { await createNotification(params); } catch {}
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    if ((session.user as { role?: string }).role !== "admin") return NextResponse.json({ success: false, data: null, message: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const { status } = await req.json();

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json({ success: false, data: null, message: `Status must be one of: ${VALID_STATUSES.join(", ")}` }, { status: 400 });
    }

    const order = await updateOrderStatus(id, status);
    if (!order) return NextResponse.json({ success: false, data: null, message: "Order not found" }, { status: 404 });

    const siteName = process.env.SITE_NAME ?? "Heritage Threads";
    const userEmail = (order as { userId?: { email?: string } }).userId?.email ?? "";
    const userName = (order as { userId?: { name?: string } }).userId?.name ?? "Customer";
    const shippingAddress = (order as { shippingAddress?: { fullName?: string; phone?: string } }).shippingAddress;
    const totalAmount = (order as { totalAmount?: number }).totalAmount ?? 0;

    notify({ type: "order_updated", title: `Order ${status}`, message: `Order #${id.slice(-8).toUpperCase()} marked as ${status}`, link: "/admin/orders", data: { orderId: id, status } });

    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: `Your order has been ${status} — ${siteName}`,
        html: orderStatusEmail({ _id: id, status, shippingAddress: { fullName: userName }, totalAmount }, siteName),
      });
    }

    const phone = shippingAddress?.phone;
    if (phone && ["shipped", "delivered"].includes(status)) {
      const msg = status === "shipped"
        ? `Hi ${userName}! Your order #${id.slice(-8).toUpperCase()} from ${siteName} has been shipped!`
        : `Hi ${userName}! Your order #${id.slice(-8).toUpperCase()} from ${siteName} has been delivered. Enjoy!`;
      sendWhatsApp(`+91${phone.replace(/\D/g, "").slice(-10)}`, msg);
    }

    return NextResponse.json({ success: true, data: order, message: "Order status updated" });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
