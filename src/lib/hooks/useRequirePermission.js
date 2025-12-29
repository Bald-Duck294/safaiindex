// src/lib/hooks/useRequirePermission.js

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

/**
 * Page-level permission protection hook
 * Automatically redirects user if they don't have required permission
 * 
 * @param {string} module - Module name (e.g., MODULES.LOCATIONS)
 * @param {object} options - Configuration options
 * @param {string} options.action - Action to check (default: 'view')
 * @param {string} options.errorMessage - Custom error message
 * @param {string} options.redirectTo - Custom redirect path
 */
export const useRequirePermission = (module, options = {}) => {
  const router = useRouter();
  const user = useSelector((state) => state.auth.user);
  
  // ✅ Memoize permissions to prevent unnecessary re-renders
  const permissions = useMemo(() => {
    if (!user?.role?.permissions) return [];
    return Array.isArray(user.role.permissions) ? user.role.permissions : [];
  }, [user?.role?.permissions]);
  
  const {
    action = 'view',
    errorMessage,
    redirectTo,
  } = options;

  useEffect(() => {
    // ✅ Superadmin bypass (has all permissions)
    if (user?.role_id === 1) {
      return;
    }

    // ✅ Build permission key (e.g., "locations.view")
    const requiredPermission = `${module}.${action}`;
    
    // ✅ Check if user has permission
    if (!permissions.includes(requiredPermission)) {
      // ✅ Show error toast
      const message = errorMessage || `You do not have permission to ${action} ${module}`;
      toast.error(message);
      
      // ✅ Determine redirect path
      let redirectPath;
      
      if (redirectTo) {
        redirectPath = redirectTo;
      } else if (user?.role_id === 1) {
        redirectPath = '/dashboard';
      } else if (user?.company_id) {
        redirectPath = `/clientDashboard/${user.company_id}`;
      } else {
        redirectPath = '/login';
      }
      
      console.log('❌ Permission denied:', requiredPermission);
      console.log('🔄 Redirecting to:', redirectPath);
      
      router.push(redirectPath);
    }
  }, [module, action, permissions, user?.role_id, user?.company_id, router, errorMessage, redirectTo]);
};
