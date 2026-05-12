import React from "react";

const ArrowLeft = ({ className = "w-5 h-5", ...props }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
};

export default ArrowLeft;