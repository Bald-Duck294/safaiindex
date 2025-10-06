// src/app/(protected)/role/[role]/[id]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
import { CompanyApi } from "@/lib/api/companyApi";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';

import { ArrowLeft, Save, X, Loader2 } from "lucide-react";

const roleTitleMap = {
  superadmin: "Superadmin",
  admin: "Admin",
  supervisor: "Supervisor",
  user: "User"
};

export default function EditUserPage() {
  const params = useParams();
  const router = useRouter();
  const { role, id } = params;
  const { companyId } = useCompanyId();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company_id: '',
    age: '',
    birthdate: ''
  });

  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const title = roleTitleMap[role] || "User";

  useEffect(() => {
    fetchCompanies();
    fetchUser();
  }, [id]);

  const fetchCompanies = async () => {
    try {
      const response = await CompanyApi.getAllCompanies();
      if (response.success) {
        setCompanies(response.data || []);
      }
    } catch (error) {
      toast.error('Error fetching companies');
    }
  };

  const fetchUser = async () => {
    setDataLoading(true);
    try {
      const response = await UsersApi.getUserById(id);
      if (response.success) {
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || '',
          company_id: user.company_id || '',
          age: user.age || '',
          birthdate: user.birthdate ? user.birthdate.split('T')[0] : ''
        });
      } else {
        toast.error(response.error);
        router.push(`/role/${role}`);
      }
    } catch (error) {
      toast.error('Failed to fetch user details');
      router.push(`/role/${role}`);
    }
    setDataLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }

    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    setIsLoading(true);

    try {
      const submitData = {
        ...formData,
        company_id: formData.company_id || null,
        age: formData.age ? parseInt(formData.age) : null,
        birthdate: formData.birthdate || null
      };

      const response = await UsersApi.updateUser(id, submitData);

      if (response.success) {
        toast.success(`${title} updated successfully!`);
        setTimeout(() => {
          router.push(`/role/${role}/${id}${companyId ? `?companyId=${companyId}` : ''}`);
        }, 1500);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Failed to update user');
    }
    setIsLoading(false);
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <Link
                href={`/role/${role}/${id}${companyId ? `?companyId=${companyId}` : ''}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit {title}</h1>
                <p className="text-sm text-gray-500 mt-1">
                  Update {title.toLowerCase()} information
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company
                  </label>
                  <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Company</option>
                    {companies.map(company => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="18"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter age"
                  />
                </div>
                
                {/* 
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    name="birthdate"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div> */}
              </div>

              {/* Role Display */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-gray-900 font-medium">{title}</span>
                  <p className="text-xs text-gray-500 mt-1">Role cannot be changed</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Update {title}
                    </>
                  )}
                </button>
                <Link
                  href={`/role/${role}/${id}${companyId ? `?companyId=${companyId}` : ''}`}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
