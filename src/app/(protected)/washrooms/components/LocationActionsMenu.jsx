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

    const user = useSelector((state) => state.auth.user);
    const userRoleId = user?.role_id;
    const canViewSupervisor = userRoleId === 1 || userRoleId === 2;

    const handleViewCleaners = (e) => {
        e.preventDefault();
        e.stopPropagation(); // ✅ Stop propagation to parent
        console.log("handle view cleaners");
        router.push(
            `/assignments/cleaner?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
                item.name
            )}`
        );
        onClose();
    };

    const handleViewSupervisor = (e) => {
        e.preventDefault();
        e.stopPropagation(); // ✅ Stop propagation to parent
        router.push(
            `/assignments/supervisor?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(
                item.name
            )}`
        );
        onClose();
    };

    return (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
            {/* View Cleaners */}
            <button
                onMouseDown={handleViewCleaners} // ✅ Changed from onClick
                className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
            >
                <Users className="h-4 w-4 text-blue-600" />
                View Cleaners
            </button>

            {/* View Supervisor */}
            {canViewSupervisor && (
                <button
                    onMouseDown={handleViewSupervisor} // ✅ Changed from onClick
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors border-t border-slate-200"
                >
                    <Users className="h-4 w-4 text-green-600" />
                    View Supervisor
                </button>
            )}
        </div>
    );
}
