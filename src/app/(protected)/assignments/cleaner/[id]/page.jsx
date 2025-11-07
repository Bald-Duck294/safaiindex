"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
    Users,
    Mail,
    Phone,
    Calendar,
    MapPin,
    ArrowLeft,
    Briefcase,
    ClipboardList,
    TrendingUp,
    Clock,
    CheckCircle,
    Activity,
    Building2,
    User,
    Navigation
} from "lucide-react";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

export default function CleanerViewPage() {
    const [cleanerData, setCleanerData] = useState(null);
    const [assignedLocations, setAssignedLocations] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);

    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
     const cleanerUserId = searchParams.get('assignemtn') 
    const { companyId } = useCompanyId();

    const assignmentId = params.id; // This is actually the assignment ID

    useEffect(() => {
        if (!assignmentId || !companyId) {
            console.log('Missing assignmentId or companyId');
            setLoading(false);
            return;
        }

        fetchCleanerDetails();
    }, [assignmentId, companyId]);

    const fetchCleanerDetails = async () => {
        setLoading(true);
        try {
            // First, get the assignment to extract cleaner_user_id
            const allAssignments = await AssignmentsApi.getAllAssignments(companyId);

            console.log(allAssignments, "all assignemtns 22 ");
            if (allAssignments.success) {
                const assignment = allAssignments.data?.data.find(a => a.id === assignmentId);
                if (!assignment) {
                    toast.error("Assignment not found");
                    setLoading(false);
                    return;
                }
                console.log(assignment, "assignment");

                const cleanerUserId = assignment.cleaner_user_id;
                setCleanerData(assignment.user); // User details from assignment

                // Fetch assigned locations
                const assignmentsRes = await AssignmentsApi.getAssignmentsByCleanerId(cleanerUserId, companyId);

                console.log(assignmentsRes, "Sing assignment response")

                if (assignmentsRes.success) {
                    setAssignedLocations(assignmentsRes.data);
                }

                // Fetch recent activities (cleaner reviews)
                const reviewsRes = await CleanerReviewApi.getCleanerReviewsByCleanerId(cleanerUserId);
                console.log(reviewsRes, "res review");

                if (reviewsRes.success) {
                    setRecentActivities(reviewsRes.data.reviews.slice(0, 10)); // Last 10 activities
                    setStats(reviewsRes.data.stats);
                }
            }
        } catch (error) {
            console.error("Error fetching cleaner details:", error);
            toast.error("Failed to fetch cleaner details");
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-700';
            case 'ongoing':
                return 'bg-blue-100 text-blue-700';
            case 'pending':
                return 'bg-yellow-100 text-yellow-700';
            default:
                return 'bg-slate-100 text-slate-700';
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
                <Loader size="large" color="#3b82f6" message="Loading cleaner details..." />
            </div>
        );
    }

    if (!cleanerData) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-center">
                    <p className="text-slate-600">Cleaner not found</p>
                    <button
                        onClick={() => router.back()}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
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
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
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
                                        {cleanerData.name}
                                    </h1>
                                    <p className="text-blue-100 text-sm mt-1">
                                        Cleaner Profile & Activity
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-100 rounded-lg">
                                    <Briefcase className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Total Reviews</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.total_reviews || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-100 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Completed</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.completed_reviews || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-100 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Ongoing</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.ongoing_reviews || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-purple-100 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-600">Today's Tasks</p>
                                    <p className="text-2xl font-bold text-slate-800">{stats.total_tasks_today || 0}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column - Cleaner Info & Assigned Locations */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Cleaner Information Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-blue-600" />
                                    Cleaner Information
                                </h2>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-500 uppercase font-medium">Full Name</label>
                                        <p className="text-sm font-medium text-slate-800 mt-1">{cleanerData.name}</p>
                                    </div>

                                    {cleanerData.email && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Email</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Mail className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{cleanerData.email}</p>
                                            </div>
                                        </div>
                                    )}

                                    {cleanerData.phone && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Phone</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Phone className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{cleanerData.phone}</p>
                                            </div>
                                        </div>
                                    )}

                                    {cleanerData.role && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Role</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Briefcase className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">{cleanerData.role.name}</p>
                                            </div>
                                        </div>
                                    )}

                                    {cleanerData.created_at && (
                                        <div>
                                            <label className="text-xs text-slate-500 uppercase font-medium">Joined Date</label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <p className="text-sm text-slate-700">
                                                    {new Date(cleanerData.created_at).toLocaleDateString('en-US', {
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
                                    <MapPin className="w-5 h-5 text-blue-600" />
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
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
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

                        {/* Right Column - Recent Activities */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                    <Activity className="w-5 h-5 text-blue-600" />
                                    Recent Activities (Last 10)
                                </h2>
                                <div className="space-y-4">
                                    {recentActivities.length === 0 ? (
                                        <div className="text-center py-12">
                                            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500">No activities found</p>
                                        </div>
                                    ) : (
                                        recentActivities.map((activity, index) => (
                                            <div
                                                key={activity.id}
                                                className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50 transition-colors"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="font-medium text-slate-800">
                                                                #{index + 1} - {activity.location?.name || 'Unknown Location'}
                                                            </span>
                                                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(activity.status)}`}>
                                                                {activity.status}
                                                            </span>
                                                        </div>

                                                        {activity.address && (
                                                            <div className="flex items-start gap-2 text-sm text-slate-600 mb-2">
                                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                                                <span>{activity.address}</span>
                                                            </div>
                                                        )}

                                                        {activity.tasks && activity.tasks.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-xs text-slate-500 mb-1">Tasks:</p>
                                                                <div className="flex flex-wrap gap-1">
                                                                    {activity.tasks.map((task, idx) => (
                                                                        <span
                                                                            key={idx}
                                                                            className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded"
                                                                        >
                                                                            {task}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {activity.score && (
                                                            <div className="mt-2 flex items-center gap-2">
                                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                                                <span className="text-sm font-medium text-green-600">
                                                                    Score: {activity.score}/10
                                                                </span>
                                                            </div>
                                                        )}

                                                        <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>
                                                                {new Date(activity.created_at).toLocaleString('en-US', {
                                                                    year: 'numeric',
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
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
