"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/Icons/SearchIcon";
import { CartIcon } from "@/components/Icons/CartIcon";
import CloseIcons from "@/components/ui/Close";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/cartContext";
import UserMenu from "@/components/ui/UserMenu";
import { useSettings } from "@/context/settingsContext";

const TopNav = () => {
  const { cartCount } = useCart();
  const { siteName, logo } = useSettings();
  const pathname = usePathname();
  const router = useRouter();
  const nav = [
    { id: "id1", title: "Home", href: "/" },
    { id: "id2", title: "Products", href: "/collection" },
    { id: "id4", title: "About US", href: "/about" },
    { id: "id3", title: "Contact US", href: "/contact" },
  ];
  const [isOpen, setIsOpen] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") { setIsOpen(false); setSearchVal(""); }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchVal.trim()) return;
    router.push(`/collection?search=${encodeURIComponent(searchVal.trim())}`);
    setIsOpen(false);
    setSearchVal("");
  };

  return (
    <header className="w-full bg-white/5  backdrop-blur-md shadow-md">
      {/* wrap */}
      <div className=" flex  justify-between items-center px-6 md:px-12 py-3  max-w-screen-2xl mx-auto min-h-14 ">
        <nav className="  md:flex justify-between items-center gap-6 font-playfair">
          {nav.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={` duration-300 transition-colors text-sm ${pathname === item.href ? "text-primary font-semibold hover:text-primary-hover" : "text-secondary active:text-primary hover:text-primary"}`}
            >
              {item.title}
            </Link>
          ))}
        </nav>

        {/* logo */}
        <Link
          className="absolute left-1/2 -translate-x-1/2 font-playfair font-semibold text-xl tracking-tight hover:text-primary transition-colors"
          href={"/"}
        >
          {logo ? (
            <img src={logo} alt={siteName} className="h-8 w-auto object-contain" />
          ) : (
            <>
              <span className="lg:hidden">{siteName?.slice(0, 2).toUpperCase() ?? "HT"}</span>
              <span className="hidden lg:block">{siteName ?? "Heritage Threads"}</span>
            </>
          )}
        </Link>

        {/* Right Icons */}
        <div className=" flex justify-end items-center gap-1 ">
            <div className={`flex justify-start items-center transition-all duration-500 ease-in-out h-9  ${isOpen ? " border border-border  rounded-full px-2  bg-body" : "border-transparent px-0"} `}>
              <button className="p-2 hover:opacity-70 transition-opacity rounded-full text-secondary hover:bg-border/30"
                aria-label="Open search" onClick={() => setIsOpen(true)}>
                <SearchIcon />
              </button>
              <form onSubmit={handleSearch}
                className={`flex items-center overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "max-w-xs opacity-100 ml-1" : "max-w-0 opacity-0 ml-0 pointer-events-none"}`}>
                <input ref={inputRef} name="search" type="text" placeholder="Search products…"
                  autoComplete="off" value={searchVal} onChange={(e) => setSearchVal(e.target.value)}
                  className="outline-none text-sm w-32 placeholder:text-muted-text focus:text-heading bg-transparent" />
                <button type="submit" aria-label="submit search" className="text-secondary hover:text-primary p-1 transition-colors cursor-pointer hover:bg-border/30 rounded-full">
                  <SearchIcon />
                </button>
                <button type="button" aria-label="close search"
                  className="text-secondary hover:text-heading p-1 transition-colors cursor-pointer hover:bg-border/30 rounded-full"
                  onClick={() => { setIsOpen(false); setSearchVal(""); }}>
                  <CloseIcons />
                </button>
              </form>
            </div>

          <Link
            href={"/cart"}
            aria-label="cart"
            className="block relative p-2 hover:opacity-70 rounded-full text-secondary hover:bg-border/30 transition-opacity "
          >
            <CartIcon />
            {cartCount>0&&(
              <span className="absolute top-1 right-1 bg-primary text-body text-xs w-4 h-4 rounded-full flex items-center justify-center" >{cartCount} </span>
            )}
          </Link>
          <UserMenu />
        </div>
      </div>
    </header>
  );
};

export default TopNav;
