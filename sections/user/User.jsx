"use client";
import React, { Suspense } from "react";
import { UserSidebar } from "./UserSidebar";
import { UserCard } from "./UserCard";
import UserOrders from "./UserOrders";
import { LeafIcon } from "@/components/Icons/LeafIcon";
import { useSearchParams } from "next/navigation";

function UserContent() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") ?? "profile";

  return (
    <main className="min-h-screen bg-body text-body-text font-inter py-12 px-6 md:px-12 lg:px-24">
      <div className="max-w-300 mx-auto flex flex-col md:flex-row gap-12 lg:gap-24">
        <UserSidebar />

        <section className="flex-1 max-w-2xl">
          {tab === "profile" && (
            <>
              <div className="mb-10">
                <h2 className="font-playfair text-4xl lg:text-5xl text-heading mb-4">Personal Profile</h2>
                <p className="text-body-text text-[15px]">
                  Manage your details to ensure seamless delivery of your artisanal pieces.
                </p>
              </div>
              <UserCard />
            </>
          )}

          {tab === "orders" && (
            <>
              <div className="mb-10">
                <h2 className="font-playfair text-4xl lg:text-5xl text-heading mb-4">My Orders</h2>
                <p className="text-body-text text-[15px]">Track and manage your orders.</p>
              </div>
              <UserOrders />
            </>
          )}

          <div className="flex items-center justify-center gap-4 py-16">
            <div className="h-px bg-border w-24" />
            <LeafIcon />
            <div className="h-px bg-border w-24" />
          </div>
        </section>
      </div>
    </main>
  );
}

const User = () => (
  <Suspense fallback={<div className="min-h-screen bg-body" />}>
    <UserContent />
  </Suspense>
);

export default User;
