"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/Icons/SearchIcon";
import { CartIcon } from "@/components/Icons/CartIcon";
import CloseIcons from "@/components/ui/Close";
import { usePathname } from "next/navigation";
import MenuIcon from "@/components/Icons/MenuIcon";
import { useCart } from "@/context/cartContext";
import { useSettings } from "@/context/settingsContext";
import { useSession, signOut } from "next-auth/react";

const SideNav = () => {
  const pathname = usePathname();
  const { cartCount } = useCart();
  const { siteName, logo } = useSettings();
  const { data: session, status } = useSession();
  const router = useRouter();

  const nav = [
    { id: "id1", title: "Home", href: "/" },
    { id: "id2", title: "Collections", href: "/collection" },
    { id: "id4", title: "About US", href: "/about" },
    { id: "id3", title: "Contact US", href: "/contact" },
  ];

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isSearchOpen) inputRef.current?.focus();
  }, [isSearchOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") { setIsSearchOpen(false); setSearchVal(""); }
    };
    if (isSearchOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isSearchOpen]);

  // Close sidebar on route change
  useEffect(() => { setIsSidebarOpen(false); }, [pathname]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/collection?search=${encodeURIComponent(searchVal.trim())}`);
    setIsSearchOpen(false);
    setSearchVal("");
  };

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : null;

  return (
    <>
      {/* ── Top bar ── */}
      <header className="w-full bg-white/5 backdrop-blur-md shadow-md">
        <div className="flex items-center justify-between px-3 py-2 max-w-screen-2xl mx-auto min-h-14">

          {/* Left: hamburger */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open menu"
            className="p-2 text-secondary hover:text-primary transition-colors shrink-0"
          >
            <MenuIcon />
          </button>

          {/* Center: logo */}
          <Link
            href="/"
            className="font-playfair font-semibold text-lg tracking-tight hover:text-primary transition-colors truncate px-2 text-center flex-1"
          >
            {logo ? (
              <img src={logo} alt={siteName} className="h-7 w-auto object-contain mx-auto" />
            ) : (
              siteName ?? "Heritage Threads"
            )}
          </Link>

          {/* Right: search + cart + auth — compact */}
          <div className="flex items-center gap-0.5 shrink-0">
            {/* Search icon — opens full-width search bar below */}
            <button
              onClick={() => setIsSearchOpen((v) => !v)}
              aria-label="Search"
              className="p-2 text-secondary hover:text-primary transition-colors rounded-full"
            >
              <SearchIcon />
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className="relative p-2 text-secondary hover:text-primary transition-colors rounded-full"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth — compact: avatar or sign-in icon */}
            {status === "loading" ? (
              <div className="w-8 h-8 rounded-full bg-border animate-pulse mx-1" />
            ) : session?.user ? (
              <button
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Account"
                className="w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mx-1 shrink-0"
              >
                {session.user.avatar ? (
                  <img src={session.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  initials ?? "U"
                )}
              </button>
            ) : (
              <Link
                href="/login"
                className="ml-1 px-3 py-1.5 text-xs font-semibold text-primary border border-primary rounded-full hover:bg-primary hover:text-white transition-colors shrink-0"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>

        {/* Expandable search bar */}
        {isSearchOpen && (
          <div className="border-t border-border px-3 py-2 bg-body">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search products…"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-border rounded-full bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:border-primary"
              />
              <button type="submit" className="p-2 text-primary hover:text-primary-hover transition-colors">
                <SearchIcon />
              </button>
              <button
                type="button"
                onClick={() => { setIsSearchOpen(false); setSearchVal(""); }}
                className="p-2 text-muted-text hover:text-heading transition-colors"
              >
                <CloseIcons />
              </button>
            </form>
          </div>
        )}
      </header>

      {/* ── Sidebar overlay ── */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-heading/40 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar drawer ── */}
      <aside className={`fixed top-0 left-0 h-screen w-72 bg-card shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out font-playfair ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-border/50">
          <span className="font-playfair font-semibold text-lg text-heading">Menu</span>
          <button
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu"
            className="p-2 text-secondary hover:text-heading transition-colors rounded-full hover:bg-border/30"
          >
            <CloseIcons />
          </button>
        </div>

        {/* User info if logged in */}
        {session?.user && (
          <div className="px-5 py-4 border-b border-border/50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
              {session.user.avatar ? (
                <img src={session.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                initials ?? "U"
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-heading truncate">{session.user.name}</p>
              <p className="text-xs text-muted-text truncate">{session.user.email}</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`px-4 py-3 rounded-lg text-sm transition-colors ${
                pathname === item.href
                  ? "text-primary font-semibold bg-section-2"
                  : "text-secondary hover:text-primary hover:bg-border/30"
              }`}
            >
              {item.title}
            </Link>
          ))}

          {/* Auth links in sidebar */}
          <div className="border-t border-border/50 mt-4 pt-4 space-y-1">
            {session?.user ? (
              <>
                <Link href="/user" onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-border/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  My Profile
                </Link>
                <Link href="/user?tab=orders" onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-border/30 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  My Orders
                </Link>
                {session.user.role === "admin" && (
                  <Link href="/admin" onClick={() => setIsSidebarOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-secondary hover:text-primary hover:bg-border/30 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { setIsSidebarOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm text-error hover:bg-red-50 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-primary border border-primary hover:bg-primary hover:text-white transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" onClick={() => setIsSidebarOpen(false)}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-colors">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default SideNav;
