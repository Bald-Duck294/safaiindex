"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    useGetAllShiftsQuery,
    useDeleteShiftMutation,
    useToggleShiftStatusMutation
} from "@/store/slices/shiftApi";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import {
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle
} from "lucide-react";

export default function ShiftList() {
    const router = useRouter();
    const { companyId } = useCompanyId();

    const [searchTerm, setSearchTerm] = useState("");
    const [includeUnavailable, setIncludeUnavailable] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [toggleStatusModalOpen, setToggleStatusModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Fetch data
    const { data, isLoading, isError } = useGetAllShiftsQuery({
        company_id: companyId,
        include_unavailable: includeUnavailable,
    });

    const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();
    const [toggleStatus, { isLoading: isToggling }] = useToggleShiftStatusMutation();

    // Filter and search
    const filteredShifts = useMemo(() => {
        if (!data?.shifts) return [];

        return data.shifts.filter((shift) =>
            shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            shift.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data?.shifts, searchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredShifts.length / itemsPerPage);
    const paginatedShifts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredShifts.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredShifts, currentPage]);

    // Handle toggle status
    const handleToggleStatus = async () => {
        try {
            await toggleStatus(selectedShift.id).unwrap();
            const action = selectedShift.status ? "deactivated" : "activated";
            toast.success(`Shift "${selectedShift.name}" has been ${action} successfully! 🎉`, {
                duration: 3000,
                icon: selectedShift.status ? "⏸️" : "✅",
            });
            setToggleStatusModalOpen(false);
            setSelectedShift(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to toggle shift status", {
                duration: 3000,
            });
        }
    };

    // Handle delete
    const handleDelete = async () => {
        try {
            await deleteShift(selectedShift.id).unwrap();
            toast.success(`Shift "${selectedShift.name}" has been deleted successfully! 🗑️`, {
                duration: 3000,
            });
            setDeleteModalOpen(false);
            setSelectedShift(null);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete shift", {
                duration: 3000,
            });
        }
    };

    // // Format time
    // const formatTime = (dateStr) => {
    //     if (!dateStr) return "";
    //     const date = new Date(dateStr);
    //     return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    // };


    // ✅ Helper function to convert 24-hour to 12-hour format
    const formatTo12Hour = (timeStr) => {
        if (!timeStr) return "";
        const [hours, minutes] = timeStr.split(":").map(Number);
        const period = hours >= 12 ? "PM" : "AM";
        const displayHours = hours % 12 || 12;
        const paddedHours = displayHours < 10 ? `0${displayHours}` : displayHours;
        return `${paddedHours}:${String(minutes).padStart(2, "0")} ${period}`;
    };

    // Format date
    // const formatDate = (dateStr) => {
    //     if (!dateStr) return "No limit";
    //     return new Date(dateStr).toLocaleDateString("en-US", {
    //         year: "numeric",
    //         month: "short",
    //         day: "numeric",
    //     });
    // };

    if (isError) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        Error loading shifts
                    </div>
                </div>
            </div>
        );
    }

    return (

        <>

            <Toaster position="top-right" /> {/* ✅ Add this line */}


            <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Shifts</h1>
                            <p className="mt-2 text-sm text-gray-600">Manage company shifts</p>
                        </div>
                        <button
                            onClick={() => router.push(`/shifts/add?companyId=${companyId}`)}
                            className="cursor-pointer mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                        >
                            + Create Shift
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="bg-white rounded-lg shadow mb-6 p-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search by name or description..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setCurrentPage(1);
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                />
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setIncludeUnavailable(!includeUnavailable)}
                                className={`cursor-pointer px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap ${includeUnavailable
                                    ? "bg-blue-600 text-white hover:bg-blue-700"
                                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                            >
                                {includeUnavailable ? "All Shifts" : "Active Only"}
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    {isLoading ? (
                        <div className="flex justify-center py-12">
                            <Loader />
                        </div>
                    ) : filteredShifts.length === 0 ? (
                        <div className="bg-white rounded-lg shadow p-8 text-center">
                            <p className="text-gray-500">No shifts found</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white rounded-lg shadow overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Shift Name
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Time
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Duration
                                                </th>
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Valid From
                                                </th> */}
                                                {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Valid Until
                                                </th> */}
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {paginatedShifts.map((shift) => (
                                                <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                                                    {/* Shift Name - Clickable */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => router.push(`/shifts/${shift.id}?companyId=${companyId}`)}
                                                            className="text-blue-600 hover:text-blue-900 hover:underline font-medium cursor-pointer"
                                                        >
                                                            {shift.name}
                                                        </button>
                                                    </td>

                                                    {/* Time */}
                                                    {/* Time */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatTo12Hour(shift.startTime)} - {formatTo12Hour(shift.endTime)}
                                                    </td>


                                                    {/* Duration */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {shift.durationHours}h
                                                    </td>


                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(shift.effectiveFrom)}
                                                    </td> */}

                                                    {/* Valid Until */}
                                                    {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {formatDate(shift.effectiveUntil)}
                                                    </td>  */}

                                                    {/* Status - Clickable with Animation */}
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <button
                                                            onClick={() => {
                                                                setSelectedShift(shift);
                                                                setToggleStatusModalOpen(true);
                                                            }}
                                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${shift.status
                                                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                                : "bg-red-100 text-red-800 hover:bg-red-200"
                                                                }`}
                                                        >
                                                            <span className={`mr-1 transition-transform duration-300 ${shift.status ? 'animate-pulse' : ''}`}>
                                                                {shift.status ? "●" : "○"}
                                                            </span>
                                                            {shift.status ? "Active" : "Inactive"}
                                                        </button>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex items-center space-x-2">
                                                            {/* <button
                                                                onClick={() => router.push(`/shifts/${shift.id}?companyId=${companyId}`)}
                                                                className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View"
                                                            >
                                                                <Eye className="h-4 w-4" />
                                                            </button> */}
                                                            <button
                                                                onClick={() => router.push(`/shifts/${shift.id}/edit?companyId=${companyId}`)}
                                                                className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedShift(shift);
                                                                    setDeleteModalOpen(true);
                                                                }}
                                                                className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                title="Delete"
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
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="mt-6 flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Showing{" "}
                                        <span className="font-medium">
                                            {(currentPage - 1) * itemsPerPage + 1}
                                        </span>{" "}
                                        to{" "}
                                        <span className="font-medium">
                                            {Math.min(currentPage * itemsPerPage, filteredShifts.length)}
                                        </span>{" "}
                                        of <span className="font-medium">{filteredShifts.length}</span> results
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                            disabled={currentPage === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Previous
                                        </button>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentPage === page
                                                        ? "bg-blue-600 text-white"
                                                        : "border border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button
                                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                            disabled={currentPage === totalPages}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Toggle Status Confirmation Modal */}
                {toggleStatusModalOpen && selectedShift && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all animate-in zoom-in duration-200">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-blue-100">
                                {selectedShift.status ? (
                                    <XCircle className="h-6 w-6 text-red-600" />
                                ) : (
                                    <CheckCircle className="h-6 w-6 text-green-600" />
                                )}
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                {selectedShift.status ? "Deactivate" : "Activate"} Shift
                            </h2>

                            <p className="text-gray-600 mb-6 text-center">
                                Are you sure you want to {selectedShift.status ? "deactivate" : "activate"}{" "}
                                <strong className="text-gray-900">"{selectedShift.name}"</strong>?
                                {selectedShift.status && (
                                    <span className="block mt-2 text-sm text-red-600">
                                        This shift will no longer be available for assignment.
                                    </span>
                                )}
                                {!selectedShift.status && (
                                    <span className="block mt-2 text-sm text-green-600">
                                        This shift will become available for assignment.
                                    </span>
                                )}
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setToggleStatusModalOpen(false);
                                        setSelectedShift(null);
                                    }}
                                    disabled={isToggling}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleToggleStatus}
                                    disabled={isToggling}
                                    className={`flex-1 px-4 py-2 rounded-md text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${selectedShift.status
                                        ? "bg-red-600 hover:bg-red-700"
                                        : "bg-green-600 hover:bg-green-700"
                                        }`}
                                >
                                    {isToggling ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </span>
                                    ) : (
                                        `Yes, ${selectedShift.status ? "Deactivate" : "Activate"}`
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModalOpen && selectedShift && (
                    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all animate-in zoom-in duration-200">
                            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>

                            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
                                Delete Shift
                            </h2>

                            <p className="text-gray-600 mb-6 text-center">
                                Are you sure you want to delete{" "}
                                <strong className="text-gray-900">"{selectedShift.name}"</strong>?
                                <span className="block mt-2 text-sm text-red-600">
                                    This action cannot be undone and will permanently remove this shift.
                                </span>
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setDeleteModalOpen(false);
                                        setSelectedShift(null);
                                    }}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isDeleting ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Deleting...
                                        </span>
                                    ) : (
                                        "Yes, Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

        </>
    );
}
