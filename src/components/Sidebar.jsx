// src/components/Sidebar.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { logout } from "../store/slices/authSlice.js";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  Building
} from "lucide-react";
import Link from "next/link";
import { useCompanyId } from "@/lib/providers/CompanyProvider.jsx";
import {
  getSuperadminMainMenu,
  getSuperadminCompanyMenu,
  getAdminMenu,
  getFullCompanyMenuTemplate,
} from "@/lib/config/menuConfig";
import { filterMenuByPermissions } from "@/lib/utils/menuFilter";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();

  const { companyId, hasCompanyContext } = useCompanyId();


  const getMenuItems = () => {
    // CASE 1: Superadmin on main dashboard (no company context)
    if (user?.role_id === 1 && !hasCompanyContext) {
      return getSuperadminMainMenu();
    }

    // CASE 2: Superadmin inside company
    if (user?.role_id === 1 && hasCompanyContext) {
      return getSuperadminCompanyMenu(companyId);
    }

    // CASE 3: Company Admin (role_id: 2)
    if (user?.role_id === 2 && hasCompanyContext) {
      return getAdminMenu(companyId);
    }

    // CASE 4: Other roles (permission-based filtering)
    if (hasCompanyContext && user?.role?.permissions) {
      const menuTemplate = getFullCompanyMenuTemplate(companyId);
      const filteredMenu = filterMenuByPermissions(menuTemplate, user.role.permissions);

      // ✅ FIX: Always add Dashboard link at the top for other roles
      const dashboardItem = {
        icon: Building, // Import this from lucide-react
        label: "Dashboard",
        href: `/clientDashboard/${companyId}`,
        hasDropdown: false,
      };

      // Check if Dashboard already exists in filtered menu
      const hasDashboard = filteredMenu.some(item =>
        item.href === `/clientDashboard/${companyId}`
      );

      // If Dashboard not in filtered menu, add it at the beginning
      if (!hasDashboard) {
        return [dashboardItem, ...filteredMenu];
      }

      return filteredMenu;
    }

    // Fallback: Empty menu
    return [];
  };
  const menuItems = getMenuItems();

  // ✅ Route Active Check
  const isRouteActive = (href) => {
    if (!href) return false;
    if (href === "/dashboard" && pathname === "/dashboard") return true;
    if (href.startsWith("/clientDashboard/") && pathname.startsWith("/clientDashboard/")) return true;
    const [basePath] = href.split("?");
    return pathname.startsWith(basePath);
  };

  // ✅ Dropdown Active Check
  const isDropdownActive = (children) => {
    if (!children) return false;
    return children.some((child) => isRouteActive(child.href));
  };

  // ✅ Auto-open active dropdowns
  useEffect(() => {
    const newOpenDropdowns = {};

    menuItems.forEach((item) => {
      if (item.hasDropdown && item.children) {
        const isActive = isDropdownActive(item.children);
        if (isActive) {
          newOpenDropdowns[item.key] = true;
        }
      }
    });

    setOpenDropdowns((prev) => ({ ...prev, ...newOpenDropdowns }));
  }, [pathname, companyId]);

  // ✅ Mobile Detection
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

  // ✅ Toggle Sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ✅ Toggle Dropdown
  const toggleDropdown = (key) => {
    if (!sidebarOpen && !isHovered) {
      setSidebarOpen(true);
      setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
      }, 150);
    } else {
      setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // ✅ Hover Handlers (Desktop Only)
  const handleMouseEnter = () => {
    if (!isMobile) {
      setIsHovered(true);
      setSidebarOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      setIsHovered(false);
      setSidebarOpen(false);
    }
  };

  // ✅ CSS Classes
  const commonLinkClasses =
    "flex items-center px-3 py-3 rounded-md cursor-pointer relative overflow-hidden transition-all duration-200";

  const getActiveLinkClasses = (href, isChild = false) => {
    const isActive = isRouteActive(href);

    if (isActive) {
      return `${commonLinkClasses} ${isChild
        ? "bg-slate-700 text-white border-l-2 border-indigo-500"
        : "bg-indigo-600 text-white shadow-lg"
        }`;
    }

    return `${commonLinkClasses} ${isChild
      ? "text-gray-400 hover:bg-slate-700 hover:text-white"
      : "text-gray-300 hover:bg-indigo-600 hover:text-white"
      }`;
  };

  const getDropdownButtonClasses = (item) => {
    const isActive = isDropdownActive(item.children);
    const isOpen = openDropdowns[item.key];

    if (isActive) {
      return `${commonLinkClasses} bg-slate-800 text-white border-l-2 border-indigo-500`;
    }

    if (isOpen) {
      return `${commonLinkClasses} bg-slate-800 text-white`;
    }

    return `${commonLinkClasses} text-gray-300 hover:bg-indigo-600 hover:text-white`;
  };

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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`fixed lg:static top-0 left-0 h-full flex flex-col bg-slate-900 text-gray-200 shadow-2xl transition-all duration-300 ease-in-out z-50
          ${sidebarOpen ? "w-64" : "w-16"}
          ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-800 min-h-[60px]">
          {sidebarOpen && (
            <h1 className="text-lg font-semibold text-white tracking-wide transition-opacity duration-300">
              Dashboard
            </h1>
          )}
          {!isMobile && (
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-slate-700 transition-all duration-200"
            >
              {sidebarOpen ? (
                <ChevronLeft size={20} className="text-gray-300 cursor-pointer" />
              ) : (
                <ChevronRight size={20} className="text-gray-300 cursor-pointer" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 overflow-y-auto p-3 mt-2"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <style jsx>{`
            nav::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isDropdownOpen = openDropdowns[item.key];

              // ✅ Dropdown Menu
              if (item.hasDropdown) {
                return (
                  <li key={index} className="group">
                    <button
                      onClick={() => toggleDropdown(item.key)}
                      className={`${getDropdownButtonClasses(item)} w-full ${!sidebarOpen ? "justify-center" : ""
                        }`}
                    >
                      <IconComponent size={20} className="flex-shrink-0" />
                      {sidebarOpen && (
                        <>
                          <span className="ml-3 font-medium flex-1 text-left">
                            {item.label}
                          </span>
                          <div className="ml-auto">
                            {isDropdownOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </>
                      )}
                      {!sidebarOpen && (
                        <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                          {item.label}
                        </div>
                      )}
                    </button>
                    {sidebarOpen && (
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${isDropdownOpen ? "max-h-60" : "max-h-0"
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
                                  className={`w-full flex items-center px-2 py-2 rounded-md transition-all duration-200 text-sm ${getActiveLinkClasses(
                                    child.href,
                                    true
                                  )}`}
                                >
                                  <ChildIcon size={16} className="flex-shrink-0" />
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

              // ✅ Regular Menu Items (Direct Links)
              return (
                <li key={index} className="group">
                  <Link
                    href={item.href}
                    onClick={() => {
                      if (isMobile) setSidebarOpen(false);
                    }}
                    className={`${getActiveLinkClasses(item.href)} ${!sidebarOpen ? "justify-center" : ""
                      }`}
                  >
                    <IconComponent size={20} className="flex-shrink-0" />
                    {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
                    {!sidebarOpen && (
                      <div className="absolute left-16 bg-slate-800 text-white px-2 py-1 rounded-md text-xs shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - Logout */}
        <div className="border-t border-slate-700 bg-slate-800">
          <div className="p-4">
            <button
              onClick={handleLogout}
              className={`cursor-pointer w-full flex items-center px-3 py-2 rounded-md text-gray-300 hover:bg-red-600 hover:text-white transition-all duration-200
                ${!sidebarOpen ? "justify-center" : ""}
              `}
            >
              <LogOut size={20} />
              {sidebarOpen && <span className="ml-3 font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && isMobile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={toggleSidebar} />
      )}
    </>
  );
};

export default Sidebar;
