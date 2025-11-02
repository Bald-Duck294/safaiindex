"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import {
    UserPlus,
    User,
    MapPin,
    Search,
    ChevronDown,
    X,
    ArrowLeft,
    AlertCircle,
} from "lucide-react";

export default function AddSupervisorAssignmentPage() {
    const [selectedSupervisors, setSelectedSupervisors] = useState([]);
    const [status, setStatus] = useState("assigned");
    const [allUsers, setAllUsers] = useState([]);
    const [availableSupervisors, setAvailableSupervisors] = useState([]);
    const [assignedSupervisors, setAssignedSupervisors] = useState([]);
    const [userSearchTerm, setUserSearchTerm] = useState("");
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();
    const { companyId } = useCompanyId();

    const locationId = searchParams.get('locationId');
    const locationName = searchParams.get('locationName');

    const userDropdownRef = useRef(null);

    // ✅ Fetch supervisors and filter out already assigned ones
    useEffect(() => {
        if (!companyId || !locationId) return;

        const fetchData = async () => {
            setIsLoading(true);
            try {
                console.log('in fetch data')
                // Fetch all supervisors
                const userRes = await UsersApi.getAllUsers(companyId);
                console.log("✅ userRes", userRes);

                if (userRes.success) {
                    const supervisors = (userRes.data || []).filter(
                        user => user.role?.name?.toLowerCase() === 'supervisor' || user.role_id === 3
                    );
                    setAllUsers(supervisors);

                    // ✅ Fetch existing assignments for this location
                    const assignmentsRes = await AssignmentsApi.getAssignmentsByLocation(locationId, companyId);
                    console.log("✅ assignmentsRes", assignmentsRes);

                    if (assignmentsRes.success) {
                        const assignedSupervisorIds = assignmentsRes.data.map(a => a.cleaner_user_id);
                        setAssignedSupervisors(assignmentsRes.data.filter(item => item.role_id === 3));

                        // ✅ Filter out supervisors who are already assigned
                        const available = supervisors.filter(
                            supervisor => !assignedSupervisorIds.includes(supervisor.id)
                        );
                        setAvailableSupervisors(available);

                        console.log(`✅ Total supervisors: ${supervisors.length}`);
                        console.log(`✅ Already assigned: ${assignedSupervisorIds.length}`);
                        console.log(`✅ Available to assign: ${available.length}`);
                    } else {
                        // If fetch fails, show all supervisors
                        setAvailableSupervisors(supervisors);
                    }
                }
            } catch (err) {
                console.error("❌ Error while fetching:", err);
                toast.error("Failed to fetch supervisors");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [companyId, locationId]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(event.target)
            ) {
                setIsUserDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSupervisorSelect = (supervisor) => {
        setSelectedSupervisors((prev) =>
            prev.some((s) => s.id === supervisor.id)
                ? prev.filter((s) => s.id !== supervisor.id)
                : [...prev, supervisor]
        );
    };

    const handleRemoveSupervisor = (supervisorId) => {
        setSelectedSupervisors(prev => prev.filter(s => s.id !== supervisorId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedSupervisors.length === 0) {
            return toast.error("Please select at least one supervisor.");
        }

        if (!locationId) {
            return toast.error("Location ID is missing.");
        }

        setIsLoading(true);

        try {
            const assignmentData = {
                location_id: locationId,
                cleaner_user_ids: selectedSupervisors.map(s => s.id),
                company_id: companyId,
                status: status,
                role_id: 3, 
            };

            const response = await AssignmentsApi.createAssignmentsForLocation(assignmentData);

            if (response.success) {
                const { created, skipped } = response.data.data || {};

                if (created > 0) {
                    toast.success(`${created} supervisor(s) assigned successfully!`);
                }

                if (skipped > 0) {
                    toast.warning(`${skipped} supervisor(s) were already assigned.`);
                }

                setTimeout(() => {
                    router.push(`/assignments/supervisor?companyId=${companyId}&locationId=${locationId}&locationName=${encodeURIComponent(locationName)}`);
                }, 1000);
            } else {
                toast.error(response.error || "Failed to create assignments");
            }
        } catch (error) {
            console.error("Error creating assignments:", error);
            toast.error("Failed to create assignments");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Filter only available supervisors (not assigned)
    const filteredUsers = availableSupervisors.filter((user) =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
        <>
            <Toaster position="top-right" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
                <div className="max-w-3xl mx-auto">
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
                                        <UserPlus className="w-7 h-7" />
                                        Map Supervisors
                                    </h1>
                                    {locationName && (
                                        <p className="text-purple-300 text-sm mt-1">
                                            <MapPin className="inline h-4 w-4 mr-1" />
                                            {locationName}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Info Banner - Show if supervisors already assigned */}
                    {assignedSupervisors.length > 0 && (
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="text-sm font-semibold text-purple-900 mb-1">
                                    {assignedSupervisors.length} supervisor(s) already assigned
                                </h3>
                                <p className="text-xs text-purple-700">
                                    Only showing supervisors who haven't been assigned to this location yet.
                                    {availableSupervisors.length === 0 && " All supervisors are already assigned!"}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Select Supervisors */}
                            <div ref={userDropdownRef}>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">
                                    Select Supervisors ({selectedSupervisors.length} selected)
                                </label>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                                        disabled={availableSupervisors.length === 0}
                                        className="w-full flex justify-between items-center text-left px-4 py-3 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors disabled:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                                    >
                                        <span>
                                            {availableSupervisors.length === 0
                                                ? "No supervisors available to assign"
                                                : selectedSupervisors.length > 0
                                                    ? `${selectedSupervisors.length} supervisor(s) selected`
                                                    : "Click to select supervisors..."}
                                        </span>
                                        <ChevronDown
                                            className={`w-5 h-5 text-slate-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""
                                                }`}
                                        />
                                    </button>
                                    {isUserDropdownOpen && availableSupervisors.length > 0 && (
                                        <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-xl max-h-72 flex flex-col">
                                            <div className="p-3 border-b border-slate-200">
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        placeholder="Search for a supervisor..."
                                                        value={userSearchTerm}
                                                        onChange={(e) => setUserSearchTerm(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                    />
                                                </div>
                                            </div>
                                            <div className="overflow-y-auto p-2">
                                                {filteredUsers.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-slate-500">
                                                        No supervisors found
                                                    </div>
                                                ) : (
                                                    filteredUsers.map((user) => (
                                                        <label
                                                            key={user.id}
                                                            className="flex items-center p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedSupervisors.some(
                                                                    (s) => s.id === user.id
                                                                )}
                                                                onChange={() => handleSupervisorSelect(user)}
                                                                className="h-4 w-4 rounded text-purple-600 border-slate-300 focus:ring-purple-500"
                                                            />
                                                            <div className="ml-3 flex items-center gap-2">
                                                                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                                    <User className="w-4 h-4 text-purple-600" />
                                                                </div>
                                                                <div>
                                                                    <div className="text-sm font-medium text-slate-700">
                                                                        {user.name}
                                                                    </div>
                                                                    {user.phone && (
                                                                        <div className="text-xs text-slate-500">
                                                                            {user.phone}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </label>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Selected Supervisors Display */}
                                {selectedSupervisors.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {selectedSupervisors.map((supervisor) => (
                                            <div
                                                key={supervisor.id}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium"
                                            >
                                                <User className="w-3 h-3" />
                                                <span>{supervisor.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSupervisor(supervisor.id)}
                                                    className="hover:text-purple-900 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Available count */}
                                <div className="mt-2 text-xs text-slate-500">
                                    {availableSupervisors.length} supervisor(s) available to assign
                                </div>
                            </div>

                            {/* Location Info */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                                    <MapPin className="w-4 h-4" />
                                    <span className="font-medium">Assigning to Location:</span>
                                </div>
                                <div className="text-slate-800 font-semibold">{locationName || 'Unknown Location'}</div>
                                <div className="text-xs text-slate-500 mt-1">Status will be set to: <span className="font-medium text-purple-600">Assigned</span></div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-4 border-t border-slate-200">
                                <button
                                    type="submit"
                                    disabled={isLoading || selectedSupervisors.length === 0 || availableSupervisors.length === 0}
                                    className="w-full px-4 py-3 font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all transform hover:scale-[1.02] disabled:bg-slate-400 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : availableSupervisors.length === 0 ? (
                                        <>
                                            <AlertCircle className="w-5 h-5" />
                                            All Supervisors Already Assigned
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="w-5 h-5" />
                                            Create {selectedSupervisors.length} Assignment{selectedSupervisors.length !== 1 ? 's' : ''}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}
