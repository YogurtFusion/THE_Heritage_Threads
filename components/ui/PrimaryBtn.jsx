import React from "react";
import Link from "next/link";

const PrimaryBtn = ({
  title,
  mainClass,
  textHover,
  hoverClass,
  hidden,
  href,
  svg,
}) => {
  return (
    <Link href={href}
        className={`group/btn block uppercase relative ${mainClass} px-3 py-2 w-fit tracking-wide text-sm cursor-pointer selection:bg-transparent selection:text-primary ease-in-out  lg:duration-300 transition-all overflow-hidden `}
      >
    
        <div className="relative z-10">{svg}</div>
        <p
          className={`relative z-10 ${textHover}  transition-all lg:duration-300 flex gap-2`}
        >
          {title}
        </p>
        {/* <p className={`relative z-10 ${textHover}   lg:duration-300 flex gap-2`}>
        EXPLORE <span className={`${hidden}`}> COLLECTION</span>
      </p> */}
        <div
          className={`absolute ${hoverClass}  inset-0  lg:duration-300 transition-all -translate-x-full group-active/btn:translate-x-0 group-hover/btn:translate-x-0 ease-in-out`}
        ></div>
    </Link>
     
  );
};

export default PrimaryBtn;
