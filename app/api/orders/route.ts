import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createOrder, getUserOrders } from "@/lib/db";
import { createNotification, sendEmail, orderConfirmationEmail } from "@/lib/notify";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, totalAmount, shippingAddress, paymentId, paymentStatus, paymentMethod, subtotal, shippingCost } = body;

    if (!items?.length || !totalAmount || !shippingAddress) {
      return NextResponse.json({ success: false, data: null, message: "Items, totalAmount, and shippingAddress are required" }, { status: 400 });
    }

    const userId = (session.user as { userId?: string }).userId ?? "";
    const order = await createOrder({ userId, items, totalAmount, shippingAddress, paymentId, paymentStatus, paymentMethod });

    const userEmail = session.user.email ?? "";
    const siteName = process.env.SITE_NAME ?? "Heritage Threads";
    const computedSubtotal = subtotal ?? items.reduce((s: number, i: { price: number; qty: number }) => s + i.price * i.qty, 0);
    const computedShipping = shippingCost ?? (totalAmount - computedSubtotal);
    const orderId = (order as { _id?: string })._id?.toString() ?? "";

    createNotification({
      type: "new_order",
      title: "New Order Received",
      message: `Order #${orderId.slice(-8).toUpperCase()} — ₹${totalAmount} from ${shippingAddress.fullName}`,
      link: "/admin/orders",
      data: { orderId, totalAmount },
    });

    if (userEmail) {
      sendEmail({
        to: userEmail,
        subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()} | ${siteName}`,
        html: orderConfirmationEmail({
          _id: orderId,
          items: items.map((i: { name: string; qty: number; price: number }) => ({ name: i.name, qty: i.qty, price: i.price })),
          subtotal: computedSubtotal,
          shippingCost: computedShipping,
          totalAmount,
          status: "pending",
          paymentMethod: paymentMethod ?? "cod",
          shippingAddress: {
            fullName: shippingAddress.fullName ?? "",
            addressLine1: shippingAddress.addressLine1 ?? "",
            addressLine2: shippingAddress.addressLine2 ?? "",
            city: shippingAddress.city ?? "",
            state: shippingAddress.state ?? "",
            pincode: shippingAddress.pincode ?? "",
            phone: shippingAddress.phone ?? "",
          },
        }, siteName),
      });
    }

    return NextResponse.json({ success: true, data: order, message: "Order created successfully" }, { status: 201 });
  } catch (error) {
    console.error("POST /api/orders error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { userId?: string }).userId ?? "";
    const orders = await getUserOrders(userId);
    return NextResponse.json({ success: true, data: orders, message: "Orders fetched successfully" });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
