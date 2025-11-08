"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "../store/slices/authSlice.js";

import {
  LayoutDashboard,
  List,
  FolderTree,
  FolderPlus,
  Bath,
  PlusCircle,
  ClipboardList,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  MapPin,
  Building,
} from "lucide-react";
import Link from "next/link";
import path from "path";
import { nullable } from "zod";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter(); // Keep router for logout
  const pathname = usePathname();


  // const isAdmin = user?.role_id === 1;

  // Determine current context
  const isSuperadmin = user?.role_id === 1;
  const isOnMainDashboard = pathname === '/dashboard';
  const isOnClientDashboard = pathname.startsWith('/clientDashboard/');


  // const isAdmin = '1';


  const getCompanyIdFromPath = () => {
    if (isOnClientDashboard) {
      const segments = pathname.split('/');
      // Always get the segment after 'clientDashboard'
      const clientDashboardIndex = segments.indexOf('clientDashboard');

      console.log(clientDashboardIndex, segments, "both seg and client dash");
      if (clientDashboardIndex !== -1 && segments[clientDashboardIndex + 1]) {
        return segments[clientDashboardIndex + 1];
      }
    }
    return null;
  };

  const companyId = getCompanyIdFromPath();

  console.log(companyId , typeof(companyId) , "id");

  const getMenuItems = () => {
    // Superadmin on main dashboard - only dashboard and logout
    if (isSuperadmin && isOnMainDashboard) {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
      ];
    }


    // Client dashboard context (for any role)
    if (isOnClientDashboard) {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        {
          icon: Building,
          label: "Client Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        { icon: MapPin, label: "Locations", href: `/clientDashboard/${companyId}/locations` },
        {
          icon: FolderTree,
          label: "Location Types",
          hasDropdown: true,
          key: "locationTypes",
          children: [
            {
              icon: List,
              label: "View Location Types",
              href: `/clientDashboard/${companyId}/location-types`,
            },
            {
              icon: FolderPlus,
              label: "Add Location Type",
              href: `/clientDashboard/${companyId}/location-types/add`,
            },
          ],
        },
        {
          icon: Bath,
          label: "Washrooms",
          hasDropdown: true,
          key: "washrooms",
          children: [
            {
              icon: List,
              label: "Washrooms List",
              href: `/clientDashboard/${companyId}/washrooms`
            },
            {
              icon: PlusCircle,
              label: "Add Washroom",
              href: `/clientDashboard/${companyId}/add-location`
            },
          ],
        },
        {
          icon: ClipboardList,
          label: "Cleaner Assignments",
          hasDropdown: true,
          key: "cleaner-assignments",
          children: [
            {
              icon: List,
              label: "Assignments List",
              href: `/clientDashboard/${companyId}/cleaner-assignments`,
            },
            {
              icon: PlusCircle,
              label: "Add Assignment",
              href: `/clientDashboard/${companyId}/cleaner-assignments/add`,
            },
          ],
        },
        {
          icon: ClipboardList,
          label: "Cleaner Review",
          href: `/clientDashboard/${companyId}/cleaner-review`
        },
      ];
    }

    // Default/fallback menu items
    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
    ];
  };


  // Filter menu items based on user permissions (future feature utility)
  const filterMenuByPermissions = (menuItems) => {
    if (!user?.features) return menuItems;

    try {
      const userFeatures = typeof user.features === 'string'
        ? JSON.parse(user.features)
        : user.features;

      return menuItems.filter(item => {
        // If no feature restriction defined, show by default
        if (!item.requiredFeature) return true;

        // Check if user has required feature
        return userFeatures.includes(item.requiredFeature);
      });
    } catch (error) {
      console.error('Error parsing user features:', error);
      return menuItems;
    }
  };

  const menuItems = filterMenuByPermissions(getMenuItems());
  // const menuItems = isAdmin ? adminMenuItems : cleanerMenuItems;

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [setSidebarOpen]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const toggleDropdown = (key) => {
    // If the sidebar is closed, open it first, then open the dropdown
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
      }, 150); // Small delay to allow sidebar to start expanding
    } else {
      setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const commonLinkClasses =
    "flex items-center px-3 py-3 rounded-md cursor-pointer relative overflow-hidden text-gray-300 hover:bg-indigo-600 hover:text-white transition-all duration-200";

  return (
    <>
      {/* Mobile Toggle Button */}
      {isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-2 left-4 z-[60] p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg lg:hidden transition-all duration-200"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={15} />}
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full flex flex-col bg-slate-900 text-gray-200 shadow-2xl transition-all duration-300 z-50
          ${sidebarOpen ? "w-64" : "w-16"}
          ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 min-h-[60px]">
          {sidebarOpen && (
            <h1 className="text-lg font-semibold text-white tracking-wide">
              Dashboard
            </h1>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
            >
              {sidebarOpen ? (
                <ChevronLeft size={20} className="text-gray-300" />
              ) : (
                <ChevronRight size={20} className="text-gray-300" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 mt-2">
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isDropdownOpen = openDropdowns[item.key];

              if (item.hasDropdown) {
                // RENDER A BUTTON FOR DROPDOWNS
                return (
                  <li key={index} className="group">
                    <button
                      onClick={() => toggleDropdown(item.key)}
                      className={`${commonLinkClasses} w-full ${isDropdownOpen ? "bg-slate-800 text-white" : ""
                        } ${!sidebarOpen ? "justify-center" : ""}`}
                    >
                      <IconComponent size={20} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="ml-3 font-medium flex-1 text-left">
                            {item.label}
                          </span>
                          <div className="ml-auto">
                            {isDropdownOpen ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </div>
                        </>
                      )}
                      {!sidebarOpen && (
                        <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                          {item.label}
                        </div>
                      )}
                    </button>
                    {sidebarOpen && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-40" : "max-h-0"
                          }`}
                      >
                        <ul className="ml-6 mt-1 space-y-1 border-l border-slate-700 pl-3">
                          {item.children?.map((child, childIndex) => {
                            const ChildIcon = child.icon;
                            return (
                              <li key={childIndex}>
                                <Link
                                  href={child.href}
                                  onClick={() => {
                                    if (isMobile) setSidebarOpen(false);
                                  }}
                                  className="w-full flex items-center px-2 py-2 rounded-md text-gray-400 hover:bg-slate-700 hover:text-white transition-all duration-200 text-sm"
                                >
                                  <ChildIcon
                                    size={16}
                                    className="flex-shrink-0"
                                  />
                                  <span className="ml-2">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </li>
                );
              }

              // RENDER A LINK FOR REGULAR ITEMS
              return (
                <li key={index} className="group">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`${commonLinkClasses} ${!sidebarOpen ? "justify-center" : ""
                      }`}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    {sidebarOpen && (
                      <span className="ml-3 font-medium">{item.label}</span>
                    )}
                    {!sidebarOpen && (
                      <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-slate-700 bg-slate-800">
          <div className="p-4">
            {sidebarOpen && (
              <div className="flex items-center space-x-3 mb-3 p-2 rounded-md hover:bg-slate-700 transition">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {isSuperadmin ? "Administrator" : "Cleaner"}
                  </p>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200
                ${!sidebarOpen ? "justify-center" : ""}
              `}
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;