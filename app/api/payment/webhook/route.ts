import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Order from "@/models/Order";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);

    const paymentId = params.get("payment_id");
    const paymentRequestId = params.get("payment_request_id");
    const status = params.get("status");
    const mac = params.get("mac");

    // Verify HMAC signature from Instamojo
    const salt = process.env.INSTAMOJO_SALT;
    if (salt && mac) {
      const message = `|${paymentId}|${paymentRequestId}|${status}`;
      const expectedMac = crypto
        .createHmac("sha1", salt)
        .update(message)
        .digest("hex");

      if (expectedMac !== mac) {
        console.warn("Instamojo webhook: invalid MAC signature");
        return NextResponse.json(
          { success: false, data: null, message: "Invalid signature" },
          { status: 400 }
        );
      }
    }

    if (status === "Credit") {
      await dbConnect();

      // Update order payment status
      await Order.findOneAndUpdate(
        { paymentId: paymentRequestId },
        { paymentStatus: "paid", status: "processing" }
      );
    }

    return NextResponse.json({ success: true, data: null, message: "Webhook received" });
  } catch (error) {
    console.error("POST /api/payment/webhook error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
