// src/lib/hooks/usePermissions.js

import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const usePermissions = () => {
    const { user } = useSelector((state) => state.auth);

    const userPermissions = useMemo(() => {
        if (!user?.role) return [];

        const permissions = user.role.permissions || [];
        return Array.isArray(permissions) ? permissions : [];
    }, [user]);

    const hasPermission = (module, action) => {
        if (!user) return false;

        // Superadmin has all permissions
        if (user.role_id === 1) return true;

        const permissionKey = `${module}.${action}`;
        return userPermissions.includes(permissionKey);
    };

    const canView = (module) => hasPermission(module, 'view');
    const canAdd = (module) => hasPermission(module, 'add');
    const canUpdate = (module) => hasPermission(module, 'update');
    const canDelete = (module) => hasPermission(module, 'delete');

    return {
        hasPermission,
        canView,
        canAdd,
        canUpdate,
        canDelete,
        userPermissions,
    };
};
    