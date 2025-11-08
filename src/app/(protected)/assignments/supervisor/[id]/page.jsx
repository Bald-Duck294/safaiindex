"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ArrowLeft,
    Briefcase,
    Activity,
    Navigation,
    Users as UsersIcon,
} from "lucide-react";
import { UsersApi } from "@/lib/api/usersApi";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function SupervisorViewPage() {
    const [supervisorData, setSupervisorData] = useState(null);
    const [assignedLocations, setAssignedLocations] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const router = useRouter();
    const { companyId } = useCompanyId();

    const cleanerUserId = params.id; // ✅ This is now the cleaner_user_id, not assignment ID

    useEffect(() => {
        if (!cleanerUserId || !companyId) {
            console.log('Missing cleanerUserId or companyId');
            setLoading(false);
            return;
        }

        fetchSupervisorDetails();
    }, [cleanerUserId, companyId]);

    const fetchSupervisorDetails = async () => {
        setLoading(true);
        try {
            // ✅ Fetch supervisor user data directly
            const userRes = await UsersApi.getUserById(cleanerUserId, companyId);
                
            if (userRes.success) {
                setSupervisorData(userRes.data);

                // ✅ Fetch assigned locations for this supervisor
                const assignmentsRes = await AssignmentsApi.getAssignmentsByCleanerId(cleanerUserId, companyId);
                if (assignmentsRes.success) {
                    setAssignedLocations(assignmentsRes.data);
                }

                // Set basic stats
                setStats({
                    total_assignments: assignmentsRes.data?.length || 0,
                    active_locations: assignmentsRes.data?.filter(a => a.status === 'assigned').length || 0,
                });
            } else {
                toast.error("Supervisor not found");
            }
        } catch (error) {
            console.error("Error fetching supervisor details:", error);
            toast.error("Failed to fetch supervisor details");
        } finally {
            setLoading(false);
        }
    };

    const handleViewLocation = (lat, lng) => {
        if (lat && lng) {
            window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader size="large" color="#3b82f6" message="Loading supervisor details..." />
            </div>
        );
    }

    if (!supervisorData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-slate-600">Supervisor not found</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
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
                        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-white" />
                                </button>
                                <div className="flex-1">
                                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        {supervisorData.name}
                                    </h1>
                                    <p className="text-purple-100 text-sm mt-1">
                                        Supervisor Profile & Assignments
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Assignments</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.total_assignments || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <Activity className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Active Locations</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.active_locations || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <UsersIcon className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Role</p>
                                    <p className="text-2xl font-bold text-slate-800 capitalize">
                                        {supervisorData.role?.name || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Supervisor Info */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Supervisor Information Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-purple-600" />
                                    Supervisor Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Full Name</label>
                                        <p className="text-sm font-medium text-slate-800 mt-1">{supervisorData.name}</p>
                                    </div>

                                    {supervisorData.email && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Email</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{supervisorData.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {supervisorData.phone && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Phone</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{supervisorData.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {supervisorData.role && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Role</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{supervisorData.role.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {supervisorData.created_at && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Joined Date</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">
                                                    {new Date(supervisorData.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Assigned Locations Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-purple-600" />
                                    Assigned Locations ({assignedLocations.length})
                                </h2>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {assignedLocations.length === 0 ? (
                                        <p className="text-sm text-slate-500 text-center py-4">
                                            No locations assigned
                                        </p>
                                    ) : (
                                        assignedLocations.map((assignment) => (
                                            <div
                                                key={assignment.id}
                                                className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="flex-1">
                                                        <h3 className="font-medium text-slate-800 text-sm">
                                                            {assignment.locations?.name || 'Unknown Location'}
                                                        </h3>
                                                        {assignment.locations?.address && (
                                                            <p className="text-xs text-slate-500 mt-1">
                                                                {assignment.locations.address}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${assignment.status === 'assigned'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-gray-100 text-gray-700'
                                                                }`}>
                                                                {assignment.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {assignment.locations?.latitude && assignment.locations?.longitude && (
                                                        <button
                                                            onClick={() => handleViewLocation(
                                                                assignment.locations.latitude,
                                                                assignment.locations.longitude
                                                            )}
                                                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                            title="View on Map"
                                                        >
                                                            <Navigation className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Overview */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-purple-600" />
                                    Assignment Overview
                                </h2>
                                <div className="space-y-4">
                                    {assignedLocations.length === 0 ? (
                                        <div className="text-center py-12">
                                            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No assigned locations</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {assignedLocations.map((assignment) => (
                                                <div
                                                    key={assignment.id}
                                                    className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between gap-4 mb-3">
                                                        <div>
                                                            <h3 className="font-medium text-slate-800">
                                                                {assignment.locations?.name}
                                                            </h3>
                                                            <p className="text-sm text-slate-500 mt-1">
                                                                {assignment.locations?.address}
                                                            </p>
                                                        </div>
                                                        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${assignment.status === 'assigned'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                            }`}>
                                                            {assignment.status}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-200">
                                                        <Calendar className="w-3 h-3" />
                                                        <span>
                                                            {new Date(assignment.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
