"use client";
import { signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

export const UserSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "profile";

  const navItems = [
    { id: "profile", label: "Profile" },
    { id: "orders", label: "Orders" },
  ];

  return (
    <aside className="w-full md:w-48 lg:w-56 shrink-0">
      <h1 className="font-playfair text-3xl text-heading mb-10">My Account</h1>
      <nav className="flex flex-col space-y-6">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(`/user?tab=${item.id}`)}
            className={`flex justify-between items-center font-bold tracking-wider text-sm text-left transition-colors ${
              tab === item.id
                ? "text-primary border-b border-primary pb-2"
                : "text-heading hover:text-primary"
            }`}
          >
            {item.label}
            {/* {tab === item.id && <span className="text-lg leading-none">→</span>} */}
          </button>
        ))}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-error font-bold tracking-wider text-sm hover:opacity-70 transition-opacity text-left"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  );
};
