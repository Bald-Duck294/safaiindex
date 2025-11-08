import React from "react";

export function Select({
  children,
  value,
  onChange,
  className = "",
  ...props
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
