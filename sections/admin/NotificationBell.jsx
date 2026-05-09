"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

// ─── Type Icons (SVG, no emojis) ─────────────────────────────────────────────
const TYPE_ICONS = {
  new_order: (
    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  order_updated: (
    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  new_contact: (
    <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  low_stock: (
    <svg className="w-4 h-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  new_user: (
    <svg className="w-4 h-4 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  payment_receipt: (
    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  default: (
    <svg className="w-4 h-4 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
};

function timeAgo(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const [data, setData] = useState({ notifications: [], unreadCount: 0 });
  const [pendingPayments, setPendingPayments] = useState(0);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = () => {
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); })
      .catch(() => {});
  };

  const fetchPendingPayments = () => {
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const count = d.data.filter(
            (o) => (o.paymentMethod === "qr" || o.paymentScreenshot) && o.paymentStatus === "pending"
          ).length;
          setPendingPayments(count);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    fetchPendingPayments();
    const interval = setInterval(() => {
      fetchNotifications();
      fetchPendingPayments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/admin/notifications", { method: "PATCH" });
    setData((p) => ({ ...p, unreadCount: 0, notifications: p.notifications.map((n) => ({ ...n, read: true })) }));
  };

  const totalBadge = data.unreadCount + pendingPayments;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => { setOpen((v) => !v); if (!open && data.unreadCount > 0) markAllRead(); }}
        aria-label="Notifications"
        className="relative text-body-text hover:text-primary transition-colors p-1"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {totalBadge > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {totalBadge > 9 ? "9+" : totalBadge}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h3 className="font-semibold text-heading text-sm">Notifications</h3>
            {data.unreadCount > 0 && (
              <button onClick={markAllRead} className="text-xs text-primary hover:text-primary-hover transition-colors">
                Mark all read
              </button>
            )}
          </div>

          {/* Pending payment receipts banner */}
          {pendingPayments > 0 && (
            <Link href="/admin/payments" onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 bg-yellow-50 border-b border-yellow-200 hover:bg-yellow-100 transition-colors">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center shrink-0">
                {TYPE_ICONS.payment_receipt}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-yellow-800">
                  {pendingPayments} payment receipt{pendingPayments !== 1 ? "s" : ""} pending
                </p>
                <p className="text-xs text-yellow-700">Click to review and verify</p>
              </div>
              <span className="w-5 h-5 bg-yellow-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                {pendingPayments > 9 ? "9+" : pendingPayments}
              </span>
            </Link>
          )}

          <div className="max-h-72 overflow-y-auto no-scrollbar">
            {data.notifications.length === 0 ? (
              <div className="text-center py-8 text-muted-text text-sm">No notifications yet</div>
            ) : (
              data.notifications.map((n) => (
                <Link key={n._id} href={n.link ?? "/admin"}
                  onClick={() => setOpen(false)}
                  className={`flex items-start gap-3 px-4 py-3 hover:bg-body transition-colors border-b border-border last:border-0 ${!n.read ? "bg-section-2/50" : ""}`}>
                  <div className="w-7 h-7 rounded-full bg-body flex items-center justify-center shrink-0 mt-0.5">
                    {TYPE_ICONS[n.type] ?? TYPE_ICONS.default}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!n.read ? "font-semibold text-heading" : "text-body-text"}`}>{n.title}</p>
                    <p className="text-xs text-muted-text mt-0.5 truncate">{n.message}</p>
                    <p className="text-xs text-muted-text mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <div className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1.5" />}
                </Link>
              ))
            )}
          </div>

          <div className="px-4 py-2 border-t border-border flex items-center justify-between">
            <Link href="/admin/payments" onClick={() => setOpen(false)}
              className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              Payment Receipts
            </Link>
            <Link href="/admin/contacts" onClick={() => setOpen(false)}
              className="text-xs text-primary hover:text-primary-hover transition-colors">
              Contact Messages
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
