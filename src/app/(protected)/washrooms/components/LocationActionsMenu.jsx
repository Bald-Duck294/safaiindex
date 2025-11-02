"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useSelector } from "react-redux"; // ✅ Import useSelector

export default function LocationActionsMenu({
    item,
    onClose,
    onDelete,
    onEdit,
}) {
    const router = useRouter();
    const { companyId } = useCompanyId();
    
    // ✅ Get current user from Redux
    const user = useSelector((state) => state.auth.user);
    const userRoleId = user?.role_id;

    // ✅ Check if user is admin or super-admin (role_id 1 or 2)
    const canViewSupervisor = userRoleId === 1 || userRoleId === 2;

    const handleViewCleaners = () => {
        router.push(
            `/assignments/cleaner?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
                item.name
            )}`
        );
        onClose();
    };

    const handleViewSupervisor = () => {
        router.push(
            `/assignments/supervisor?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
                item.name
            )}`
        );
        onClose();
    };

    const handleEdit = () => {
        onEdit?.(item.id);
        onClose();
    };

    const handleDelete = () => {
        onDelete?.(item);
        onClose();
    };

    const handleDuplicate = () => {
        console.log("Duplicate location:", item.id);
        onClose();
    };

    return (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
            {/* View Cleaners */}
            <button
                onClick={handleViewCleaners}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <Users className="h-4 w-4 text-blue-600" />
                View Cleaners
            </button>

            {/* View Supervisor - Only for Admin/Super-Admin (role_id 1 or 2) */}
            {canViewSupervisor && (
                <button
                    onClick={handleViewSupervisor}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200"
                >
                    <Users className="h-4 w-4 text-green-600" />
                    View Supervisor
                </button>
            )}

            {/* Edit - Commented out */}
            {/* <button
                onClick={handleEdit}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200"
            >
                <Edit className="h-4 w-4 text-slate-600" />
                Edit Location
            </button> */}

            {/* Duplicate - Commented out */}
            {/* <button
                onClick={handleDuplicate}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200"
            >
                <Copy className="h-4 w-4 text-slate-600" />
                Duplicate
            </button> */}

            {/* Delete - Commented out */}
            {/* <button
                onClick={handleDelete}
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-slate-200"
            >
                <Trash2 className="h-4 w-4 text-red-600" />
                Delete
            </button> */}
        </div>
    );
}
