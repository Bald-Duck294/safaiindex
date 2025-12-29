// src/app/(protected)/role/[role]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';

import {
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  ArrowLeft,
  Search,
  Filter,
  UserPlus,
  Loader2,
  Eye
} from "lucide-react";
import { useRequirePermission } from '@/lib/hooks/useRequirePermission';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MODULES } from '@/lib/constants/permissions';

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            {[...Array(6)].map((_, i) => (
              <th key={i} className="px-6 py-4 text-left">
                <div className="h-4 bg-gray-300 rounded w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              {[...Array(6)].map((_, j) => (
                <td key={j} className="px-6 py-4">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// const EmptyState = ({ role, companyId }) => (
//   <div className="text-center py-16 px-4">
//     <div className="max-w-md mx-auto">
//       <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
//         <UserPlus className="w-12 h-12 text-blue-400" />
//       </div>
//       <h3 className="text-xl font-semibold text-gray-900 mb-3">
//         No {role}s Found
//       </h3>
//       <p className="text-gray-500 mb-6">
//         You haven't added any {role}s yet. Start by creating your first {role} account.
//       </p>
//       <Link
//         href={`/role/${role}/add${companyId ? `?companyId=${companyId}` : ''}`}
//         className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
//       >
//         <Plus className="w-5 h-5" />
//         Add First {role}
//       </Link>
//     </div>
//   </div>
// );

const EmptyState = ({ role, companyId, canAdd }) => (
  <div className="text-center py-16 px-4">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
        <UserPlus className="w-12 h-12 text-blue-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No {role}s Found
      </h3>
      <p className="text-gray-500 mb-6">
        {canAdd
          ? `You haven't added any ${role}s yet. Start by creating your first ${role} account.`
          : `No ${role}s have been added yet.`
        }
      </p>
      {canAdd && (
        <Link
          href={`/role/${role}/add${companyId ? `?companyId=${companyId}` : ''}`}
          className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Add First {role}
        </Link>
      )}
    </div>
  </div>
);


const StatusBadge = ({ isActive }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${isActive
    ? 'bg-green-100 text-green-800'
    : 'bg-red-100 text-red-800'
    }`}>
    <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'
      }`}></div>
    {isActive ? 'Active' : 'Inactive'}
  </span>
);

const roleTitleMap = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  user: "User",
  cleaner: "Cleaner"
};

const roleIdMap = {
  superadmin: 1,
  admin: 2,
  supervisor: 3,
  user: 4,
  cleaner: 5
};

export default function RolePage() {

  useRequirePermission(MODULES.USERS);

  const { canView, canAdd, canUpdate, canDelete } = usePermissions();
  const canViewUsers = canView(MODULES.USERS);
  const canAddUsers = canAdd(MODULES.USERS);
  const canEditUsers = canUpdate(MODULES.USERS);
  const canDeleteUsers = canDelete(MODULES.USERS);

  const params = useParams();
  const router = useRouter();
  const role = params.role;
  const { companyId, hasCompanyContext } = useCompanyId();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const title = roleTitleMap[role] || "Unknown Role";
  const roleId = roleIdMap[role];

  // src/app/(protected)/role/[role]/page.jsx
  // Replace the fetchUsers function with this:

  // src/app/(protected)/role/[role]/page.jsx
  // Replace only the fetchUsers function:


  console.log("In role page")
  const fetchUsers = async () => {
    if (!roleId) return;

    setLoading(true);

    try {
      // ✅ Use the same API call as dashboard (getAllUsers)
      const response = await UsersApi.getAllUsers();
      if (response.success) {
        const allUsers = response.data || [];

        // ✅ Filter by role_id client-side (same logic as dashboard)
        const roleUsers = allUsers.filter(user => user.role_id === roleId);

        setUsers(roleUsers);
        setFilteredUsers(roleUsers);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
    setLoading(false);
  };


  // const handleDelete = async (id, userName) => {
  //   if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
  //     return;
  //   }

  //   const loadingToast = toast.loading('Deleting user...');
  //   try {
  //     const response = await UsersApi.deleteUser(id);
  //     if (response.success) {
  //       toast.success("User deleted successfully!", { id: loadingToast });
  //       fetchUsers(); // Refresh the list
  //     } else {
  //       toast.error(response.error, { id: loadingToast });
  //     }
  //   } catch (error) {
  //     toast.error('Failed to delete user', { id: loadingToast });
  //   }
  // };

  const handleDelete = async (id, userName) => {
    // ✅ Check permission before deleting
    if (!canDeleteUsers) {
      toast.error("You don't have permission to delete users"); 
      return;
    }

    if (!confirm(`Are you sure you want to delete ${userName}? This action cannot be undone.`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting user...');
    try {
      const response = await UsersApi.deleteUser(id);
      if (response.success) {
        toast.success("User deleted successfully!", { id: loadingToast });
        fetchUsers(); // Refresh the list
      } else {
        toast.error(response.error, { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete user', { id: loadingToast });
    }
  };

  useEffect(() => {

    if (roleId) {
      fetchUsers();
    }
  }, [roleId, companyId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  if (!roleId) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600">Invalid Role</h1>
        <p className="text-gray-600 mt-2">The role "{role}" is not recognized.</p>
        <Link
          href="/dashboard"
          className="mt-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 sm:p-6">
            {/* <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title} Management</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasCompanyContext
                      ? `Manage ${title.toLowerCase()}s for this company`
                      : `Manage all ${title.toLowerCase()}s`
                    }
                  </p>
                </div>
              </div>

              <Link
                href={`/role/${role}/add${companyId ? `?companyId=${companyId}` : ''}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Add {title}
              </Link>
            </div> */}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{title} Management</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {hasCompanyContext
                      ? `Manage ${title.toLowerCase()}s for this company`
                      : `Manage all ${title.toLowerCase()}s`
                    }
                  </p>
                </div>
              </div>

              {/* ✅ Only show Add button if user has ADD permission */}
              {canAddUsers && (
                <Link
                  href={`/role/${role}/add${companyId ? `?companyId=${companyId}` : ''}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" />
                  Add {title}
                </Link>
              )}
            </div>

          </div>

          {/* Search - Only show if there are users */}
          {users.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-lg shadow-sm border">
            {loading ? (
              <div className="p-6">
                <LoadingSkeleton />
              </div>
            ) : users.length === 0 ? (
              <EmptyState role={title.toLowerCase()} companyId={companyId} />
            ) : (
              <>
                {/* Table Header */}
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">
                    All {title}s
                    {searchTerm && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        ({filteredUsers.length} of {users.length})
                      </span>
                    )}
                  </h3>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Phone
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center">
                            <div className="text-gray-500">
                              <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                              <p className="font-medium">No {title.toLowerCase()}s found</p>
                              <p className="text-sm">Try adjusting your search terms</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((user, index) => (
                          <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <div className="text-sm font-medium text-gray-900">
                                  {user.name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <div className="text-sm text-gray-900">
                                  {user.email || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <div className="text-sm text-gray-900">
                                  {user.phone || 'N/A'}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge isActive={user.is_active !== false} />
                            </td>
                            {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/role/${role}/${user.id}${companyId ? `?companyId=${companyId}` : ''}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-3 h-3" />
                                  View
                                </Link>
                                <Link
                                  href={`/role/${role}/${user.id}/edit${companyId ? `?companyId=${companyId}` : ''}`}
                                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                                >
                                  <Edit className="w-3 h-3" />
                                  Edit
                                </Link>
                                <button
                                  onClick={() => handleDelete(user.id, user.name)}
                                  className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  Delete
                                </button>
                              </div>
                            </td> */}

                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex items-center gap-2">
                                {/* ✅ View button - always visible if user has VIEW permission */}
                                {canViewUsers && (
                                  <Link
                                    href={`/role/${role}/${user.id}${companyId ? `?companyId=${companyId}` : ''}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                  >
                                    <Eye className="w-3 h-3" />
                                    View
                                  </Link>
                                )}

                                {/* ✅ Edit button - only if user has UPDATE permission */}
                                {canEditUsers && (
                                  <Link
                                    href={`/role/${role}/${user.id}/edit${companyId ? `?companyId=${companyId}` : ''}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 transition-colors"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit
                                  </Link>
                                )}

                                {/* ✅ Delete button - only if user has DELETE permission */}
                                {canDeleteUsers && (
                                  <button
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                  </button>
                                )}
                              </div>
                            </td>

                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                {filteredUsers.length > 0 && (
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <p className="text-sm text-gray-700">
                        Showing {filteredUsers.length} of {users.length} {title.toLowerCase()}s
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className=" cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
