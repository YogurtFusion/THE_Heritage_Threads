import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, buyerName, buyerEmail, buyerPhone, orderId, returnUrl } = body;

    if (!amount || !buyerName || !buyerEmail || !buyerPhone || !orderId) {
      return NextResponse.json({ success: false, data: null, message: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();
    const dbSettings = await Settings.findOne({}).lean() as {
      cashfreeAppId?: string;
      cashfreeSecretKey?: string;
      cashfreeEnv?: string;
    } | null;

    const appId = dbSettings?.cashfreeAppId?.trim() || process.env.CASHFREE_APP_ID || "";
    const secretKey = dbSettings?.cashfreeSecretKey?.trim() || process.env.CASHFREE_SECRET_KEY || "";
    const env = dbSettings?.cashfreeEnv || "sandbox";

    if (!appId || !secretKey) {
      return NextResponse.json(
        { success: false, data: null, message: "Cashfree credentials not configured. Add them in Admin → Settings → Payment." },
        { status: 503 }
      );
    }

    const baseUrl = env === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const finalReturnUrl = returnUrl ?? `${appUrl}/success`;

    const orderPayload = {
      order_id: orderId,
      order_amount: Number(amount).toFixed(2),
      order_currency: "INR",
      customer_details: {
        customer_id: (session.user as { userId?: string }).userId ?? "guest",
        customer_name: buyerName,
        customer_email: buyerEmail,
        customer_phone: buyerPhone.replace(/\D/g, "").slice(-10),
      },
      order_meta: {
        return_url: `${finalReturnUrl}?order_id={order_id}`,
        notify_url: `${appUrl}/api/payment/cashfree/webhook`,
      },
    };

    const response = await fetch(`${baseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": appId,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    console.log("Cashfree response:", JSON.stringify(data));

    if (!response.ok || data.type === "ERROR") {
      return NextResponse.json(
        { success: false, data: null, message: data.message ?? "Cashfree payment creation failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentSessionId: data.payment_session_id,
        orderId: data.order_id,
        paymentUrl: `${baseUrl}/checkout/post/submit`,
        cfOrderId: data.cf_order_id,
      },
      message: "Cashfree order created",
    });
  } catch (error) {
    console.error("Cashfree payment error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
