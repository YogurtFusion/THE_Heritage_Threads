import React from "react";
import OpenSideBar from "./OpenBar";
import AdminSidebar from "./AdminSidebar";

const AdminNav = () => {
  return (
    <div>
      <div className="lg:hidden">
      <AdminSidebar />
      </div>

      <div className="hidden  lg:block h-full">
          <OpenSideBar />
      </div>
    </div>
  );
};

export default AdminNav;
