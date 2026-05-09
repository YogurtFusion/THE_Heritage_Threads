"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/cartContext";

const OrderPage = () => {
  const { clearCart } = useCart();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    clearCart();
    // Trigger animation after mount
    const t = setTimeout(() => setAnimate(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="max-w-lg mx-auto text-center py-16 min-h-screen px-6 flex flex-col items-center justify-center">
      {/* Animated checkmark */}
      <div className={`relative mb-8 transition-all duration-700 ${animate ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
        <svg className="w-24 h-24" viewBox="0 0 100 100">
          {/* Circle */}
          <circle
            cx="50" cy="50" r="46"
            fill="none" stroke="#4ade80" strokeWidth="4"
            strokeDasharray="289"
            strokeDashoffset={animate ? "0" : "289"}
            className="transition-all duration-700 ease-out"
            style={{ transitionDelay: "0ms" }}
          />
          {/* Checkmark */}
          <polyline
            points="28,52 43,67 72,36"
            fill="none" stroke="#4ade80" strokeWidth="5"
            strokeLinecap="round" strokeLinejoin="round"
            strokeDasharray="60"
            strokeDashoffset={animate ? "0" : "60"}
            className="transition-all duration-500 ease-out"
            style={{ transitionDelay: "400ms" }}
          />
        </svg>
        {/* Pulse ring */}
        <div className={`absolute inset-0 rounded-full border-4 border-green-300 transition-all duration-1000 ${animate ? "scale-150 opacity-0" : "scale-100 opacity-100"}`} />
      </div>

      <h2 className={`font-playfair text-4xl text-heading mb-4 font-semibold transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ transitionDelay: "500ms" }}>
        Order Placed!
      </h2>

      <p className={`text-body-text text-[15px] mb-10 leading-relaxed transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ transitionDelay: "600ms" }}>
        Thank you for your order. Your artisanal piece is being prepared for its journey.
        We&apos;ll send a confirmation to your email.
      </p>

      <div className={`bg-transparent border border-border p-6 text-left mb-10 w-full transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ transitionDelay: "700ms" }}>
        <h3 className="text-xs font-bold tracking-widest text-heading mb-4 border-b border-border pb-3 uppercase">
          What&apos;s Next?
        </h3>
        <div className="space-y-3 text-sm text-body-text">
          <p className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            Your order has been received and is being processed.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            Track your order in{" "}
            <Link href="/user?tab=orders" className="text-primary hover:underline">My Orders</Link>.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">✓</span>
            Questions? <Link href="/contact" className="text-primary hover:underline">Contact us</Link>.
          </p>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row gap-4 w-full transition-all duration-500 ${animate ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        style={{ transitionDelay: "800ms" }}>
        <Link href="/collection"
          className="flex-1 flex items-center justify-center bg-primary text-white py-3.5 font-bold text-xs tracking-widest uppercase hover:bg-primary-hover transition-colors">
          Continue Shopping
        </Link>
        <Link href="/user?tab=orders"
          className="flex-1 flex items-center justify-center border border-black text-heading py-3.5 font-bold text-xs tracking-widest uppercase hover:bg-heading hover:text-white transition-colors">
          View My Orders
        </Link>
      </div>
    </main>
  );
};

export default OrderPage;
