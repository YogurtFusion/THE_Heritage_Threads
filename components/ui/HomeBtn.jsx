import React from "react";
import Link from "next/link";

const MainBtn = ({ mainClass, textHover, hoverClass, hidden, href }) => {
  return (
    <div
      className={`group/btn uppercase relative ${mainClass}    px-3 py-2 w-fit tracking-wide text-sm cursor-pointer selection:bg-transparent selection:text-primary ease-in-out  lg:duration-300 transition-all overflow-hidden `}
      >
<Link href={href} >
      <p className={`relative z-10 ${textHover}   lg:duration-300 flex gap-2`}>
        EXPLORE <span className={`${hidden}`}> COLLECTION</span>
      </p>
      <div
        className={`absolute ${hoverClass}  inset-0  lg:duration-300 transition-all -translate-x-full group-active/btn:translate-x-0 group-hover/btn:translate-x-0 ease-in-out`}
        ></div>
        </Link>
    </div>
  );
};

export default MainBtn;
