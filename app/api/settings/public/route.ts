import { NextResponse } from "next/server";
import { getPublicSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await getPublicSettings();

    if (!settings) {
      return NextResponse.json({
        success: true,
        data: {
          siteName: "Heritage Threads",
          logo: null,
          banner: null,
          favicon: null,
          socialLinks: {},
          codEnabled: true,
          onlinePaymentEnabled: false,
          qrEnabled: false,
          freeShippingAbove: 500,
          shippingCharge: 50,
          paymentGateway: "instamojo",
        },
        message: "Default public settings",
      });
    }

    return NextResponse.json({ success: true, data: settings, message: "Public settings fetched" });
  } catch (error) {
    console.error("GET /api/settings/public error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
