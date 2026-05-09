"use client";
import React, { useState, useEffect, useCallback } from "react";
import { CollectionCards } from "./CollectionCards";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const CATEGORIES = [
  { value: "", label: "All Categories" },
  { value: "keychains", label: "Keychains" },
  { value: "zipchains", label: "Zip Chains" },
  { value: "accessories", label: "Accessories" },
  { value: "home-decor", label: "Home Decor" },
  { value: "clothing", label: "Clothing" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "featured", label: "Featured" },
];

const CollectionSection = () => {
  const searchParams = useSearchParams();
  const urlSearch = searchParams.get("search") ?? "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState(urlSearch);
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Sync URL search param into state
  useEffect(() => {
    setSearch(urlSearch);
    setPage(1);
  }, [urlSearch]);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (sort === "featured") params.set("featured", "true");
    params.set("page", String(page));
    params.set("limit", "12");

    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          let sorted = [...d.data.products];
          if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
          if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
          setProducts(sorted);
          setTotalPages(d.data.pages);
          setTotal(d.data.total);
        }
      })
      .finally(() => setLoading(false));
  }, [category, search, sort, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, search, sort]);

  return (
    <section className="bg-body min-h-screen pb-24 font-inter text-body-text">
      <div className="max-w-350 mx-auto px-6 lg:px-12 flex flex-col lg:flex-row gap-12 lg:gap-16 pt-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-56 shrink-0">
          {/* Search */}
          <div className="border-t border-border pt-6 mb-8">
            <h2 className="text-xs font-bold uppercase tracking-widest text-heading mb-4">Search</h2>
            <input
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-border bg-body text-sm text-body-text placeholder:text-muted-text focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category Filter */}
          <div className="border-t border-border pt-6 mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-heading mb-6">Category</h2>
            <ul className="space-y-4">
              {CATEGORIES.map((cat) => (
                <li key={cat.value} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="category"
                    id={`cat-${cat.value}`}
                    checked={category === cat.value}
                    onChange={() => setCategory(cat.value)}
                    className="w-4 h-4 accent-primary"
                  />
                  <label
                    htmlFor={`cat-${cat.value}`}
                    className={`text-sm cursor-pointer ${category === cat.value ? "text-heading font-medium" : "text-body-text"}`}
                  >
                    {cat.label}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1">
          {/* Header & Sorting */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-border pb-6 mb-8 gap-4">
            <div>
              <h1 className="font-playfair text-4xl md:text-5xl text-heading tracking-wide">COLLECTION</h1>
              {!loading && (
                <p className="text-xs text-muted-text mt-1">{total} product{total !== 1 ? "s" : ""}</p>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs tracking-widest uppercase text-muted-text pb-2">
              Sort By:
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="font-semibold text-heading capitalize tracking-normal text-sm ml-1 bg-transparent border-none focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </header>

          {/* Product Grid */}
          {loading ? (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-4/5 bg-card mb-5" />
                  <div className="h-5 bg-border rounded w-3/4 mb-2" />
                  <div className="h-4 bg-border rounded w-1/4 mb-4" />
                  <div className="h-10 bg-border rounded" />
                </div>
              ))}
            </section>
          ) : products.length === 0 ? (
            <div className="text-center py-24 text-muted-text">
              <p className="text-lg mb-2">No products found</p>
              <button onClick={() => { setCategory(""); setSearch(""); }} className="text-sm text-primary hover:text-primary-hover transition-colors">
                Clear filters
              </button>
            </div>
          ) : (
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
              {products.map((item, index) => (
                <CollectionCards
                  key={item._id}
                  _id={item._id}
                  images={item.images}
                  name={item.name}
                  price={item.discountPrice ?? item.price}
                  index={index}
                />
              ))}
            </section>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex justify-center items-center gap-2 mt-16 pt-16 border-t border-border">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-10 h-10 border border-border text-muted-text flex items-center justify-center hover:border-heading hover:text-heading transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 font-semibold flex items-center justify-center transition-colors ${
                    page === i + 1
                      ? "bg-primary text-white"
                      : "border border-border text-heading hover:border-heading"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-10 h-10 border border-border text-muted-text flex items-center justify-center hover:border-heading hover:text-heading transition-colors disabled:opacity-40"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          )}
        </main>
      </div>
    </section>
  );
};

export default function CollectionPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-body" />}>
      <CollectionSection />
    </Suspense>
  );
}
