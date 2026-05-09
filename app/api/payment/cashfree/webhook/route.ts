import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-webhook-signature");
    const timestamp = req.headers.get("x-webhook-timestamp");

    const secretKey = process.env.CASHFREE_SECRET_KEY ?? "";

    // Verify signature
    if (signature && timestamp && secretKey) {
      const signedPayload = `${timestamp}${body}`;
      const expectedSig = crypto
        .createHmac("sha256", secretKey)
        .update(signedPayload)
        .digest("base64");

      if (expectedSig !== signature) {
        console.warn("Cashfree webhook: invalid signature");
        return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
      }
    }

    const event = JSON.parse(body);
    const { type, data: eventData } = event;

    if (type === "PAYMENT_SUCCESS_WEBHOOK") {
      const orderId = eventData?.order?.order_id;
      if (orderId) {
        await dbConnect();
        await Order.findOneAndUpdate(
          { _id: orderId },
          { paymentStatus: "paid", status: "processing" }
        );
      }
    }

    return NextResponse.json({ success: true, message: "Webhook received" });
  } catch (error) {
    console.error("Cashfree webhook error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
