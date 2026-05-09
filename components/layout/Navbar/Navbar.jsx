import React from "react";
import TopNav from "./TopNav";
import SideNav from "./SideNav";

const Navbar = () => {
  return (
    <div className=" sticky top-0 w-full z-50">
      <div className="hidden md:block">
        <TopNav />
      </div>
      <div className="md:hidden">
        <SideNav />
      </div>
    </div>
  );
};

export default Navbar;
