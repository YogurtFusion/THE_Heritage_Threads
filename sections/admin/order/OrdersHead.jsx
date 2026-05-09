import React, { useState } from "react";

const OrdersHead = () => {
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div className="space-y-8 "> 

      {/* HEADER */}
      <div className="flex items-center justify-between">
        {/* Notice: No font-playfair class here because your globals.css handles it! */}
        <h1 className="text-3xl font-semibold text-primary">Orders</h1>
        <button className="px-4 py-2 bg-body border border-border text-sm font-medium text-body-text rounded-md hover:bg-card transition-colors shadow-sm">
          Export CSV
        </button>
      </div>
      {/* CONTROLS */}
      <div className="flex items-center justify-between gap-2 bg-white p-4 border border-border rounded-lg shadow-sm">
        <div className="relative w-72">
          {/* Search Icon */}
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-text"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search orders..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary bg-body text-body-text placeholder:text-muted-text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select className="px-4 py-2 text-sm border border-border rounded-md bg-body focus:outline-none focus:ring-1 focus:ring-primary text-body-text">
          <option value="all">All Statuses</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
        </select>
      </div>
    </div>
  );
};

export default OrdersHead;
