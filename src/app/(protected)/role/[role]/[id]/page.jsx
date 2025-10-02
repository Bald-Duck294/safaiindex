// src/app/(protected)/role/[role]/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';

import {
  ArrowLeft,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  Building,
  Shield,
  MapPin,
  Clock,
  Loader2
} from "lucide-react";

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="bg-white rounded-lg shadow border p-6">
      <div className="space-y-6">
        <div className="h-8 bg-gray-300 rounded w-64"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const roleTitleMap = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  user: "User"
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { role, id } = params;
  // const { companyId } = useCompanyId();
  const { companyId, hasCompanyContext } = useCompanyId(); // ✅ No Suspense needed!


  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const title = roleTitleMap[role] || "User";

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await UsersApi.getUserById(id);
      if (response.success) {
        setUser(response.data);
      } else {
        toast.error(response.error);
        router.push(`/role/${role}`);
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
      router.push(`/role/${role}`);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${user?.name}? This action cannot be undone.`)) {
      return;
    }

    const loadingToast = toast.loading('Deleting user...');
    try {
      const response = await UsersApi.deleteUser(id);
      if (response.success) {
        toast.success("User deleted successfully!", { id: loadingToast });
        router.push(`/role/${role}`);
      } else {
        toast.error(response.error, { id: loadingToast });
      }
    } catch (error) {
      toast.error('Failed to delete user', { id: loadingToast });
    }
  };

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleText = (roleId) => {
    const roleMap = {
      1: 'Superadmin',
      2: 'Admin',
      3: 'Supervisor',
      4: 'User'
    };
    return roleMap[roleId] || 'Unknown';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The user you're looking for doesn't exist.</p>
          <Link
            href={`/role/${role}`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to {title} List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Link
                  href={`/role/${role}${companyId ? `?companyId=${companyId}` : ''}`}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {title} Details
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Link
                  href={`/role/${role}/${id}/edit${companyId ? `?companyId=${companyId}` : ''}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Edit className="w-4 h-4" />
                  Edit User
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete User
                </button>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">User Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Full Name
                  </label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{user.name}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Email Address
                  </label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.email || 'Not provided'}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phone Number
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.phone || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    User ID
                  </label>
                  <span className="text-gray-900 font-mono">#{user.id}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Role
                  </label>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="inline-flex px-2.5 py-1.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getRoleText(user.role_id)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Company ID
                  </label>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{user.company_id || 'Not assigned'}</span>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Age
                  </label>
                  <span className="text-gray-900">{user.age || 'Not provided'}</span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Birth Date
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(user.birthdate)}</span>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Created At
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(user.created_at)}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Last Updated
                  </label>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900">{formatDate(user.updated_at)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
