"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function UserMenu() {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-border animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="text-sm text-secondary hover:text-primary transition-colors px-3 py-1.5 rounded-md hover:bg-border/30"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="text-sm text-white bg-primary hover:bg-primary-hover transition-colors px-3 py-1.5 rounded-md"
        >
          Sign up
        </Link>
      </div>
    );
  }

  const initials = session.user.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
        aria-expanded={open}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-border/30 transition-colors"
      >
        {session.user.avatar ? (
          <img
            src={session.user.avatar}
            alt={session.user.name ?? "User"}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
        ) : (
          <span className="w-8 h-8 rounded-full bg-primary text-white text-xs font-semibold flex items-center justify-center">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg z-50 py-1 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-medium text-heading truncate">{session.user.name}</p>
            <p className="text-xs text-muted-text truncate">{session.user.email}</p>
          </div>

          <Link
            href="/user"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-body-text hover:bg-body hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Profile
          </Link>

          <Link
            href="/user?tab=orders"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-body-text hover:bg-body hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            My Orders
          </Link>

          {session.user.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm text-body-text hover:bg-body hover:text-primary transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Admin Panel
            </Link>
          )}

          <div className="border-t border-border mt-1">
            <button
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-error hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
