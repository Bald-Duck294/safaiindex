import React from "react";

export function Badge({ children, variant = "default", className = "" }) {
  const baseClasses = "px-2.5 py-0.5 text-xs font-semibold rounded-full inline-block";

  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
