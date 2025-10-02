// "use client";

// import { useState, useEffect } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { CompanyApi } from "../../../lib/api/companyApi";
// import toast, { Toaster } from "react-hot-toast";
// import { Plus, Edit, Trash2, Eye, ArrowLeft, Download } from "lucide-react";

// // Skeleton Loader Component
// const TableRowSkeleton = () => (
//   <tr className="animate-pulse">
//     <td className="p-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
//     <td className="p-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
//     <td className="p-3"><div className="h-6 bg-slate-200 rounded w-20"></div></td>
//     <td className="p-3"><div className="h-8 bg-slate-200 rounded w-24"></div></td>
//   </tr>
// );

// export default function CompaniesPage() {
//   const [companies, setCompanies] = useState([]);
//   const [filteredCompanies, setFilteredCompanies] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [entriesPerPage, setEntriesPerPage] = useState(10);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   const fetchCompanies = async () => {
//     setIsLoading(true);
//     try {
//       const response = await CompanyApi.getAllCompanies();
//       if (response.success) {
//         setCompanies(response.data);
//         setFilteredCompanies(response.data);
//       } else {
//         toast.error(response.error || "Failed to fetch companies.");
//       }
//     } catch (error) {
//       toast.error("Error fetching companies.");
//     }
//     setIsLoading(false);
//   };

//   useEffect(() => {
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     const results = companies.filter(company =>
//       company.name.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//     setFilteredCompanies(results);
//   }, [searchTerm, companies]);

//   const handleDelete = async (id) => {
//     toast((t) => (
//       <div className="flex flex-col items-center gap-2">
//         <p className="font-semibold">Are you sure you want to delete this company?</p>
//         <div className="flex gap-4">
//           <button
//             onClick={() => {
//               toast.dismiss(t.id);
//               performDelete(id);
//             }}
//             className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
//           >
//             Delete
//           </button>
//           <button
//             onClick={() => toast.dismiss(t.id)}
//             className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300"
//           >
//             Cancel
//           </button>
//         </div>
//       </div>
//     ), { duration: 6000 });
//   };

//   const performDelete = async (id) => {
//     const toastId = toast.loading("Deleting company...");
//     try {
//       const response = await CompanyApi.deleteCompany(id);
//       if (response.success) {
//         toast.success("Company deleted successfully!", { id: toastId });
//         fetchCompanies();
//       } else {
//         toast.error(response.error || "Failed to delete company.", { id: toastId });
//       }
//     } catch (error) {
//       toast.error("Error deleting company.", { id: toastId });
//     }
//   };

//   const handleExport = () => {
//     // Create CSV content
//     const headers = ['Sr. No.', 'Client Name', 'Status'];
//     const csvContent = [
//       headers.join(','),
//       ...filteredCompanies.map((company, index) => [
//         index + 1,
//         `"${company.name}"`,
//         company.status ? 'Active' : 'Inactive'
//       ].join(','))
//     ].join('\n');

//     // Create and download file
//     const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//     const link = document.createElement('a');
//     const url = URL.createObjectURL(blob);
//     link.setAttribute('href', url);
//     link.setAttribute('download', `companies_${new Date().toISOString().split('T')[0]}.csv`);
//     link.style.visibility = 'hidden';
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);

//     toast.success("Companies exported successfully!");
//   };

//   const handleViewCompany = (companyId) => {
//     // Navigate to client dashboard for the specific company
//     router.push(`/clientDashboard/${companyId}`);
//   };

//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => router.back()}
//                 className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
//               <h1 className="text-2xl font-bold text-gray-900">Client List</h1>
//             </div>
//             <div className="flex gap-3">
//               <button
//                 onClick={handleExport}
//                 className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
//               >
//                 <Download size={18} />
//                 Export
//               </button>
//               <Link href="/companies/add">
//                 <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
//                   <Plus size={18} />
//                   Add Company
//                 </span>
//               </Link>
//               <button
//                 onClick={() => router.back()}
//                 className="inline-flex items-center gap-2 px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
//               >
//                 Back
//               </button>
//             </div>
//           </div>

//           {/* Controls */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-600">Show</span>
//               <select
//                 value={entriesPerPage}
//                 onChange={(e) => setEntriesPerPage(Number(e.target.value))}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               >
//                 <option value={10}>10</option>
//                 <option value={25}>25</option>
//                 <option value={50}>50</option>
//               </select>
//               <span className="text-sm text-gray-600">entries</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-sm text-gray-600">Search:</span>
//               <input
//                 type="text"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 placeholder=""
//               />
//             </div>
//           </div>

