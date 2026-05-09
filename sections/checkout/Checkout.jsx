"use client";
import React, { useState } from "react";
import CheckoutStep1 from "./CheckoutStep1";
import CheckoutStep2 from "./CheckoutStep2";
import CheckoutSummary from "./CheckoutSummary";
import { useCart } from "@/context/cartContext";
import Link from "next/link";

const CheckoutSection = () => {
  const { cartItems } = useCart();
  const [step, setStep] = useState(1);
  const [shippingAddress, setShippingAddress] = useState(null);

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-body flex flex-col items-center justify-center gap-4">
        <p className="text-muted-text text-lg">Your cart is empty</p>
        <Link href="/collection" className="text-primary hover:text-primary-hover font-medium transition-colors">
          Browse Collection →
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-body py-12 px-4 sm:px-6 lg:px-12">
      <div className="max-w-6xl mx-auto">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          <StepBadge n={1} active={step === 1} done={step > 1} label="Shipping" />
          <div className="flex-1 h-px bg-border" />
          <StepBadge n={2} active={step === 2} done={false} label="Payment" />
        </div>

        <section className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          <div className="flex-1">
            {step === 1 && (
              <CheckoutStep1
                onNext={(addr) => { setShippingAddress(addr); setStep(2); }}
              />
            )}
            {step === 2 && (
              <CheckoutStep2
                shippingAddress={shippingAddress}
                onBack={() => setStep(1)}
              />
            )}
          </div>
          <CheckoutSummary />
        </section>
      </div>
    </main>
  );
};

function StepBadge({ n, active, done, label }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
        done ? "bg-success text-white" : active ? "bg-primary text-white" : "bg-border text-muted-text"
      }`}>
        {done ? "✓" : n}
      </div>
      <span className={`text-xs uppercase tracking-widest font-semibold hidden sm:block ${active ? "text-heading" : "text-muted-text"}`}>
        {label}
      </span>
    </div>
  );
}

export default CheckoutSection;
