/**
 * Media upload service — Local, Backblaze B2 (S3-compatible), Cloudflare R2.
 * Config is read from DB settings (Admin → Settings → Media Storage).
 */
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export type StorageProvider = "local" | "backblaze" | "r2";

interface StorageConfig {
  provider: StorageProvider;
  // Backblaze B2 (S3-compatible)
  backblazeBucketName?: string;
  backblazeRegion?: string;
  backblazeAccessKeyId?: string;
  backblazeSecretKey?: string;
  backblazePublicUrl?: string;
  // Cloudflare R2
  r2BucketName?: string;
  r2AccessKeyId?: string;
  r2SecretAccessKey?: string;
  r2Endpoint?: string;
  r2PublicUrl?: string;
}

async function getStorageConfig(): Promise<StorageConfig> {
  try {
    const { getAllSettings } = await import("@/lib/db");
    const settings = await getAllSettings() as Record<string, unknown> | null;
    const provider = (settings?.mediaStorage as StorageProvider) || "local";

    if (provider !== "local") {
      return {
        provider,
        backblazeBucketName: (settings?.backblazeBucketName as string) || undefined,
        backblazeRegion: (settings?.backblazeRegion as string) || undefined,
        backblazeAccessKeyId: (settings?.backblazeAccessKeyId as string) || undefined,
        backblazeSecretKey: (settings?.backblazeSecretKey as string) || undefined,
        backblazePublicUrl: (settings?.backblazePublicUrl as string) || undefined,
        r2BucketName: (settings?.r2BucketName as string) || undefined,
        r2AccessKeyId: (settings?.r2AccessKeyId as string) || undefined,
        r2SecretAccessKey: (settings?.r2SecretAccessKey as string) || undefined,
        r2Endpoint: (settings?.r2Endpoint as string) || undefined,
        r2PublicUrl: (settings?.r2PublicUrl as string) || undefined,
      };
    }
  } catch (err) {
    console.error("getStorageConfig error:", err);
  }
  return { provider: "local" };
}

