export const ROLES = {
  SUPER_ADMIN: 1,
  ADMIN: 2,
  SUPERVISOR: 3,
  JANITOR: 4,
  CLIENT: 5,
};

export const ROLE_NAMES = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.ADMIN]: "Admin",
  [ROLES.SUPERVISOR]: "Supervisor",
  [ROLES.JANITOR]: "Janitor",
  [ROLES.CLIENT]: "Client",
};

// Roles that can be assigned a location
export const LOCATION_ASSIGNABLE_ROLES = [ROLES.SUPERVISOR, ROLES.JANITOR];
