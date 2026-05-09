import { mockInventory } from "@/data/admin";
import React from "react";

const getStockStyle = (status) => {
  if (status === "LOW STOCK") return "bg-section-2 text-primary";
 if (status === "ACTIVE")return  "bg-border text-success";
  return "bg-card text-body-text";
}

const InventoryCards = () => {
  return (
    <div className="flex flex-col gap-3 md:hidden">
      {mockInventory.map((product) => (
        <div
          key={product.name}
          className="bg-card rounded-xl border border-border p-4"
        >
          {/* Product name */}
          <p className="font-semibold text-heading text-sm mb-2">
            {product.name}
          </p>

          {/* Price + Status */}
          <div className="flex items-center justify-between">
            <span className="text-heading font-medium text-sm">
              {product.price}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium 
                ${getStockStyle(product.status)}`}
            >
              {product.status}
            </span>
          </div>

          {/* Stock count */}
          <p className="text-heading text-xs mt-2">
            Stock: {product.stock} units
          </p>
        </div>
      ))}
    </div>
  );
};

export default InventoryCards;