//           {/* Companies Table */}
//           <div className="bg-white rounded-lg shadow overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                       Sr. No. ↕
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                       Client Name ↕
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                       Status ↕
//                     </th>
//                     <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100">
//                       Action ↕
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-gray-200">
//                   {isLoading ? (
//                     Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
//                   ) : filteredCompanies.length > 0 ? (
//                     filteredCompanies.slice(0, entriesPerPage).map((company, index) => (
//                       <tr key={company.id} className="hover:bg-gray-50">
//                         <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
//                         <td className="px-4 py-3">
//                           <button
//                             onClick={() => handleViewCompany(company.id)}
//                             className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
//                           >
//                             {company.name}
//                           </button>
//                         </td>
//                         <td className="px-4 py-3">
//                           <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${company.status
//                             ? 'bg-blue-100 text-blue-800'
//                             : 'bg-red-100 text-red-800'
//                             }`}>
//                             {company.status ? 'Active' : 'Inactive'}
//                           </span>
//                         </td>
//                         <td className="px-4 py-3">
//                           <div className="flex items-center gap-2">
//                             <button
//                               onClick={() => handleViewCompany(company.id)}
//                               className="p-1 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
//                               title="View Company Dashboard "
//                             >
//                               <Eye size={16} />
//                             </button>
//                             <button
//                               onClick={() => router.push(`/companies/${company.id}/edit`)}
//                               className="p-1 text-gray-600 hover:text-green-600 transition-colors cursor-pointer"
//                               title="Edit Company"
//                             >
//                               <Edit size={16} />
//                             </button>
//                             <button
//                               onClick={() => handleDelete(company.id)}
//                               className="p-1 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
//                               title="Delete Company"
//                             >
//                               <Trash2 size={16} />
//                             </button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="4" className="text-center py-8 text-gray-500">
//                         <p className="font-medium">No data available in table</p>
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>

//             {/* Pagination Info */}
//             {!isLoading && filteredCompanies.length > 0 && (
//               <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t text-sm text-gray-700">
//                 <span>
//                   Showing 1 to {Math.min(entriesPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
//                 </span>
//                 <div className="flex gap-2">
//                   <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Previous</button>
//                   <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
//                   <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Next</button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CompanyApi } from "../../../lib/api/companyApi";
import toast, { Toaster } from "react-hot-toast";
import { Plus, Edit, Trash2, Eye, ArrowLeft, Download } from "lucide-react";

// Skeleton Loader Component
const TableRowSkeleton = () => (
  <tr className="animate-pulse">
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-8"></div></td>
    <td className="p-3"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
    <td className="p-3"><div className="h-6 bg-slate-200 rounded w-20"></div></td>
    <td className="p-3"><div className="h-8 bg-slate-200 rounded w-24"></div></td>
  </tr>
);

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);

  // Sort state management
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc'
  });

  const router = useRouter();

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await CompanyApi.getAllCompanies();
      if (response.success) {
        setCompanies(response.data);
        setFilteredCompanies(response.data);
      } else {
        toast.error(response.error || "Failed to fetch companies.");
      }
    } catch (error) {
      toast.error("Error fetching companies.");
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    const results = companies.filter(company =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCompanies(results);
  }, [searchTerm, companies]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sortedData = [...filteredCompanies].sort((a, b) => {
      let aValue, bValue;

      switch (key) {
        case 'serial':
          // For serial number, use index + 1
          aValue = filteredCompanies.indexOf(a) + 1;
          bValue = filteredCompanies.indexOf(b) + 1;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'status':
          aValue = a.status ? 1 : 0; // Active = 1, Inactive = 0
          bValue = b.status ? 1 : 0;
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
      // Call API to update status
      const response = await CompanyApi.updateCompanyStatus(companyId, !currentStatus);
      if (response.success) {
        // Update local state
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

  const handleExport = () => {
    const headers = ['Sr. No.', 'Client Name', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredCompanies.map((company, index) => [
        index + 1,
        `"${company.name}"`,
        company.status ? 'Active' : 'Inactive'
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
              <h1 className="text-2xl font-bold text-gray-900">Orgnizations List</h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
              >
                <Download size={18} />
                Export
              </button>
              <Link href="/companies/add">
                <span className="inline-flex items-center gap-2 px-4 py-2 font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors cursor-pointer">
                  <Plus size={18} />
                  Add Orgnizations
                </span>
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 px-4 py-2 font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Back
              </button>
            </div>
          </div>

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
              </select>
              <span className="text-sm text-gray-600">entries</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Search:</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=""
              />
            </div>
          </div>

          {/* Companies Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th
                      onClick={() => handleSort('serial')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Sr. No. {getSortIndicator('serial')}
                    </th>
                    <th
                      onClick={() => handleSort('name')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Orgnization Name {getSortIndicator('name')}
                    </th>
                    <th
                      onClick={() => handleSort('status')}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                    >
                      Status {getSortIndicator('status')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} />)
                  ) : filteredCompanies.length > 0 ? (
                    filteredCompanies.slice(0, entriesPerPage).map((company, index) => (
                      <tr key={company.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleViewCompany(company.id)}
                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                          >
                            {company.name}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handleStatusToggle(company.id, company.status)}
                            className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 hover:scale-105 ${company.status
                              ? 'bg-green-100 text-green-800 hover:bg-green-200'
                              : 'bg-red-100 text-red-800 hover:bg-red-200'
                              }`}
                            title={`Click to ${company.status ? 'deactivate' : 'activate'}`}
                          >
                            {company.status ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
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
                            {/* <button
                              onClick={() => handleDelete(company.id)}
                              className="p-1 text-gray-600 hover:text-red-600 transition-colors cursor-pointer"
                              title="Delete Company"
                            >
                              <Trash2 size={16} />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-500">
                        <p className="font-medium">No data available in table</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Info */}
            {!isLoading && filteredCompanies.length > 0 && (
              <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t text-sm text-gray-700">
                <span>
                  Showing 1 to {Math.min(entriesPerPage, filteredCompanies.length)} of {filteredCompanies.length} entries
                </span>
                <div className="flex gap-2">
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Previous</button>
                  <button className="px-3 py-1 bg-blue-500 text-white rounded text-sm">1</button>
                  <button className="px-3 py-1 border rounded text-sm hover:bg-gray-100">Next</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