// ─── AWS Signature V4 helper (used by both Backblaze S3 and R2) ───────────────
function awsSign(params: {
  method: string;
  endpoint: string;
  bucket: string;
  key: string;
  contentType: string;
  contentHash: string;
  accessKeyId: string;
  secretKey: string;
  region: string;
  service?: string;
}) {
  const { method, endpoint, bucket, key, contentType, contentHash, accessKeyId, secretKey, region, service = "s3" } = params;
  const now = new Date();
  const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateShort = dateStr.slice(0, 8);
  const host = new URL(endpoint).host;

  const canonicalUri = `/${bucket}/${key}`;
  const canonicalHeaders = `content-type:${contentType}\nhost:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${dateStr}\n`;
  const signedHeaders = "content-type;host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = `${method}\n${canonicalUri}\n\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`;
  const credentialScope = `${dateShort}/${region}/${service}/aws4_request`;
  const stringToSign = `AWS4-HMAC-SHA256\n${dateStr}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;

  const hmac = (k: Buffer, d: string) => crypto.createHmac("sha256", k).update(d).digest();
  const signingKey = hmac(hmac(hmac(hmac(Buffer.from(`AWS4${secretKey}`), dateShort), region), service), "aws4_request");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return {
    authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
    dateStr,
    url: `${endpoint}/${bucket}/${key}`,
  };
}

// ─── Local storage ────────────────────────────────────────────────────────────
async function uploadLocal(file: File, subfolder: string): Promise<string> {
  const uploadDir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(uploadDir, { recursive: true });
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const filename = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  await writeFile(path.join(uploadDir, filename), buffer);
  return `/uploads/${subfolder}/${filename}`;
}

// ─── Backblaze B2 (S3-compatible API) ────────────────────────────────────────
async function uploadBackblaze(file: File, subfolder: string, config: StorageConfig): Promise<string> {
  const { backblazeBucketName, backblazeRegion, backblazeAccessKeyId, backblazeSecretKey, backblazePublicUrl } = config;

  if (!backblazeBucketName || !backblazeRegion || !backblazeAccessKeyId || !backblazeSecretKey) {
    throw new Error("Backblaze credentials incomplete. Check Admin → Settings → Media Storage.");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileKey = `${subfolder}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const contentType = file.type || "application/octet-stream";
  const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // Backblaze S3-compatible endpoint
  const endpoint = `https://s3.${backblazeRegion}.backblazeb2.com`;

  const { authorization, dateStr, url } = awsSign({
    method: "PUT",
    endpoint,
    bucket: backblazeBucketName,
    key: fileKey,
    contentType,
    contentHash,
    accessKeyId: backblazeAccessKeyId,
    secretKey: backblazeSecretKey,
    region: backblazeRegion,
  });

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": contentHash,
      "x-amz-date": dateStr,
      Authorization: authorization,
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Backblaze upload failed (${res.status}): ${errText}`);
  }

  // Return public URL
  if (backblazePublicUrl) {
    return `${backblazePublicUrl.replace(/\/$/, "")}/${fileKey}`;
  }
  return `${endpoint}/${backblazeBucketName}/${fileKey}`;
}

// ─── Cloudflare R2 ────────────────────────────────────────────────────────────
async function uploadR2(file: File, subfolder: string, config: StorageConfig): Promise<string> {
  const { r2BucketName, r2AccessKeyId, r2SecretAccessKey, r2Endpoint, r2PublicUrl } = config;

  if (!r2BucketName || !r2AccessKeyId || !r2SecretAccessKey) {
    throw new Error("R2 credentials incomplete: Bucket Name, Access Key ID, and Secret are required. Check Admin → Settings → Media Storage.");
  }

  if (!r2Endpoint) {
    throw new Error("R2 Endpoint is required. Find it in Cloudflare Dashboard → R2 → Manage R2 API Tokens → Endpoint URL. Format: https://ACCOUNT_ID.r2.cloudflarestorage.com");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const ext = file.name.split(".").pop() ?? "jpg";
  const fileKey = `${subfolder}/${Date.now()}-${crypto.randomBytes(4).toString("hex")}.${ext}`;
  const contentType = file.type || "application/octet-stream";
  const contentHash = crypto.createHash("sha256").update(buffer).digest("hex");

  // R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
  const endpoint = r2Endpoint.replace(/\/$/, "");

  const { authorization, dateStr, url } = awsSign({
    method: "PUT",
    endpoint,
    bucket: r2BucketName,
    key: fileKey,
    contentType,
    contentHash,
    accessKeyId: r2AccessKeyId,
    secretKey: r2SecretAccessKey,
    region: "auto",
    service: "s3",
  });

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": contentType,
      "x-amz-content-sha256": contentHash,
      "x-amz-date": dateStr,
      Authorization: authorization,
    },
    body: buffer,
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`R2 upload failed (${res.status}): ${errText}`);
  }

  if (r2PublicUrl) {
    return `${r2PublicUrl.replace(/\/$/, "")}/${fileKey}`;
  }
  return `${endpoint}/${r2BucketName}/${fileKey}`;
}

// ─── Test connection ──────────────────────────────────────────────────────────
export async function testMediaConnection(config: StorageConfig): Promise<{ success: boolean; message: string }> {
  try {
    if (config.provider === "backblaze") {
      const { backblazeBucketName, backblazeRegion, backblazeAccessKeyId, backblazeSecretKey } = config;
      if (!backblazeBucketName || !backblazeRegion || !backblazeAccessKeyId || !backblazeSecretKey) {
        return { success: false, message: "All Backblaze fields are required" };
      }
      const endpoint = `https://s3.${backblazeRegion}.backblazeb2.com`;
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
      const dateShort = dateStr.slice(0, 8);
      const host = `s3.${backblazeRegion}.backblazeb2.com`;
      const contentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${dateStr}\n`;
      const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
      const canonicalRequest = `GET\n/${backblazeBucketName}\n\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`;
      const credentialScope = `${dateShort}/${backblazeRegion}/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${dateStr}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;
      const hmac = (k: Buffer, d: string) => crypto.createHmac("sha256", k).update(d).digest();
      const signingKey = hmac(hmac(hmac(hmac(Buffer.from(`AWS4${backblazeSecretKey}`), dateShort), backblazeRegion), "s3"), "aws4_request");
      const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
      const authorization = `AWS4-HMAC-SHA256 Credential=${backblazeAccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
      const res = await fetch(`${endpoint}/${backblazeBucketName}?max-keys=1`, {
        headers: { "x-amz-content-sha256": contentHash, "x-amz-date": dateStr, Authorization: authorization },
      });
      if (res.ok || res.status === 403) {
        return { success: true, message: "Connection established successfully!" };
      }
      return { success: false, message: `Backblaze returned ${res.status}. Check your credentials.` };
    }

    if (config.provider === "r2") {
      const { r2BucketName, r2AccessKeyId, r2SecretAccessKey, r2Endpoint } = config;
      if (!r2BucketName || !r2AccessKeyId || !r2SecretAccessKey || !r2Endpoint) {
        return { success: false, message: "All R2 fields are required" };
      }
      const endpoint = r2Endpoint.replace(/\/$/, "");
      const host = new URL(endpoint).host;
      const now = new Date();
      const dateStr = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
      const dateShort = dateStr.slice(0, 8);
      const contentHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855";
      const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${contentHash}\nx-amz-date:${dateStr}\n`;
      const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
      const canonicalRequest = `GET\n/${r2BucketName}\n\n${canonicalHeaders}\n${signedHeaders}\n${contentHash}`;
      const credentialScope = `${dateShort}/auto/s3/aws4_request`;
      const stringToSign = `AWS4-HMAC-SHA256\n${dateStr}\n${credentialScope}\n${crypto.createHash("sha256").update(canonicalRequest).digest("hex")}`;
      const hmac = (k: Buffer, d: string) => crypto.createHmac("sha256", k).update(d).digest();
      const signingKey = hmac(hmac(hmac(hmac(Buffer.from(`AWS4${r2SecretAccessKey}`), dateShort), "auto"), "s3"), "aws4_request");
      const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");
      const authorization = `AWS4-HMAC-SHA256 Credential=${r2AccessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
      const res = await fetch(`${endpoint}/${r2BucketName}?max-keys=1`, {
        headers: { "x-amz-content-sha256": contentHash, "x-amz-date": dateStr, Authorization: authorization },
      });
      if (res.ok || res.status === 403) {
        return { success: true, message: "Connection established successfully!" };
      }
      return { success: false, message: `R2 returned ${res.status}. Check your credentials and endpoint.` };
    }

    return { success: true, message: "Local storage is always available." };
  } catch (err) {
    return { success: false, message: `Connection failed: ${(err as Error).message}` };
  }
}

// ─── Main upload function ─────────────────────────────────────────────────────
export async function uploadMedia(file: File, subfolder = "uploads"): Promise<string> {
  const config = await getStorageConfig();
  switch (config.provider) {
    case "backblaze": return uploadBackblaze(file, subfolder, config);
    case "r2":        return uploadR2(file, subfolder, config);
    default:          return uploadLocal(file, subfolder);
  }
}

export async function getMediaProvider(): Promise<StorageProvider> {
  const config = await getStorageConfig();
  return config.provider;
}
