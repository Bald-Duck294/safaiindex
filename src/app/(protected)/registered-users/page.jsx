"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RegisteredUsersApi } from '@/lib/api/registeredUsersApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
    <td className="p-3"><div className="h-6 bg-slate-200 rounded w-20"></div></td>
    <td className="p-3"><div className="h-8 bg-slate-200 rounded w-24"></div></td>
  </tr>
);

export default function RegisteredUsersPage() {
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { companyId } = useCompanyId();
  const router = useRouter();

  const fetchRegisteredUsers = async () => {
    setIsLoading(true);
    try {
      const response = await RegisteredUsersApi.getAllRegisteredUsers(companyId);
      if (response.success) {
        setRegisteredUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Error fetching registered users');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchRegisteredUsers();
  }, [companyId]);

  useEffect(() => {
    console.log(registeredUsers, "Above if  else stamtent")

    if (registeredUsers) {
      console.log(registeredUsers, "from else stamtent")
    }
    const results = (registeredUsers) ? registeredUsers?.data?.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone.includes(searchTerm) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ) : [];
    // console.log(results, "results  from registerd users")
    setFilteredUsers(results);
  }, [searchTerm, registeredUsers]);

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Registered Users</h1>
            </div>
            <Link href={`/registered-users/add?companyId=${companyId}`}>
              <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                <Plus size={18} />
                Add Registered User
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name, phone, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full max-w-md"
            />
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sr. No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-medium">{user.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 capitalize">{user.role}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.is_verified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {user.is_verified ? 'Verified' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/registered-users/${user.id}`)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/registered-users/${user.id}/edit`)}
                              className="p-1 text-gray-600 hover:text-green-600 transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-gray-500">
                        <p className="font-medium">No registered users found</p>
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

