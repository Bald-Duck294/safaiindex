"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompanyApi } from "../../../lib/api/companyApi";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, Eye, ArrowLeft, Download } from "lucide-react";
import Loader from '@/components/ui/Loader'; // ✅ Import universal Loader

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true); // ✅ Start with true
  const [hasInitialized, setHasInitialized] = useState(false);

  // Sort state management
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const router = useRouter();

  // ✅ Date formatting function
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  // ✅ Enhanced fetchCompanies with proper error handling
  const fetchCompanies = async () => {
    try {
      console.log('Fetching companies...');
      const response = await CompanyApi.getAllCompanies();
      console.log('Companies API response:', response);

      if (response.success) {
        // ✅ Handle different response structures
        const companiesData = response.data?.data || response.data || [];
        console.log('Companies data:', companiesData);
        
        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } else {
        console.error('Companies API error:', response.error);
        toast.error(response.error || "Failed to fetch companies");
        setCompanies([]);
        setFilteredCompanies([]);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Error fetching companies");
      setCompanies([]);
      setFilteredCompanies([]);
    } finally {
      setIsLoading(false);
      setHasInitialized(true);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  // ✅ Search effect (working fine)
  useEffect(() => {
    const results = companies.filter(company =>
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(results);
  }, [searchTerm, companies]);

  // ✅ Enhanced sorting function with date support
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...filteredCompanies].sort((a, b) => {
      let aValue, bValue;

      switch (key) {
        case 'serial':
          aValue = filteredCompanies.indexOf(a) + 1;
          bValue = filteredCompanies.indexOf(b) + 1;
          break;
        case 'name':
          aValue = a.name?.toLowerCase() || '';
          bValue = b.name?.toLowerCase() || '';
          break;
        case 'email':
          aValue = a.contact_email?.toLowerCase() || '';
          bValue = b.contact_email?.toLowerCase() || '';
          break;
        case 'status':
          aValue = a.status ? 1 : 0;
          bValue = b.status ? 1 : 0;
          break;
        case 'created_at':
        case 'updated_at':
          aValue = new Date(a[key] || 0);
          bValue = new Date(b[key] || 0);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredCompanies(sortedData);
    setSortConfig({ key, direction });
  };

  // Get sort indicator
  const getSortIndicator = (columnKey) => {
    if (sortConfig.key === columnKey) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  // Toggle status function
  const handleStatusToggle = async (companyId, currentStatus) => {
    const toastId = toast.loading("Updating status...");
    try {
      const response = await CompanyApi.updateCompanyStatus(companyId, !currentStatus);
      if (response.success) {
        const updatedCompanies = companies.map(company =>
          company.id === companyId
            ? { ...company, status: !currentStatus }
            : company
        );
        setCompanies(updatedCompanies);
        toast.success(`Status updated to ${!currentStatus ? 'Active' : 'Inactive'}!`, { id: toastId });
      } else {
        toast.error(response.error || "Failed to update status.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error updating status.", { id: toastId });
    }
  };

  const handleDelete = async (id) => {
    toast((t) => (
      <div className="flex flex-col items-center gap-2">
        <p className="font-semibold">Are you sure you want to delete this company?</p>
        <div className="flex gap-4">
          <button
            onClick={() => {
              toast.dismiss(t.id);
              performDelete(id);
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const performDelete = async (id) => {
    const toastId = toast.loading("Deleting company...");
    try {
      const response = await CompanyApi.deleteCompany(id);
      if (response.success) {
        toast.success("Company deleted successfully!", { id: toastId });
        fetchCompanies();
      } else {
        toast.error(response.error || "Failed to delete company.", { id: toastId });
      }
    } catch (error) {
      toast.error("Error deleting company.", { id: toastId });
    }
  };

  // ✅ Enhanced export function with date columns
  const handleExport = () => {
    const headers = ['Sr. No.', 'Organization Name', 'Contact Email', 'Status', 'Created At', 'Updated At'];
    const csvContent = [
      headers.join(','),
      ...filteredCompanies.map((company, index) => [
        index + 1,
        `"${company.name || ''}"`,
        `"${company.contact_email || ''}"`,
        company.status ? 'Active' : 'Inactive',
        `"${formatDate(company.created_at)}"`,
        `"${formatDate(company.updated_at)}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Companies exported successfully!");
  };

  const handleViewCompany = (companyId) => {
    router.push(`/clientDashboard/${companyId}`);
  };

  // ✅ Loading state with Loader component
  if (isLoading || !hasInitialized) {
    return (
      <>
        <Toaster position="top-center" />
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Organizations List</h1>
            </div>
            <div className="flex justify-center items-center h-64">
              <Loader 
                size="large" 
                color="#3b82f6" 
                message="Loading organizations..." 
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Organizations List</h1>
                <p className="text-sm text-gray-600">Manage and view all organizations</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download size={18} />
                Export CSV
              </button>
              <Link href="/companies/add">
                <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                  <Plus size={18} />
                  Add Organization
                </span>
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                <ArrowLeft size={18} />
                Back
              </button>
            </div>
          </div>

          {/* ✅ Debug Info (remove in production) */}
          {/* <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-yellow-800">
                Debug Info (Click to expand)
              </summary>
              <div className="mt-2 text-xs text-yellow-700">
                <p>Total companies: {companies.length}</p>
                <p>Filtered companies: {filteredCompanies.length}</p>
                <p>Search term: "{searchTerm}"</p>
                <p>Entries per page: {entriesPerPage}</p>
              </div>
            </details>
          </div> */}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Show</span>
              <select
                value={entriesPerPage}
                onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by name or email..."
              />
            </div>
          </div>

          {/* ✅ Companies Table with Date Columns */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th
                      onClick={() => handleSort('serial')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Sr. No. {getSortIndicator('serial')}
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Organization Name {getSortIndicator('name')}
                    </th>
                    <th
                      onClick={() => handleSort('email')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Contact Email {getSortIndicator('email')}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Status {getSortIndicator('status')}
                    </th>
                    <th
                      onClick={() => handleSort('created_at')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Created At {getSortIndicator('created_at')}
                    </th>
                    <th
                      onClick={() => handleSort('updated_at')}
                      className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Updated At {getSortIndicator('updated_at')}
                    </th>
                    <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCompanies.length > 0 ? (
                    filteredCompanies.slice(0, entriesPerPage).map((company, index) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-3 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleViewCompany(company.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                          >
                            {company.name || 'N/A'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-sm text-gray-600">
                          {company.contact_email || 'N/A'}
                        </td>
                        <td className="px-3 py-3">
                          <button
                            onClick={() => handleStatusToggle(company.id, company.status)}
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 hover:scale-105 ${
                              company.status
                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                            title={`Click to ${company.status ? 'deactivate' : 'activate'}`}
                          >
                            {company.status ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {formatDate(company.created_at)}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-500">
                          {formatDate(company.updated_at)}
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewCompany(company.id)}
                              className="p-1 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                              title="View Company Dashboard"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => router.push(`/companies/${company.id}`)}
                              className="p-1 text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
                              title="Edit Company"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(company.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Company"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-12 text-gray-500">
                        <div className="flex flex-col items-center">
                          <Plus className="w-12 h-12 text-gray-300 mb-3" />
                          <p className="font-medium text-lg">No organizations found</p>
                          <p className="text-sm mb-4">
                            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first organization'}
                          </p>
                          {!searchTerm && (
                            <Link href="/companies/add">
                              <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                                <Plus size={18} />
                                Add First Organization
                              </span>
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {filteredCompanies.length > 0 && (
              <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-3 bg-gray-50 border-t text-sm text-gray-700">
                <span>
                  Showing 1 to {Math.min(entriesPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
                  {searchTerm && ` (filtered from ${companies.length} total)`}
                </span>
                <div className="flex gap-2 mt-2 sm:mt-0">
                  <button 
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    disabled={true}
                  >
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
                  <button 
                    className="px-3 py-1 border rounded text-sm hover:bg-gray-100 disabled:opacity-50"
                    disabled={filteredCompanies.length <= entriesPerPage}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
