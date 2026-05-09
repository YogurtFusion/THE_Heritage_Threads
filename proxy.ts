import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";

export default async function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Always allow setup page and its APIs — no auth needed
  if (pathname.startsWith("/setup") || pathname.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  // Check NEXTAUTH_SECRET is present and long enough
  const secret = process.env.NEXTAUTH_SECRET ?? "";
  const envMissing = !process.env.MONGODB_URI || !secret || secret.length < 32;

  if (envMissing) {
    // Missing or broken config — redirect everything to /setup
    return NextResponse.redirect(new URL("/setup", req.nextUrl.origin));
  }

  // Run NextAuth middleware
  let session: { user?: { role?: string } } | null = null;
  try {
    const authReq = req as NextRequest & { auth: { user?: { role?: string } } | null };
    // Call auth() to get session — wrapped in try/catch so a bad secret doesn't crash
    const result = await auth();
    session = result as { user?: { role?: string } } | null;
  } catch {
    // Auth config error — send to setup
    return NextResponse.redirect(new URL("/setup", req.nextUrl.origin));
  }

  // Protect /admin/* — must be authenticated AND role === admin
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.nextUrl.origin));
    }
  }

  // Protect /user/* and /checkout — must be authenticated
  if (pathname.startsWith("/user") || pathname.startsWith("/checkout")) {
    if (!session?.user) {
      const loginUrl = new URL("/login", req.nextUrl.origin);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/checkout/:path*", "/setup/:path*"],
};
