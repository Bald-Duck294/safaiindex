"use client";

import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, Users, Search, Eye, Filter, TrendingUp, Building2, MapPin, Shield, UserCog, Briefcase, HardHat, LucideDog } from "lucide-react";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useRouter } from "next/navigation";
import { usePermissions } from '@/lib/hooks/usePermissions';
import { useRequirePermission } from '@/lib/hooks/useRequirePermission';
import { MODULES } from '@/lib/constants/permissions';




const ROLE_HIERARCHY = {
  2: { name: "Admin", level: 2, icon: Shield, color: "blue" },
  3: { name: "Supervisor", level: 4, icon: UserCog, color: "green" },
  5: { name: "Cleaner", level: 5, icon: HardHat, color: "gray" },
  6: { name: "Zonal Admin", level: 3, icon: MapPin, color: "purple" },
  7: { name: "Facility Supervisor", level: 4, icon: Users, color: "teal" },
  8: { name: "Facility Admin", level: 3, icon: Building2, color: "indigo" },
};

// Role hierarchy definition (removed User and Superadmin)
// const ROLE_HIERARCHY = {
//   2: { name: 'Admin', level: 2, icon: Briefcase, color: 'blue' },
//   3: { name: 'Supervisor', level: 3, icon: UserCog, color: 'green' },
//   5: { name: 'Cleaner', level: 5, icon: HardHat, color: 'gray' },
//   6: { name: 'Demo users', level: 6, icon: LucideDog, color: 'orange' }
// };

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(4)].map((_, i) => (
      <td key={i} className="p-4"><div className="h-4 bg-slate-200 rounded" /></td>
    ))}
  </tr>
);

