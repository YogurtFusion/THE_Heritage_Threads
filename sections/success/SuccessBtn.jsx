import Link from "next/link";
import React from "react";

export default function SucessBtn({ title, MainClass }) {
  return (
    <Link
      href={"/collection"}
      aria-label="add to cart button"
      className={` inline-block group uppercase relative text-center  bg-stone-900 active:bg-stone-950 lg:bg-transparent border border-stone-950 text-heading tracking-wide text-sm  cursor-pointer selection:bg-transparent overflow-hidden mx-auto transition-all ${MainClass} `}
    >
      <span className="relative z-10 inset-0 mx-auto text-white lg:text-heading lg:group-active:text-body lg:group-hover:text-body  lg:duration-300 transition-all">
        {title}
      </span>
      <div className=" hidden lg:block absolute bg-heading   inset-0  lg:duration-300 transition-all -translate-x-full lg:group-active:translate-x-0 lg:group-hover:translate-x-0 ease-in-out"></div>
    </Link>
  );
}
