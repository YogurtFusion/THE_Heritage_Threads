import { Inter, Playfair_Display } from "next/font/google";
import "@/app/globals.css";
import { CartProvider } from "@/context/cartContext";
import { SettingsProvider } from "@/context/settingsContext";
import { Toaster } from "react-hot-toast";
import SessionProvider from "@/components/providers/SessionProvider";
import DynamicFavicon from "@/components/DynamicFavicon";
import { headers } from "next/headers";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"], display: "swap" });

async function getSiteSettings() {
  try {
    const host = (await headers()).get("host") ?? "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const res = await fetch(`${protocol}://${host}/api/settings/public`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.success ? data.data : null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const settings = await getSiteSettings();
  const siteName = settings?.siteName ?? "Heritage Threads";
  const favicon = settings?.favicon ?? null;

  const icons = favicon
    ? [
        { rel: "icon", url: favicon, type: favicon.endsWith(".png") ? "image/png" : "image/x-icon" },
        { rel: "shortcut icon", url: favicon },
        { rel: "apple-touch-icon", url: favicon },
      ]
    : [{ rel: "icon", url: "/favicon.ico" }];

  return {
    title: { default: siteName, template: `%s | ${siteName}` },
    description: "Premium artisanal store",
    icons,
  };
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SessionProvider>
          <SettingsProvider>
            <CartProvider>
              <Toaster position="bottom-center" />
              {/* Client-side favicon injection — always reflects latest DB value */}
              <DynamicFavicon />
              {children}
            </CartProvider>
          </SettingsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
