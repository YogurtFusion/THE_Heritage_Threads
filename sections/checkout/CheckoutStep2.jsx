"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCart } from "@/context/cartContext";
import { useSettings } from "@/context/settingsContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Script from "next/script";

export default function CheckoutStep2({ shippingAddress, onBack }) {
  const { data: session } = useSession();
  const { cartItems, cartTotal, clearCart } = useCart();
  const settings = useSettings();
  const {
    codEnabled, onlinePaymentEnabled, freeShippingAbove, shippingCharge,
    paymentGateway, qrEnabled, qrRecipientName, qrUpiId, qrImage,
  } = settings ?? {};
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  // QR screenshot state
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const screenshotRef = useRef(null);

  // Track when settings have loaded from server (not just defaults)
  useEffect(() => {
    if (settings && settings.siteName !== "My Store") {
      setSettingsLoaded(true);
    }
    // Also set loaded after a short delay as fallback
    const t = setTimeout(() => setSettingsLoaded(true), 2000);
    return () => clearTimeout(t);
  }, [settings]);

  useEffect(() => {
    if (!settingsLoaded) return;
    if (!codEnabled && qrEnabled) setPaymentMethod("qr");
    else if (!codEnabled && onlinePaymentEnabled) setPaymentMethod("online");
    else setPaymentMethod("cod");
  }, [codEnabled, onlinePaymentEnabled, qrEnabled, settingsLoaded]);

  const shipping = cartTotal >= (freeShippingAbove ?? 500) ? 0 : (shippingCharge ?? 50);
  const grandTotal = cartTotal + shipping;

  const createOrder = async (paymentId, paymentStatus, method) => {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cartItems.map((i) => ({
          productId: i.id,
          name: i.name,
          qty: i.quantity,
          price: i.price,
          image: i.image ?? null,
        })),
        totalAmount: grandTotal,
        subtotal: cartTotal,
        shippingCost: shipping,
        paymentMethod: method ?? paymentMethod,
        shippingAddress,
        paymentId: paymentId ?? null,
        paymentStatus: paymentStatus ?? "pending",
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? "Failed to create order");
    return data.data;
  };

  // ── Instamojo Seamless Checkout ──────────────────────────────────────────
  const handleInstamojoPayment = useCallback(async () => {
    const payRes = await fetch("/api/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: grandTotal,
        buyerName: shippingAddress.fullName,
        buyerEmail: session.user.email,
        buyerPhone: shippingAddress.phone,
        purpose: "Order Payment",
        redirectUrl: `${window.location.origin}/success`,
      }),
    });
    const payData = await payRes.json();
    if (!payData.success) throw new Error(payData.message ?? "Could not create payment request");

    const { paymentUrl, paymentRequestId } = payData.data;
    const order = await createOrder(paymentRequestId, "pending", "online");

    return new Promise((resolve, reject) => {
      const Instamojo = window.Instamojo;
      if (!Instamojo) { window.location.href = paymentUrl; resolve(true); return; }

      Instamojo.configure({
        handlers: {
          onClose: () => { setPlacing(false); toast("Payment cancelled.", { icon: "ℹ️" }); reject(new Error("cancelled")); },
          onSuccess: (response) => {
            clearCart();
            router.push(`/success?payment_id=${response?.paymentId ?? ""}&order_id=${order._id}`);
            resolve(true);
          },
          onFailure: (response) => reject(new Error(response?.message ?? "Payment failed")),
        },
      });
      Instamojo.open(paymentUrl);
    });
  }, [grandTotal, shippingAddress, session, cartItems, clearCart, router]);

  // ── Cashfree ─────────────────────────────────────────────────────────────
  const handleCashfreePayment = async () => {
    const order = await createOrder(null, "pending", "online");
    const payRes = await fetch("/api/payment/cashfree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: grandTotal,
        buyerName: shippingAddress.fullName,
        buyerEmail: session.user.email,
        buyerPhone: shippingAddress.phone,
        orderId: order._id,
        returnUrl: `${window.location.origin}/success`,
      }),
    });
    const payData = await payRes.json();
    if (!payData.success) throw new Error(payData.message ?? "Cashfree payment failed");
    window.location.href = `https://payments.cashfree.com/order/#${payData.data.paymentSessionId}`;
  };

  // ── QR Payment ────────────────────────────────────────────────────────────
  const handleQrPayment = async () => {
    if (!screenshot) {
      toast.error("Please upload your payment screenshot first");
      return false;
    }
    // Create order first
    const order = await createOrder(null, "pending", "qr");

    // Upload screenshot
    const fd = new FormData();
    fd.append("screenshot", screenshot);
    const res = await fetch(`/api/orders/${order._id}/screenshot`, { method: "POST", body: fd });
    const data = await res.json();
    if (!data.success) throw new Error(data.message ?? "Screenshot upload failed");

    clearCart();
    router.push("/success");
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!session?.user) {
      toast.error("Please sign in to place an order");
      router.push("/login?callbackUrl=/checkout");
      return;
    }
    if (cartItems.length === 0) { toast.error("Your cart is empty"); return; }

    setPlacing(true);
    try {
      if (paymentMethod === "qr") {
        await handleQrPayment();
        return;
      }
      if (paymentMethod === "online") {
        const gateway = paymentGateway ?? "instamojo";
        if (gateway === "cashfree") await handleCashfreePayment();
        else await handleInstamojoPayment();
        return;
      }
      // COD
      await createOrder(null, "pending", "cod");
      clearCart();
      router.push("/success");
    } catch (err) {
      const msg = err?.message ?? "Something went wrong";
      if (msg !== "cancelled") toast.error(`${msg}`, { duration: 6000 });
      setPlacing(false);
    }
  };

  const noPaymentMethods = !codEnabled && !onlinePaymentEnabled && !qrEnabled;
  const gatewayLabel = (paymentGateway ?? "instamojo") === "cashfree" ? "Cashfree" : "Instamojo";

  return (
    <>
      {onlinePaymentEnabled && (paymentGateway ?? "instamojo") === "instamojo" && (
        <Script src="https://js.instamojo.com/v1/checkout.js" strategy="lazyOnload" />
      )}

      <div>
        <div className="flex items-end justify-between border-b border-border pb-4 mb-8">
          <h1 className="font-playfair text-3xl text-heading">Payment</h1>
          <span className="text-xs font-semibold tracking-widest text-heading uppercase">Step 2 of 2</span>
        </div>

        {/* Address summary */}
        <div className="bg-card border border-border p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-heading mb-2">Delivering to</p>
              <p className="text-sm font-medium text-heading">{shippingAddress.fullName}</p>
              <p className="text-sm text-body-text">{shippingAddress.addressLine1}{shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ""}</p>
              <p className="text-sm text-body-text">{shippingAddress.city}, {shippingAddress.state} — {shippingAddress.pincode}</p>
              <p className="text-xs text-muted-text mt-1">{shippingAddress.phone}</p>
            </div>
            <button onClick={onBack} className="text-xs text-primary hover:text-primary-hover font-medium transition-colors shrink-0 ml-4">Edit</button>
          </div>
        </div>

        {/* Totals */}
        <div className="bg-card border border-border p-4 mb-8 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-body-text">Subtotal ({cartItems.length} item{cartItems.length !== 1 ? "s" : ""})</span>
            <span className="text-heading">₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-body-text">Shipping</span>
            {shipping === 0 ? <span className="text-success font-medium text-xs">FREE</span> : <span className="text-heading">₹{shipping}</span>}
          </div>
          {shipping === 0 && (freeShippingAbove ?? 0) > 0 && (
            <p className="text-xs text-success">🎉 Free shipping on orders above ₹{freeShippingAbove}</p>
          )}
          <div className="flex justify-between items-center border-t border-border pt-3 mt-1">
            <span className="text-xs font-bold uppercase tracking-widest text-heading">Grand Total</span>
            <span className="text-xl font-semibold text-heading">₹{grandTotal}</span>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mb-8">
          <p className="text-xs font-bold tracking-widest text-heading mb-4 uppercase">Payment Method</p>

          {noPaymentMethods ? (
            <div className="border border-border p-4 text-sm text-muted-text rounded">No payment methods enabled. Contact support.</div>
          ) : (
            <div className="space-y-3">
              {/* COD */}
              {codEnabled && (
                <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "cod" ? "border-primary bg-section-2" : "border-border hover:border-heading"}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-0.5 accent-primary" />
                  <div>
                    <p className="text-sm font-semibold text-heading">Cash on Delivery</p>
                    <p className="text-xs text-muted-text mt-1">Pay when your order arrives. Available across India.</p>
                  </div>
                </label>
              )}

              {/* QR / UPI */}
              {qrEnabled && (
                <div>
                  <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "qr" ? "border-primary bg-section-2" : "border-border hover:border-heading"}`}>
                    <input type="radio" name="payment" value="qr" checked={paymentMethod === "qr"} onChange={() => setPaymentMethod("qr")} className="mt-0.5 accent-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-heading">UPI / QR Code Payment</p>
                      <p className="text-xs text-muted-text mt-1">Scan the QR code and pay via GPay, PhonePe, Paytm, or any UPI app.</p>
                    </div>
                  </label>

                  {/* QR details — shown when selected */}
                  {paymentMethod === "qr" && (
                    <div className="border border-primary/30 border-t-0 bg-section-2/50 p-5 space-y-4">
                      {/* QR image + UPI info */}
                      <div className="flex flex-col sm:flex-row gap-5 items-start">
                        {qrImage && (
                          <div className="shrink-0">
                            <img src={qrImage} alt="Payment QR Code" className="w-40 h-40 object-contain border border-border rounded-lg bg-white p-2" />
                          </div>
                        )}
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-text mb-1">Pay To</p>
                            <p className="text-sm font-semibold text-heading">{qrRecipientName || "Store"}</p>
                          </div>
                          <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-muted-text mb-1">UPI ID</p>
                            <div className="flex items-center gap-2">
                              <code className="text-sm font-mono text-heading bg-white border border-border px-3 py-1.5 rounded">{qrUpiId || "—"}</code>
                              {qrUpiId && (
                                <button type="button" onClick={() => { navigator.clipboard.writeText(qrUpiId); toast.success("UPI ID copied!"); }}
                                  className="text-xs text-primary hover:text-primary-hover transition-colors">
                                  Copy
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                            <p className="text-xs font-bold text-yellow-800 mb-1">Amount to Pay</p>
                            <p className="text-xl font-bold text-yellow-900">₹{grandTotal}</p>
                          </div>
                        </div>
                      </div>

                      {/* Screenshot upload */}
                      <div>
                        <p className="text-xs font-bold uppercase tracking-widest text-heading mb-2">Upload Payment Screenshot *</p>
                        <p className="text-xs text-muted-text mb-3">After paying, take a screenshot of the payment confirmation and upload it here. Your order will be confirmed after admin verification.</p>

                        {screenshotPreview ? (
                          <div className="relative inline-block group">
                            <img src={screenshotPreview} alt="Payment screenshot" className="h-32 w-auto object-contain border border-border rounded-lg" />
                            <button type="button"
                              onClick={() => { setScreenshot(null); setScreenshotPreview(null); }}
                              className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                            <p className="text-xs text-success mt-2">✅ Screenshot ready</p>
                          </div>
                        ) : (
                          <div onClick={() => screenshotRef.current?.click()}
                            className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-section-2 transition-colors">
                            <svg className="w-8 h-8 mx-auto mb-2 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <p className="text-sm text-body-text"><span className="text-primary font-medium">Click to upload</span> screenshot</p>
                            <p className="text-xs text-muted-text mt-1">PNG, JPG (max 5MB)</p>
                          </div>
                        )}
                        <input ref={screenshotRef} type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setScreenshot(file);
                            setScreenshotPreview(URL.createObjectURL(file));
                          }} />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Online payment */}
              {onlinePaymentEnabled && (
                <label className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${paymentMethod === "online" ? "border-primary bg-section-2" : "border-border hover:border-heading"}`}>
                  <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-0.5 accent-primary" />
                  <div>
                    <p className="text-sm font-semibold text-heading">
                      Online Payment <span className="text-xs text-muted-text font-normal">via {gatewayLabel}</span>
                    </p>
                    <p className="text-xs text-muted-text mt-1">Pay securely via UPI, cards, net banking, or wallets.</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {["UPI", "Cards", "Net Banking", "Wallets"].map((m) => (
                        <span key={m} className="text-xs bg-border px-2 py-0.5 rounded text-body-text">{m}</span>
                      ))}
                    </div>
                  </div>
                </label>
              )}
            </div>
          )}
        </div>

        {/* Place Order */}
        <button onClick={handlePlaceOrder} disabled={placing || noPaymentMethods || (paymentMethod === "qr" && !screenshot)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-primary-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {placing ? (
            <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>
            {paymentMethod === "qr" ? "Uploading…" : paymentMethod === "online" ? "Opening Payment…" : "Placing Order…"}</>
          ) : (
            <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/></svg>
            {paymentMethod === "qr" ? (screenshot ? "Submit Order & Screenshot" : "Upload Screenshot First") : paymentMethod === "online" ? "Pay Now" : "Place Order"}</>
          )}
        </button>

        <p className="text-center text-xs text-muted-text mt-4">
          By placing your order you agree to our <a href="/policy" className="text-primary hover:underline">Terms & Conditions</a>
        </p>
      </div>
    </>
  );
}
