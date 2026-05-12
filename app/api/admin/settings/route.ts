import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings, updateSettings } from "@/lib/db";
import { uploadMedia } from "@/lib/mediaUpload";

export async function GET(_req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, data: null, message: session?.user ? "Forbidden" : "Unauthorized" },
        { status: session?.user ? 403 : 401 }
      );
    }

    const settings = await getAllSettings();

    if (!settings) {
      return NextResponse.json({ success: true, data: { siteName: "My Store", codEnabled: true }, message: "Default settings" });
    }

    return NextResponse.json({ success: true, data: settings, message: "Settings fetched" });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, data: null, message: session?.user ? "Forbidden" : "Unauthorized" },
        { status: session?.user ? 403 : 401 }
      );
    }

    const contentType = req.headers.get("content-type") ?? "";
    let updates: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();

      const textFields = [
        "siteName", "currency", "contactEmail", "contactPhone", "contactAddress",
        "returnPolicy", "privacyPolicy", "termsConditions", "aboutText",
        "instaMojoApiKey", "instaMojoAuthToken", "instaMojoSalt",
        "cashfreeAppId", "cashfreeSecretKey", "cashfreeEnv", "paymentGateway",
        "qrRecipientName", "qrUpiId",
        "mediaStorage",
        "backblazeBucketName", "backblazeRegion", "backblazeAccessKeyId", "backblazeSecretKey", "backblazePublicUrl",
        "r2BucketName", "r2AccessKeyId", "r2SecretAccessKey", "r2Endpoint", "r2PublicUrl",
      ];
      for (const field of textFields) {
        const val = formData.get(field);
        if (val !== null) updates[field] = val as string;
      }

      const boolFields = ["codEnabled", "onlinePaymentEnabled", "qrEnabled"];
      for (const field of boolFields) {
        const val = formData.get(field);
        if (val !== null) updates[field] = val === "true";
      }

      const numFields = ["freeShippingAbove", "shippingCharge"];
      for (const field of numFields) {
        const val = formData.get(field);
        if (val !== null) updates[field] = parseFloat(val as string);
      }

      const socialFields = ["instagram", "facebook", "twitter", "youtube", "reddit", "whatsapp"];
      const socialLinks: Record<string, string> = {};
      for (const field of socialFields) {
        const val = formData.get(`socialLinks.${field}`);
        if (val !== null) socialLinks[field] = val as string;
      }
      if (Object.keys(socialLinks).length > 0) updates["socialLinks"] = socialLinks;

      const logoFile = formData.get("logo") as File | null;
      if (logoFile && logoFile.size > 0) updates.logo = await uploadMedia(logoFile, "settings");
      else if (formData.get("removeLogo") === "true") updates.logo = null;

      const bannerFile = formData.get("banner") as File | null;
      if (bannerFile && bannerFile.size > 0) updates.banner = await uploadMedia(bannerFile, "settings");
      else if (formData.get("removeBanner") === "true") updates.banner = null;

      const faviconFile = formData.get("favicon") as File | null;
      if (faviconFile && faviconFile.size > 0) updates.favicon = await uploadMedia(faviconFile, "settings");
      else if (formData.get("removeFavicon") === "true") updates.favicon = null;

      const qrFile = formData.get("qrImage") as File | null;
      if (qrFile && qrFile.size > 0) updates.qrImage = await uploadMedia(qrFile, "settings");
      else if (formData.get("removeQrImage") === "true") updates.qrImage = null;
    } else {
      updates = await req.json();
    }

    const settings = await updateSettings(updates);

    return NextResponse.json({ success: true, data: settings, message: "Settings updated successfully" });
  } catch (error) {
    console.error("PUT /api/admin/settings error:", error);
    return NextResponse.json(
      { success: false, data: null, message: "Internal server error" },
      { status: 500 }
    );
  }
}
