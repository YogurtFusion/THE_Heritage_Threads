"use client";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "keychains",   label: "Keychains" },
  { value: "zipchains",   label: "Zip Chains" },
  { value: "accessories", label: "Accessories" },
  { value: "home-decor",  label: "Home Decor" },
  { value: "clothing",    label: "Clothing" },
];

const iCls = "w-full px-4 py-3 border border-border rounded-md bg-body text-body-text placeholder:text-muted-text focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-shadow text-sm";

const AddItemForm = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "", category: "", price: "", discountPrice: "",
    stock: "", description: "", isFeatured: false, isTrending: false,
  });

  // Each entry: { file: File, preview: string }
  const [imageEntries, setImageEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const handleFiles = (e) => {
    const files = Array.from(e.target.files ?? []);
    const newEntries = files.map((f) => ({ file: f, preview: URL.createObjectURL(f) }));
    setImageEntries((p) => [...p, ...newEntries]);
    e.target.value = ""; // allow re-picking same file
  };

  const removeImage = (idx) => {
    setImageEntries((p) => {
      URL.revokeObjectURL(p[idx].preview);
      return p.filter((_, i) => i !== idx);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("category", form.category);
      fd.append("price", form.price);
      if (form.discountPrice) fd.append("discountPrice", form.discountPrice);
      fd.append("stock", form.stock);
      fd.append("description", form.description);
      fd.append("isFeatured", String(form.isFeatured));
      fd.append("isTrending", String(form.isTrending));
      for (const { file } of imageEntries) fd.append("images", file);

      const res = await fetch("/api/admin/products", { method: "POST", body: fd });
      const data = await res.json();

      if (data.success) {
        toast.success("Product added successfully");
        router.push("/admin/inventory");
      } else {
        toast.error(data.message ?? "Failed to add product");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-border rounded-xl p-8 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">Product Name</label>
          <input name="name" type="text" placeholder="e.g. Handwoven Silk Scarf"
            value={form.name} onChange={handleChange} className={iCls} required />
        </div>

        {/* Category & Price */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Category</label>
            <select name="category" value={form.category} onChange={handleChange}
              className={`${iCls} appearance-none cursor-pointer`} required>
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Price (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
              <input name="price" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.price} onChange={handleChange}
                className={`${iCls} pl-10`} required />
            </div>
          </div>
        </div>

        {/* Discount & Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-heading mb-2">
              Discount Price (₹) <span className="text-muted-text font-normal">(optional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-text pointer-events-none">₹</span>
              <input name="discountPrice" type="number" min="0" step="0.01" placeholder="0.00"
                value={form.discountPrice} onChange={handleChange} className={`${iCls} pl-10`} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-heading mb-2">Stock Quantity</label>
            <input name="stock" type="number" min="0" placeholder="e.g. 15"
              value={form.stock} onChange={handleChange} className={iCls} required />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">Description</label>
          <textarea name="description" rows="4" placeholder="Describe the craftsmanship, materials, and origin…"
            value={form.description} onChange={handleChange}
            className={`${iCls} resize-none`} />
        </div>

        {/* Flags */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isFeatured" checked={form.isFeatured} onChange={handleChange} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-body-text">Featured</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" name="isTrending" checked={form.isTrending} onChange={handleChange} className="w-4 h-4 accent-primary" />
            <span className="text-sm text-body-text">Trending</span>
          </label>
        </div>

        {/* Images */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-heading">
              Product Images <span className="text-muted-text font-normal">({imageEntries.length} selected)</span>
            </label>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-xs text-primary hover:text-primary-hover font-medium transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Images
            </button>
          </div>

          {imageEntries.length > 0 ? (
            <div className="flex flex-wrap gap-3 p-4 border-2 border-dashed border-section rounded-lg bg-section-2/30">
              {imageEntries.map(({ preview }, i) => (
                <div key={i} className="relative group w-24 h-24">
                  <img src={preview} alt={`img-${i}`} className="w-full h-full object-cover rounded-md border border-border" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 z-10">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-white text-[9px] text-center py-0.5 rounded-b-md">
                      Main
                    </span>
                  )}
                </div>
              ))}
              {/* Add more tile */}
              <div onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-border rounded-md flex flex-col items-center justify-center cursor-pointer hover:bg-section-2 transition-colors text-muted-text">
                <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs">Add more</span>
              </div>
            </div>
          ) : (
            <div onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center px-6 py-12 border-2 border-dashed border-section rounded-lg hover:bg-section-2 transition-colors cursor-pointer group">
              <div className="h-12 w-12 bg-section-2 text-primary rounded-md flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <p className="text-sm text-body-text"><span className="text-primary font-medium">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-text mt-1">PNG, JPG, WebP — multiple allowed (max 5MB each)</p>
            </div>
          )}

          <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
        </div>

        {/* Actions */}
        <div className="pt-6 border-t border-border flex items-center justify-end gap-4">
          <Link href="/admin/inventory">
            <button type="button" className="px-6 py-2.5 border border-border rounded-md text-sm font-medium text-body-text hover:bg-body transition-colors">
              Cancel
            </button>
          </Link>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-hover transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
            {loading ? "Saving…" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
