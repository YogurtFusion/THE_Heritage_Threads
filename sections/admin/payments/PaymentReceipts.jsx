"use client";
import { useEffect, useState, useCallback } from "react";
import toast from "react-hot-toast";

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
const XIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const ReceiptIcon = () => (
  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);
const ZoomIcon = () => (
  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
  </svg>
);
const Spinner = () => (
  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Toast confirmation helper ────────────────────────────────────────────────
function confirmToast(message, onConfirm, confirmLabel = "Confirm", confirmClass = "bg-primary") {
  toast((t) => (
    <div className="flex flex-col gap-3 min-w-[220px]">
      <p className="text-sm text-heading font-medium">{message}</p>
      <div className="flex gap-2">
        <button
          onClick={() => { toast.dismiss(t.id); onConfirm(); }}
          className={`flex-1 px-3 py-1.5 ${confirmClass} text-white text-xs font-semibold rounded hover:opacity-90 transition-opacity`}
        >
          {confirmLabel}
        </button>
        <button
          onClick={() => toast.dismiss(t.id)}
          className="flex-1 px-3 py-1.5 border border-border text-body-text text-xs font-medium rounded hover:bg-body transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  ), { duration: 12000, style: { maxWidth: "280px" } });
}

export default function PaymentReceipts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [lightbox, setLightbox] = useState(null);
  const [filter, setFilter] = useState("all");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const qrOrders = d.data.filter(
            (o) => o.paymentMethod === "qr" || (o.paymentScreenshot && o.paymentScreenshot !== null)
          );
          setOrders(qrOrders);
        } else {
          toast.error(d.message);
        }
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const doAction = async (orderId, action) => {
    setProcessing(orderId + action);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message, {
          icon: action === "verify"
            ? <CheckIcon />
            : <XIcon />,
          style: {
            background: action === "verify" ? "#f0f7f0" : "#fdf0f0",
            color: action === "verify" ? "#155724" : "#721c24",
            border: `1px solid ${action === "verify" ? "#c3e6cb" : "#f5c6cb"}`,
          },
        });
        setOrders((prev) => prev.map((o) =>
          o._id === orderId
            ? { ...o, paymentStatus: data.data.paymentStatus, status: data.data.status, paymentMethod: action === "decline" ? "cod" : o.paymentMethod }
            : o
        ));
      } else {
        toast.error(data.message ?? "Action failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const handleVerify = (orderId) => {
    confirmToast(
      "Mark this payment as verified? The order will move to Processing.",
      () => doAction(orderId, "verify"),
      "Verify Payment",
      "bg-success"
    );
  };

  const handleDecline = (orderId) => {
    confirmToast(
      "Decline this payment? The order will be converted to Cash on Delivery.",
      () => doAction(orderId, "decline"),
      "Decline",
      "bg-error"
    );
  };

  const filtered = orders.filter((o) => {
    if (filter === "pending") return o.paymentStatus === "pending" && o.paymentScreenshot;
    if (filter === "verified") return o.paymentStatus === "paid";
    if (filter === "declined") return o.paymentMethod === "cod" && o.paymentScreenshot;
    return true;
  });

  const pendingCount = orders.filter((o) => o.paymentStatus === "pending" && o.paymentScreenshot).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-1">Payment Receipts</h1>
          <p className="text-muted-text text-sm">Review and verify QR/UPI payment screenshots from customers</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm font-medium text-yellow-800">
            <ClockIcon />
            {pendingCount} pending verification{pendingCount !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b border-border overflow-x-auto no-scrollbar">
        {[
          { id: "all", label: "All" },
          { id: "pending", label: "Pending" },
          { id: "verified", label: "Verified" },
          { id: "declined", label: "Declined" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              filter === f.id ? "border-primary text-primary" : "border-transparent text-muted-text hover:text-body-text"
            }`}>
            {f.label}
            {f.id === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card border border-border rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-text">
          <div className="flex justify-center mb-4 opacity-30"><ReceiptIcon /></div>
          <p className="text-lg font-medium text-heading">No payment receipts {filter !== "all" ? `with status "${filter}"` : "yet"}</p>
          <p className="text-sm mt-2">QR payment orders will appear here for verification</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const isPending = order.paymentStatus === "pending" && order.paymentScreenshot;
            const isVerified = order.paymentStatus === "paid";

            return (
              <div key={order._id}
                className={`bg-card border rounded-xl overflow-hidden ${
                  isPending ? "border-yellow-300 shadow-sm" : isVerified ? "border-green-300" : "border-border"
                }`}>
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* Screenshot */}
                    <div className="shrink-0">
                      {order.paymentScreenshot ? (
                        <div className="relative group cursor-pointer" onClick={() => setLightbox(order.paymentScreenshot)}>
                          <img src={order.paymentScreenshot} alt="Payment screenshot"
                            className="w-28 h-28 object-cover rounded-lg border border-border hover:opacity-90 transition-opacity" />
                          <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ZoomIcon />
                          </div>
                          <p className="text-xs text-muted-text mt-1 text-center">Click to enlarge</p>
                        </div>
                      ) : (
                        <div className="w-28 h-28 bg-border rounded-lg flex items-center justify-center text-muted-text text-xs text-center p-2">
                          No screenshot
                        </div>
                      )}
                    </div>

                    {/* Order info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs font-mono text-muted-text">#{order._id.toString().slice(-8).toUpperCase()}</p>
                          <p className="text-base font-semibold text-heading mt-0.5">{order.userId?.name ?? "—"}</p>
                          <p className="text-xs text-muted-text">{order.userId?.email ?? ""}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-heading">₹{Number(order.totalAmount).toLocaleString("en-IN")}</p>
                          <p className="text-xs text-muted-text mt-0.5">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      {/* Status badges */}
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          isVerified ? "bg-green-50 text-green-700 border-green-200" :
                          isPending ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                          "bg-gray-100 text-gray-600 border-gray-200"
                        }`}>
                          {isVerified ? <CheckIcon /> : isPending ? <ClockIcon /> : <XIcon />}
                          {isVerified ? "Payment Verified" : isPending ? "Awaiting Verification" : "Declined — COD"}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border ${
                          order.status === "delivered" ? "bg-green-50 text-green-700 border-green-200" :
                          order.status === "shipped" ? "bg-blue-50 text-blue-700 border-blue-200" :
                          order.status === "processing" ? "bg-section-2 text-primary border-primary/20" :
                          "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <p className="text-xs text-muted-text mt-2">
                        {order.items?.slice(0, 2).map((i) => `${i.name} ×${i.qty}`).join(", ")}
                        {order.items?.length > 2 ? ` +${order.items.length - 2} more` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Action buttons — only for pending */}
                  {isPending && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-border flex-wrap">
                      <button
                        onClick={() => handleVerify(order._id)}
                        disabled={!!processing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-success text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {processing === order._id + "verify" ? <Spinner /> : <CheckIcon />}
                        {processing === order._id + "verify" ? "Verifying…" : "Verify Payment"}
                      </button>
                      <button
                        onClick={() => handleDecline(order._id)}
                        disabled={!!processing}
                        className="flex items-center gap-2 px-5 py-2.5 bg-error text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {processing === order._id + "decline" ? <Spinner /> : <XIcon />}
                        {processing === order._id + "decline" ? "Declining…" : "Decline"}
                      </button>
                      <p className="text-xs text-muted-text">Declining converts order to Cash on Delivery</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={lightbox} alt="Payment screenshot" className="w-full rounded-xl shadow-2xl" />
            <button onClick={() => setLightbox(null)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
              <XIcon />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
