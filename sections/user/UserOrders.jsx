"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const STATUS_BADGE = {
  pending:    "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-section-2 text-primary border-primary/20",
  shipped:    "bg-blue-50 text-blue-700 border-blue-200",
  delivered:  "bg-green-50 text-green-700 border-green-200",
  cancelled:  "bg-red-50 text-error border-red-200",
};

const PAYMENT_BADGE = {
  paid:    "text-green-700",
  pending: "text-yellow-700",
  failed:  "text-error",
};

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default function UserOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => { if (d.success) setOrders(d.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 bg-card border border-border rounded" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-text">
        <div className="text-4xl mb-4">🛍️</div>
        <p className="text-lg mb-4">No orders yet</p>
        <Link href="/collection" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Start shopping →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-card border border-border overflow-hidden">
          {/* Order header */}
          <div
            className="flex items-start justify-between p-5 cursor-pointer hover:bg-body/50 transition-colors"
            onClick={() => setExpanded(expanded === order._id ? null : order._id)}
          >
            <div>
              <p className="text-xs font-mono text-muted-text mb-1">
                #{order._id.toString().slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-body-text">{formatDate(order.createdAt)}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_BADGE[order.status] ?? "bg-border text-body-text border-border"}`}>
                  {order.status}
                </span>
                {order.paymentMethod === "qr" && order.paymentStatus === "pending" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    ⏳ Awaiting payment verification
                  </span>
                )}
              </div>
            </div>
            <div className="text-right flex flex-col items-end gap-2">
              <p className="text-lg font-semibold text-heading">₹{order.totalAmount.toLocaleString("en-IN")}</p>
              <p className={`text-xs font-medium capitalize ${PAYMENT_BADGE[order.paymentStatus] ?? "text-muted-text"}`}>
                {order.paymentStatus === "paid" ? "✅ Paid" : order.paymentStatus === "pending" ? "⏳ Pending" : order.paymentStatus}
              </p>
              <svg className={`w-4 h-4 text-muted-text transition-transform ${expanded === order._id ? "rotate-180" : ""}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expanded items */}
          {expanded === order._id && (
            <div className="border-t border-border">
              {/* Product list with images */}
              <div className="p-5 space-y-3">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-text mb-3">Items</p>
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {/* Product image */}
                    <Link
                      href={item.productId ? `/product/${item.productId}` : "#"}
                      className="shrink-0 w-16 h-16 bg-border rounded overflow-hidden hover:opacity-80 transition-opacity"
                    >
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-section flex items-center justify-center text-muted-text text-xs">
                          No img
                        </div>
                      )}
                    </Link>
                    {/* Product info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={item.productId ? `/product/${item.productId}` : "#"}
                        className="text-sm font-medium text-heading hover:text-primary transition-colors truncate block"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-text mt-0.5">Qty: {item.qty} × ₹{item.price}</p>
                    </div>
                    <p className="text-sm font-semibold text-heading shrink-0">
                      ₹{(item.price * item.qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order summary */}
              <div className="border-t border-border px-5 py-4 bg-body/50 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-text">Payment method</span>
                  <span className="text-body-text capitalize">{order.paymentMethod ?? "cod"}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-heading">Total</span>
                  <span className="text-heading">₹{order.totalAmount.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Shipping address */}
              {order.shippingAddress && (
                <div className="border-t border-border px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-text mb-2">Delivering to</p>
                  <p className="text-sm text-heading font-medium">{order.shippingAddress.fullName}</p>
                  <p className="text-xs text-body-text mt-0.5">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ""}
                  </p>
                  <p className="text-xs text-body-text">
                    {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
