"use client";
import { SearchIcon } from "@/components/Icons/SearchIcon";
import React, { useState } from "react";
import OrderTable from "../RecentOrders";
import OrdersTable from "./OrderTabel";
import OrdersHead from "./OrdersHead";
import OrderCards from "./OrderCards";


const AdminOrder = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="max-w-7xl w-full mx-auto space-y-8 bg-body">
      <OrdersHead />
      {/* TABLE */}
      <div className=" hidden lg:block"> <OrdersTable /></div>
      <div className="lg:hidden"> <OrderCards/> </div>
 
    </div>
  );
};

export default AdminOrder;
