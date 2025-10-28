"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname, useSearchParams } from "next/navigation"; // ✅ Added useSearchParams
import { logout } from "../store/slices/authSlice.js";

import {
  LayoutDashboard,// Dashboard
  Building2, // Client Dashboard
  List,   //List views
  FolderTree, // Location Types parent
  FolderPlus,
  UserPlus,      // Add User
  Users,             // User Management
  UserCog,           // Cleaner Mapping
  PlusCircle,        // Add actions
  Bath,
  Toilet,            // Washrooms (better than Bath)
  ClipboardList,
  CheckCircle,
  ClipboardCheck,
  UserCheck, // for registered user
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  X,
  MapPin, // Locations
  Building,
  MessageSquare,
  FileText
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

  // console.log('Pathname:', pathname);
  // console.log('SearchParams:', Object.fromEntries(searchParams.entries()));



  const getRoleText = () => {
    if (!user || !user.role_id) {
      return "User"; // Default role if not specified
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
    // Method 1: From clientDashboard route
    if (pathname.startsWith('/clientDashboard/')) {
      const segments = pathname.split('/');
      // console.log('ClientDashboard segments:', segments);
      return segments[2]; // Gets the ID from /clientDashboard/[id]
    }

    // Method 2: From search params (for other routes)
    const companyId = searchParams.get('companyId');
    if (companyId) {
      // console.log('CompanyId from searchParams:', companyId);
      return companyId;
    }

    return null;
  };

  const companyId = getCompanyContext();
  const isSuperadmin = user?.role_id === 1;
  const isOnMainDashboard = pathname === '/dashboard';
  const hasCompanyContext = !!companyId;


  // console.log('CompanyId:', companyId);
  // console.log('HasCompanyContext:', hasCompanyContext);
  // console.log('IsOnMainDashboard:', isOnMainDashboard);
  // console.log('IsSuperadmin:', isSuperadmin);

  const getMenuItems = () => {
    // Superadmin on main dashboard only
    if (isSuperadmin && isOnMainDashboard && !hasCompanyContext) {
      return [
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
      ];
    }

    // Company context menu (show when companyId exists)
    if (hasCompanyContext && user?.role_id === 1) {
      // SUPERADMIN VIEW - Full access including company management
      return [
        // dashboard 
        { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
        // client dashboard
        {
          icon: Building2,
          label: "Client Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        // Location hierarchy
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
        //washrooms 
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
        //user management 
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
        // cleaner mapping
        // {
        //   icon: UserCog,
        //   label: "Cleaner Mapping",
        //   hasDropdown: true,
        //   key: "cleaner-assignments",
        //   children: [
        //     {
        //       icon: List,
        //       label: "Mapped List",
        //       href: `/cleaner-assignments?companyId=${companyId}`,
        //     },
        //     {
        //       icon: PlusCircle,
        //       label: "Add Mapping",
        //       href: `/cleaner-assignments/add?companyId=${companyId}`,
        //     },
        //   ],
        // },


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
        // locate on map
        {
          icon: MapPin,
          label: "Locate On Map",
          href: `/locations?companyId=${companyId}`
        },
        // cleaner-activity
        {
          icon: ClipboardList,
          label: "Cleaner Activity",
          href: `/cleaner-review?companyId=${companyId}`
        },
        // user-review
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
      // ADMIN VIEW - Company-specific access
      return [
        // admin -dashboard
        {
          icon: Building,
          label: "Dashboard",
          href: `/clientDashboard/${companyId}`
        },
        // admin -Locaton Hierarchy 
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
        // admin - washroom list
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

        // admin - user mangament 
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
        // admin -cleaner mapping 
        // {
        //   icon: ClipboardList,
        //   label: "Cleaner Mapping",
        //   hasDropdown: true,
        //   key: "cleaner-assignments",
        //   children: [
        //     {
        //       icon: List,
        //       label: "Mapped List",
        //       href: `/cleaner-assignments?companyId=${companyId}`,
        //     },
        //     {
        //       icon: UserCog,
        //       label: "Add Mapping",
        //       href: `/cleaner-assignments/add?companyId=${companyId}`,
        //     },
        //   ],
        // },

        // locate on map
        {
          icon: MapPin,
          label: "Locate On Map",
          href: `/locations?companyId=${companyId}`
        },
        // cleaner activity
        {
          icon: ClipboardList,
          label: "Cleaner Activity",
          href: `/cleaner-review?companyId=${companyId}`
        },
        // admin - user -activity 
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
        // ✅ ADD REGISTERED USERS FOR ADMIN (Company-specific)

        // {
        //   icon: ClipboardList,
        //   label: "Registered Users",
        //   hasDropdown: true,
        //   key: "registered-users",
        //   children: [
        //     {
        //       icon: List,
        //       label: "Registered Users List",
        //       href: `/registered-users?companyId=${companyId}`,
        //     },
        //     {
        //       icon: PlusCircle,
        //       label: "Add Registered User",
        //       href: `/registered-users/add?companyId=${companyId}`,
        //     },
        //   ],
        // },

      ];
    }

    // Fallback
    return [
      { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }
    ];
  };


  // Filter menu items based on user permissions (future feature utility)
  const filterMenuByPermissions = (menuItems) => {
    // console.log('In filter')
    if (!user?.features) return menuItems;
    // console.log('in filter by permission ')
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

  // ✅ Add debugging for final menu items
  // console.log('Final menuItems:', menuItems);

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
            {/* {sidebarOpen && (
              <div className="flex items-center space-x-3 mb-3 p-2 rounded-md hover:bg-slate-700 transition">
                <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  {getInitials()}
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {user?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {userRole}
                  </p>
                </div>
              </div>
            )} */}
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
