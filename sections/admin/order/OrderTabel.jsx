"use client";

import React, { useState } from "react";

import { mockOrders } from "@/data/admin";

const getStatusStyle = (status) => {
  switch (status) {
    case "Processing":
      return "bg-section-2 text-primary";
    case "Shipped":
      return "bg-card text-secondary";
    case "Delivered":
      return "bg-border text-success";
    default:
      return "bg-card text-body-text";
  }
};

export default function OrdersTable() {
  return (
    <div className="bg-white border border-border rounded-lg shadow-sm overflow-hidden ">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-card border-b border-border">
            <th className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Order ID
            </th>
            <th className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Customer
            </th>
            <th className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Date
            </th>
            <th className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Total
            </th>
            <th className="py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {mockOrders.map((order) => (
            <tr key={order.id} className="hover:bg-card transition-colors">
              <td className="py-4 px-6 text-sm font-medium text-heading">
                {order.id}
              </td>
              <td className="py-4 px-6 text-sm text-body-text">
                {order.customer}
              </td>
              <td className="py-4 px-6 text-sm text-body-text">{order.date}</td>
              <td className="py-4 px-6 text-sm font-medium text-heading">
                {order.total}
              </td>
              <td className="py-4 px-6">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium  ${getStatusStyle(order.status)}`}
                >
                  {order.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PAGINATION */}
      <div className="bg-card border-t border-border px-6 py-4 flex items-center justify-between ">
        <span className="text-sm text-muted-text">
          Showing 1 to 6 of 24 orders
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border border-border rounded bg-white text-sm text-muted-text hover:bg-body disabled:opacity-50"
            disabled
          >
            Prev
          </button>
          <button className="px-3 py-1 border border-border rounded bg-white text-sm text-body-text hover:bg-body">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
