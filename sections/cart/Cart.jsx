"use client";
import React from "react";
import { useCart } from "@/context/cartContext";
import Link from "next/link";
import CartSummary from "./CartSummary";

const CartSection = () => {
  const { cartItems, removeFromCart, updateQuantity, cartCount } = useCart();

  return (
    <div className="bg-body min-h-screen py-16 text-body-text">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <header className="flex justify-between items-end border-b border-border pb-6 mb-10">
          <h1 className="text-6xl md:text-7xl text-heading tracking-wide">CART</h1>
          <span className="text-xs font-bold uppercase tracking-widest text-heading pb-2">
            {cartCount} Item{cartCount !== 1 ? "s" : ""}
          </span>
        </header>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 flex flex-col items-center gap-6">
            <p className="text-muted-text text-lg">Your cart is empty</p>
            <Link
              href="/collection"
              className="group/btn uppercase relative flex justify-center items-center bg-transparent border border-black text-heading tracking-wide text-sm px-8 py-3 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 group-hover/btn:text-body transition-all lg:duration-500">
                Browse Collection
              </span>
              <div className="absolute bg-heading inset-0 lg:duration-500 transition-all -translate-x-full group-hover/btn:translate-x-0 ease-in-out" />
            </Link>
          </div>
        ) : (
          <section className="flex flex-col lg:flex-row gap-12 lg:gap-8">
            {/* Left: Cart Items */}
            <div className="flex-1">
              <div className="hidden sm:flex justify-between text-xs font-bold uppercase tracking-widest text-heading pb-4 mb-4">
                <span className="w-1/2">Product</span>
                <span className="w-1/4 text-center">Quantity</span>
                <span className="w-1/4 text-right">Total</span>
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <article
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-card p-4 gap-6 sm:gap-0"
                  >
                    {/* Product info */}
                    <div className="flex items-center gap-6 w-full sm:w-1/2">
                      <Link href={item.id ? `/product/${item.id}` : "#"}
                        className="w-24 h-24 bg-white shrink-0 flex items-center justify-center p-2 border border-border hover:opacity-80 transition-opacity">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="max-w-full max-h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-section" />
                        )}
                      </Link>
                      <div>
                        <Link href={item.id ? `/product/${item.id}` : "#"}>
                          <h3 className="text-xl text-heading uppercase mb-1 hover:text-primary transition-colors">{item.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-text mb-3">₹{item.price} each</p>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-xs font-semibold uppercase tracking-widest text-heading border-b border-heading pb-0.5 hover:text-error hover:border-error transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="w-full sm:w-1/4 flex justify-start sm:justify-center">
                      <div className="flex border border-border bg-white h-10">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 flex items-center justify-center text-heading hover:bg-gray-50 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          &minus;
                        </button>
                        <div className="w-10 flex items-center justify-center font-semibold text-heading border-x border-border text-sm">
                          {item.quantity}
                        </div>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 flex items-center justify-center text-heading hover:bg-gray-50 transition-colors"
                          aria-label="Increase quantity"
                        >
                          &#43;
                        </button>
                      </div>
                    </div>

                    {/* Total */}
                    <div className="w-full sm:w-1/4 text-left sm:text-right font-inter text-lg text-heading">
                      ₹{item.price * item.quantity}
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Right: Summary */}
            <CartSummary cartItems={cartItems} />
          </section>
        )}
      </div>
    </div>
  );
};

export default CartSection;
