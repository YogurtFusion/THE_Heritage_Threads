import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/dbConnect";
import Settings from "@/models/Settings";

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+91${digits.slice(-10)}`;
}

async function createPaymentRequest(
  baseUrl: string,
  apiKey: string,
  authToken: string,
  payload: URLSearchParams
) {
  const res = await fetch(`${baseUrl}/payment-requests/`, {
    method: "POST",
    headers: {
      "X-Api-Key": apiKey,
      "X-Auth-Token": authToken,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: payload.toString(),
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ success: false, data: null, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, buyerName, buyerEmail, buyerPhone, purpose, redirectUrl } = body;

    if (!amount || !buyerName || !buyerEmail || !buyerPhone) {
      return NextResponse.json({ success: false, data: null, message: "Missing required fields" }, { status: 400 });
    }

    // Prefer DB settings, fall back to env
    await dbConnect();
    const dbSettings = await Settings.findOne({}).lean() as {
      instaMojoApiKey?: string;
      instaMojoAuthToken?: string;
    } | null;

    const apiKey = dbSettings?.instaMojoApiKey?.trim() || process.env.INSTAMOJO_API_KEY || "";
    const authToken = dbSettings?.instaMojoAuthToken?.trim() || process.env.INSTAMOJO_AUTH_TOKEN || "";

    if (!apiKey || !authToken) {
      return NextResponse.json(
        { success: false, data: null, message: "Instamojo credentials not configured. Go to Admin → Settings → Payment to add them." },
        { status: 503 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    // For seamless checkout, redirect_url is where Instamojo sends the user after payment
    const finalRedirectUrl = redirectUrl ?? `${appUrl}/success`;

    const payload = new URLSearchParams();
    payload.append("purpose", String(purpose || "Order Payment").slice(0, 30));
    payload.append("amount", Number(amount).toFixed(2));
    payload.append("buyer_name", String(buyerName).slice(0, 100));
    payload.append("email", String(buyerEmail));
    payload.append("phone", formatPhone(String(buyerPhone)));
    payload.append("redirect_url", finalRedirectUrl);
    payload.append("allow_repeated_payments", "false");
    payload.append("send_email", "true");
    payload.append("send_sms", "false");
    // Webhook only works on public URLs
    if (!appUrl.includes("localhost") && !appUrl.includes("127.0.0.1")) {
      payload.append("webhook", `${appUrl}/api/payment/webhook`);
    }

    // Determine endpoint — Instamojo only has ONE API endpoint
    // test.instamojo.com does NOT exist as a public domain
    // All API calls go to www.instamojo.com/api/1.1
    const endpoint = "https://www.instamojo.com/api/1.1";

    try {
      const { ok, status, data } = await createPaymentRequest(endpoint, apiKey, authToken, payload);
      console.log(`Instamojo → HTTP ${status}:`, JSON.stringify(data));

      if (ok && data.success) {
        const paymentRequest = data.payment_request;
        return NextResponse.json({
          success: true,
          data: {
            paymentUrl: paymentRequest.longurl,
            paymentRequestId: paymentRequest.id,
            shortUrl: paymentRequest.shorturl ?? paymentRequest.longurl,
          },
          message: "Payment request created",
        });
      }

      // Build a helpful error message
      const parts: string[] = [];
      if (status === 403 || status === 401) {
        parts.push("Invalid Instamojo credentials (403 Forbidden)");
        parts.push("Go to Admin → Settings → Payment and enter your correct API Key and Auth Token from instamojo.com");
      } else {
        if (data.message) parts.push(data.message);
        if (data.phone) parts.push(`Phone: ${Array.isArray(data.phone) ? data.phone[0] : data.phone}`);
        if (data.email) parts.push(`Email: ${Array.isArray(data.email) ? data.email[0] : data.email}`);
        if (data.amount) parts.push(`Amount: ${Array.isArray(data.amount) ? data.amount[0] : data.amount}`);
      }

      return NextResponse.json(
        { success: false, data: null, message: parts.join(". ") || "Payment request failed" },
        { status: 400 }
      );
    } catch (err) {
      console.error("Instamojo fetch error:", err);
      return NextResponse.json(
        { success: false, data: null, message: "Could not reach Instamojo servers. Check your internet connection." },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error("POST /api/payment/create error:", error);
    return NextResponse.json({ success: false, data: null, message: "Internal server error" }, { status: 500 });
  }
}
