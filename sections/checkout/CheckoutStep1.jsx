"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { indianStates } from "@/data/checkout";
import { addrKey } from "@/context/cartContext";

const EMPTY = {
  fullName: "", phone: "", addressLine1: "", addressLine2: "",
  city: "", state: "", pincode: "",
};

const inputCls = "w-full border border-border bg-transparent p-3.5 text-sm focus:outline-none focus:border-primary placeholder:text-muted-text transition-colors";

export default function CheckoutStep1({ onNext }) {
  const { data: session } = useSession();
  const [form, setForm] = useState(EMPTY);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedSaved, setSelectedSaved] = useState(null);
  const [errors, setErrors] = useState({});

  // Load saved addresses from localStorage — per user
  useEffect(() => {
    const key = addrKey(session?.user?.userId ?? null);
    try {
      const stored = localStorage.getItem(key);
      if (stored) setSavedAddresses(JSON.parse(stored));
    } catch {}
  }, [session?.user?.userId]);

  // Pre-fill name from session
  useEffect(() => {
    if (session?.user?.name && !form.fullName) {
      setForm((p) => ({ ...p, fullName: session.user.name }));
    }
  }, [session]);

  const handleChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((p) => ({ ...p, [e.target.name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Enter valid 10-digit phone";
    if (!form.addressLine1.trim()) e.addressLine1 = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state) e.state = "Required";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) e.pincode = "Enter valid 6-digit pincode";
    return e;
  };

  const handleSaveAndContinue = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }

    // Save address to localStorage — per user
    const key = addrKey(session?.user?.userId ?? null);
    const existing = savedAddresses.find(
      (a) => a.addressLine1 === form.addressLine1 && a.pincode === form.pincode
    );
    if (!existing) {
      const updated = [form, ...savedAddresses].slice(0, 5);
      setSavedAddresses(updated);
      localStorage.setItem(key, JSON.stringify(updated));
    }

    onNext(form);
  };

  const useSaved = (addr) => {
    setForm(addr);
    setSelectedSaved(addr.addressLine1 + addr.pincode);
    setErrors({});
  };

  return (
    <div>
      <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
        <h1 className="font-playfair text-3xl text-heading">Shipping Address</h1>
        <span className="text-xs font-semibold tracking-widest text-heading uppercase">Step 1 of 2</span>
      </div>

      {/* Saved Addresses */}
      {savedAddresses.length > 0 && (
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-heading mb-3 uppercase">Saved Addresses</p>
          <div className="space-y-3">
            {savedAddresses.map((addr, i) => {
              const key = addr.addressLine1 + addr.pincode;
              const isSelected = selectedSaved === key;
              return (
                <div
                  key={i}
                  onClick={() => useSaved(addr)}
                  className={`border p-4 cursor-pointer transition-colors ${isSelected ? "border-primary bg-section-2" : "border-border hover:border-heading"}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-heading">{addr.fullName}</p>
                      <p className="text-xs text-body-text mt-1">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                      <p className="text-xs text-body-text">{addr.city}, {addr.state} — {addr.pincode}</p>
                      <p className="text-xs text-muted-text">{addr.phone}</p>
                    </div>
                    {isSelected && (
                      <span className="text-xs font-bold text-primary uppercase tracking-wider">Selected</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-text mt-3">Or enter a new address below:</p>
        </div>
      )}

      {/* Address Form */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Full Name" error={errors.fullName}>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="FULL NAME" className={inputCls} />
          </Field>
          <Field label="Phone" error={errors.phone}>
            <input name="phone" value={form.phone} onChange={handleChange} placeholder="10-DIGIT PHONE" className={inputCls} maxLength={10} />
          </Field>
        </div>

        <Field label="Address Line 1" error={errors.addressLine1}>
          <input name="addressLine1" value={form.addressLine1} onChange={handleChange} placeholder="STREET ADDRESS, HOUSE NO." className={inputCls} />
        </Field>

        <Field label="Address Line 2 (optional)">
          <input name="addressLine2" value={form.addressLine2} onChange={handleChange} placeholder="APARTMENT, LANDMARK (OPTIONAL)" className={inputCls} />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Field label="City" error={errors.city}>
            <input name="city" value={form.city} onChange={handleChange} placeholder="CITY" className={inputCls} />
          </Field>
          <Field label="State" error={errors.state}>
            <div className="relative">
              <select name="state" value={form.state} onChange={handleChange}
                className={`${inputCls} appearance-none cursor-pointer`}>
                <option value="">SELECT STATE</option>
                {indianStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </Field>
          <Field label="Pincode" error={errors.pincode}>
            <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-DIGIT PINCODE" className={inputCls} maxLength={6} />
          </Field>
        </div>
      </div>

      <button
        onClick={handleSaveAndContinue}
        className="mt-8 w-full group/btn uppercase relative flex justify-center items-center bg-primary text-white tracking-widest text-sm font-bold py-4 cursor-pointer overflow-hidden hover:bg-primary-hover transition-colors"
      >
        Continue to Payment →
      </button>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      {children}
      {error && <p className="text-xs text-error mt-1">{error}</p>}
    </div>
  );
}
