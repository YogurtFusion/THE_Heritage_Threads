import { mockInventory } from "@/data/admin";
import React from "react";

const getStatusStyle = (status) => {
  if (status === "LOW STOCK") return "bg-section-2 text-primary";
  if (status === "ACTIVE") return "bg-border text-success";
  return "bg-card text-body-text ";
};

const InventoryTable = () => {
  return (
    <div className="bg-white border box-border border-border rounded-lg shadow-sm overflow-hidden">
      <table className="w-full text-left  border-collapse">
        <thead>
          <tr className="bg-card border-b border-border  box-border">
            <th className=" py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Product
            </th>
            <th className=" -cell -4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Price
            </th>
            <th className=" -cell -4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Status
            </th>
            <th className=" py-4 px-6 text-xs font-semibold text-muted-text uppercase tracking-wider">
              Stock
            </th>
          </tr>
        </thead>
        <tbody>
          {mockInventory.map((item) => {
            return (
              <tr
                className="border-b border-border hover:bg-card"
                key={item.id}
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-border rounded-md overflow-hidden shrink-0 ">
                      <div className="w-full h-full bg-section object-cover" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-heading">
                        {item.name}
                      </div>
                    </div>
                  </div>
                </td>
                {/* hidden md:table-cell not working on  price and status */}
                <td className=" ">{item.price}</td>
                <td className=" py-4 px-6">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${getStatusStyle(item.status)}`}
                  >
                    {item.status}
                  </span>
                </td>

                {/* Stock Column (Turns red if under 10) */}
                <td
                  className={`py-4 px-6 text-sm ${item.stock < 10 ? "text-error font-medium" : "text-body-text"}`}
                >
                  {item.stock}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
