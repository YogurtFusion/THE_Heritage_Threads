"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import PrimaryBtn from "@/components/ui/PrimaryBtn";

const getStatusStyle = (stock) => {
  if (stock === 0) return "bg-red-50 text-error";
  if (stock <= 5) return "bg-section-2 text-primary";
  return "bg-border text-success";
};

const getStatusLabel = (stock) => {
  if (stock === 0) return "OUT OF STOCK";
  if (stock <= 5) return "LOW STOCK";
  return "ACTIVE";
};

export default function InventoryClient() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  const fetchProducts = useCallback(() => {
    setLoading(true);
    fetch("/api/products?limit=100")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProducts(d.data.products);
        else toast.error(d.message);
      })
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleDelete = async (id, name) => {
    // Custom confirmation toast
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium text-heading">Delete <strong>"{name}"</strong>?</p>
        <p className="text-xs text-muted-text">This cannot be undone.</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              setDeleting(id);
              try {
                const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
                const data = await res.json();
                if (data.success) {
                  toast.success(`"${name}" deleted`);
                  setProducts((prev) => prev.filter((p) => p._id !== id));
                } else {
                  toast.error(data.message ?? "Delete failed");
                }
              } catch {
                toast.error("An error occurred");
              } finally {
                setDeleting(null);
              }
            }}
            className="flex-1 px-3 py-1.5 bg-error text-white text-xs font-medium rounded hover:opacity-90 transition-opacity"
          >
            Yes, Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="flex-1 px-3 py-1.5 border border-border text-body-text text-xs font-medium rounded hover:bg-body transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 10000, style: { maxWidth: "280px" } });
  };

  return (
    <div className="bg-body max-w-6xl mx-auto space-y-8">
      <div className="text-left flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Inventory</h1>
          <p className="text-base text-muted-text tracking-tight hidden md:block max-w-xs">
            Manage your artisanal inventory and listings.
          </p>
        </div>
        <PrimaryBtn
          title="Add Product"
          href="/admin/inventory/add"
          mainClass="text-white bg-primary px-3 py-2"
          hoverClass="bg-primary-hover"
        />
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card border border-border rounded-lg" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-muted-text">
          <p className="text-lg mb-4">No products yet</p>
          <Link href="/admin/inventory/add" className="text-primary hover:text-primary-hover font-medium">
            Add your first product →
          </Link>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden lg:block bg-white border border-border rounded-lg shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  {["Product", "Category", "Price", "Status", "Stock", "Actions"].map((h) => (
                    <th key={h} className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item._id} className="border-b border-border hover:bg-card transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-border rounded-md overflow-hidden shrink-0">
                          {item.images?.[0] ? (
                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-section" />
                          )}
                        </div>
                        <span className="text-sm font-medium text-heading">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-body-text capitalize">{item.category}</td>
                    <td className="py-4 px-6 text-sm text-body-text">₹{item.price}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${getStatusStyle(item.stock)}`}>
                        {getStatusLabel(item.stock)}
                      </span>
                    </td>
                    <td className={`py-4 px-6 text-sm ${item.stock < 10 ? "text-error font-medium" : "text-body-text"}`}>
                      {item.stock}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/inventory/edit/${item._id}`}
                          className="text-xs text-primary hover:text-primary-hover font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          disabled={deleting === item._id}
                          className="text-xs text-error hover:opacity-70 font-medium transition-opacity disabled:opacity-40"
                        >
                          {deleting === item._id ? "Deleting…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-4">
            {products.map((item) => (
              <div key={item._id} className="bg-card border border-border rounded-lg p-4 flex gap-4">
                <div className="w-16 h-16 bg-border rounded-md overflow-hidden shrink-0">
                  {item.images?.[0] ? (
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-section" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-heading truncate">{item.name}</p>
                  <p className="text-xs text-muted-text capitalize mt-0.5">{item.category}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm font-medium text-heading">₹{item.price}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider ${getStatusStyle(item.stock)}`}>
                      {getStatusLabel(item.stock)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <Link href={`/admin/inventory/edit/${item._id}`} className="text-xs text-primary font-medium">Edit</Link>
                    <button
                      onClick={() => handleDelete(item._id, item.name)}
                      disabled={deleting === item._id}
                      className="text-xs text-error font-medium disabled:opacity-40"
                    >
                      {deleting === item._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
