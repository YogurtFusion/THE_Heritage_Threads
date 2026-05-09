import BellIcon from "@/components/Icons/BellIcon";
import { STATS_DATA } from "@/data/admin";
import React from "react";



const StatsGrid = () => {
  return (
    <div>
      <header className="flex items-center justify-between border-b border-border pb-4 md:pb-6 mb-6 md:mb-8">
        <h1 className=" text-2xl md:text-3xl lg:text-4xl text-heading font-semibold">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-6">
          <button
            aria-label="Notifications"
            className="text-body-text hover:text-primary transition-colors"
          >
           <BellIcon/>
          </button>
        
        </div>
      </header>
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">

        {STATS_DATA.map((stat) => (
          <article
            key={stat.title}
            className="bg-card border border-border rounded-sm p-5 md:p-6 w-full mx-auto ">
            <div className="flex items-center justify-between mb-4 ">
              <p className="text-xs font-semibold tracking-widest text-body-text uppercase">
                {stat.title}
              </p>
              <svg
                aria-hidden="true"
                className="w-5 h-5 text-muted-text"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {stat.icon}
              </svg>
            </div>
            <p className=" text-3xl md:text-4xl text-heading">{stat.value}</p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default StatsGrid;
