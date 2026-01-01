// src/lib/config/menuConfig.js

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
  Toilet,
  ClipboardList,
  MapPin,
  Building,
  MessageSquare,
  FileText,
  ShieldCheck,
  Award,
} from "lucide-react";

// ✅ Superadmin Main Dashboard (No Company Context)
export const getSuperadminMainMenu = () => [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    icon: Building2,
    label: "Organizations",
    href: "/companies",
  },
  {
    icon: Award,
    label: "Score Management",
    href: "/score-management",
  },
  {
    icon: ShieldCheck,
    label: "Role Management",
    hasDropdown: true,
    key: "role-management",
    children: [
      {
        icon: List,
        label: "Role List",
        href: "/role-management",
      },
      {
        icon: PlusCircle,
        label: "Add Role",
        href: "/role-management/add",
      },
    ],
  },
  {
    icon: Users,
    label: "All Users",
    hasDropdown: true,
    key: "all-users",
    children: [
      {
        icon: List,
        label: "Superadmin",
        href: "/role/superadmin",
      },
      {
        icon: List,
        label: "Admin",
        href: "/role/admin",
      },
      {
        icon: List,
        label: "Cleaner",
        href: "/role/cleaner",
      },
      // {
      //   icon: List,
      //   label: "Superadmin",
      //   href: "/role/superadmin",
      // },
    ],
  },
];

