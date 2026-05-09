"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";

const cartContext = createContext();

// Key scoped to user so carts don't bleed between accounts
function cartKey(userId) {
  return userId ? `ht_cart_${userId}` : "ht_cart_guest";
}
function addrKey(userId) {
  return userId ? `ht_addresses_${userId}` : "ht_addresses_guest";
}

export const CartProvider = ({ children }) => {
  const { data: session } = useSession();
  const userId = session?.user?.userId ?? null;

  const [cartItems, setCartItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Re-load cart whenever userId changes (login/logout)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(cartKey(userId));
      setCartItems(stored ? JSON.parse(stored) : []);
    } catch {
      setCartItems([]);
    }
    setHydrated(true);
  }, [userId]);

  // Persist on every change
  useEffect(() => {
    if (hydrated) {
      localStorage.setItem(cartKey(userId), JSON.stringify(cartItems));
    }
  }, [cartItems, hydrated, userId]);

  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((i) => i.id !== productId));
    } else {
      setCartItems((prev) => prev.map((i) => i.id === productId ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  return (
    <cartContext.Provider value={{ cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, clearCart, hydrated }}>
      {children}
    </cartContext.Provider>
  );
};

export const useCart = () => useContext(cartContext);

// Export address key helper so checkout can use it
export { addrKey };
