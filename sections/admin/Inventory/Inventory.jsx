import React from "react";
import InventoryTable from "./InventoryTable";
import PrimaryBtn from "@/components/ui/PrimaryBtn";
import InventoryCards from "./InventoryCards";

const Inventory = () => {
  return (
    <div className="bg-body max-w-6xl mx-auto space-y-8 ">
      <div className="text-left flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Inventory</h1>
          <p className=" text-base text-muted-text tracking-tight  sm:hidden hidden md:block max-w-3xs">
            Manage your artisanal inventory and listings.
          </p>
        </div>
        <div className=" md:hidden">
        <PrimaryBtn
          title={"Add"}
          href={"/admin/inventory/add"}
          mainClass={" text-white bg-primary px-3 py-2"}
          hoverClass={"bg-primary-hover"}
        />  
        </div>

        <div className="hidden md:block">
        <PrimaryBtn
          title={"Add Product"}
          href={"/admin/inventory/add"}
          mainClass={" text-white bg-primary px-3 py-2"}
          hoverClass={"bg-primary-hover"}
          />
          </div>
      </div>
<div className="hidden lg:block"><InventoryTable /></div>
<div className="lg:hidden"><InventoryCards/> </div>
      
    </div>
  );
};

export default Inventory;
