"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_BADGE = {
  pending: "bg-yellow-50 text-yellow-700",
  processing: "bg-section-2 text-primary",
  shipped: "bg-blue-50 text-blue-700",
  delivered: "bg-green-50 text-green-700",
  cancelled: "bg-red-50 text-error",
};

function formatCurrency(n) {
  return `₹${Number(n).toLocaleString("en-IN")}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersClient() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");

  const fetchOrders = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setOrders(d.data);
        else toast.error(d.message);
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Order status updated");
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        toast.error(data.message ?? "Update failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(q) ||
      o.userId?.name?.toLowerCase().includes(q) ||
      o.userId?.email?.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 bg-body">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-1">Orders</h1>
          <p className="text-muted-text text-sm">Manage and track all customer orders</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search orders…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-border rounded-md bg-body text-sm text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-text">
          {search ? "No orders match your search" : "No orders yet"}
        </div>
      ) : (
        <>
                  {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  {["Order ID", "Items", "Customer", "Date", "Total", "Payment", "Status", "Update"].map((h) => (
                    <th key={h} className="py-4 px-4 text-xs font-semibold text-muted-text uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-card transition-colors">
                    <td className="py-4 px-4 text-xs font-mono text-heading">
                      #{order._id.toString().slice(-8).toUpperCase()}
                    </td>
                    {/* Product images + names */}
                    <td className="py-4 px-4">
                      <div className="flex flex-col gap-1.5">
                        {order.items?.slice(0, 3).map((item, i) => (
                          <div key={i} className="flex items-center gap-2">
                            {item.image ? (
                              <Link href={`/product/${item.productId}`} target="_blank">
                                <img src={item.image} alt={item.name}
                                  className="w-8 h-8 object-cover rounded border border-border hover:opacity-80 transition-opacity shrink-0" />
                              </Link>
                            ) : (
                              <div className="w-8 h-8 bg-section rounded border border-border shrink-0" />
                            )}
                            <Link href={`/product/${item.productId}`} target="_blank"
                              className="text-xs text-body-text hover:text-primary transition-colors truncate max-w-[120px]">
                              {item.name} ×{item.qty}
                            </Link>
                          </div>
                        ))}
                        {order.items?.length > 3 && (
                          <span className="text-xs text-muted-text">+{order.items.length - 3} more</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm text-heading">{order.userId?.name ?? "—"}</p>
                      <p className="text-xs text-muted-text">{order.userId?.email ?? ""}</p>
                    </td>
                    <td className="py-4 px-4 text-sm text-body-text">{formatDate(order.createdAt)}</td>
                    <td className="py-4 px-4 text-sm font-medium text-heading">{formatCurrency(order.totalAmount)}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${order.paymentStatus === "paid" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[order.status] ?? "bg-border text-body-text"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={updating === order._id}
                        className="text-xs border border-border rounded-md px-2 py-1.5 bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 cursor-pointer">
                        {STATUSES.map((s) => (
                          <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {filtered.map((order) => (
              <div key={order._id} className="bg-card border border-border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-mono text-heading font-medium">#{order._id.toString().slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-body-text mt-0.5">{order.userId?.name ?? "—"}</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[order.status] ?? "bg-border text-body-text"}`}>
                    {order.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-text">{formatDate(order.createdAt)}</span>
                  <span className="font-medium text-heading">{formatCurrency(order.totalAmount)}</span>
                </div>
                <select
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updating === order._id}
                  className="w-full text-sm border border-border rounded-md px-3 py-2 bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
