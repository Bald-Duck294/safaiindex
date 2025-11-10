"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import toast, { Toaster } from "react-hot-toast";
import {
    ArrowLeft,
    Loader2,
    User,
    Mail,
    Phone,
    Briefcase,
    MapPin,
    Edit,
    Building2,
    Calendar,
    CheckCircle,
    Clock,
    Navigation
} from "lucide-react";
import Link from "next/link";

const DetailItem = ({ icon, label, value, subtext }) => (
    <div className="flex items-start py-4">
        <div className="w-10 h-10 mr-4 flex items-center justify-center bg-indigo-50 rounded-lg text-indigo-600">
            {icon}
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
            <p className="text-base font-semibold text-slate-800 mt-1">{value || 'N/A'}</p>
            {subtext && <p className="text-sm text-slate-500 mt-1">{subtext}</p>}
        </div>
    </div>
);

const LocationCard = ({ assignment, router, companyId }) => (
    <div className="cursor-pointer p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow bg-white"
        onClick={(e) => router.push(`/washrooms/item/${assignment?.locations?.id}?companyId=${companyId}`)}
    >
        <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                <h3 className="font-semibold text-slate-800">{assignment.name}</h3>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${assignment.status === 'assigned'
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
                }`}>
                {assignment.status}
            </span>
        </div>

        {assignment.locations && (
            <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                    <Navigation className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-slate-600">{assignment.locations.address}</p>
                        <p className="text-slate-500">{assignment.locations.city}, {assignment.locations.state} - {assignment.locations.pincode}</p>
                    </div>
                </div>

                {(assignment.locations.latitude && assignment.locations.longitude) && (
                    <div className="flex items-center gap-2 text-slate-500">
                        <span className="text-xs font-mono bg-slate-50 px-2 py-1 rounded">
                            {assignment.locations.latitude}, {assignment.locations.longitude}
                        </span>
                    </div>
                )}

                <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-100">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs">
                        Assigned on {new Date(assignment.assigned_on).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </span>
                </div>
            </div>
        )}
    </div>
);

export default function ViewUserPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const { id } = params;

    const { companyId: contextCompanyId } = useCompanyId();
    const queryCompanyId = searchParams.get('companyId');
    const companyId = queryCompanyId || contextCompanyId;

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchUser = async () => {
                setIsLoading(true);
                try {
                    const response = await UsersApi.getUserById(id);
                    console.log('User response:', response);

                    if (response) {
                        setUser(response?.data);
                    } else {
                        toast.error("Failed to fetch user data.");
                        router.push(`/users?companyId=${companyId}`);
                    }
                } catch (error) {
                    console.error('Error fetching user:', error);
                    toast.error("Error loading user data.");
                    router.push(`/users?companyId=${companyId}`);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchUser();
        }
    }, [id, router]);

    const totalAssignments = user?.location_assignments?.length || 0;
    const activeAssignments = user?.location_assignments?.filter(a => a.status === 'assigned').length || 0;

    return (
        <>
            <Toaster position="top-center" />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto">
                    {/* Header with Back Button */}
                    <button
                        onClick={() => router.back()}
                        className="cursor-pointer flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Back to Users
                    </button>

                    {isLoading ? (
                        <div className="bg-white rounded-xl shadow-md p-12">
                            <div className="flex flex-col justify-center items-center gap-4">
                                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                                <p className="text-slate-500">Loading user details...</p>
                            </div>
                        </div>
                    ) : user ? (
                        <div className="space-y-6">
                            {/* User Info Card */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                {/* Header Section */}
                                <div className="p-6 sm:p-8 bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-slate-200">
                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                                {user.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{user.name}</h1>
                                                <div className="flex items-center gap-2 mt-2">
                                                    <span className="px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-700 rounded-full">
                                                        {user.role?.name || 'No Role'}
                                                    </span>
                                                    {user.role?.description && (
                                                        <span className="text-sm text-slate-500">• {user.role.description}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <Link href={`/users/${user.id}?companyId=${companyId}`}>
                                            <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors cursor-pointer">
                                                <Edit size={16} />
                                                Edit User
                                            </span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Basic Details */}
                                <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 divide-y md:divide-y-0 divide-slate-200">
                                    <div className="space-y-2">
                                        <DetailItem
                                            icon={<Mail size={20} />}
                                            label="Email Address"
                                            value={user.email}
                                        />
                                        <DetailItem
                                            icon={<Phone size={20} />}
                                            label="Phone Number"
                                            value={user.phone}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <DetailItem
                                            icon={<Building2 size={20} />}
                                            label="Company"
                                            value={user.companies?.name}
                                            subtext={user.companies?.description}
                                        />
                                        <DetailItem
                                            icon={<User size={20} />}
                                            label="User ID"
                                            value={user.id}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Location Assignments Section */}
                            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                <div className="p-6 sm:p-8 border-b border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                                <MapPin className="w-6 h-6 text-indigo-600" />
                                                Location Assignments
                                            </h2>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Locations assigned to this user
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-indigo-600">{activeAssignments}</div>
                                                <div className="text-xs text-slate-500">Active</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-slate-600">{totalAssignments}</div>
                                                <div className="text-xs text-slate-500">Total</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-8">
                                    {user.location_assignments && user.location_assignments.length > 0 ? (
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                            {user.location_assignments.map((assignment) => (
                                                <LocationCard key={assignment.id} assignment={assignment} router={router} companyId={companyId} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                            <p className="text-slate-500 font-medium">No locations assigned</p>
                                            <p className="text-sm text-slate-400 mt-1">
                                                This user hasn't been assigned to any locations yet.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md p-12">
                            <p className="text-center text-slate-500">User not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
