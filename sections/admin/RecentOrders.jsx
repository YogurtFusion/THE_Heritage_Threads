import Link from "next/link";
import React from "react";
const RECENT_ORDERS = [
  {
    id: "#ORD-092",
    customer: "Anya Sharma",
    date: "Oct 24, 2023",
    total: "₹12,400",
    status: "Processing",
    badgeClasses: "bg-section text-primary-hover border-primary/20",
  },
  {
    id: "#ORD-091",
    customer: "Rohan Gupta",
    date: "Oct 23, 2023",
    total: "₹8,900",
    status: "Shipped",
    badgeClasses: "bg-red-50 text-primary border-red-100",
  },
  {
    id: "#ORD-090",
    customer: "Meera Patel",
    date: "Oct 22, 2023",
    total: "₹24,500",
    status: "Shipped",
    badgeClasses: "bg-red-50 text-primary border-red-100",
  },
  {
    id: "#ORD-089",
    customer: "Vikram Singh",
    date: "Oct 20, 2023",
    total: "₹4,200",
    status: "Delivered",
    badgeClasses: "bg-border text-body-text border-muted-text/30",
  },
];
const OrderTable = () => {
  return (
    <section className="bg-card border border-border rounded-sm">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className=" text-2xl text-heading">Recent Orders</h2>

        <Link
          href="/admin/orders"
          className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-card">
              {/* Improved: Added scope="col" to table headers for screen reader accessibility */}
              {["Order ID", "Customer", "Date", "Total", "Status"].map(
                (head) => (
                  <th
                    key={head}
                    scope="col"
                    className="p-6 text-xs font-semibold tracking-widest text-muted-text uppercase"
                  >
                    {head}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="text-body-text text-sm">
            {RECENT_ORDERS.map((order) => (
              <tr
                key={order.id}
                className="border-b last:border-0 border-border  hover:bg-card bg-body transition-colors"
              >
                <td className="p-6">{order.id}</td>
                <td className="p-6">{order.customer}</td>
                <td className="p-6">{order.date}</td>
                <td className="p-6 font-medium text-heading">{order.total}</td>
                <td className="p-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${order.badgeClasses}`}
                  >
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default OrderTable;
