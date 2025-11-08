// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useParams } from "next/navigation";
// import { UsersApi } from "@/lib/api/usersApi";
// import toast, { Toaster } from "react-hot-toast";
// import { ArrowLeft, Loader2, User, Mail, Phone, Briefcase, MapPin, Edit } from "lucide-react";
// import Link from "next/link";

// const DetailItem = ({ icon, label, value }) => (
//     <div className="flex items-start py-3">
//         <div className="w-8 mr-4 text-indigo-500">{icon}</div>
//         <div>
//             <p className="text-sm text-slate-500">{label}</p>
//             <p className="text-md font-semibold text-slate-800">{value || 'N/A'}</p>
//         </div>
//     </div>
// );

// export default function ViewUserPage() {
//     const router = useRouter();
//     const params = useParams();
//     const { id } = params;

//     const [user, setUser] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);

//     useEffect(() => {
//         if (id) {
//             const fetchUser = async () => {
//                 setIsLoading(true);
//                 const response = await UsersApi.getUserById(id);
//                 if (response.success) {
//                     setUser(response.data);
//                 } else {
//                     toast.error("Failed to fetch user data.");
//                     router.push("/users");
//                 }
//                 setIsLoading(false);
//             };
//             fetchUser();
//         }
//     }, [id, router]);

//     return (
//         <>
//             <Toaster position="top-center" />
//             <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//                 <div className="max-w-2xl mx-auto">
//                     <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800">
//                         <ArrowLeft size={18} />
//                         Back to Users
//                     </button>
//                     <div className="bg-white rounded-xl shadow-md overflow-hidden">
//                         {isLoading ? (
//                             <div className="flex justify-center items-center h-96">
//                                 <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
//                             </div>
//                         ) : user ? (
//                             <>
//                                 <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
//                                     <div>
//                                         <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{user.name}</h1>
//                                         <p className="text-md text-slate-500">{user.role?.name || 'No Role Assigned'}</p>
//                                     </div>
//                                     <Link href={`/users/${user.id}/edit`}>
//                                         <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 cursor-pointer">
//                                             <Edit size={16} />
//                                             Edit User
//                                         </span>
//                                     </Link>
//                                 </div>
//                                 <div className="p-6 sm:p-8 grid grid-cols-1 divide-y divide-slate-200">
//                                     <DetailItem icon={<Mail size={20} />} label="Email" value={user.email} />
//                                     <DetailItem icon={<Phone size={20} />} label="Phone" value={user.phone} />
//                                     <DetailItem 
//                                         icon={<MapPin size={20} />} 
//                                         label="Assigned Locations" 
//                                         value={
//                                             user.location_assignments && user.location_assignments.length > 0
//                                             ? user.location_assignments.map(a => a.location.name).join(', ')
//                                             : 'None'
//                                         } 
//                                     />
//                                 </div>
//                             </>
//                         ) : (
//                              <p className="text-center text-slate-500 p-12">User not found.</p>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }



// app/role/[role]/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Edit,
    User,
    Mail,
    Phone,
    Calendar,
    Building,
    Shield,
    MapPin,
    Clock,
    AlertCircle,
    CheckCircle,
    XCircle,
} from "lucide-react";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from "@/components/ui/Loader";
import toast from "react-hot-toast";

