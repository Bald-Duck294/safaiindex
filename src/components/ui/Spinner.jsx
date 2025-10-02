import React from "react";

export function Spinner({ size = "md" }) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-16 w-16",
  };
  return (
    <div className="flex justify-center items-center p-4">
      <div
        className={`animate-spin rounded-full border-4 border-gray-300 border-t-gray-900 ${sizes[size]}`}
      ></div>
    </div>
  );
}
