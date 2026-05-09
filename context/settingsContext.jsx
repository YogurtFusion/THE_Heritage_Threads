"use client";
import { createContext, useContext, useEffect, useState } from "react";

const SettingsContext = createContext(null);

const DEFAULT = {
  siteName: "My Store",
  logo: null,
  banner: null,
  favicon: null,
  socialLinks: { instagram: "#", facebook: "#", twitter: "#", youtube: "#" },
  contactEmail: "",
  contactPhone: "",
  contactAddress: "",
  codEnabled: true,
  onlinePaymentEnabled: false,
  qrEnabled: false,
  qrRecipientName: "",
  qrUpiId: "",
  qrImage: null,
  paymentGateway: "instamojo",
  freeShippingAbove: 500,
  shippingCharge: 50,
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT);

  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setSettings((prev) => ({ ...prev, ...d.data })); })
      .catch(() => {});
  }, []);

  return (
    <SettingsContext.Provider value={settings}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
