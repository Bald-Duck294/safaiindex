// src/lib/constants/permissions.js

export const MODULES = {
    DASHBOARD: 'dashboard',
    LOCATIONS: 'locations',
    LOCATION_TYPES: 'location_types',
    USERS: 'users',
    ASSIGNMENTS: 'assignments',
    FACILITY_COMPANIES: 'facility_companies',
    REPORTS: 'reports',
    CLEANER_REVIEWS: 'cleaner_reviews',
    SCORE_MANAGEMENT: 'score_management',
    ROLE_MANAGEMENT: 'role_management',
};

export const ACTIONS = {
    VIEW: 'view',
    ADD: 'add',
    UPDATE: 'update',
    DELETE: 'delete',
};

// Helper to create permission key
export const createPermissionKey = (module, action) => {
    return `${module}.${action}`;
};

// Module configurations for UI
export const MODULE_CONFIG = [
    {
        key: MODULES.DASHBOARD,
        label: 'Dashboard',
        description: 'Main dashboard and analytics',
    },
    {
        key: MODULES.LOCATIONS,
        label: 'Washrooms/Locations',
        description: 'Manage washroom locations',
    },
    {
        key: MODULES.LOCATION_TYPES,
        label: 'Location Hierarchy',
        description: 'Manage location types and zones',
    },
    {
        key: MODULES.USERS,
        label: 'User Management',
        description: 'Manage users (cleaners, supervisors)',
    },
    {
        key: MODULES.ASSIGNMENTS,
        label: 'User Mapping',
        description: 'Assign users to locations',
    },
    {
        key: MODULES.FACILITY_COMPANIES,
        label: 'Facility Companies',
        description: 'Manage facility companies',
    },
    {
        key: MODULES.REPORTS,
        label: 'Reports',
        description: 'View and export reports',
    },
    {
        key: MODULES.CLEANER_REVIEWS,
        label: 'Reviews & Activity',
        description: 'Cleaner activity and  reviews',
    },
    {
        key: MODULES.SCORE_MANAGEMENT,
        label: 'Score Management',
        description: 'Manage scoring system',
    },
    {
        key: MODULES.ROLE_MANAGEMENT,
        label: 'Role Management',
        description: 'Manage roles and permissions',
    },
];
