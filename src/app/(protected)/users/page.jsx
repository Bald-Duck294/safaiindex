"use client";

import { useState, useEffect, useCallback } from "react";
// import Link from "next/link"; // Replaced with standard <a> tag
// import { useRouter } from "next/navigation"; // Replaced with window.location
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, Users, Search, Eye } from "lucide-react";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
// import { useSelector } from "react-redux"; // Replaced with a placeholder

// Skeleton Loader Component for table rows
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    {[...Array(5)].map((_, i) => (
      <td key={i} className="p-4"><div className="h-4 bg-slate-200 rounded"></div></td>
    ))}
  </tr>
);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // const router = useRouter(); // Replaced with window.location

  // --- MOCK USER DATA ---
  // FIXME: Replace this with your actual user state management (e.g., Redux, Context API)
  // const [currentUser, setCurrentUser] = useState({
  //     company_id: '1' // Default company_id for demonstration
  // });
  // const companyId = currentUser?.company_id;
  const { companyId } = useCompanyId();
  // Fetches users based on the logged-in user's company
  const fetchUsers = useCallback(async () => {
    if (!companyId) {
      setIsLoading(false);
      toast.error("Could not determine your company.");
      return;
    };

    setIsLoading(true);
    const response = await UsersApi.getAllUsers(companyId);
    if (response.success) {
      setUsers(response.data);
      setFilteredUsers(response.data);
    } else {
      toast.error(response.error || "Failed to fetch users.");
    }
    setIsLoading(false);
  }, [companyId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filters users based on search term
  useEffect(() => {
    const results = users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(results);
  }, [searchTerm, users]);

  // Handles the deletion confirmation and action
  const handleDelete = (id) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-4 p-4">
        <p className="font-semibold text-center">Are you sure you want to delete this user?</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
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
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Manage Users</h1>
            </div>
            <a href={`/users/add?companyId=${companyId}`} className="inline-flex items-center gap-2 px-4 py-2 font-semibold text-white bg-indigo-600 rounded-lg shadow-md hover:bg-indigo-700 transition-transform transform hover:scale-105 cursor-pointer">
              <Plus size={20} />
              Add User
            </a>
          </div>

          {/* Search Bar */}
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                    {/* <th className="p-4 text-sm font-semibold text-slate-600 hidden md:table-cell">Assigned Locations</th> */}
                    <th className="p-4 text-sm font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                        <td className="p-4 text-slate-600">{user.email || 'N/A'}</td>
                        <td className="p-4 text-slate-600">
                          <span className="px-2 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
                            {user.role?.name || 'No Role'}
                          </span>
                        </td>
                        {/* <td className="p-4 text-slate-600 hidden md:table-cell">
                          {user.location_assignments && user.location_assignments.length > 0
                            ? user.location_assignments.map(a => a.location.name).join(', ')
                            : 'None'
                          }
                        </td> */}
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <button onClick={() => navigateTo(`/users/view`)} className="p-2 text-green-600 bg-green-100 rounded-md hover:bg-green-200 transition">
                              <Eye size={16} />
                            </button>
                            <button onClick={() => navigateTo(`/users/${user.id}`)} className="p-2 text-sky-600 bg-sky-100 rounded-md hover:bg-sky-200 transition">
                              <Edit size={16} />
                            </button>
                            {/* <button onClick={() => handleDelete(user.id)} className="p-2 text-red-600 bg-red-100 rounded-md hover:bg-red-200 transition">
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-16 text-slate-500">
                        <p className="font-semibold text-lg">No users found</p>
                        <p>Click "Add User" to get started.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

