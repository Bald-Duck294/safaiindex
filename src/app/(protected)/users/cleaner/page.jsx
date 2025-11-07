"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux"; // Now we need to use Redux
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, Users, Search, Eye } from "lucide-react";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";

// Role hierarchy definition - lower numbers have higher authority
const ROLE_HIERARCHY = {
    1: { name: 'Superadmin', level: 1 },
    2: { name: 'Admin', level: 2 },
    3: { name: 'Supervisor', level: 3 },
    4: { name: 'User', level: 4 },
    5: { name: 'Cleaner', level: 5 }
};

// Skeleton Loader Component for table rows
const TableRowSkeleton = () => (
    <tr className="animate-pulse">
        {[...Array(4)].map((_, i) => (
            <td key={i} className="p-4"><div className="h-4 bg-slate-200 rounded"></div></td>
        ))}
    </tr>
);

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Get current user from Redux store
    const currentUser = useSelector((state) => state.auth.user);
    const { companyId } = useCompanyId();

    // Get current user's role level for filtering
    const currentUserRoleId = parseInt(currentUser?.role_id || 4);
    const currentUserRoleLevel = ROLE_HIERARCHY[currentUserRoleId]?.level || 4;

    console.log('Current user role:', currentUserRoleId, 'Level:', currentUserRoleLevel);

    // Filter users based on role hierarchy
    const filterUsersByRole = useCallback((allUsers) => {
        if (!currentUser || !currentUser.role_id) {
            return allUsers; // If no current user, show all (fallback)
        }

        return allUsers.filter(user => {
            const userRoleId = parseInt(user.role_id || user.role?.id || 4);
            const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 4;

            // Current user can only see users with equal or lower authority (higher level number)
            // Superadmin (1) sees everyone, Admin (2) can't see Superadmin (1), etc.
            return userRoleLevel >= currentUserRoleLevel;
        });
    }, [currentUser, currentUserRoleLevel]);

    // Filter users based on search term
    const filterUsersBySearch = useCallback((allUsers, term) => {
        if (!term) return allUsers;

        return allUsers.filter(user =>
            user.name.toLowerCase().includes(term.toLowerCase()) ||
            (user.email && user.email.toLowerCase().includes(term.toLowerCase())) ||
            (user.phone && user.phone.includes(term))
        );
    }, []);

    // Fetches users based on the logged-in user's company
    const fetchUsers = useCallback(async () => {
        if (!companyId) {
            setIsLoading(false);
            // toast.error("Could not determine your company.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await UsersApi.getAllUsers(companyId);
            if (response.success) {
                console.log('All users fetched:', response.data);

                // Apply role-based filtering
                const filteredCleaners = response.data.filter((item) => item.role_id === 5)
                const roleFilteredUsers = filterUsersByRole(filteredCleaners);
                console.log('Role filtered users:', roleFilteredUsers);

                setUsers(roleFilteredUsers);

                // Apply search filter on top of role filter
                const searchFilteredUsers = filterUsersBySearch(roleFilteredUsers, searchTerm);
                setFilteredUsers(searchFilteredUsers);
            } else {
                toast.error(response.error || "Failed to fetch users.");
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error("Failed to fetch users.");
        }
        setIsLoading(false);
    }, [companyId, filterUsersByRole, filterUsersBySearch, searchTerm]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Update filtered users when search term changes
    useEffect(() => {
        const searchResults = filterUsersBySearch(users, searchTerm);
        setFilteredUsers(searchResults);
    }, [searchTerm, users, filterUsersBySearch]);

    // Check if current user can manage a specific user
    const canManageUser = (targetUser) => {
        const targetUserRoleId = parseInt(targetUser.role_id || targetUser.role?.id || 4);
        const targetUserRoleLevel = ROLE_HIERARCHY[targetUserRoleId]?.level || 4;

        // Can manage users with equal or lower authority (higher level number)
        return targetUserRoleLevel >= currentUserRoleLevel;
    };

    // Get role display name
    const getRoleDisplayName = (user) => {
        const roleId = parseInt(user.role_id || user.role?.id || 4);
        return ROLE_HIERARCHY[roleId]?.name || user.role?.name || 'Unknown Role';
    };

    // Get role color class
    const getRoleColorClass = (user) => {
        const roleId = parseInt(user.role_id || user.role?.id || 4);
        const colors = {
            1: 'text-purple-700 bg-purple-100', // Superadmin
            2: 'text-blue-700 bg-blue-100',     // Admin
            3: 'text-green-700 bg-green-100',   // Supervisor
            4: 'text-yellow-700 bg-yellow-100', // User
            5: 'text-gray-700 bg-gray-100'      // Cleaner
        };
        return colors[roleId] || 'text-indigo-700 bg-indigo-100';
    };

    // Handles the deletion confirmation and action
    const handleDelete = (user) => {
        if (!canManageUser(user)) {
            toast.error("You don't have permission to delete this user.");
            return;
        }

        toast((t) => (
            <div className="flex flex-col items-center gap-4 p-4">
                <p className="font-semibold text-center">Are you sure you want to delete {user.name}?</p>
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            performDelete(user.id);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Delete
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        ), { duration: 6000 });
    };

    const performDelete = async (id) => {
        const toastId = toast.loading("Deleting user...");
        const response = await UsersApi.deleteUser(id);
        if (response.success) {
            toast.success("User deleted successfully!", { id: toastId });
            fetchUsers(); // Refresh the list
        } else {
            toast.error(response.error || "Failed to delete user.", { id: toastId });
        }
    };

    // Navigation handlers
    const navigateTo = (path) => {
        window.location.href = path;
    };

    return (
        <>
            <Toaster position="top-center" reverseOrder={false} />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-indigo-600" />
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manage Users</h1>
                                {/* <p className="text-sm text-slate-600 mt-1">
                  Showing users you can manage ({ROLE_HIERARCHY[currentUserRoleId]?.name} level and below)
                </p> */}
                            </div>
                        </div>
                        <a
                            href={`/users/add?companyId=${companyId}`}
                            className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 cursor-pointer"
                        >
                            <Plus size={20} />
                            Add User
                        </a>
                    </div>

                    {/* Role Filter Info */}
                    {/* <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users size={16} />
              <span>
                <strong>Access Level:</strong> {ROLE_HIERARCHY[currentUserRoleId]?.name}
                - You can manage users with roles: {
                  Object.entries(ROLE_HIERARCHY)
                    .filter(([_, role]) => role.level >= currentUserRoleLevel)
                    .map(([_, role]) => role.name)
                    .join(', ')
                }
              </span>
            </div>
          </div>

          {/* Search Bar */}
                    <div className="mb-6 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200/60">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-100 border-b border-slate-200">
                                    <tr>
                                        <th className="p-4 text-sm font-semibold text-slate-600">Name</th>
                                        <th className="p-4 text-sm font-semibold text-slate-600">Email</th>
                                        <th className="p-4 text-sm font-semibold text-slate-600">Role</th>
                                        <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                                    ) : filteredUsers.length > 0 ? (
                                        filteredUsers.map((user) => (
                                            <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                                                <td className="p-4">
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{user.name}</div>
                                                        {user.phone && (
                                                            <div className="text-xs text-slate-500">{user.phone}</div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-slate-600">{user.email || 'N/A'}</td>
                                                <td className="p-4 text-slate-600">
                                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getRoleColorClass(user)}`}>
                                                        {getRoleDisplayName(user)}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => navigateTo(`/users/view/${user.id}?companyId=${companyId}`)}
                                                            className="p-2 cursor-pointer text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition"
                                                            title="View User"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                        {canManageUser(user) && (
                                                            <>
                                                                <button
                                                                    onClick={() => navigateTo(`/users/${user.id}?companyId=${companyId}`)}
                                                                    className=" cursor-pointer p-2 text-sky-600 bg-sky-100 rounded-md hover:bg-sky-200 transition"
                                                                    title="Edit User"
                                                                >
                                                                    <Edit size={16} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(user)}
                                                                    className=" cursor-pointer p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition"
                                                                    title="Delete User"
                                                                >
                                                                    <Trash2 size={16} />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center py-16 text-slate-500">
                                                <p className="font-semibold text-lg">
                                                    {searchTerm ? 'No users found matching your search' : 'No users found'}
                                                </p>
                                                <p>
                                                    {searchTerm ? 'Try a different search term.' : 'Click "Add User" to get started.'}
                                                </p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200">
                        <div className="flex items-center justify-between text-sm text-slate-600">
                            <span>
                                Showing {filteredUsers.length} of {users.length} manageable users
                            </span>
                            <span>
                                {/* Your role: <strong>{ROLE_HIERARCHY[currentUserRoleId]?.name}</strong> */}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
