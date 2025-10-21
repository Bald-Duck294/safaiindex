// app/LayoutWrapper.jsx
"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header"
import dynamic from "next/dynamic";


const Sidebar = dynamic(() => import('../components/Sidebar'), { ssr: false });

import { Suspense } from "react";
export default function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Pages to exclude layout
  const hideLayoutFor = ["/login", "/register"]; // add more routes if needed
  const shouldHideLayout = hideLayoutFor.includes(pathname);

  if (shouldHideLayout) {
    return <>{children}</>; // Just render children (no header/sidebar/footer)
  }

  return (
    <>
      {/* <div className="flex h-[90vh] min-h-screen max-w-[100rem] mx-auto overflow-hidden"> */}
      <div className="flex h-screen min-h-screen w-full overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <div className="flex flex-col flex-grow h-full">
          <Header />
          <div className="bg-gray-50 flex-grow overflow-y-auto">{children}</div>
        </div>
      </div>
      {/* <Footer /> */}
    </>
  );
}
