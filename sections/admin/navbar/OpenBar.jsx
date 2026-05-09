"use client";
import BoxIcon from "@/components/Icons/BoxIcon";
import { CartIcon } from "@/components/Icons/CartIcon";
import Dashboard from "@/components/Icons/DashboardIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSettings } from "@/context/settingsContext";

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const ContactIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
const ReceiptIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const OpenSideBar = () => {
  const pathname = usePathname();
  const { siteName } = useSettings();
  const [pendingPayments, setPendingPayments] = useState(0);

  useEffect(() => {
    const fetchPending = () => {
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
    fetchPending();
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { title: "Dashboard", href: "/admin", icon: Dashboard },
    { title: "Orders", href: "/admin/orders", icon: CartIcon },
    { title: "Inventory", href: "/admin/inventory", icon: BoxIcon },
    { title: "Payments", href: "/admin/payments", icon: ReceiptIcon, badge: pendingPayments },
    { title: "Users", href: "/admin/users", icon: UsersIcon },
    { title: "Contacts", href: "/admin/contacts", icon: ContactIcon },
    { title: "Settings", href: "/admin/settings", icon: GearIcon },
  ];

  return (
    <aside className="w-64 h-screen rounded-md border-r border-border bg-card flex flex-col py-8 px-4">
      <div className="px-4 py-3 mb-2">
        <h2 className="text-2xl font-semibold text-primary hover:text-secondary cursor-pointer">
          <Link href="/">{siteName ?? "Heritage Threads"}</Link>
        </h2>
        <p className="text-sm text-gray-500 mt-1">Admin Panel</p>
      </div>
      <nav className="flex flex-col gap-2">
        {navLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.title}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors ${isActive ? "bg-body text-primary shadow-md font-medium" : "text-muted-text hover:bg-border/50"}`}
              href={item.href}>
              <Icon className="text-xl text-muted-text" />
              <span className="flex-1">{item.title}</span>
              {item.badge > 0 && (
                <span className="w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default OpenSideBar;
