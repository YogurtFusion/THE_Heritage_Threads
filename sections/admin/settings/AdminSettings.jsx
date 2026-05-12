"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

const TABS = [
  { id: "site", label: "Site Settings" },
  { id: "social", label: "Social Links" },
  { id: "payment", label: "Payment" },
  { id: "shipping", label: "Shipping" },
  { id: "policy", label: "Policies" },
  { id: "media", label: "Media Storage" },
  { id: "notifications", label: "Notifications" },
  { id: "database", label: "Database" },
];

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("site");
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  // New file objects (to upload)
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [faviconFile, setFaviconFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  // Local preview URLs (blob or existing path)
  const [logoPrev, setLogoPrev] = useState(null);
  const [bannerPrev, setBannerPrev] = useState(null);
  const [faviconPrev, setFaviconPrev] = useState(null);
  const [qrPrev, setQrPrev] = useState(null);
  const [removeQr, setRemoveQr] = useState(false);

  // Explicit remove flags (only true when user clicks X)
  const [removeLogo, setRemoveLogo] = useState(false);
  const [removeBanner, setRemoveBanner] = useState(false);
  const [removeFavicon, setRemoveFavicon] = useState(false);

  // Direct ref for QR file input — bypasses any state closure issues
  const qrInputRef = useRef(null);

  const logoRef = useRef(null);
  const bannerRef = useRef(null);
  const faviconRef = useRef(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setSettings(d.data);
          setLogoPrev(d.data.logo ?? null);
          setBannerPrev(d.data.banner ?? null);
          setFaviconPrev(d.data.favicon ?? null);
          setQrPrev(d.data.qrImage ?? null);
        } else {
          toast.error(d.message ?? "Failed to load settings");
        }
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (field, value) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...(prev.socialLinks ?? {}), [field]: value },
    }));
  };

  const pickFile = (e, setter, prevSetter, removeSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setter(file);
    prevSetter(URL.createObjectURL(file));
    if (removeSetter) removeSetter(false); // picking a new file cancels any remove flag
    e.target.value = "";
  };

  const removeImage = (field) => {
    if (field === "logo")    { setLogoFile(null);    setLogoPrev(null);    setRemoveLogo(true);    handleChange("logo", null); }
    if (field === "banner")  { setBannerFile(null);  setBannerPrev(null);  setRemoveBanner(true);  handleChange("banner", null); }
    if (field === "favicon") { setFaviconFile(null); setFaviconPrev(null); setRemoveFavicon(true); handleChange("favicon", null); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();

      const textFields = [
        "siteName", "currency", "contactEmail", "contactPhone", "contactAddress",
        "returnPolicy", "privacyPolicy", "termsConditions", "aboutText",
        "instaMojoApiKey", "instaMojoAuthToken", "instaMojoSalt",
        "qrRecipientName", "qrUpiId", "cashfreeAppId", "cashfreeSecretKey", "cashfreeEnv", "paymentGateway",
        "mediaStorage",
        "backblazeBucketName", "backblazeRegion", "backblazeAccessKeyId", "backblazeSecretKey", "backblazePublicUrl",
        "r2BucketName", "r2AccessKeyId", "r2SecretAccessKey", "r2Endpoint", "r2PublicUrl",
      ];
      // Always send all text fields (even empty string) so they get saved/cleared
      for (const f of textFields) {
        fd.append(f, settings[f] ?? "");
      }

      fd.append("codEnabled", String(settings.codEnabled ?? true));
      fd.append("onlinePaymentEnabled", String(settings.onlinePaymentEnabled ?? false));
      fd.append("qrEnabled", String(settings.qrEnabled ?? false));
      fd.append("freeShippingAbove", String(settings.freeShippingAbove ?? 500));
      fd.append("shippingCharge", String(settings.shippingCharge ?? 50));

      // QR image — only send remove flag if user explicitly clicked remove
      if (qrFile) fd.append("qrImage", qrFile);
      else if (removeQr) fd.append("removeQrImage", "true");
      // Only send remove flags if user explicitly clicked the X button
      if (removeLogo && !logoFile)   fd.append("removeLogo",   "true");
      if (removeBanner && !bannerFile) fd.append("removeBanner", "true");
      if (removeFavicon && !faviconFile) fd.append("removeFavicon", "true");

      const social = settings.socialLinks ?? {};
      for (const key of ["instagram", "facebook", "twitter", "youtube", "reddit", "whatsapp"]) {
        fd.append(`socialLinks.${key}`, social[key] ?? "");
      }

      if (logoFile) fd.append("logo", logoFile);
      if (bannerFile) fd.append("banner", bannerFile);
      if (faviconFile) fd.append("favicon", faviconFile);

      const res = await fetch("/api/admin/settings", { method: "PUT", body: fd });
      const data = await res.json();

      if (data.success) {
        toast.success("Settings saved");
        setSettings(data.data);
        setLogoFile(null); setBannerFile(null); setFaviconFile(null); setQrFile(null);
        setRemoveQr(false); setRemoveLogo(false); setRemoveBanner(false); setRemoveFavicon(false);
        setLogoPrev(data.data.logo ?? null);
        setBannerPrev(data.data.banner ?? null);
        setFaviconPrev(data.data.favicon ?? null);
        setQrPrev(data.data.qrImage ?? null);
      } else {
        toast.error(data.message ?? "Failed to save");
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  const handleTestPayment = async () => {
    const apiKey = settings?.instaMojoApiKey?.trim();
    const authToken = settings?.instaMojoAuthToken?.trim();
    if (!apiKey || !authToken) {
      toast.error("Enter API Key and Auth Token first");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/payment/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey, authToken }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, { duration: 5000 });
      } else {
        toast.error(data.message, { duration: 6000 });
      }
    } catch {
      toast.error("Test failed — network error");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-border rounded w-48" />
        <div className="h-64 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-1">Settings</h1>
        <p className="text-muted-text text-sm">Manage your store configuration</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-text hover:text-body-text"
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">

        {/* ── SITE SETTINGS ── */}
        {activeTab === "site" && (
          <>
            <Field label="Site Name">
              <input type="text" value={settings.siteName ?? ""} onChange={(e) => handleChange("siteName", e.target.value)}
                className={iCls} placeholder="Heritage Threads" />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ImageField label="Logo" preview={logoPrev} inputRef={logoRef}
                onPick={(e) => pickFile(e, setLogoFile, setLogoPrev, setRemoveLogo)}
                onRemove={() => removeImage("logo")} />
              <ImageField label="Banner" preview={bannerPrev} inputRef={bannerRef}
                onPick={(e) => pickFile(e, setBannerFile, setBannerPrev, setRemoveBanner)}
                onRemove={() => removeImage("banner")} />
              <ImageField label="Favicon" preview={faviconPrev} inputRef={faviconRef}
                onPick={(e) => pickFile(e, setFaviconFile, setFaviconPrev, setRemoveFavicon)}
                onRemove={() => removeImage("favicon")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Contact Email">
                <input type="email" value={settings.contactEmail ?? ""} onChange={(e) => handleChange("contactEmail", e.target.value)}
                  className={iCls} placeholder="hello@heritagethreads.in" />
              </Field>
              <Field label="Contact Phone">
                <input type="tel" value={settings.contactPhone ?? ""} onChange={(e) => handleChange("contactPhone", e.target.value)}
                  className={iCls} placeholder="+91 98765 43210" />
              </Field>
            </div>

            <Field label="Contact Address">
              <textarea rows={3} value={settings.contactAddress ?? ""} onChange={(e) => handleChange("contactAddress", e.target.value)}
                className={`${iCls} resize-none`} placeholder="123 Artisan Lane, Patna, Bihar 800001" />
            </Field>
          </>
        )}

        {/* ── SOCIAL LINKS ── */}
        {activeTab === "social" && (
          <div className="space-y-5">
            {[
              { key: "instagram", label: "Instagram URL", ph: "https://instagram.com/yourpage" },
              { key: "facebook",  label: "Facebook URL",  ph: "https://facebook.com/yourpage" },
              { key: "twitter",   label: "Twitter / X URL", ph: "https://twitter.com/yourpage" },
              { key: "youtube",   label: "YouTube URL",   ph: "https://youtube.com/@yourpage" },
              { key: "reddit",    label: "Reddit URL",    ph: "https://reddit.com/r/yourpage" },
              { key: "whatsapp",  label: "WhatsApp Link", ph: "https://wa.me/919876543210" },
            ].map(({ key, label, ph }) => (
              <Field key={key} label={label}>
                <input type="url" value={settings.socialLinks?.[key] ?? ""} onChange={(e) => handleSocialChange(key, e.target.value)}
                  className={iCls} placeholder={ph} />
              </Field>
            ))}
          </div>
        )}

        {/* ── PAYMENT ── */}
        {activeTab === "payment" && (
          <div className="space-y-5">
            <ToggleRow
              label="Cash on Delivery (COD)"
              desc="Allow customers to pay on delivery"
              checked={settings.codEnabled ?? true}
              onChange={(v) => handleChange("codEnabled", v)}
            />
            <ToggleRow
              label="Online Payment"
              desc="Accept payments via payment gateway"
              checked={settings.onlinePaymentEnabled ?? false}
              onChange={(v) => handleChange("onlinePaymentEnabled", v)}
            />

            {/* Gateway selector */}
            {(settings.onlinePaymentEnabled) && (
              <Field label="Payment Gateway">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "instamojo", label: "Instamojo", desc: "Popular in India, supports UPI/cards" },
                    { value: "cashfree", label: "Cashfree", desc: "Modern gateway, lower fees" },
                  ].map((gw) => (
                    <button key={gw.value} type="button"
                      onClick={() => handleChange("paymentGateway", gw.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-colors ${(settings.paymentGateway ?? "instamojo") === gw.value ? "border-primary bg-section-2" : "border-border hover:border-heading"}`}>
                      <p className="font-semibold text-sm text-heading">{gw.label}</p>
                      <p className="text-xs text-muted-text mt-0.5">{gw.desc}</p>
                    </button>
                  ))}
                </div>
              </Field>
            )}

            {/* Instamojo credentials */}
            {(settings.paymentGateway ?? "instamojo") === "instamojo" && (
              <div className="border-t border-border pt-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-heading">Instamojo Credentials</p>
                <Field label="API Key">
                  <input type="text" value={settings.instaMojoApiKey ?? ""}
                    onChange={(e) => handleChange("instaMojoApiKey", e.target.value)}
                    className={iCls} placeholder="test_xxxxxxxxxxxxxxxxxxxxxxxx" autoComplete="off" />
                  <p className="text-xs text-muted-text mt-1">
                    Test keys from <a href="https://test.instamojo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">test.instamojo.com</a> · Live keys from <a href="https://www.instamojo.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">instamojo.com</a>
                  </p>
                </Field>
                <Field label="Auth Token">
                  <input type="text" value={settings.instaMojoAuthToken ?? ""}
                    onChange={(e) => handleChange("instaMojoAuthToken", e.target.value)}
                    className={iCls} placeholder="Enter auth token" autoComplete="off" />
                </Field>
                <Field label="Salt (webhook verification)">
                  <input type="text" value={settings.instaMojoSalt ?? ""}
                    onChange={(e) => handleChange("instaMojoSalt", e.target.value)}
                    className={iCls} placeholder="Enter salt" autoComplete="off" />
                </Field>
                <button onClick={handleTestPayment} disabled={testing}
                  className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50">
                  {testing ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Testing…</> : "Test Instamojo Connection"}
                </button>
              </div>
            )}

            {/* Cashfree credentials */}
            {settings.paymentGateway === "cashfree" && (
              <div className="border-t border-border pt-5 space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-heading">Cashfree Credentials</p>
                <Field label="Environment">
                  <select value={settings.cashfreeEnv ?? "sandbox"} onChange={(e) => handleChange("cashfreeEnv", e.target.value)}
                    className={`${iCls} appearance-none cursor-pointer`}>
                    <option value="sandbox">Sandbox (Testing)</option>
                    <option value="production">Production (Live)</option>
                  </select>
                </Field>
                <Field label="App ID">
                  <input type="text" value={settings.cashfreeAppId ?? ""}
                    onChange={(e) => handleChange("cashfreeAppId", e.target.value)}
                    className={iCls} placeholder="Your Cashfree App ID" autoComplete="off" />
                  <p className="text-xs text-muted-text mt-1">
                    Get credentials from <a href="https://merchant.cashfree.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">merchant.cashfree.com</a>
                  </p>
                </Field>
                <Field label="Secret Key">
                  <input type="text" value={settings.cashfreeSecretKey ?? ""}
                    onChange={(e) => handleChange("cashfreeSecretKey", e.target.value)}
                    className={iCls} placeholder="Your Cashfree Secret Key" autoComplete="off" />
                </Field>
              </div>
            )}

            {/* ── QR / UPI Payment ── */}
            <div className="border-t border-border pt-5 space-y-4">
              <ToggleRow
                label="QR / UPI Payment"
                desc="Let customers scan your QR code and upload a payment screenshot"
                checked={settings.qrEnabled ?? false}
                onChange={(v) => handleChange("qrEnabled", v)}
              />

              {settings.qrEnabled && (
                <div className="space-y-4 pl-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Recipient Name">
                      <input type="text" value={settings.qrRecipientName ?? ""}
                        onChange={(e) => handleChange("qrRecipientName", e.target.value)}
                        className={iCls} placeholder="Your Name / Business Name" />
                    </Field>
                    <Field label="UPI ID">
                      <input type="text" value={settings.qrUpiId ?? ""}
                        onChange={(e) => handleChange("qrUpiId", e.target.value)}
                        className={iCls} placeholder="yourname@upi" />
                    </Field>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">QR Code Image</label>
                    <div className="flex items-start gap-4">
                      <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden w-40 h-40 shrink-0">
                        {qrPrev ? (
                          <div className="relative group w-full h-full">
                            <img src={qrPrev} alt="QR Code" className="w-full h-full object-contain bg-body p-2" />
                            <button type="button"
                              onClick={(e) => { e.stopPropagation(); setQrFile(null); setQrPrev(null); setRemoveQr(true); }}
                              className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <div onClick={() => qrInputRef.current?.click()}
                              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="text-white text-xs font-medium">Replace</span>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => qrInputRef.current?.click()}
                            className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-section-2 transition-colors text-muted-text">
                            <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="text-xs text-center px-2">Upload QR Image</span>
                          </div>
                        )}
                        <input
                          ref={qrInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setQrFile(file);
                            setQrPrev(URL.createObjectURL(file));
                            setRemoveQr(false);
                            e.target.value = "";
                          }}
                        />
                      </div>
                      <div className="text-xs text-muted-text space-y-1 pt-2">
                        <p>Upload a clear QR code image (PNG/JPG).</p>
                        <p>Customers will see this at checkout.</p>
                        <p>Recommended: 400×400px or larger.</p>
                        {qrFile && <p className="text-success font-medium">✅ {qrFile.name} ready to upload</p>}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-text">
                    Upload your UPI QR code image. Customers will see this at checkout and can pay via any UPI app (GPay, PhonePe, Paytm, etc.).
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SHIPPING ── */}
        {activeTab === "shipping" && (
          <div className="space-y-5">
            <Field label="Free Shipping Above (₹)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
                <input type="number" min="0" value={settings.freeShippingAbove ?? 500}
                  onChange={(e) => handleChange("freeShippingAbove", parseFloat(e.target.value))}
                  className={`${iCls} pl-10`} placeholder="500" />
              </div>
            </Field>
            <Field label="Default Shipping Charge (₹)">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
                <input type="number" min="0" value={settings.shippingCharge ?? 50}
                  onChange={(e) => handleChange("shippingCharge", parseFloat(e.target.value))}
                  className={`${iCls} pl-10`} placeholder="50" />
              </div>
            </Field>
          </div>
        )}

        {/* ── POLICIES ── */}
        {activeTab === "policy" && (
          <div className="space-y-5">
            {[
              { key: "returnPolicy",    label: "Return Policy" },
              { key: "privacyPolicy",   label: "Privacy Policy" },
              { key: "termsConditions", label: "Terms & Conditions" },
              { key: "aboutText",       label: "About Us" },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <textarea rows={6} value={settings[key] ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  className={`${iCls} resize-y`} placeholder={`Enter your ${label.toLowerCase()}…`} />
              </Field>
            ))}
          </div>
        )}

        {/* ── MEDIA STORAGE ── */}
        {activeTab === "media" && (
          <MediaStorageTab settings={settings} handleChange={handleChange} iCls={iCls} />
        )}

        {/* ── NOTIFICATIONS ── */}
        {activeTab === "notifications" && (
          <NotificationsTab />
        )}

        {/* ── DATABASE ── */}
        {activeTab === "database" && (
          <DatabaseTab />
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-8 py-3 bg-primary text-white rounded-md font-medium hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {saving ? "Saving…" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}

// ─── Shared style ────────────────────────────────────────────────────────────
const iCls = "w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow text-sm";

// ─── Sub-components ──────────────────────────────────────────────────────────
function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-2">{label}</label>
      {children}
    </div>
  );
}

function ImageField({ label, preview, inputRef, onPick, onRemove }) {
  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-2">{label}</label>
      <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden">
        {preview ? (
          <div className="relative group">
            <img src={preview} alt={label} className="h-24 w-full object-contain bg-body p-2" />
            {/* Delete button */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(); }}
              className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10"
              title={`Remove ${label}`}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {/* Replace overlay */}
            <div
              onClick={() => inputRef.current?.click()}
              className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="text-white text-xs font-medium">Replace</span>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="h-24 flex flex-col items-center justify-center cursor-pointer hover:bg-section-2 transition-colors text-muted-text"
          >
            <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs">Upload {label}</span>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
      </div>
    </div>
  );
}

function QrImageField({ label, preview, onChange, onRemove }) {
  const ref = useRef(null);
  return (
    <div>
      <label className="block text-sm font-medium text-heading mb-2">{label}</label>
      <div className="flex items-start gap-4">
        <div className="relative border-2 border-dashed border-border rounded-lg overflow-hidden w-40 h-40 shrink-0">
          {preview ? (
            <div className="relative group w-full h-full">
              <img src={preview} alt="QR Code" className="w-full h-full object-contain bg-body p-2" />
              <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="absolute top-1 right-1 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div onClick={() => ref.current?.click()}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-xs font-medium">Replace</span>
              </div>
            </div>
          ) : (
            <div onClick={() => ref.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center cursor-pointer hover:bg-section-2 transition-colors text-muted-text">
              <svg className="w-8 h-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-xs text-center px-2">Upload QR Image</span>
            </div>
          )}
          <input ref={ref} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onChange(file, URL.createObjectURL(file));
              e.target.value = "";
            }} />
        </div>
        <div className="text-xs text-muted-text space-y-1 pt-2">
          <p>Upload a clear QR code image (PNG/JPG).</p>
          <p>Customers will see this at checkout.</p>
          <p>Recommended: 400×400px or larger.</p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <div className="flex items-center justify-between p-4 bg-body rounded-lg border border-border">
      <div>
        <p className="font-medium text-heading text-sm">{label}</p>
        <p className="text-xs text-muted-text mt-0.5">{desc}</p>
      </div>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${checked ? "bg-primary" : "bg-border"}`}>
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}

// ─── Database Tab ─────────────────────────────────────────────────────────────
function DatabaseTab() {
  const [uri, setUri] = useState("");
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState("");
  const [dbType, setDbType] = useState("mongodb");
  const [currentDb, setCurrentDb] = useState(null);

  const iCls = "w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow text-sm font-mono";

  // Fetch current DB info from server
  useEffect(() => {
    fetch("/api/admin/db-info")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCurrentDb(d.data); })
      .catch(() => {});
  }, []);

  const testConnection = async () => {
    if (!uri.trim()) { setMsg("Enter a connection string first"); setStatus("error"); return; }
    setTesting(true); setStatus(null); setMsg("");
    try {
      const res = await fetch("/api/setup/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri, type: dbType }),
      });
      const data = await res.json();
      setStatus(data.success ? "ok" : "error");
      setMsg(data.message);
    } catch {
      setStatus("error"); setMsg("Test failed — network error");
    } finally {
      setTesting(false);
    }
  };

  const DB_ICONS = { mongodb: "🍃", mysql: "🐬", sqlite: "📁" };
  const DB_LABELS = { mongodb: "MongoDB", mysql: "MySQL", sqlite: "SQLite" };

  return (
    <div className="space-y-6">
      {/* Current active database */}
      {currentDb && (
        <div className={`border rounded-xl p-4 ${currentDb.type === "mongodb" ? "bg-green-50 border-green-200" : currentDb.type === "mysql" ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"}`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{DB_ICONS[currentDb.type] ?? "🗄️"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-heading text-sm">
                Currently using: <span className="text-primary">{DB_LABELS[currentDb.type] ?? currentDb.type}</span>
              </p>
              <p className="text-xs text-muted-text mt-1 font-mono truncate">{currentDb.uri}</p>
              <p className="text-xs text-success font-medium mt-1">Connected</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-body border border-border rounded-lg p-4 text-sm space-y-2">
        <p className="font-medium text-heading text-xs uppercase tracking-widest">To change your database:</p>
        <ol className="list-decimal list-inside space-y-1 text-body-text text-xs">
          <li>Update <code className="bg-border px-1 rounded">MONGODB_URI</code> in your <code className="bg-border px-1 rounded">.env.local</code> file with the new connection string</li>
          <li>Restart the development server (<code className="bg-border px-1 rounded">npm run dev</code>)</li>
          <li>For SQLite: use <code className="bg-border px-1 rounded">file:./ht.db</code></li>
          <li>For MySQL: use <code className="bg-border px-1 rounded">mysql://user:pass@host:3306/db</code></li>
          <li>For MongoDB Atlas: use <code className="bg-border px-1 rounded">mongodb+srv://user:pass@cluster.mongodb.net/db</code></li>
        </ol>
      </div>
    </div>
  );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const iCls = "w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow text-sm";

  const [form, setForm] = useState({
    gmailUser: "",
    gmailAppPassword: "",
    twilioSid: "",
    twilioToken: "",
    twilioWhatsapp: "whatsapp:+14155238886",
    adminWhatsapp: "",
  });
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(null);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    fetch("/api/admin/notifications/config")
      .then((r) => r.json())
      .then((d) => { if (d.success && d.data) setForm((p) => ({ ...p, ...d.data })); })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/notifications/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const d = await res.json();
      if (d.success) {
        const toast = (await import("react-hot-toast")).default;
        toast.success("Notification settings saved");
      }
    } catch {}
    finally { setSaving(false); }
  };

  const testEmail = async () => {
    setTesting("email"); setTestResult(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "email", ...form }),
      });
      const d = await res.json();
      setTestResult({ type: "email", ok: d.success, msg: d.message });
    } catch { setTestResult({ type: "email", ok: false, msg: "Network error" }); }
    finally { setTesting(null); }
  };

  const testWhatsApp = async () => {
    setTesting("whatsapp"); setTestResult(null);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp", ...form }),
      });
      const d = await res.json();
      setTestResult({ type: "whatsapp", ok: d.success, msg: d.message });
    } catch { setTestResult({ type: "whatsapp", ok: false, msg: "Network error" }); }
    finally { setTesting(null); }
  };

  return (
    <div className="space-y-6">
      {/* Gmail */}
      <div className="space-y-4">
        <div>
          <p className="text-sm font-bold text-heading">📧 Gmail (Email Notifications)</p>
          <p className="text-xs text-muted-text mt-0.5">Send order confirmations and status updates via Gmail SMTP.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Gmail Address</label>
            <input type="email" value={form.gmailUser} onChange={(e) => setForm((p) => ({ ...p, gmailUser: e.target.value }))}
              placeholder="yourstore@gmail.com" className={iCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">App Password</label>
            <input type="password" value={form.gmailAppPassword} onChange={(e) => setForm((p) => ({ ...p, gmailAppPassword: e.target.value }))}
              placeholder="xxxx xxxx xxxx xxxx" className={iCls} />
          </div>
        </div>
        <p className="text-xs text-muted-text">
          Generate at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/apppasswords</a> (requires 2FA).
        </p>
        <div className="flex items-center gap-3">
          <button onClick={testEmail} disabled={testing === "email" || !form.gmailUser}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md text-sm hover:bg-primary hover:text-white transition-colors disabled:opacity-50">
            {testing === "email" ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending…</> : "Send Test Email"}
          </button>
          {testResult?.type === "email" && (
            <span className={`text-sm ${testResult.ok ? "text-success" : "text-error"}`}>
              {testResult.ok ? "✅" : "❌"} {testResult.msg}
            </span>
          )}
        </div>
      </div>

      {/* WhatsApp */}
      <div className="space-y-4 border-t border-border pt-5">
        <div>
          <p className="text-sm font-bold text-heading">💬 WhatsApp (via Twilio)</p>
          <p className="text-xs text-muted-text mt-0.5">Send shipping and delivery notifications via WhatsApp.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Twilio Account SID</label>
            <input type="text" value={form.twilioSid} onChange={(e) => setForm((p) => ({ ...p, twilioSid: e.target.value }))}
              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={`${iCls} font-mono`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Twilio Auth Token</label>
            <input type="password" value={form.twilioToken} onChange={(e) => setForm((p) => ({ ...p, twilioToken: e.target.value }))}
              placeholder="••••••••••••••••••••••••••••••••" className={iCls} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">WhatsApp From Number</label>
            <input type="text" value={form.twilioWhatsapp} onChange={(e) => setForm((p) => ({ ...p, twilioWhatsapp: e.target.value }))}
              placeholder="whatsapp:+14155238886" className={`${iCls} font-mono`} />
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Admin WhatsApp (for test)</label>
            <input type="text" value={form.adminWhatsapp} onChange={(e) => setForm((p) => ({ ...p, adminWhatsapp: e.target.value }))}
              placeholder="+919876543210" className={`${iCls} font-mono`} />
          </div>
        </div>
        <p className="text-xs text-muted-text">
          Get credentials at <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.twilio.com</a>. Use the Twilio Sandbox for testing.
        </p>
        <div className="flex items-center gap-3">
          <button onClick={testWhatsApp} disabled={testing === "whatsapp" || !form.twilioSid || !form.adminWhatsapp}
            className="flex items-center gap-2 px-4 py-2 border border-primary text-primary rounded-md text-sm hover:bg-primary hover:text-white transition-colors disabled:opacity-50">
            {testing === "whatsapp" ? <><svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending…</> : "Send Test WhatsApp"}
          </button>
          {testResult?.type === "whatsapp" && (
            <span className={`text-sm ${testResult.ok ? "text-success" : "text-error"}`}>
              {testResult.ok ? "✅" : "❌"} {testResult.msg}
            </span>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save Notification Settings"}
        </button>
      </div>
    </div>
  );
}

// ─── Media Storage Tab ────────────────────────────────────────────────────────
function MediaStorageTab({ settings, handleChange, iCls }) {
  const provider = settings?.mediaStorage ?? "local";
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch("/api/admin/media/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          backblazeBucketName: settings?.backblazeBucketName,
          backblazeRegion: settings?.backblazeRegion,
          backblazeAccessKeyId: settings?.backblazeAccessKeyId,
          backblazeSecretKey: settings?.backblazeSecretKey,
          backblazePublicUrl: settings?.backblazePublicUrl,
          r2BucketName: settings?.r2BucketName,
          r2AccessKeyId: settings?.r2AccessKeyId,
          r2SecretAccessKey: settings?.r2SecretAccessKey,
          r2Endpoint: settings?.r2Endpoint,
          r2PublicUrl: settings?.r2PublicUrl,
        }),
      });
      const d = await res.json();
      setTestResult({ ok: d.success, msg: d.message });
    } catch {
      setTestResult({ ok: false, msg: "Network error" });
    } finally {
      setTesting(false);
    }
  };

  const Spinner = () => (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
    </svg>
  );

  const FieldHint = ({ children }) => (
    <p className="text-xs text-muted-text mt-1 leading-relaxed">{children}</p>
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold text-heading mb-1">Media Storage Provider</p>
        <p className="text-xs text-muted-text">Choose where uploaded images (products, logos, QR codes) are stored.</p>
      </div>

      {/* Provider selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { value: "local", label: "Local Storage", desc: "Stored on your server. Good for development only.", color: "text-gray-600" },
          { value: "backblaze", label: "Backblaze B2", desc: "Affordable cloud storage. $0.006/GB/month.", color: "text-orange-600" },
          { value: "r2", label: "Cloudflare R2", desc: "Zero egress fees. Fast global CDN.", color: "text-blue-600" },
        ].map((p) => (
          <button key={p.value} type="button" onClick={() => { handleChange("mediaStorage", p.value); setTestResult(null); }}
            className={`p-4 border-2 rounded-xl text-left transition-all ${provider === p.value ? "border-primary bg-section-2 shadow-sm" : "border-border hover:border-heading"}`}>
            <p className={`font-semibold text-sm ${provider === p.value ? "text-primary" : "text-heading"}`}>{p.label}</p>
            <p className="text-xs text-muted-text mt-1 leading-relaxed">{p.desc}</p>
            {provider === p.value && <p className="text-xs text-primary font-semibold mt-2">Active</p>}
          </button>
        ))}
      </div>

      {/* Local */}
      {provider === "local" && (
        <div className="bg-body border border-border rounded-lg p-4 space-y-2">
          <p className="font-medium text-heading text-sm">Local Storage is active</p>
          <p className="text-xs text-body-text">Files are saved to <code className="bg-border px-1 rounded">/public/uploads/</code> on your server.</p>
          <p className="text-xs text-warning font-medium">Not recommended for production — files are lost on server restart/redeploy. Use Backblaze or R2 for production.</p>
        </div>
      )}

      {/* Backblaze B2 */}
      {provider === "backblaze" && (
        <div className="space-y-5">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-xs text-orange-800 space-y-1">
            <p className="font-semibold">How to get Backblaze B2 credentials:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://www.backblaze.com" target="_blank" rel="noopener noreferrer" className="underline">backblaze.com</a> → Sign in → B2 Cloud Storage</li>
              <li>Click <strong>Create a Bucket</strong> — note the Bucket Name and Region</li>
              <li>Go to <strong>App Keys</strong> → <strong>Add a New Application Key</strong></li>
              <li>Set permissions to <strong>Read and Write</strong> for your bucket</li>
              <li>Copy the <strong>keyID</strong> (Access Key ID) and <strong>applicationKey</strong> (Secret)</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Bucket Name</label>
            <input type="text" value={settings?.backblazeBucketName ?? ""} onChange={(e) => handleChange("backblazeBucketName", e.target.value)}
              className={iCls} placeholder="my-store-bucket" autoComplete="off" />
            <FieldHint>The name of your B2 bucket. Found in B2 Cloud Storage → Buckets.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Bucket Region</label>
            <select value={settings?.backblazeRegion ?? ""} onChange={(e) => handleChange("backblazeRegion", e.target.value)}
              className={`${iCls} appearance-none cursor-pointer`}>
              <option value="">Select region</option>
              <option value="us-west-004">us-west-004 (US West)</option>
              <option value="us-east-005">us-east-005 (US East)</option>
              <option value="eu-central-003">eu-central-003 (EU Central)</option>
              <option value="ap-southeast-001">ap-southeast-001 (Asia Pacific)</option>
            </select>
            <FieldHint>Your bucket region. Found in B2 Cloud Storage → Buckets → Bucket Details.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Access Key ID</label>
            <input type="text" value={settings?.backblazeAccessKeyId ?? ""} onChange={(e) => handleChange("backblazeAccessKeyId", e.target.value)}
              className={iCls} placeholder="0030d68d280149a0000000003" autoComplete="off" />
            <FieldHint>The <strong>keyID</strong> from your Backblaze Application Key. Found in App Keys section.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Access Key Secret</label>
            <input type="password" value={settings?.backblazeSecretKey ?? ""} onChange={(e) => handleChange("backblazeSecretKey", e.target.value)}
              className={iCls} placeholder="K003l8noNMpjh6VutRJ7oZJ0x5vLDpU" autoComplete="off" />
            <FieldHint>The <strong>applicationKey</strong> shown once when you create the key. Store it safely.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Public URL (optional)</label>
            <input type="url" value={settings?.backblazePublicUrl ?? ""} onChange={(e) => handleChange("backblazePublicUrl", e.target.value)}
              className={iCls} placeholder="https://f000.backblazeb2.com/file/my-store-bucket" />
            <FieldHint>Leave blank to auto-generate. Or use a custom CDN domain. Format: <code className="bg-border px-1 rounded">https://f000.backblazeb2.com/file/BUCKET_NAME</code></FieldHint>
          </div>
        </div>
      )}

      {/* Cloudflare R2 */}
      {provider === "r2" && (
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 space-y-1">
            <p className="font-semibold">How to get Cloudflare R2 credentials:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="underline">dash.cloudflare.com</a> → R2 Object Storage</li>
              <li>Click <strong>Create bucket</strong> — note the Bucket Name</li>
              <li>Go to <strong>Manage R2 API Tokens</strong> → <strong>Create API Token</strong></li>
              <li>Set permissions to <strong>Object Read & Write</strong></li>
              <li>Copy the <strong>Access Key ID</strong>, <strong>Secret Access Key</strong>, and <strong>Endpoint</strong></li>
              <li>Enable <strong>Public Access</strong> on the bucket to get a Public URL</li>
            </ol>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Bucket Name</label>
            <input type="text" value={settings?.r2BucketName ?? ""} onChange={(e) => handleChange("r2BucketName", e.target.value)}
              className={iCls} placeholder="my-store-bucket" autoComplete="off" />
            <FieldHint>The name of your R2 bucket. Found in R2 → Buckets.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Access Key ID</label>
            <input type="text" value={settings?.r2AccessKeyId ?? ""} onChange={(e) => handleChange("r2AccessKeyId", e.target.value)}
              className={iCls} placeholder="e0f052af5f2f71022f78e18cc186421f" autoComplete="off" />
            <FieldHint>Found in R2 → Manage R2 API Tokens → your token's <strong>Access Key ID</strong>.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Access Key Secret</label>
            <input type="password" value={settings?.r2SecretAccessKey ?? ""} onChange={(e) => handleChange("r2SecretAccessKey", e.target.value)}
              className={iCls} placeholder="3aef0769f46faafd61f7fe53d2bd283e..." autoComplete="off" />
            <FieldHint>The <strong>Secret Access Key</strong> shown once when you create the API token.</FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Endpoint</label>
            <input type="url" value={settings?.r2Endpoint ?? ""} onChange={(e) => handleChange("r2Endpoint", e.target.value)}
              className={iCls} placeholder="https://fd0f7ca7e5991f7ccd4d52d1ebcec6e8.r2.cloudflarestorage.com" autoComplete="off" />
            <FieldHint>Found in R2 → Manage R2 API Tokens → <strong>Endpoint</strong>. Format: <code className="bg-border px-1 rounded">https://ACCOUNT_ID.r2.cloudflarestorage.com</code></FieldHint>
          </div>

          <div>
            <label className="block text-sm font-medium text-heading mb-1">Custom Domain / Public URL</label>
            <input type="url" value={settings?.r2PublicUrl ?? ""} onChange={(e) => handleChange("r2PublicUrl", e.target.value)}
              className={iCls} placeholder="https://pub-90bf958bd7444656b18400680f35b8cd.r2.dev" />
            <FieldHint>Found in R2 → your bucket → <strong>Public Access</strong> → Enable → copy the URL. Or use your own domain.</FieldHint>
          </div>
        </div>
      )}

      {/* Test + Save buttons */}
      {provider !== "local" && (
        <div className="flex items-center gap-3 pt-2 border-t border-border flex-wrap">
          <button onClick={handleTest} disabled={testing}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50">
            {testing ? <><Spinner /> Testing…</> : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg> Test Connection</>
            )}
          </button>
          {testResult && (
            <span className={`text-sm font-medium ${testResult.ok ? "text-success" : "text-error"}`}>
              {testResult.ok ? "✓" : "✗"} {testResult.msg}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
