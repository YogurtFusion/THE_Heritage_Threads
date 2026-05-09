"use client"
import PrimaryBtn from "@/components/ui/PrimaryBtn";
import { useCart } from "@/context/cartContext";
import React from "react";
import toast from "react-hot-toast";

const PreviewBtn = () => {
  const { addToCart } = useCart();

  const handlePress = () => {
    addToCart()
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
    <button onClick={handlePress} >
      <PrimaryBtn
        title={" Add to Cart"}
        mainClass={
          " text-white bg-primary flex justify-center  py-4 w-full mb-6 "
        }
        hoverClass={"bg-primary-hover"}
        textHover={"text-white font-bold text-lg tracking-widest uppercase"}
        href={"/cart"}
      />
    </button>
  );
};

export default PreviewBtn;
