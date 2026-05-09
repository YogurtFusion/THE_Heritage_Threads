"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const STEPS = ["Database", "Site", "Admin", "Notifications", "Licence", "Done"];

const DB_OPTIONS = [
  { value: "mongodb", icon: "🍃", label: "MongoDB", desc: "Recommended for production", ph: "mongodb://localhost:27017/mystore\nor mongodb+srv://user:pass@cluster.mongodb.net/db" },
  { value: "mysql",   icon: "🐬", label: "MySQL",   desc: "Popular relational database", ph: "mysql://user:password@localhost:3306/mystore" },
  { value: "sqlite",  icon: "📁", label: "SQLite",  desc: "Local file — testing only",  ph: "file:./dev.db" },
];

const iCls = "w-full px-4 py-3 border border-border rounded-lg bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-primary text-sm";
const iMonoCls = `${iCls} font-mono`;

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  // Step 0 — DB
  const [dbType, setDbType] = useState("mongodb");
  const [dbUri, setDbUri] = useState("");
  const [dbTesting, setDbTesting] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);

  // Step 1 — Site
  const [site, setSite] = useState({ siteName: "", contactEmail: "", appUrl: "http://localhost:3000" });

  // Step 2 — Admin
  const [admin, setAdmin] = useState({ name: "", email: "", password: "", confirm: "" });

  // Step 3 — Notifications
  const [notif, setNotif] = useState({
    gmailUser: "", gmailAppPassword: "",
    twilioSid: "", twilioToken: "", twilioWhatsapp: "whatsapp:+14155238886",
  });

  // Step 4 — Licence
  const [licence, setLicence] = useState({ key: "" });

  useEffect(() => {
    fetch("/api/setup/check")
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.setupComplete) router.replace("/");
        else setChecking(false);
      })
      .catch(() => setChecking(false));
  }, []);

  const testDb = async () => {
    if (!dbUri.trim()) { setError("Enter a connection string first"); return; }
    setDbTesting(true); setDbStatus(null); setError("");
    try {
      const res = await fetch("/api/setup/test-db", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uri: dbUri, type: dbType }),
      });
      const d = await res.json();
      setDbStatus(d.success ? "ok" : "error");
      if (!d.success) setError(d.message);
    } catch { setDbStatus("error"); setError("Network error"); }
    finally { setDbTesting(false); }
  };

  const next = (validate) => {
    const err = validate?.();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  };

  const handleComplete = async () => {
    if (admin.password !== admin.confirm) { setError("Passwords do not match"); return; }
    if (admin.password.length < 8) { setError("Password must be at least 8 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/setup/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ site, admin, database: { uri: dbUri, type: dbType }, notifications: notif, licence }),
      });
      const d = await res.json();
      if (d.success) setStep(5);
      else setError(d.message);
    } catch { setError("Setup failed. Please try again."); }
    finally { setLoading(false); }
  };

  if (checking) return (
    <div className="min-h-screen bg-body flex items-center justify-center">
      <div className="flex items-center gap-3 text-muted-text">
        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
        Checking setup status…
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-body flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-white text-xl font-bold font-playfair">HT</span>
          </div>
          <h1 className="font-playfair text-3xl font-semibold text-heading mb-1">Store Setup Wizard</h1>
          <p className="text-muted-text text-sm">Configure your store in {STEPS.length - 1} steps</p>
        </div>

        {/* Progress bar */}
        <div className="flex items-center mb-8 px-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i < step ? "bg-success text-white" : i === step ? "bg-primary text-white shadow-md" : "bg-border text-muted-text"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span className={`text-[10px] mt-1 hidden sm:block whitespace-nowrap ${i === step ? "text-primary font-semibold" : "text-muted-text"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < step ? "bg-success" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm">
          {error && (
            <div className="bg-red-50 border border-red-200 text-error text-sm rounded-lg px-4 py-3 mb-6 flex items-start gap-2">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* ── STEP 0: Database ── */}
          {step === 0 && (
            <div className="space-y-6">
              <Heading title="Database Configuration" sub="Choose your database type and enter the connection string." />
              <div className="grid grid-cols-3 gap-3">
                {DB_OPTIONS.map((db) => (
                  <button key={db.value} type="button" onClick={() => { setDbType(db.value); setDbUri(""); setDbStatus(null); setError(""); }}
                    className={`p-3 border-2 rounded-xl text-left transition-all ${dbType === db.value ? "border-primary bg-section-2 shadow-sm" : "border-border hover:border-heading"}`}>
                    <div className="text-xl mb-1">{db.icon}</div>
                    <p className="font-semibold text-heading text-xs">{db.label}</p>
                    <p className="text-[10px] text-muted-text mt-0.5 leading-tight">{db.desc}</p>
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-heading mb-2">Connection String *</label>
                <textarea rows={2} value={dbUri} onChange={(e) => { setDbUri(e.target.value); setDbStatus(null); }}
                  placeholder={DB_OPTIONS.find((d) => d.value === dbType)?.ph}
                  className={`${iMonoCls} resize-none`} />
                {dbType === "mysql" && (
                  <p className="text-xs text-muted-text mt-1">Format: <code className="bg-border px-1 rounded">mysql://user:password@host:3306/database</code></p>
                )}
                {dbType === "sqlite" && (
                  <p className="text-xs text-warning mt-1">⚠️ SQLite is for local testing only. Use MongoDB or MySQL for production.</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <button onClick={testDb} disabled={dbTesting || !dbUri.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors disabled:opacity-50">
                  {dbTesting ? <Spinner /> : null} {dbTesting ? "Testing…" : "Test Connection"}
                </button>
                {dbStatus === "ok" && <span className="text-success text-sm font-medium">✅ Connected!</span>}
                {dbStatus === "error" && <span className="text-error text-sm">❌ Failed</span>}
              </div>

              <Btn onClick={() => next(() => !dbUri.trim() ? "Enter a connection string" : null)}>Continue →</Btn>
            </div>
          )}

          {/* ── STEP 1: Site Details ── */}
          {step === 1 && (
            <div className="space-y-5">
              <Heading title="Site Details" sub="Basic information about your store." />
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Store Name *</label>
                <input type="text" value={site.siteName} onChange={(e) => setSite((p) => ({ ...p, siteName: e.target.value }))}
                  placeholder="My Awesome Store" className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Contact Email</label>
                <input type="email" value={site.contactEmail} onChange={(e) => setSite((p) => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="hello@mystore.com" className={iCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-heading mb-2">App URL</label>
                <input type="url" value={site.appUrl} onChange={(e) => setSite((p) => ({ ...p, appUrl: e.target.value }))}
                  placeholder="http://localhost:3000" className={iCls} />
                <p className="text-xs text-muted-text mt-1">Used for payment redirects and email links. Change to your domain in production.</p>
              </div>
              <NavBtns onBack={() => setStep(0)} onNext={() => next(() => !site.siteName.trim() ? "Store name is required" : null)} />
            </div>
          )}

          {/* ── STEP 2: Admin Account ── */}
          {step === 2 && (
            <div className="space-y-5">
              <Heading title="Admin Account" sub="Create your administrator login credentials." />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Full Name *</label>
                  <input type="text" value={admin.name} onChange={(e) => setAdmin((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Admin Name" className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Email *</label>
                  <input type="email" value={admin.email} onChange={(e) => setAdmin((p) => ({ ...p, email: e.target.value }))}
                    placeholder="admin@mystore.com" className={iCls} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Password * (min 8 chars)</label>
                  <input type="password" value={admin.password} onChange={(e) => setAdmin((p) => ({ ...p, password: e.target.value }))}
                    placeholder="••••••••" className={iCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">Confirm Password *</label>
                  <input type="password" value={admin.confirm} onChange={(e) => setAdmin((p) => ({ ...p, confirm: e.target.value }))}
                    placeholder="••••••••" className={iCls} />
                </div>
              </div>
              <NavBtns onBack={() => setStep(1)} onNext={() => next(() => {
                if (!admin.name.trim() || !admin.email.trim() || !admin.password) return "All admin fields are required";
                if (admin.password.length < 8) return "Password must be at least 8 characters";
                if (admin.password !== admin.confirm) return "Passwords do not match";
                return null;
              })} />
            </div>
          )}

          {/* ── STEP 3: Notifications ── */}
          {step === 3 && (
            <div className="space-y-6">
              <Heading title="Notifications" sub="Configure email and WhatsApp notifications. You can skip this and set it up later in Admin → Settings." />

              <div className="space-y-4">
                <p className="text-xs font-bold uppercase tracking-widest text-heading">Gmail (Email Notifications)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Gmail Address</label>
                    <input type="email" value={notif.gmailUser} onChange={(e) => setNotif((p) => ({ ...p, gmailUser: e.target.value }))}
                      placeholder="yourstore@gmail.com" className={iCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">App Password</label>
                    <input type="password" value={notif.gmailAppPassword} onChange={(e) => setNotif((p) => ({ ...p, gmailAppPassword: e.target.value }))}
                      placeholder="xxxx xxxx xxxx xxxx" className={iCls} />
                  </div>
                </div>
                <p className="text-xs text-muted-text">
                  Generate an App Password at <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">myaccount.google.com/apppasswords</a> (requires 2FA enabled).
                </p>
              </div>

              <div className="space-y-4 border-t border-border pt-5">
                <p className="text-xs font-bold uppercase tracking-widest text-heading">WhatsApp (via Twilio)</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Twilio Account SID</label>
                    <input type="text" value={notif.twilioSid} onChange={(e) => setNotif((p) => ({ ...p, twilioSid: e.target.value }))}
                      placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" className={iMonoCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-heading mb-2">Twilio Auth Token</label>
                    <input type="password" value={notif.twilioToken} onChange={(e) => setNotif((p) => ({ ...p, twilioToken: e.target.value }))}
                      placeholder="••••••••••••••••••••••••••••••••" className={iCls} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-heading mb-2">WhatsApp From Number</label>
                  <input type="text" value={notif.twilioWhatsapp} onChange={(e) => setNotif((p) => ({ ...p, twilioWhatsapp: e.target.value }))}
                    placeholder="whatsapp:+14155238886" className={iMonoCls} />
                  <p className="text-xs text-muted-text mt-1">Get credentials at <a href="https://console.twilio.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">console.twilio.com</a></p>
                </div>
              </div>

              <NavBtns onBack={() => setStep(2)} onNext={() => next()} skipLabel="Skip for now" onSkip={() => { setError(""); setStep(4); }} />
            </div>
          )}

          {/* ── STEP 4: Licence ── */}
          {step === 4 && (
            <div className="space-y-6">
              <Heading title="Licence Key" sub="Enter your licence key if you have one. You can skip this for the free/open-source version." />
              <div>
                <label className="block text-sm font-medium text-heading mb-2">Licence Key (optional)</label>
                <input type="text" value={licence.key} onChange={(e) => setLicence({ key: e.target.value })}
                  placeholder="XXXX-XXXX-XXXX-XXXX" className={iMonoCls} />
                <p className="text-xs text-muted-text mt-1">Leave blank to use the free version. Premium features require a valid licence.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-body-text hover:bg-body transition-colors">← Back</button>
                <button onClick={handleComplete} disabled={loading}
                  className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <><Spinner /> Setting up…</> : "Complete Setup 🚀"}
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 5: Done ── */}
          {step === 5 && (
            <div className="text-center space-y-6 py-4">
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="46" fill="none" stroke="#4ade80" strokeWidth="4"
                    strokeDasharray="289" strokeDashoffset="0" className="transition-all duration-700" />
                  <polyline points="28,52 43,67 72,36" fill="none" stroke="#4ade80" strokeWidth="5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h2 className="font-playfair text-2xl text-heading mb-2">Setup Complete! 🎉</h2>
                <p className="text-muted-text text-sm">Your <code className="bg-border px-1 rounded">.env.local</code> has been written with all your configuration.</p>
              </div>
              <div className="bg-body border border-border rounded-xl p-5 text-left space-y-3 text-sm">
                <p className="font-semibold text-heading text-xs uppercase tracking-widest">Next Steps</p>
                <div className="space-y-2 text-body-text">
                  <p>1. <strong>Restart</strong> your dev server (<code className="bg-border px-1 rounded">npm run dev</code>)</p>
                  <p>2. Log in at <a href="/login" className="text-primary hover:underline">/login</a> with your admin credentials</p>
                  <p>3. Go to <a href="/admin/settings" className="text-primary hover:underline">Admin → Settings</a> to configure payment gateways</p>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-800 text-left">
                ⚠️ <strong>Important:</strong> Restart the server now so the new environment variables take effect.
              </div>
              <a href="/login" className="block w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors text-center">
                Go to Login →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function Heading({ title, sub }) {
  return (
    <div>
      <h2 className="font-playfair text-2xl text-heading mb-1">{title}</h2>
      <p className="text-muted-text text-sm">{sub}</p>
    </div>
  );
}

function Btn({ onClick, children, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
      {children}
    </button>
  );
}

function NavBtns({ onBack, onNext, skipLabel, onSkip }) {
  return (
    <div className="flex gap-3 pt-2">
      <button onClick={onBack} className="px-6 py-3 border border-border rounded-lg text-sm font-medium text-body-text hover:bg-body transition-colors">← Back</button>
      {onSkip && (
        <button onClick={onSkip} className="px-4 py-3 border border-border rounded-lg text-sm text-muted-text hover:bg-body transition-colors">
          {skipLabel ?? "Skip"}
        </button>
      )}
      <button onClick={onNext} className="flex-1 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-hover transition-colors">Continue →</button>
    </div>
  );
}

function Spinner() {
  return <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>;
}