const LoadingSkeleton = () => (
    <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
            {/* Header Skeleton */}
            <div className="bg-white rounded-lg shadow-sm border mb-6 p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                </div>
                <div className="h-8 bg-gray-200 rounded w-64 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-96"></div>
            </div>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
                        <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-full"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const StatusBadge = ({ isActive, label }) => (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${isActive
        ? 'bg-green-100 text-green-800'
        : 'bg-red-100 text-red-800'
        }`}>
        {isActive ? (
            <CheckCircle className="w-4 h-4" />
        ) : (
            <XCircle className="w-4 h-4" />
        )}
        {label}
    </span>
);

const InfoCard = ({ icon: Icon, title, children, className = "" }) => (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
                <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {children}
    </div>
);

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { companyId } = useCompanyId();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const userId = params.id;
    const role = params.role;
    const urlCompanyId = searchParams.get('companyId');
    const finalCompanyId = companyId || urlCompanyId;

    useEffect(() => {
        const fetchUser = async () => {
            if (!userId) return;

            try {
                setLoading(true);
                setError(null);

                const response = await UsersApi.getUserById(userId);
                console.log("response single user", response.data)
                if (response.success) {
                    setUser(response.data);
                } else {
                    setError(response.error || 'Failed to fetch user');
                    toast.error(response.error || 'Failed to fetch user');
                }
            } catch (err) {
                setError('An unexpected error occurred');
                toast.error('An unexpected error occurred');
                console.error('Error fetching user:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [userId]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Not specified';
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
                    <div className="text-red-500 mb-4">
                        <AlertCircle className="w-12 h-12 mx-auto" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                        {error || 'User not found'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The user you're looking for doesn't exist or has been removed.
                    </p>
                    <button
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4 sm:p-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.back()}
                                className="cursor-pointer p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {user.name}
                                </h1>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                        <Shield className="w-4 h-4" />
                                        {user.role?.name || 'No Role'}
                                    </span>
                                    <StatusBadge
                                        isActive={user.is_active !== false}
                                        label={user.is_active !== false ? 'Active' : 'Inactive'}
                                    />
                                </div>
                            </div>
                        </div>


                        {/* users/86?companyId=14 */}
                        {/* {`/role/${role}/${userId}/edit${finalCompanyId ? `?companyId=${finalCompanyId} */}
                        <Link
                            href={`/users/${user?.id}?companyId=${companyId}`}
                            // onClick={() => router.push(`users/86?companyId=${companyId}`)}
                            className="cursor-pointer inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            <Edit className="w-4 h-4" />
                            Edit User
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Info */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <InfoCard icon={User} title="Personal Information">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                                    <p className="text-gray-900 font-medium">{user.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Age</label>
                                    <p className="text-gray-900">{user.age || 'Not specified'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                                    <p className="text-gray-900">{formatDate(user.birthdate)}</p>
                                </div>
                                {/* <div>
                                    <label className="text-sm font-medium text-gray-500">User ID</label>
                                    <p className="text-gray-900 font-mono">#{user.id}</p>
                                </div> */}
                            </div>
                        </InfoCard>

                        {/* Contact Information */}
                        <InfoCard icon={Mail} title="Contact Information">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Email</label>
                                        <p className="text-gray-900">{user.email || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Phone</label>
                                        <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </InfoCard>

                        {/* Location Assignments */}
                        {user.location_assignments && user.location_assignments.length > 0 && (
                            <InfoCard icon={MapPin} title="Assigned Locations">
                                <div className="space-y-3">
                                    {user.location_assignments.map((assignment) => (
                                        <div key={assignment.id} className="border border-gray-200 rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h4 className="font-medium text-gray-900">
                                                        {assignment.location?.name || 'Unknown Location'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        Location ID: #{assignment.location?.id}
                                                    </p>
                                                    {assignment.location?.latitude && assignment.location?.longitude && (
                                                        <p className="text-sm text-gray-500">
                                                            Coordinates: {assignment.location.latitude}, {assignment.location.longitude}
                                                        </p>
                                                    )}
                                                </div>
                                                <StatusBadge
                                                    isActive={assignment.is_active}
                                                    label={assignment.is_active ? 'Active' : 'Inactive'}
                                                />
                                            </div>
                                            <p className="text-xs text-gray-400 mt-2">
                                                Assigned: {formatDateTime(assignment.assigned_at)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </InfoCard>
                        )}
                    </div>

                    {/* Right Column - Secondary Info */}
                    <div className="space-y-6">

                        {/* Company Information */}
                        {user.companies && (
                            <InfoCard icon={Building} title="Company">
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500">Company Name</label>
                                        <p className="text-gray-900 font-medium">{user.companies.name}</p>
                                    </div>
                                    {/* <div>
                                        <label className="text-sm font-medium text-gray-500">Description</label>
                                        <p className="text-gray-600 text-sm">
                                            {user.companies.description || 'No description'}
                                        </p>
                                    </div> */}
                                    {/* <div>
                                        <label className="text-sm font-medium text-gray-500">Company ID</label>
                                        <p className="text-gray-900 font-mono">#{user.companies.id}</p>
                                    </div> */}
                                </div>
                            </InfoCard>
                        )}
                        {/* Role Information */}
                        <InfoCard icon={Shield} title="Role & Permissions">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role</label>
                                    <p className="text-gray-900 font-medium">{user.role?.name || 'No Role'}</p>
                                </div>
                                {/* <div>
                                    <label className="text-sm font-medium text-gray-500">Description</label>
                                    <p className="text-gray-600 text-sm">
                                        {user.role?.description || 'No description available'}
                                    </p>
                                </div> */}
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Role ID</label>
                                    <p className="text-gray-900 font-mono">#{user.role_id}</p>
                                </div>
                            </div>
                        </InfoCard>



                        {/* Account Information */}
                        <InfoCard icon={Clock} title="Account Information">
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Created</label>
                                    <p className="text-gray-900 text-sm">{formatDateTime(user.created_at)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Last Updated</label>
                                    <p className="text-gray-900 text-sm">{formatDateTime(user.updated_at)}</p>
                                </div>
                            </div>
                        </InfoCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
