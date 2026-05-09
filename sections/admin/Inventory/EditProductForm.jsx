"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "keychains", label: "Keychains" },
  { value: "zipchains", label: "Zip Chains" },
  { value: "accessories", label: "Accessories" },
  { value: "home-decor", label: "Home Decor" },
  { value: "clothing", label: "Clothing" },
];

export default function EditProductForm({ id }) {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState(null);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          const p = d.data;
          setForm({
            name: p.name ?? "",
            category: p.category ?? "",
            price: p.price ?? "",
            discountPrice: p.discountPrice ?? "",
            stock: p.stock ?? "",
            description: p.description ?? "",
            isFeatured: p.isFeatured ?? false,
            isTrending: p.isTrending ?? false,
          });
          setPreviews(p.images ?? []);
        } else {
          toast.error(d.message ?? "Product not found");
          router.push("/admin/inventory");
        }
      })
      .catch(() => {
        toast.error("Failed to load product");
        router.push("/admin/inventory");
      })
      .finally(() => setFetching(false));
  }, [id, router]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files ?? []);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("category", form.category);
      formData.append("price", form.price);
      if (form.discountPrice) formData.append("discountPrice", form.discountPrice);
      formData.append("stock", form.stock);
      formData.append("description", form.description);
      formData.append("isFeatured", String(form.isFeatured));
      formData.append("isTrending", String(form.isTrending));
      for (const img of images) {
        formData.append("images", img);
      }

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Product updated successfully");
        router.push("/admin/inventory");
      } else {
        toast.error(data.message ?? "Failed to update product");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="max-w-4xl mx-auto py-8 space-y-4 animate-pulse">
        <div className="h-8 bg-border rounded w-48" />
        <div className="h-96 bg-card border border-border rounded-xl" />
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <Link href="/admin/inventory" className="text-sm text-muted-text hover:text-primary transition-colors">
          ← Back to Inventory
        </Link>
        <h1 className="text-3xl font-semibold text-primary mt-2">Edit Product</h1>
      </div>

      <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-heading mb-2">Product Name</label>
            <input id="name" name="name" type="text" value={form.name} onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
              required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-heading mb-2">Category</label>
              <select id="category" name="category" value={form.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer"
                required>
                <option value="" disabled>Select a category</option>
                {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-heading mb-2">Price (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
                <input id="price" name="price" type="number" min="0" step="0.01" value={form.price} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary"
                  required />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="discountPrice" className="block text-sm font-medium text-heading mb-2">
                Discount Price (₹) <span className="text-muted-text font-normal">(optional)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
                <input id="discountPrice" name="discountPrice" type="number" min="0" step="0.01" value={form.discountPrice} onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-md bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-heading mb-2">Stock Quantity</label>
              <input id="stock" name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text focus:outline-none focus:ring-1 focus:ring-primary"
                required />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-heading mb-2">Description</label>
            <textarea id="description" name="description" rows="4" value={form.description} onChange={handleChange}
              className="w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-body-text">Featured product</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-body-text">Trending product</span>
            </label>
          </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-heading">
              Product Images
            </label>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add / Replace Images
            </button>
          </div>

          {previews.length > 0 ? (
            <div className="flex flex-wrap gap-3 p-4 border-2 border-dashed border-section rounded-lg bg-section-2/30">
              {previews.map((src, i) => (
                <div key={i} className="relative group w-24 h-24">
                  <img src={src} alt={`img-${i}`} className="w-full h-full object-cover rounded-md border border-border" />
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5 rounded-b-md">
                      Main
                    </span>
                  )}
                </div>
              ))}
              <div onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-section-2 transition-colors text-muted-text">
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Replace</span>
              </div>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center px-6 py-10 border-2 border-dashed border-section rounded-lg hover:bg-section-2 transition-colors cursor-pointer">
              <p className="text-sm text-body-text"><span className="text-primary font-medium">Click to upload</span> images</p>
              <p className="text-xs text-muted-text mt-1">PNG, JPG, WebP — multiple allowed</p>
            </div>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
          {images.length === 0 && previews.length > 0 && (
            <p className="text-xs text-muted-text mt-2">Showing current images. Upload new files to replace them.</p>
          )}
        </div>

          <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
            <Link href="/admin/inventory">
              <button type="button" className="px-6 py-2.5 border border-border rounded-md text-sm font-medium text-body-text hover:bg-body transition-colors">
                Cancel
              </button>
            </Link>
            <button type="submit" disabled={loading}
              className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? "Saving…" : "Update Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
