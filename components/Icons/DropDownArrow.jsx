import React from "react";

const DropDownArrow = ({mainClass}) => {
  return (
    <svg
      className={`w-4 h-4  text-muted-text pointer-events-none ${mainClass}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
};

export default DropDownArrow;
