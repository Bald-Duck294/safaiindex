"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Search,
    Plus,
    Eye,
    Edit,
    Trash2,
    Filter,
    X,
    AlertTriangle,
    Building2,
    Phone,
    Mail,
    Calendar,
    CheckCircle,
    XCircle,
    Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi";

export default function FacilityCompaniesPage() {
    const router = useRouter();
    const { companyId } = useCompanyId();

    // State
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all"); // all, active, inactive
    const [showFilters, setShowFilters] = useState(false);

    // Modal states
    const [deleteModal, setDeleteModal] = useState({ show: false, company: null });
    const [statusModal, setStatusModal] = useState({ show: false, company: null });

    // Fetch companies
    const fetchCompanies = async () => {
        if (!companyId) return;

        setIsLoading(true);
        // Include inactive to show all
        const result = await FacilityCompanyApi.getAll(companyId, true);

        if (result.success) {
            setCompanies(result.data);
            setFilteredCompanies(result.data);
        } else {
            toast.error(result.error || "Failed to load facility companies");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchCompanies();
    }, [companyId]);

    // Filter and search
    useEffect(() => {
        let filtered = [...companies];

        // Status filter
        if (statusFilter === "active") {
            filtered = filtered.filter((c) => c.status === true);
        } else if (statusFilter === "inactive") {
            filtered = filtered.filter((c) => c.status === false);
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (c) =>
                    c.name?.toLowerCase().includes(query) ||
                    c.email?.toLowerCase().includes(query) ||
                    c.phone?.includes(query) ||
                    c.contact_person_name?.toLowerCase().includes(query)
            );
        }

        setFilteredCompanies(filtered);
    }, [searchQuery, statusFilter, companies]);

    // Handle delete
    const handleDeleteClick = (company) => {
        setDeleteModal({ show: true, company });
    };

    const confirmDelete = async () => {
        const { company } = deleteModal;
        if (!company) return;

        const result = await FacilityCompanyApi.delete(company.id);

        if (result.success) {
            toast.success("Facility company deleted successfully!");
            fetchCompanies();
            setDeleteModal({ show: false, company: null });
        } else {
            toast.error(result.error || "Failed to delete facility company");
        }
    };

    // Handle status toggle
    const handleStatusClick = (company) => {
        setStatusModal({ show: true, company });
    };

    // const confirmStatusToggle = async () => {
    //     const { company } = statusModal;
    //     if (!company) return;

    //     const result = await FacilityCompanyApi.toggleStatus(company.id);

    //     if (result.success) {
    //         toast.success(result.message || "Status updated successfully!");
    //         fetchCompanies();
    //         setStatusModal({ show: false, company: null });
    //     } else {
    //         toast.error(result.error || "Failed to update status");
    //     }
    // };

    // Format date


    const confirmStatusToggle = async () => {
        const { company } = statusModal;
        if (!company) return;

        const result = await FacilityCompanyApi.toggleStatus(company.id);

        if (result.success) {
            toast.success(result.message || "Status updated successfully!");

            // ✅ Update the state immediately without refetching
            setCompanies((prevCompanies) =>
                prevCompanies.map((c) =>
                    c.id === company.id ? { ...c, status: !c.status } : c
                )
            );

            setStatusModal({ show: false, company: null });
        } else {
            toast.error(result.error || "Failed to update status");
        }
    };


    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                                        Facility Companies
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                        Manage facility management companies
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/facility-company/add?companyId=${companyId}`)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Facility Company
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, phone..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg font-medium text-sm transition-colors ${showFilters
                                        ? "bg-blue-50 border-blue-300 text-blue-700"
                                        : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50"
                                        }`}
                                >
                                    <Filter className="w-4 h-4" />
                                    Filters
                                    {statusFilter !== "all" && (
                                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Filter Options */}
                        {showFilters && (
                            <div className="mt-4 pt-4 border-t border-slate-200">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => setStatusFilter("all")}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === "all"
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        All ({companies.length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("active")}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === "active"
                                            ? "bg-green-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        Active ({companies.filter((c) => c.status).length})
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("inactive")}
                                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${statusFilter === "inactive"
                                            ? "bg-red-600 text-white"
                                            : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                                            }`}
                                    >
                                        Inactive ({companies.filter((c) => !c.status).length})
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Results count */}
                        <div className="mt-3 text-sm text-slate-600">
                            Showing {filteredCompanies.length} of {companies.length} facility
                            companies
                        </div>
                    </div>

                    {/* Table/List */}
                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 flex flex-col items-center justify-center">
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                            <p className="text-slate-500">Loading facility companies...</p>
                        </div>
                    ) : filteredCompanies.length === 0 ? (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800 mb-2">
                                No facility companies found
                            </h3>
                            <p className="text-slate-500 mb-4">
                                {searchQuery
                                    ? "Try adjusting your search or filters"
                                    : "Get started by adding your first facility company"}
                            </p>
                            {!searchQuery && (
                                <button
                                    onClick={() => router.push(`facility-company/add?companyId=${companyId}`)}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Facility Company
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Desktop Table */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50 border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Name
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Contact
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Status
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Created At
                                            </th>
                                            <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {filteredCompanies.map((company) => (
                                            <tr
                                                key={company.id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-blue-100 rounded-lg">
                                                            <Building2 className="w-5 h-5 text-blue-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-slate-800">
                                                                {company.name}
                                                            </p>
                                                            <p className="text-xs text-slate-500">
                                                                {company.contact_person_name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="w-4 h-4 text-slate-400" />
                                                            {company.phone || "N/A"}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail className="w-4 h-4 text-slate-400" />
                                                            {company.email || "N/A"}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => handleStatusClick(company)}
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${company.status
                                                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                            : "bg-red-100 text-red-700 hover:bg-red-200"
                                                            }`}
                                                    >
                                                        {company.status ? (
                                                            <>
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Active
                                                            </>
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-3.5 h-3.5" />
                                                                Inactive
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {formatDate(company.created_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() =>
                                                                router.push(`/facility-company/${company.id}?companyId=${companyId}`)
                                                            }
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() =>
                                                                router.push(
                                                                    `/facility-company/${company.id}/edit?companyId=${companyId}`
                                                                )
                                                            }
                                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteClick(company)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-slate-200">
                                {filteredCompanies.map((company) => (
                                    <div key={company.id} className="p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 rounded-lg">
                                                    <Building2 className="w-5 h-5 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-slate-800">
                                                        {company.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500">
                                                        {company.contact_person_name}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleStatusClick(company)}
                                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${company.status
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {company.status ? (
                                                    <>
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-3 h-3" />
                                                        Inactive
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        <div className="space-y-2 mb-3">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                {company.phone || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                {company.email || "N/A"}
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                {formatDate(company.created_at)}
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() =>
                                                    router.push(`/facility-company/${company.id}?companyId=${companyId}`)
                                                }
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() =>
                                                    router.push(`/facility-company/${company.id}/edit?companyId=${companyId}`)
                                                }
                                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors text-sm font-medium"
                                            >
                                                <Edit className="w-4 h-4" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(company)}
                                                className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">
                                Delete Facility Company
                            </h3>
                        </div>

                        <p className="text-slate-600 mb-6">
                            Are you sure you want to delete{" "}
                            <span className="font-semibold">{deleteModal.company?.name}</span>
                            ? This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, company: null })}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Toggle Confirmation Modal */}
            {statusModal.show && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div
                                className={`p-3 rounded-full ${statusModal.company?.status
                                    ? "bg-red-100"
                                    : "bg-green-100"
                                    }`}
                            >
                                {statusModal.company?.status ? (
                                    <XCircle className="w-6 h-6 text-red-600" />
                                ) : (
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                )}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-800">
                                {statusModal.company?.status ? "Deactivate" : "Activate"}{" "}
                                Company
                            </h3>
                        </div>

                        <p className="text-slate-600 mb-6">
                            Are you sure you want to{" "}
                            {statusModal.company?.status ? "deactivate" : "activate"}{" "}
                            <span className="font-semibold">{statusModal.company?.name}</span>
                            ?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStatusModal({ show: false, company: null })}
                                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmStatusToggle}
                                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium ${statusModal.company?.status
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                {statusModal.company?.status ? "Deactivate" : "Activate"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
