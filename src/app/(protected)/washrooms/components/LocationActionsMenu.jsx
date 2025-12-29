"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Users, Trash, Edit, Delete } from "lucide-react";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useSelector } from "react-redux";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { MODULES } from "@/lib/constants/permissions";
export default function LocationActionsMenu({
    item,
    onClose,
    onDelete,
    onEdit,
    location_id,
    canDeleteLocation,
    canEditLocation,
}) {
    const router = useRouter();
    const { companyId } = useCompanyId();


    const { canView } = usePermissions();
    const canViewAssignments = canView(MODULES.ASSIGNMENTS);

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

    const handleDelete = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (onDelete) {
            onDelete(item);
        }
        onClose();
    }

    return (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
            {/* View Cleaners */}
            {canViewAssignments && (
                <button
                    onMouseDown={handleViewCleaners}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Users className="h-4 w-4 text-blue-600" />
                    View Cleaners
                </button>
            )}

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

            {
                (canViewSupervisor || canEditLocation) &&
                (<button
                    onMouseDown={(e) => router.push(`/washrooms/item/${location_id}/edit?companyId=${companyId}`)} // ✅ Changed from onClick
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Edit className="h-4 w-4 text-yellow-300" />
                    Edit Washroom
                </button>)
            }


            {
                (canViewSupervisor || canDeleteLocation) &&
                (<button
                    onMouseDown={handleDelete} // ✅ Changed from onClick
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                >
                    <Delete className="h-4 w-4 text-red-600" />
                    Delete Washroom
                </button>)
            }
        </div >
    );
}
