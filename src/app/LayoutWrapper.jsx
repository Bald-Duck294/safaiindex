"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../components/Header";
import dynamic from "next/dynamic";
// import AuthChecker from "../components/AuthChecker"; // ✅ Import AuthChecker
import AuthChecker from "./(protected)/components/AuthChecker";

const Sidebar = dynamic(() => import("../components/Sidebar"), { ssr: false });

export default function LayoutWrapper({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  // Pages to exclude layout (public pages)
  const hideLayoutFor = ["/", "/login", "/register"];
  const shouldHideLayout = hideLayoutFor.includes(pathname);

  // ✅ Wrap everything with AuthChecker
  if (shouldHideLayout) {
    return (
      <AuthChecker>
        {children}
      </AuthChecker>
    );
  }

  return (
    <AuthChecker>
      <div className="flex h-screen min-h-screen w-full overflow-hidden">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* Main content */}
        <div className="flex flex-col flex-grow h-full">
          <Header />
          <div className="bg-gray-50 flex-grow overflow-y-auto">{children}</div>
        </div>
      </div>
    </AuthChecker>
  );
}
