"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { UsersApi } from "@/lib/api/usersApi";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, Loader2, User, Mail, Phone, Briefcase, MapPin, Edit } from "lucide-react";
import Link from "next/link";

const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start py-3">
        <div className="w-8 mr-4 text-indigo-500">{icon}</div>
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-md font-semibold text-slate-800">{value || 'N/A'}</p>
        </div>
    </div>
);

export default function ViewUserPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchUser = async () => {
                setIsLoading(true);
                const response = await UsersApi.getUserById(id);
                if (response.success) {
                    setUser(response.data);
                } else {
                    toast.error("Failed to fetch user data.");
                    router.push("/users");
                }
                setIsLoading(false);
            };
            fetchUser();
        }
    }, [id, router]);

    return (
        <>
            <Toaster position="top-center" />
            <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
                <div className="max-w-2xl mx-auto">
                    <button onClick={() => router.back()} className="flex items-center gap-2 mb-6 text-sm font-semibold text-slate-600 hover:text-slate-800">
                        <ArrowLeft size={18} />
                        Back to Users
                    </button>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-96">
                                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                            </div>
                        ) : user ? (
                            <>
                                <div className="p-6 sm:p-8 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">{user.name}</h1>
                                        <p className="text-md text-slate-500">{user.role?.name || 'No Role Assigned'}</p>
                                    </div>
                                    <Link href={`/users/${user.id}/edit`}>
                                        <span className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg shadow-sm hover:bg-indigo-700 cursor-pointer">
                                            <Edit size={16} />
                                            Edit User
                                        </span>
                                    </Link>
                                </div>
                                <div className="p-6 sm:p-8 grid grid-cols-1 divide-y divide-slate-200">
                                    <DetailItem icon={<Mail size={20} />} label="Email" value={user.email} />
                                    <DetailItem icon={<Phone size={20} />} label="Phone" value={user.phone} />
                                    <DetailItem 
                                        icon={<MapPin size={20} />} 
                                        label="Assigned Locations" 
                                        value={
                                            user.location_assignments && user.location_assignments.length > 0
                                            ? user.location_assignments.map(a => a.location.name).join(', ')
                                            : 'None'
                                        } 
                                    />
                                </div>
                            </>
                        ) : (
                             <p className="text-center text-slate-500 p-12">User not found.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