// ✅ Superadmin Inside Company (With Company Context)
export const getSuperadminCompanyMenu = (companyId) => [
  {
    icon: LayoutDashboard,
    label: "Main Dashboard",
    href: "/dashboard",
  },
  {
    icon: Building2,
    label: "Client Dashboard",
    href: `/clientDashboard/${companyId}`,
  },
  {
    icon: FolderTree,
    label: "Location Hierarchy",
    hasDropdown: true,
    key: "locationTypes",
    children: [
      {
        icon: List,
        label: "View Hierarchy",
        href: `/location-types?companyId=${companyId}`,
      },
      {
        icon: FolderPlus,
        label: "Add Hierarchy",
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
        href: `/washrooms?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Washroom",
        href: `/washrooms/add-location?companyId=${companyId}`,
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
  // {
  //   icon: ShieldCheck,
  //   label: "Role Management",
  //   hasDropdown: true,
  //   key: "role-management",
  //   children: [
  //     {
  //       icon: List,
  //       label: "Role List",
  //       href: "/role-management",
  //     },
  //     {
  //       icon: PlusCircle,
  //       label: "Add Role",
  //       href: "/role-management/add",
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
  {
    icon: MapPin,
    label: "Locate On Map",
    href: `/locations?companyId=${companyId}`,
  },
  {
    icon: ClipboardList,
    label: "Cleaner Activity",
    href: `/cleaner-review?companyId=${companyId}`,
  },
  {
    icon: MessageSquare,
    label: "User Review",
    href: `/user-activity?companyId=${companyId}`,
  },
  {
    icon: FileText,
    label: "Reports",
    href: `/reports?companyId=${companyId}`,
  },
];

// ✅ Admin Menu (role_id: 2)
export const getAdminMenu = (companyId) => [
  {
    icon: Building,
    label: "Dashboard",
    href: `/clientDashboard/${companyId}`,
  },
  {
    icon: FolderTree,
    label: "Location Hierarchy",
    hasDropdown: true,
    key: "locationTypes",
    children: [
      {
        icon: List,
        label: "View Hierarchy",
        href: `/location-types?companyId=${companyId}`,
      },
      {
        icon: FolderPlus,
        label: "Add Hierarchy",
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
        href: `/washrooms?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Washroom",
        href: `/washrooms/add-location?companyId=${companyId}`,
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
  // {
  //   icon: ShieldCheck,
  //   label: "Role Management",
  //   hasDropdown: true,
  //   key: "role-management",
  //   children: [
  //     {
  //       icon: List,
  //       label: "Role List",
  //       href: "/role-management",
  //     },
  //     {
  //       icon: PlusCircle,
  //       label: "Add Role",
  //       href: "/role-management/add",
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
  {
    icon: MapPin,
    label: "Locate On Map",
    href: `/locations?companyId=${companyId}`,
  },
  {
    icon: ClipboardList,
    label: "Cleaner Activity",
    href: `/cleaner-review?companyId=${companyId}`,
  },
  {
    icon: Building,
    label: "User Review",
    href: `/user-activity?companyId=${companyId}`,
  },
  {
    icon: FileText,
    label: "Reports",
    href: `/reports?companyId=${companyId}`,
  },
];

// ✅ Full Company Menu Template (For Permission-Based Filtering)
export const getFullCompanyMenuTemplate = (companyId) => [
  {
    icon: Building,
    label: "Dashboard",
    simpleLabel: "Dashboard",
    requiredPermission: "dashboard.view",
    href: `/clientDashboard/${companyId}`,
  },
  {
    icon: FolderTree,
    label: "Location Hierarchy",
    simpleLabel: "Location Hierarchy",
    requiredPermission: "location_types.view",
    key: "locationTypes",
    children: [
      {
        icon: List,
        label: "View Hierarchy",
        requiredPermission: "location_types.view",
        href: `/location-types?companyId=${companyId}`,
      },
      {
        icon: FolderPlus,
        label: "Add Hierarchy",
        requiredPermission: "location_types.add",
        href: `/location-types/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Toilet,
    label: "Washroom Management",
    simpleLabel: "Washrooms",
    requiredPermission: "locations.view",
    key: "washrooms",
    children: [
      {
        icon: List,
        label: "Washrooms List",
        requiredPermission: "locations.view",
        href: `/washrooms?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Washroom",
        requiredPermission: "locations.add",
        href: `/washrooms/add-location?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Users,
    label: "User Management",
    simpleLabel: "Users",
    requiredPermission: "users.view",
    key: "user-management",
    children: [
      {
        icon: List,
        label: "User List",
        requiredPermission: "users.view",
        href: `/users?companyId=${companyId}`,
      },
      {
        icon: UserPlus,
        label: "Add User",
        requiredPermission: "users.add",
        href: `/users/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: UserCog,
    label: "User Mapping",
    simpleLabel: "User Mapping",
    requiredPermission: "assignments.view",
    key: "cleaner-assignments",
    children: [
      {
        icon: List,
        label: "Mapped List",
        requiredPermission: "assignments.view",
        href: `/cleaner-assignments?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Mapping",
        requiredPermission: "assignments.add",
        href: `/cleaner-assignments/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: Building2,
    label: "Facility Companies",
    simpleLabel: "Facility Companies",
    requiredPermission: "facility_companies.view",
    key: "facility-companies",
    children: [
      {
        icon: List,
        label: "View List",
        requiredPermission: "facility_companies.view",
        href: `/facility-company?companyId=${companyId}`,
      },
      {
        icon: PlusCircle,
        label: "Add Facility",
        requiredPermission: "facility_companies.add",
        href: `/facility-company/add?companyId=${companyId}`,
      },
    ],
  },
  {
    icon: MapPin,
    label: "Locate On Map",
    simpleLabel: "Locate On Map",
    requiredPermission: "locations.view",
    href: `/locations?companyId=${companyId}`,
  },
  {
    icon: ClipboardList,
    label: "Cleaner Activity",
    simpleLabel: "Cleaner Activity",
    requiredPermission: "cleaner_reviews.view",
    href: `/cleaner-review?companyId=${companyId}`,
  },
  {
    icon: MessageSquare,
    label: "User Review",
    simpleLabel: "User Review",
    requiredPermission: "cleaner_reviews.view",
    href: `/user-activity?companyId=${companyId}`,
  },
  {
    icon: FileText,
    label: "Reports",
    simpleLabel: "Reports",
    requiredPermission: "reports.view",
    href: `/reports?companyId=${companyId}`,
  },
];
