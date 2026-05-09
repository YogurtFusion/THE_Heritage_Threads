"use client";
import { useCart } from "@/context/cartContext";
import React from "react";
import toast from "react-hot-toast";

export default function AddCartBtn({ product }) {
  const { addToCart } = useCart();

  const handlePress = () => {
    if (product) {
      addToCart(product);
    }
    toast.success("Added to Cart", {
      style: {
        borderRadius: "0px",
        background: "#1C2628",
        color: "#fff",
        fontSize: "12px",
        textTransform: "uppercase",
      },
    });
  };

  return (
    <button
      aria-label="add to cart button"
      className="group/btn uppercase relative flex justify-center items-center bg-transparent border border-black text-heading w-full tracking-wide text-sm px-6 py-2 cursor-pointer selection:bg-transparent overflow-hidden mx-auto"
      onClick={handlePress}
    >
      <span className="relative z-10 inset-0 mx-auto group-active/btn:text-body group-hover/btn:text-body lg:duration-500 transition-all">
        Add to cart
      </span>
      <div className="absolute bg-heading inset-0 lg:duration-500 transition-all -translate-x-full group-active/btn:translate-x-0 group-hover/btn:translate-x-0 ease-in-out" />
    </button>
  );
}
