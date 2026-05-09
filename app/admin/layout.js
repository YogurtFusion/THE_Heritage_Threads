import AdminNav from "@/sections/admin/navbar/AdminNav";
import AdminSidebar from "@/sections/admin/navbar/AdminSidebar";
import Link from "next/link";

export default function AdminLayout({ children }) {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-body w-full  ">
      <div className="hidden lg:block w-64 shrink-0">
        <AdminNav />
      </div>
      <header className="lg:hidden flex items-center justify-between bg-card border-b border-border p-4 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {/* Your hamburger trigger goes HERE now! */}
          <AdminSidebar />
          <span className="font-playfair font-semibold text-lg text-primary cursor-pointer">
           <Link href={"/"} >Heritage Threads</Link> 
          </span>
        </div>
      </header>
      <main className="flex-1 py-8 px-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
