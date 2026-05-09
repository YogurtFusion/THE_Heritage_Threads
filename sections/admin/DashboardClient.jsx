"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import BellIcon from "@/components/Icons/BellIcon";
import NotificationBell from "@/sections/admin/NotificationBell";

const STATUS_BADGE = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  processing: "bg-section text-primary-hover border-primary/20",
  shipped: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
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

export default function DashboardClient() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-border rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-card border border-border rounded-sm" />
          ))}
        </div>
        <div className="h-64 bg-card border border-border rounded-sm" />
      </div>
    );
  }

  const stats = data
    ? [
        {
          title: "Total Orders",
          value: data.totalOrders,
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          ),
        },
        {
          title: "Total Revenue",
          value: formatCurrency(data.totalRevenue),
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          ),
        },
        {
          title: "New Users Today",
          value: data.newUsersToday,
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          ),
        },
        {
          title: "Low Stock Items",
          value: data.lowStockProducts?.length ?? 0,
          icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          ),
        },
      ]
    : [];

  // Simple bar chart for daily sales
  const maxRevenue = data
    ? Math.max(...data.dailySalesChart.map((d) => d.revenue), 1)
    : 1;

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border pb-4 md:pb-6">
        <h1 className="text-2xl md:text-3xl lg:text-4xl text-heading font-semibold">
          Dashboard Overview
        </h1>
        <NotificationBell />
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <article key={stat.title} className="bg-card border border-border rounded-sm p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-semibold tracking-widest text-body-text uppercase">
                {stat.title}
              </p>
              <svg aria-hidden="true" className="w-5 h-5 text-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {stat.icon}
              </svg>
            </div>
            <p className="text-3xl md:text-4xl text-heading">{stat.value}</p>
          </article>
        ))}
      </section>

      {/* Daily Sales Chart */}
      {data && (
        <section className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-xl text-heading mb-6">Daily Sales (Last 7 Days)</h2>
          <div className="flex items-end gap-2 h-40">
            {data.dailySalesChart.map((day) => {
              const heightPct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const label = new Date(day.date).toLocaleDateString("en-IN", { weekday: "short" });
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-muted-text">{formatCurrency(day.revenue)}</span>
                  <div className="w-full bg-border rounded-t-sm relative" style={{ height: "100px" }}>
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-sm transition-all duration-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-text">{label}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Recent Orders */}
      {data && (
        <section className="bg-card border border-border rounded-sm">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="text-2xl text-heading">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors">
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-card">
                  {["Order ID", "Customer", "Date", "Total", "Status"].map((h) => (
                    <th key={h} scope="col" className="p-6 text-xs font-semibold tracking-widest text-muted-text uppercase">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-body-text text-sm">
                {data.recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-text">No orders yet</td>
                  </tr>
                ) : (
                  data.recentOrders.map((order) => (
                    <tr key={order._id} className="border-b last:border-0 border-border hover:bg-body bg-card transition-colors">
                      <td className="p-6 font-mono text-xs">{order._id.toString().slice(-8).toUpperCase()}</td>
                      <td className="p-6">{order.userId?.name ?? "—"}</td>
                      <td className="p-6">{formatDate(order.createdAt)}</td>
                      <td className="p-6 font-medium text-heading">{formatCurrency(order.totalAmount)}</td>
                      <td className="p-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_BADGE[order.status] ?? "bg-border text-body-text"}`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Low Stock */}
      {data && data.lowStockProducts.length > 0 && (
        <section className="bg-card border border-border rounded-sm p-6">
          <h2 className="text-xl text-heading mb-4">Low Stock Alert</h2>
          <div className="space-y-3">
            {data.lowStockProducts.map((p) => (
              <div key={p._id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <span className="text-sm text-body-text">{p.name}</span>
                <span className={`text-sm font-medium ${p.stock === 0 ? "text-error" : "text-warning"}`}>
                  {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
