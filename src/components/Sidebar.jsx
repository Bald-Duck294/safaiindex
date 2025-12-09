"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { logout } from "../store/slices/authSlice.js";

import {
  LayoutDashboard,
  Building2,
  List,
  FolderTree,
  FolderPlus,
  UserPlus,
  Users,
  UserCog,
  PlusCircle,
  Bath,
  Toilet,
  ClipboardList,
  CheckCircle,
  ClipboardCheck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  MapPin,
  Building,
  MessageSquare,
  FileText,
  CalendarClock
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [isMobile, setIsMobile] = useState(false);

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const getRoleText = () => {
    if (!user || !user.role_id) {
      return "User";
    }
    switch (user.role_id) {
      case 1:
        return "Super Admin";
      case 2:
        return "Admin";
      case 3:
        return "Supervisor";
      default:
        return "User";
    }
  };

  const userRole = getRoleText();

  const getCompanyContext = () => {
    if (pathname.startsWith('/clientDashboard/')) {
      const segments = pathname.split('/');
      return segments[2];
    }

    const companyId = searchParams.get('companyId');
    if (companyId) {
      return companyId;
    }

    return null;
  };

  const companyId = getCompanyContext();
  const isSuperadmin = user?.role_id === 1;
  const isOnMainDashboard = pathname === '/dashboard';
  const hasCompanyContext = !!companyId;

  // ✅ NEW: Function to check if a route is active
  const isRouteActive = (href) => {
    if (!href) return false;

    // Exact match for dashboard routes
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    if (href.startsWith('/clientDashboard/') && pathname.startsWith('/clientDashboard/')) return true;

    // For routes with query params, match the base path
    const [basePath] = href.split('?');
    return pathname.startsWith(basePath);
  };

  // ✅ NEW: Function to check if any child route is active
  const isDropdownActive = (children) => {
    if (!children) return false;
    return children.some(child => isRouteActive(child.href));
  };

  // ✅ NEW: Auto-expand dropdown if child route is active
  useEffect(() => {
    const newOpenDropdowns = {};

    menuItems.forEach(item => {
      if (item.hasDropdown && item.children) {
        const isActive = isDropdownActive(item.children);
        if (isActive) {
          newOpenDropdowns[item.key] = true;
        }
      }
    });

    setOpenDropdowns(prev => ({ ...prev, ...newOpenDropdowns }));
  }, [pathname, searchParams]); // Re-run when route changes

  const getMenuItems = () => {
    // ... your existing getMenuItems logic remains exactly the same ...
    if (isSuperadmin && isOnMainDashboard && !hasCompanyContext) {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
      ];
    }

    if (hasCompanyContext && user?.role_id === 1) {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        {
          icon: Building2,
          label: "Client Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        {
          icon: FolderTree,
          label: "Location Hierarchy",
          hasDropdown: true,
          key: "locationTypes",
          children: [
            {
              icon: List,
              label: "View Location Hierarchy",
              href: `/location-types?companyId=${companyId}`,
            },
            {
              icon: FolderPlus,
              label: "Add Location Hierarchy",
              href: `/location-types/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: Toilet,
          label: "Washrooms",
          hasDropdown: true,
          key: "washrooms",
          children: [
            {
              icon: List,
              label: "Washrooms List",
              href: `/washrooms?companyId=${companyId}`
            },
            {
              icon: PlusCircle,
              label: "Add Washroom",
              href: `/washrooms/add-location?companyId=${companyId}`
            },
          ],
        },
        {
          icon: Users,
          label: "User Management",
          hasDropdown: true,
          key: "user-management",
          children: [
            {
              icon: List,
              label: "User List",
              href: `/users?companyId=${companyId}`,
            },
            {
              icon: UserPlus,
              label: "Add User",
              href: `/users/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: UserCog,
          label: "User Mapping",
          hasDropdown: true,
          key: "cleaner-assignments",
          children: [
            {
              icon: List,
              label: "Mapped List",
              href: `/cleaner-assignments?companyId=${companyId}`,
            },
            {
              icon: PlusCircle,
              label: "Add Mapping",
              href: `/cleaner-assignments/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: Building2,
          label: "Facility Companies",
          hasDropdown: true,
          key: "facility-companies",
          children: [
            {
              icon: List,
              label: "View List",
              href: `/facility-company?companyId=${companyId}`,
            },
            {
              icon: PlusCircle,
              label: "Add Facility",
              href: `/facility-company/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: MapPin,
          label: "Locate On Map",
          href: `/locations?companyId=${companyId}`
        },
        {
          icon: ClipboardList,
          label: "Cleaner Activity",
          href: `/cleaner-review?companyId=${companyId}`
        },
        {
          icon: MessageSquare,
          label: "User Review",
          href: `/user-activity?companyId=${companyId}`
        },
        {
          icon: FileText,
          label: "Reports",
          href: `/reports?companyId=${companyId}`,
        },
      ];
    }
    else if (hasCompanyContext && user?.role_id === 2) {
      return [
        {
          icon: Building,
          label: "Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        {
          icon: FolderTree,
          label: "Location Hierarchy",
          hasDropdown: true,
          key: "locationTypes",
          children: [
            {
              icon: List,
              label: "View Location Hierarchy",
              href: `/location-types?companyId=${companyId}`,
            },
            {
              icon: FolderPlus,
              label: "Add Location Hierarchy",
              href: `/location-types/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: Toilet,
          label: "Washrooms",
          hasDropdown: true,
          key: "washrooms",
          children: [
            {
              icon: List,
              label: "Washrooms List",
              href: `/washrooms?companyId=${companyId}`
            },
            {
              icon: PlusCircle,
              label: "Add Washroom",
              href: `/washrooms/add-location?companyId=${companyId}`
            },
          ],
        },
        {
          icon: Users,
          label: "User Management",
          hasDropdown: true,
          key: "user-management",
          children: [
            {
              icon: List,
              label: "User List",
              href: `/users?companyId=${companyId}`,
            },
            {
              icon: UserPlus,
              label: "Add User",
              href: `/users/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: ClipboardList,
          label: "User Mapping",
          hasDropdown: true,
          key: "cleaner-assignments",
          children: [
            {
              icon: List,
              label: "Mapped List",
              href: `/cleaner-assignments?companyId=${companyId}`,
            },
            {
              icon: UserCog,
              label: "Add Mapping",
              href: `/cleaner-assignments/add?companyId=${companyId}`,
            },
          ],
        },
        {
          icon: MapPin,
          label: "Locate On Map",
          href: `/locations?companyId=${companyId}`
        },
        // {
        //   icon: List,
        //   label: "shift",
        //   href: `/shift?companyId=${companyId}`
        // },
        {
          icon: ClipboardList,
          label: "Cleaner Activity",
          href: `/cleaner-review?companyId=${companyId}`
        },
        {
          icon: Building,
          label: "User Review",
          href: `/user-activity?companyId=${companyId}`
        },
        {
          icon: FileText,
          label: "Reports",
          href: `/reports?companyId=${companyId}`,
        },
      ];
    }
    else if (hasCompanyContext && user?.role_id === 3) {
      return [
        {
          icon: Building,
          label: "Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        {
          icon: Toilet,
          label: "Washrooms",
          hasDropdown: true,
          key: "washrooms",
          children: [
            {
              icon: List,
              label: "Washrooms List",
              href: `/washrooms?companyId=${companyId}`
            },
          ],
        },
        {
          icon: UserCheck,
          label: "Cleaner List",
          href: `/users/cleaner?companyId=${companyId}`
        },
        {
          icon: MapPin,
          label: "Locate On Map",
          href: `/locations?companyId=${companyId}`
        },
        {
          icon: ClipboardList,
          label: "Cleaner Activity",
          href: `/cleaner-review?companyId=${companyId}`
        },
        {
          icon: Building,
          label: "User Review",
          href: `/user-activity?companyId=${companyId}`
        },
        {
          icon: FileText,
          label: "Reports",
          href: `/reports?companyId=${companyId}`,
        },
        {
          icon: ClipboardList,
          label: "User Mapping",
          hasDropdown: true,
          key: "cleaner-assignments",
          children: [
            {
              icon: List,
              label: "Mapped List",
              href: `/cleaner-assignments?companyId=${companyId}`,
            },
            {
              icon: UserCog,
              label: "Add Mapping",
              href: `/cleaner-assignments/add?companyId=${companyId}`,
            },
          ],
        },
      ];
    }

    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
    ];
  };

  const filterMenuByPermissions = (menuItems) => {
    if (!user?.features) return menuItems;

    try {
      const userFeatures = typeof user.features === 'string'
        ? JSON.parse(user.features)
        : user.features;

      return menuItems.filter(item => {
        if (!item.requiredFeature) return true;
        return userFeatures.includes(item.requiredFeature);
      });
    } catch (error) {
      console.error('Error parsing user features:', error);
      return menuItems;
    }
  };

  const menuItems = filterMenuByPermissions(getMenuItems());

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
    if (!sidebarOpen) {
      setSidebarOpen(true);
      setTimeout(() => {
        setOpenDropdowns((prev) => ({ ...prev, [key]: !prev[key] }));
      }, 150);
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

  // ✅ UPDATED: Base link classes
  const commonLinkClasses = "flex items-center px-3 py-3 rounded-md cursor-pointer relative overflow-hidden transition-all duration-200";

  // ✅ NEW: Function to get active link classes
  const getActiveLinkClasses = (href, isChild = false) => {
    const isActive = isRouteActive(href);

    if (isActive) {
      return `${commonLinkClasses} ${isChild
        ? 'bg-slate-700 text-white border-l-2 border-indigo-500'
        : 'bg-indigo-600 text-white shadow-lg'
        }`;
    }

    return `${commonLinkClasses} ${isChild
      ? 'text-gray-400 hover:bg-slate-700 hover:text-white'
      : 'text-gray-300 hover:bg-indigo-600 hover:text-white'
      }`;
  };

  // ✅ NEW: Function to get dropdown button classes
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
                <ChevronLeft size={20} className="text-gray-300 cursor-pointer" />
              ) : (
                <ChevronRight size={20} className="text-gray-300 cursor-pointer" />
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 mt-2"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#475569 #1e293b'
          }}>
          <ul className="space-y-1">
            {menuItems.map((item, index) => {
              const IconComponent = item.icon;
              const isDropdownOpen = openDropdowns[item.key];

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
                                  className={`w-full flex items-center px-2 py-2 rounded-md transition-all duration-200 text-sm ${getActiveLinkClasses(child.href, true)
                                    }`}
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

              // Regular menu items
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
