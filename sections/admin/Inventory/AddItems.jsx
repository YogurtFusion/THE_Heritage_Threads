"use client"; // Required because forms eventually handle user input/state
import Link from "next/link";
import React from "react";
import AddItemsHead from "./AddItemsHead";
import AddItemForm from "./AddItemForm";
export default function AddProductPage() {
  return (
    <div className="max-w-4xl mx-auto py-8">
      
      {/* 1. HEADER SECTION */}
  <AddItemsHead/>
      {/* 2. FORM CONTAINER */}
    <AddItemForm/>
    </div>
  );
}