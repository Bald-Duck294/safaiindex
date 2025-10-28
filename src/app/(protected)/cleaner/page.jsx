"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Users, Mail, Phone, Calendar, MapPin, Eye, Edit, Trash2, AlertTriangle, ArrowLeft, UserCheck, UserPlus, Search, Filter, ToggleLeft, ToggleRight } from "lucide-react";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function CleanersPage() {
    const [assignments, setAssignments] = useState([]);
    const [filteredAssignments, setFilteredAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ open: false, assignment: null });
    const [deleting, setDeleting] = useState(false);
    const [togglingStatus, setTogglingStatus] = useState(null); // ✅ Track which assignment is being toggled
    const [statusModal, setStatusModal] = useState({ open: false, assignment: null });

    // Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const router = useRouter();
    const searchParams = useSearchParams();
    const { companyId } = useCompanyId();

    const locationId = searchParams.get('locationId');
    const locationName = searchParams.get('locationName');

    useEffect(() => {
        if (!locationId || !companyId) {
            console.log('Missing locationId or companyId');
            setLoading(false);
            return;
        }

        fetchAssignments();
    }, [locationId, companyId]);

    // Apply filters
    useEffect(() => {
        let filtered = [...assignments];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(assignment => {
                const cleanerName = assignment.cleaner_user?.name?.toLowerCase() || '';
                const cleanerEmail = assignment.cleaner_user?.email?.toLowerCase() || '';
                const cleanerPhone = assignment.cleaner_user?.phone?.toLowerCase() || '';

                return cleanerName.includes(query) ||
                    cleanerEmail.includes(query) ||
                    cleanerPhone.includes(query);
            });
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter(assignment =>
                assignment.status?.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        setFilteredAssignments(filtered);
    }, [searchQuery, statusFilter, assignments]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {
            const response = await AssignmentsApi.getAssignmentsByLocation(locationId, companyId);

            if (response.success) {
                setAssignments(response.data);
                setFilteredAssignments(response.data);
            } else {
                toast.error(response.error || "Failed to fetch assignments");
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
            toast.error("Failed to fetch assignments");
        } finally {
            setLoading(false);
        }
    };

    const handleView = (assignmentId) => {
        router.push(`/cleaner/${assignmentId}?companyId=${companyId}&locationId=${locationId}`);
    };

    const handleEdit = (assignmentId) => {
        router.push(`/cleaner/${assignmentId}/edit?companyId=${companyId}&locationId=${locationId}`);
    };

    const handleAddCleaner = () => {
        router.push(`/cleaner/add?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`);
    };

    // ✅ Toggle Status Handler
    const handleToggleStatus = async (assignment) => {
        setTogglingStatus(assignment.id);

        try {
            const currentStatus = assignment.status?.toLowerCase() || 'unassigned';
            const newStatus = currentStatus === 'assigned' ? 'unassigned' : 'assigned';

            console.log(`Toggling status from ${currentStatus} to ${newStatus}`);

            const updateData = {
                status: newStatus,
            };

            const response = await AssignmentsApi.updateAssignment(assignment.id, updateData);

            if (response.success) {
                toast.success(`Status changed to ${newStatus}`);

                // Update the assignment in the list
                setAssignments(prevAssignments =>
                    prevAssignments.map(a =>
                        a.id === assignment.id ? { ...a, status: newStatus } : a
                    )
                );
            } else {
                toast.error(response.error || "Failed to update status");
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            toast.error("Failed to update status");
        } finally {
            setTogglingStatus(null);
        }
    };


    const confirmStatusToggle = async () => {
        if (!statusModal.assignment) return;

        const assignment = statusModal.assignment;
        setTogglingStatus(assignment.id);

        try {
            const currentStatus = assignment.status?.toLowerCase() || 'unassigned';
            const newStatus = currentStatus === 'assigned' ? 'unassigned' : 'assigned';

            console.log(`Toggling status from ${currentStatus} to ${newStatus}`);

            const updateData = {
                status: newStatus,
            };

            const response = await AssignmentsApi.updateAssignment(assignment.id, updateData);

            if (response.success) {
                toast.success(`Status changed to ${newStatus}`);

                setAssignments(prevAssignments =>
                    prevAssignments.map(a =>
                        a.id === assignment.id ? { ...a, status: newStatus } : a
                    )
                );

                // Close modal
                setStatusModal({ open: false, assignment: null });
            } else {
                toast.error(response.error || "Failed to update status");
            }
        } catch (error) {
            console.error('Toggle status error:', error);
            toast.error("Failed to update status");
        } finally {
            setTogglingStatus(null);
        }
    };

    const handleDelete = (assignment) => {
        setDeleteModal({ open: true, assignment });
    };

    const confirmDelete = async () => {
        if (!deleteModal.assignment) return;

        const assignmentId = deleteModal.assignment.id;
        const cleanerName = deleteModal.assignment.cleaner_user?.name || 'Cleaner';

        setDeleting(true);

        try {
            const response = await AssignmentsApi.deleteAssignment(assignmentId);

            if (response.success) {
                toast.success(`${cleanerName} removed successfully`);
                setAssignments(prev => prev.filter(a => a.id !== assignmentId));
                setDeleteModal({ open: false, assignment: null });
            } else {
                toast.error(response.error || "Failed to remove assignment");
            }
        } catch (error) {
            console.error("Delete error:", error);
            toast.error("Failed to remove assignment");
        } finally {
            setDeleting(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'assigned':
                return 'bg-green-100 text-green-700';
            case 'active':
                return 'bg-blue-100 text-blue-700';
            case 'unassigned':
                return 'bg-gray-100 text-gray-700';
            case 'released':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-slate-100 text-slate-700';
        }
    };

    const clearFilters = () => {
        setSearchQuery("");
        setStatusFilter("all");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader size="large" color="#3b82f6" message="Loading cleaners..." />
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-3 sm:p-4 md:p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden mb-6">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-6">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => router.back()}
                                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-white" />
                                    </button>
                                    <div>
                                        <h1 className="text-2xl font-bold text-white">Assigned Cleaners</h1>
                                        {locationName && (
                                            <p className="text-slate-300 text-sm mt-1">
                                                <MapPin className="inline h-4 w-4 mr-1" />
                                                {locationName}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="bg-white/10 px-4 py-2 rounded-lg">
                                        <div className="text-white text-sm">
                                            <span className="font-bold text-lg">{filteredAssignments.length}</span>
                                            <span className="ml-1">of {assignments.length}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAddCleaner}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        <span>Add Cleaner</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="p-4 bg-slate-50 border-b border-slate-200">
                            <div className="flex flex-col sm:flex-row gap-3">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name, email, or phone..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
                                >
                                    <option value="all">All Status</option>
                                    <option value="assigned">Assigned</option>
                                    <option value="unassigned">Unassigned</option>
                                </select>

                                {/* Clear Filters */}
                                {(searchQuery || statusFilter !== "all") && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden">
                        {filteredAssignments.length === 0 ? (
                            <div className="p-12 text-center">
                                <UserCheck className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-slate-600 mb-2">
                                    {assignments.length === 0 ? 'No Cleaners Assigned' : 'No Results Found'}
                                </h3>
                                <p className="text-slate-500 mb-4">
                                    {assignments.length === 0
                                        ? 'No cleaners are currently assigned to this washroom.'
                                        : 'Try adjusting your search or filters.'}
                                </p>
                                {assignments.length === 0 && (
                                    <button
                                        onClick={handleAddCleaner}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                                    >
                                        <UserPlus className="h-4 w-4" />
                                        Add First Cleaner
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Sr. No.</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Cleaner Name</th>
                                            {/* <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Email</th> */}
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Phone</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Status</th>
                                            <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Assigned On</th>
                                            <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredAssignments.map((assignment, index) => (
                                            <tr
                                                key={assignment.id}
                                                className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                                            >
                                                <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                                                    {index + 1}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                            <Users className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="font-medium text-slate-800">
                                                            {assignment.cleaner_user?.name || 'Unknown'}
                                                        </span>
                                                    </div>
                                                </td>
                                                {/* <td className="py-4 px-6">
                                                    {assignment.cleaner_user?.email ? (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Mail className="h-3 w-3 text-slate-400" />
                                                            <span className="truncate max-w-xs">{assignment.cleaner_user.email}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">N/A</span>
                                                    )}
                                                </td> */}
                                                <td className="py-4 px-6">
                                                    {assignment.cleaner_user?.phone ? (
                                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                                            <Phone className="h-3 w-3 text-slate-400" />
                                                            <span>{assignment.cleaner_user.phone}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6">
                                                    {/* ✅ Status Toggle Button */}
                                                    <button
                                                        // onClick={() => handleToggleStatus(assignment)}
                                                        onClick={() => setStatusModal({ open: true, assignment: assignment })}
                                                        disabled={togglingStatus === assignment.id}
                                                        className={`inline-flex cursor-pointer items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${assignment.status?.toLowerCase() === 'assigned'
                                                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                                        title="Click to toggle status"
                                                    >
                                                        {togglingStatus === assignment.id ? (
                                                            <div className="  w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                        ) : assignment.status?.toLowerCase() === 'assigned' ? (
                                                            <ToggleRight className="w-3 h-3 cursor-pointer" />
                                                        ) : (
                                                            <ToggleLeft className="w-3 h-3 cursor-pointer" />
                                                        )}
                                                        {assignment.status || 'N/A'}
                                                    </button>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-slate-600">
                                                    {new Date(assignment.assigned_on).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => handleView(assignment.id)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </button>
                                                        {/* Removed Edit button since we're toggling status directly */}
                                                        <button
                                                            onClick={() => handleDelete(assignment)}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Remove Assignment"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Footer */}
                        {filteredAssignments.length > 0 && (
                            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                                <div className="flex justify-between items-center text-sm text-slate-600">
                                    <span className="font-medium">
                                        Showing {filteredAssignments.length} of {assignments.length} cleaner{assignments.length !== 1 ? 's' : ''}
                                    </span>
                                    <span>
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Confirmation Modal */}
                    {statusModal.open && (
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className={`p-3 rounded-full ${statusModal.assignment?.status?.toLowerCase() === 'assigned'
                                            ? 'bg-gray-100'
                                            : 'bg-green-100'
                                        }`}>
                                        {statusModal.assignment?.status?.toLowerCase() === 'assigned' ? (
                                            <ToggleLeft className="h-6 w-6 text-gray-600" />
                                        ) : (
                                            <ToggleRight className="h-6 w-6 text-green-600" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                            Change Assignment Status
                                        </h3>
                                        <p className="text-slate-600 text-sm">
                                            Confirm status change for this cleaner
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-slate-700">
                                        Are you sure you want to change{" "}
                                        <strong>{statusModal.assignment?.cleaner_user?.name}</strong>'s status to{" "}
                                        <strong className={
                                            statusModal.assignment?.status?.toLowerCase() === 'assigned'
                                                ? 'text-gray-700'
                                                : 'text-green-700'
                                        }>
                                            {statusModal.assignment?.status?.toLowerCase() === 'assigned'
                                                ? 'Unassigned'
                                                : 'Assigned'}
                                        </strong>?
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setStatusModal({ open: false, assignment: null })}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                                        disabled={togglingStatus === statusModal.assignment?.id}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmStatusToggle}
                                        disabled={togglingStatus === statusModal.assignment?.id}
                                        className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 font-medium ${statusModal.assignment?.status?.toLowerCase() === 'assigned'
                                                ? 'bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400'
                                                : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                                            }`}
                                    >
                                        {togglingStatus === statusModal.assignment?.id && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {togglingStatus === statusModal.assignment?.id
                                            ? 'Processing...'
                                            : 'Confirm Change'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete Modal */}
                    {deleteModal.open && (
                        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <AlertTriangle className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                                            Remove Assignment
                                        </h3>
                                        <p className="text-slate-600 text-sm">
                                            This action cannot be undone
                                        </p>
                                    </div>
                                </div>

                                <div className="mb-6">
                                    <p className="text-slate-700">
                                        Are you sure you want to remove{" "}
                                        <strong>{deleteModal.assignment?.cleaner_user?.name}</strong>{" "}
                                        from this washroom?
                                    </p>
                                </div>

                                <div className="flex gap-3 justify-end">
                                    <button
                                        onClick={() => setDeleteModal({ open: false, assignment: null })}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                        disabled={deleting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmDelete}
                                        disabled={deleting}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:bg-red-400"
                                    >
                                        {deleting && (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        )}
                                        {deleting ? 'Removing...' : 'Remove'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
