"use client";
import { useSettings } from "@/context/settingsContext";
import { useEffect } from "react";

/**
 * Updates the favicon by modifying existing <link> elements' href attribute.
 * Never adds or removes DOM nodes — avoids React's removeChild crash.
 */
export default function DynamicFavicon() {
  const { favicon } = useSettings();

  useEffect(() => {
    if (!favicon) return;

    const url = `${favicon}?t=${Date.now()}`;

    // Update existing icon links rather than adding/removing nodes
    const selectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
    ];

    let updated = false;
    selectors.forEach((sel) => {
      const el = document.querySelector(sel);
      if (el) {
        el.setAttribute("href", url);
        updated = true;
      }
    });

    // Only create new elements if none exist at all
    if (!updated) {
      const mime = favicon.endsWith(".svg")
        ? "image/svg+xml"
        : favicon.endsWith(".ico")
        ? "image/x-icon"
        : "image/png";

      const link = document.createElement("link");
      link.rel = "icon";
      link.type = mime;
      link.href = url;
      document.head.appendChild(link);
    }
  }, [favicon]);

  return null;
}
