"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RegisteredUsersApi } from '@/lib/api/registeredUsersApi';
import { CompanyApi } from '@/lib/api/companyApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { ArrowLeft } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function AddRegisteredUserPage() {
  const [formData, setFormData] = useState({
    company_id: '',
    name: '',
    phone: '',
    role: 'guard'
  });
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { companyId } = useCompanyId();
  const router = useRouter();

  const roles = [
    { value: 'guard', label: 'Guard' },
    { value: 'ranger', label: 'Ranger' },
    { value: 'acf', label: 'ACF' },
    { value: 'admin', label: 'Admin' }
  ];

  useEffect(() => {
    fetchCompanies();
    if (companyId) {
      setFormData(prev => ({ ...prev, company_id: companyId }));
    }
  }, [companyId]);

  const fetchCompanies = async () => {
    try {
      const response = await CompanyApi.getAllCompanies();
      if (response.success) {
        setCompanies(response.data);
      }
    } catch (error) {
      toast.error('Error fetching companies');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await RegisteredUsersApi.createRegisteredUser(formData);
      if (response.success) {
        toast.success('Registered user added successfully!');
        setTimeout(() => {
          router.push('/registered-users');
        }, 1500);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Error adding registered user');
    }
    setIsLoading(false);
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Add Registered User</h1>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleChange}
                  required
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

              {/* Name */}
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

              {/* Phone */}
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

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                  {isLoading ? 'Adding...' : 'Add Registered User'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

