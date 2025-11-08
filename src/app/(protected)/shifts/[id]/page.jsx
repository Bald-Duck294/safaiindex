"use client";

import { useRouter, useParams } from "next/navigation";
import { useGetShiftByIdQuery, useDeleteShiftMutation } from "@/store/slices/shiftApi";
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";
import { useState } from "react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
export default function ShiftDetail() {
    const router = useRouter();
    const params = useParams();
    const shiftId = params.id;
    const { companyId } = useCompanyId();

    const { data: shift, isLoading, isError } = useGetShiftByIdQuery({
        id: shiftId,
        company_id: companyId,
    });

    const [deleteShift, { isLoading: isDeleting }] = useDeleteShiftMutation();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const handleDelete = async () => {
        try {
            await deleteShift(shiftId).unwrap();
            toast.success("Shift deleted successfully");
            setDeleteModalOpen(false);
            router.push(`/shifts?companyId=${companyId}`);
        } catch (error) {
            toast.error(error?.data?.message || "Failed to delete shift");
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (isError || !shift) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                        Error loading shift
                    </div>
                </div>
            </div>
        );
    }

    const formatTime = (dateStr) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "No limit";
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <button
                            onClick={() => router.back()}
                            className="text-blue-600 hover:text-blue-900 mb-4 font-medium"
                        >
                            ← Back
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">{shift.name}</h1>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => router.push(`/shifts/${shiftId}/edit?companyId=${companyId}`)}
                            className="px-4 py-2 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors"
                        >
                            ✏️ Edit
                        </button>
                        <button
                            onClick={() => setDeleteModalOpen(true)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Basic Info Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Name</p>
                                <p className="text-lg font-medium text-gray-900">{shift.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${shift.status
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                >
                                    {shift.status ? "Active" : "Inactive"}
                                </span>
                            </div>
                            {shift.description && (
                                <div>
                                    <p className="text-sm text-gray-600">Description</p>
                                    <p className="text-gray-900 whitespace-pre-wrap">{shift.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Timing Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Shift Timing</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Start Time</p>
                                <p className="text-lg font-medium text-gray-900">{formatTime(shift.startTime)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">End Time</p>
                                <p className="text-lg font-medium text-gray-900">{formatTime(shift.endTime)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Duration</p>
                                <p className="text-lg font-medium text-blue-600">{shift.durationHours} hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Validity Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Validity Period</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Effective From</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {formatDate(shift.effectiveFrom)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Effective Until</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {formatDate(shift.effectiveUntil)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Company Card */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Company</h2>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-600">Company Name</p>
                                <p className="text-lg font-medium text-gray-900">{shift.company?.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Assigned Employees</p>
                                <p className="text-lg font-medium text-gray-900">
                                    {shift.assignments?.length || 0} employees
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Metadata */}
                <div className="mt-6 bg-white rounded-lg shadow p-6 text-sm text-gray-600">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Created</p>
                            <p>{new Date(shift.createdAt).toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Last Updated</p>
                            <p>{new Date(shift.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Delete Shift</h2>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete <strong>{shift.name}</strong>? This action cannot be
                            undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
