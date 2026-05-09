"use client";
import React from "react";
import { useCart } from "@/context/cartContext";
import { useSettings } from "@/context/settingsContext";

const CheckoutSummary = () => {
  const { cartItems, cartTotal } = useCart();
  const { freeShippingAbove, shippingCharge } = useSettings();

  const shipping = cartTotal >= freeShippingAbove ? 0 : shippingCharge;
  const grandTotal = cartTotal + shipping;

  return (
    <aside className="w-full lg:w-96 shrink-0">
      <div className="bg-card p-8 sticky top-24">
        <h2 className="text-xs font-bold tracking-widest text-heading mb-6 border-b border-border pb-4 uppercase">
          Order Summary
        </h2>

        {/* Items */}
        <div className="space-y-4 mb-6 max-h-64 overflow-y-auto no-scrollbar">
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-16 h-16 bg-border shrink-0 overflow-hidden">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-section" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-heading uppercase truncate">{item.name}</p>
                <p className="text-xs text-muted-text mt-0.5">Qty: {item.quantity}</p>
                <p className="text-sm text-body-text mt-1">₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border-t border-border pt-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-body-text">Subtotal</span>
            <span className="text-body-text">₹{cartTotal}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-body-text">Shipping</span>
            {shipping === 0 ? (
              <span className="text-success font-medium text-xs">Free</span>
            ) : (
              <span className="text-body-text">₹{shipping}</span>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mt-5 pt-5 border-t border-border">
          <span className="text-xs font-bold uppercase tracking-widest text-heading">Total</span>
          <span className="text-xl font-semibold text-heading">₹{grandTotal}</span>
        </div>
      </div>
    </aside>
  );
};

export default CheckoutSummary;