const CardSkeleton = () => (
  <div className="animate-pulse p-4 bg-white mb-4 rounded-lg shadow">
    <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
    <div className="h-3 bg-slate-100 rounded w-1/3 mb-2" />
    <div className="h-4 bg-slate-200 rounded w-2/3 mb-4" />
    <div className="flex gap-2">
      <div className="h-8 w-16 bg-slate-200 rounded" />
      <div className="h-8 w-16 bg-slate-100 rounded" />
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="animate-pulse bg-white p-6 rounded-xl shadow-md border border-slate-200">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-slate-200 rounded w-20 mb-2" />
        <div className="h-8 bg-slate-300 rounded w-12 mb-2" />
        <div className="h-3 bg-slate-100 rounded w-24" />
      </div>
      <div className="w-12 h-12 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

export default function UsersPage() {

  useRequirePermission(MODULES.USERS);

  // ✅ ADD: Permission checks
  const { canAdd, canUpdate, canDelete } = usePermissions();
  const canAddUser = canAdd(MODULES.USERS);
  const canEditUser = canUpdate(MODULES.USERS);
  const canDeleteUser = canDelete(MODULES.USERS);

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('all');

  const currentUser = useSelector((state) => state.auth.user);
  const { companyId } = useCompanyId();
  const router = useRouter();

  const currentUserRoleId = parseInt(currentUser?.role_id || 4);

  // Calculate role statistics
  const roleStats = useCallback(() => {
    const stats = {};
    Object.keys(ROLE_HIERARCHY).forEach(roleId => {
      stats[roleId] = users.filter(u => parseInt(u.role_id || u.role?.id) === parseInt(roleId)).length;
    });
    return stats;
  }, [users]);

  // ✅ FIXED: Filter users by role - exclude superadmins (role_id 1) and users (role_id 4)
  // const filterUsersByRole = useCallback((allUsers) => {
  //   if (!currentUser || !currentUser.role_id) return allUsers;

  //   return allUsers.filter(user => {
  //     const userRoleId = parseInt(user.role_id || user.role?.id || 4);

  //     //  Exclude superadmins (role_id 1) and regular users (role_id 4)
  //     if (userRoleId === 1 || userRoleId === 4) {
  //       return false;
  //     }

  //     // Only show roles that exist in ROLE_HIERARCHY (2, 3, 5)
  //     if (!ROLE_HIERARCHY[userRoleId]) {
  //       return false;
  //     }

  //     // ✅ If current user is Superadmin (role_id 1), show all valid roles
  //     if (currentUserRoleId === 1) {
  //       return true;
  //     }

  //     // ✅ For other roles, apply hierarchy: show users with equal or lower authority
  //     const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
  //     const currentUserRoleLevel = ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

  //     return userRoleLevel >= currentUserRoleLevel;
  //   });
  // }, [currentUser, currentUserRoleId]);


  const filterUsersByRole = useCallback((allUsers) => {
    if (!currentUser || !currentUser.role_id) return allUsers;

    return allUsers.filter(user => {
      const userRoleId = parseInt(user.role_id || user.role?.id, 10);

      // ✅ Exclude superadmins (1) and reserved (4)
      if (userRoleId === 1 || userRoleId === 4) return false;

      // ✅ Only show roles defined in ROLE_HIERARCHY (2, 3, 5, 6, 7, 8)
      if (!ROLE_HIERARCHY[userRoleId]) return false;

      // ✅ Superadmin sees all
      if (currentUserRoleId === 1) return true;

      // ✅ Admin sees all in their company
      if (currentUserRoleId === 2) return true;

      // ✅ Other roles: Show same role or lower hierarchy
      const userRoleLevel = ROLE_HIERARCHY[userRoleId]?.level || 999;
      const currentUserRoleLevel = ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

      // Show users of same level or lower
      return userRoleLevel >= currentUserRoleLevel;
    });
  }, [currentUser, currentUserRoleId]);


  // Filter users by search
  const filterUsersBySearch = useCallback((allUsers, term) => {
    if (!term) return allUsers;
    return allUsers.filter(user =>
      user.name.toLowerCase().includes(term.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(term.toLowerCase())) ||
      (user.phone && user.phone.includes(term))
    );
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const response = await UsersApi.getAllUsers(companyId);
      console.log('Fetched users:', response.data);
      if (response.success) {
        const roleFilteredUsers = filterUsersByRole(response.data);
        console.log('After role filter:', roleFilteredUsers); // ✅ Debug log
        setUsers(roleFilteredUsers);
        applyFilters(roleFilteredUsers, searchTerm, selectedRole);
      } else {
        toast.error(response.error || "Failed to fetch users.");
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error("Failed to fetch users.");
    }
    setIsLoading(false);
  }, [companyId, filterUsersByRole, searchTerm, selectedRole]);

  const applyFilters = useCallback((userList, search, role) => {
    let filtered = [...userList];

    // Apply role filter
    if (role !== 'all') {
      filtered = filtered.filter(u => parseInt(u.role_id || u.role?.id) === parseInt(role));
    }

    // Apply search filter
    filtered = filterUsersBySearch(filtered, search);

    setFilteredUsers(filtered);
  }, [filterUsersBySearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    applyFilters(users, searchTerm, selectedRole);
  }, [searchTerm, selectedRole, users, applyFilters]);

  const canManageUser = (targetUser) => {
    // Superadmin can manage all users
    if (currentUserRoleId === 1) return true;

    const targetUserRoleId = parseInt(targetUser.role_id || targetUser.role?.id || 4);
    const targetUserRoleLevel = ROLE_HIERARCHY[targetUserRoleId]?.level || 999;
    const currentUserRoleLevel = ROLE_HIERARCHY[currentUserRoleId]?.level || 999;

    return targetUserRoleLevel >= currentUserRoleLevel;
  };

  const getRoleDisplayName = (user) => {
    const roleId = parseInt(user.role_id || user.role?.id || 4);
    return ROLE_HIERARCHY[roleId]?.name || user.role?.name || 'Unknown Role';
  };

  const getRoleColorClass = (user) => {
    const roleId = parseInt(user.role_id || user.role?.id || 4);
    const colorMap = {
      blue: 'text-blue-700 bg-blue-100 border-blue-200',
      green: 'text-green-700 bg-green-100 border-green-200',
      gray: 'text-gray-700 bg-gray-100 border-gray-200'
    };
    const color = ROLE_HIERARCHY[roleId]?.color || 'gray';
    return colorMap[color] || 'text-indigo-700 bg-indigo-100 border-indigo-200';
  };

  const getStatCardColor = (color) => {
    const colorMap = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      gray: 'from-gray-500 to-gray-600'
    };
    return colorMap[color] || 'from-indigo-500 to-indigo-600';
  };

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
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400 transition-all"
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
      fetchUsers();
    } else {
      toast.error(response.error || "Failed to delete user.", { id: toastId });
    }
  };

  const stats = roleStats();

  return (
    <>
      <Toaster position="top-center" reverseOrder={false} />
      <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">User Management</h1>
                <p className="text-sm text-slate-600 mt-1">Manage all user roles and permissions</p>
              </div>
            </div>
            {canAddUser && (
              <a
                href={`/users/add?companyId=${companyId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <Plus size={20} />
                Add User
              </a>
            )}
          </div>

          {/* Stats Cards - Compact Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
            {/* Total Users - Spans 2 columns on mobile */}
            <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-indigo-500 to-indigo-600 p-4 rounded-lg shadow-md text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs opacity-90">Total Users</p>
                  <p className="text-2xl font-bold mt-1">{users.length}</p>
                </div>
                <Users className="w-8 h-8 opacity-80" />
              </div>
            </div>

            {/* Role Cards - Only show roles with users */}
            {Object.entries(ROLE_HIERARCHY)
              .filter(([roleId]) => stats[roleId] > 0)
              .map(([roleId, roleData]) => {
                const Icon = roleData.icon;
                const count = stats[roleId] || 0;

                return (
                  <div
                    key={roleId}
                    onClick={() => setSelectedRole(selectedRole === roleId ? 'all' : roleId)}
                    className={`p-4 rounded-lg shadow-md cursor-pointer transition-all duration-200 hover:shadow-lg ${selectedRole === roleId
                      ? `bg-${roleData.color}-600 text-white ring-2 ring-${roleData.color}-400`
                      : 'bg-white hover:bg-gray-50'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs ${selectedRole === roleId ? 'text-white opacity-90' : 'text-gray-600'}`}>
                          {roleData.name}
                        </p>
                        <p className={`text-2xl font-bold mt-1 ${selectedRole === roleId ? 'text-white' : 'text-gray-800'}`}>
                          {count}
                        </p>
                      </div>
                      <Icon className={`w-6 h-6 ${selectedRole === roleId ? 'text-white opacity-80' : 'text-gray-400'}`} />
                    </div>
                  </div>
                );
              })}
          </div>


          {/* Filters Section */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 mb-6 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-md border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Role Filter Pills */}
              <div className="flex flex-wrap gap-2 items-center">
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Filter size={16} />
                  <span className="hidden sm:inline">Filter:</span>
                </div>
                <button
                  onClick={() => setSelectedRole('all')}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${selectedRole === 'all'
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                >
                  All Users
                </button>
                {Object.entries(ROLE_HIERARCHY).map(([roleId, roleData]) => {
                  const count = stats[roleId] || 0;
                  if (count === 0) return null;

                  return (
                    <button
                      key={roleId}
                      onClick={() => setSelectedRole(roleId)}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${selectedRole === roleId
                        ? `bg-${roleData.color}-600 text-white shadow-md`
                        : `bg-${roleData.color}-100 text-${roleData.color}-700 hover:bg-${roleData.color}-200`
                        }`}
                    >
                      {roleData.name}s
                      <span className={`px-2 py-0.5 rounded-full text-xs ${selectedRole === roleId
                        ? 'bg-white/20'
                        : `bg-${roleData.color}-200`
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table View - Desktop */}
          <div className="hidden sm:block animate-fadeIn">
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                    <tr>
                      <th className="p-4 text-sm font-semibold text-slate-700">Name</th>
                      <th className="p-4 text-sm font-semibold text-slate-700">Email</th>
                      <th className="p-4 text-sm font-semibold text-slate-700">Role</th>
                      <th className="p-4 text-sm font-semibold text-slate-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                    ) : filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr
                          key={user.id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors duration-150 animate-slideUp"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getStatCardColor(ROLE_HIERARCHY[parseInt(user.role_id || user.role?.id)]?.color)} flex items-center justify-center text-white font-semibold shadow-md`}>
                                {user.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-800">{user.name}</div>
                                {user.phone && (
                                  <div className="text-xs text-slate-500">{user.phone}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-slate-600">{user.email || 'N/A'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1.5 text-xs font-semibold rounded-full border ${getRoleColorClass(user)}`}>
                              {getRoleDisplayName(user)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => router.push(`/users/view/${user.id}?companyId=${companyId}`)}
                                className="p-2 cursor-pointer text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 hover:scale-110"
                                title="View User"
                              >
                                <Eye size={16} />
                              </button>
                              {canManageUser(user) && canEditUser && (
                                <button
                                  onClick={() => router.push(`/users/${user.id}?companyId=${companyId}`)}
                                  className="flex-1 cursor-pointer p-2.5 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                                >
                                  <Edit size={16} />
                                  Edit
                                </button>
                              )}
                              {canManageUser(user) && canDeleteUser && (
                                <button
                                  onClick={() => handleDelete(user)}
                                  className="cursor-pointer p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center py-16 text-slate-500">
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                              <Users className="w-10 h-10 text-slate-400" />
                            </div>
                            <p className="font-semibold text-lg text-slate-700">
                              {searchTerm || selectedRole !== 'all' ? 'No users found' : 'No users found'}
                            </p>
                            <p className="text-sm">
                              {searchTerm || selectedRole !== 'all'
                                ? 'Try adjusting your filters or search term.'
                                : 'Click "Add User" to get started.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => <CardSkeleton key={i} />)
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <div
                  key={user.id}
                  className="mb-4 p-4 bg-white rounded-xl shadow-md border border-slate-200 hover:shadow-lg transition-all duration-200 animate-slideUp"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getStatCardColor(ROLE_HIERARCHY[parseInt(user.role_id || user.role?.id)]?.color)} flex items-center justify-center text-white font-semibold shadow-md text-lg`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800 text-lg">{user.name}</div>
                      {user.phone && (
                        <div className="text-xs text-slate-500 mt-0.5">{user.phone}</div>
                      )}
                      <span className={`inline-block mt-2 px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColorClass(user)}`}>
                        {getRoleDisplayName(user)}
                      </span>
                    </div>
                  </div>
                  <div className="text-slate-600 text-sm mb-3">{user.email || 'N/A'}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/users/view/${user.id}?companyId=${companyId}`)}
                      className="flex-1 p-2.5 cursor-pointer text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    {canManageUser(user) && (
                      <>
                        <button
                          onClick={() => router.push(`/users/${user.id}?companyId=${companyId}`)}
                          className="flex-1 cursor-pointer p-2.5 text-sky-600 bg-sky-50 rounded-lg hover:bg-sky-100 transition-all duration-200 flex items-center justify-center gap-2 font-medium text-sm"
                        >
                          <Edit size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="cursor-pointer p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-all duration-200"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 bg-white rounded-xl shadow-md p-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-slate-400" />
                  </div>
                  <p className="font-semibold text-lg text-slate-700">
                    {searchTerm || selectedRole !== 'all' ? 'No users found' : 'No users found'}
                  </p>
                  <p className="text-sm">
                    {searchTerm || selectedRole !== 'all'
                      ? 'Try adjusting your filters or search term.'
                      : 'Click "Add User" to get started.'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Summary Footer */}
          <div className="mt-6 p-4 bg-white rounded-lg border border-slate-200 shadow-sm animate-fadeIn">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span className="font-medium">
                Showing <span className="text-indigo-600 font-bold">{filteredUsers.length}</span> of <span className="font-bold">{users.length}</span> users
                {selectedRole !== 'all' && ` • Filtered by ${ROLE_HIERARCHY[selectedRole]?.name}`}
              </span>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}
