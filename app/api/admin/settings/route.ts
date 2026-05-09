import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllSettings, updateSettings } from "@/lib/db";
import dbConnect from "@/lib/dbConnect";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function saveUploadedFile(file: File, subfolder: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "png";
  const filename = `${subfolder}-${Date.now()}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${subfolder}/${filename}`;
}

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

    await dbConnect();

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
      if (logoFile && logoFile.size > 0) updates.logo = await saveUploadedFile(logoFile, "settings");
      else if (formData.get("removeLogo") === "true") updates.logo = null;

      const bannerFile = formData.get("banner") as File | null;
      if (bannerFile && bannerFile.size > 0) updates.banner = await saveUploadedFile(bannerFile, "settings");
      else if (formData.get("removeBanner") === "true") updates.banner = null;

      const faviconFile = formData.get("favicon") as File | null;
      if (faviconFile && faviconFile.size > 0) updates.favicon = await saveUploadedFile(faviconFile, "settings");
      else if (formData.get("removeFavicon") === "true") updates.favicon = null;

      const qrFile = formData.get("qrImage") as File | null;
      if (qrFile && qrFile.size > 0) updates.qrImage = await saveUploadedFile(qrFile, "settings");
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
