"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function ProductDetail({ id }) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setProduct(d.data);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) {
      addToCart({
        id: product._id,
        name: product.name,
        price: product.discountPrice ?? product.price,
        image: product.images?.[0] ?? null,
      });
    }
    toast.success(`${qty > 1 ? qty + "x " : ""}${product.name} added to cart`, {
      style: {
        borderRadius: "0px",
        background: "#1C2628",
        color: "#fff",
        fontSize: "12px",
        textTransform: "uppercase",
      },
    });
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-body py-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-6xl mx-auto animate-pulse">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="w-full lg:w-1/2 aspect-square bg-card rounded" />
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-border rounded w-3/4" />
              <div className="h-6 bg-border rounded w-1/4" />
              <div className="h-4 bg-border rounded w-full" />
              <div className="h-4 bg-border rounded w-5/6" />
              <div className="h-12 bg-border rounded w-full mt-8" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-body flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl text-heading font-semibold">Product not found</h1>
        <Link href="/collection" className="text-primary hover:text-primary-hover transition-colors">
          ← Back to Collection
        </Link>
      </main>
    );
  }

  const displayPrice = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;

  return (
    <main className="min-h-screen bg-body py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-text mb-8 uppercase tracking-widest">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collection" className="hover:text-primary transition-colors">Collection</Link>
          <span>/</span>
          <span className="text-heading">{product.name}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Images */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4">
            {/* Main image */}
            <div className="relative aspect-square bg-card overflow-hidden">
              {product.images?.length > 0 ? (
                <img
                  src={product.images[selectedImg]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />
              ) : (
                <div className="w-full h-full bg-section flex items-center justify-center text-muted-text text-sm">
                  No image
                </div>
              )}
              {hasDiscount && (
                <span className="absolute top-4 left-4 bg-primary text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">
                  Sale
                </span>
              )}
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImg(i)}
                    className={`w-20 h-20 shrink-0 overflow-hidden border-2 transition-colors ${
                      selectedImg === i ? "border-primary" : "border-border hover:border-heading"
                    }`}
                  >
                    <img src={img} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 flex flex-col gap-6">
            {/* Category */}
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              {product.category}
            </span>

            {/* Name */}
            <h1 className="font-playfair text-4xl md:text-5xl text-heading leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-semibold text-heading">₹{displayPrice}</span>
              {hasDiscount && (
                <span className="text-lg text-muted-text line-through">₹{product.price}</span>
              )}
            </div>

            {/* Stock */}
            <div>
              {product.stock === 0 ? (
                <span className="text-sm font-medium text-error">Out of stock</span>
              ) : product.stock <= 5 ? (
                <span className="text-sm font-medium text-warning">Only {product.stock} left</span>
              ) : (
                <span className="text-sm font-medium text-success">In stock</span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-body-text text-sm leading-relaxed border-t border-border pt-6">
                {product.description}
              </p>
            )}

            {/* Quantity + Add to Cart */}
            {product.stock > 0 && (
              <div className="flex flex-col gap-4 border-t border-border pt-6">
                {/* Qty selector */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-widest text-heading">Qty</span>
                  <div className="flex border border-border h-10">
                    <button
                      onClick={() => setQty((q) => Math.max(1, q - 1))}
                      className="w-10 flex items-center justify-center text-heading hover:bg-card transition-colors"
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <div className="w-10 flex items-center justify-center font-semibold text-heading border-x border-border text-sm">
                      {qty}
                    </div>
                    <button
                      onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                      className="w-10 flex items-center justify-center text-heading hover:bg-card transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="group/btn uppercase relative flex justify-center items-center bg-transparent border border-black text-heading w-full tracking-wide text-sm px-6 py-4 cursor-pointer overflow-hidden"
                >
                  <span className="relative z-10 group-active/btn:text-body group-hover/btn:text-body lg:duration-500 transition-all">
                    Add to Cart
                  </span>
                  <div className="absolute bg-heading inset-0 lg:duration-500 transition-all -translate-x-full group-active/btn:translate-x-0 group-hover/btn:translate-x-0 ease-in-out" />
                </button>
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-border pt-6 space-y-2 text-xs text-muted-text uppercase tracking-widest">
              <p>Category: <span className="text-body-text capitalize">{product.category}</span></p>
              {product.isFeatured && <p className="text-secondary">✦ Featured Product</p>}
              {product.isTrending && <p className="text-secondary">✦ Trending</p>}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
