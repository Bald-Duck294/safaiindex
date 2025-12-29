// src/app/(protected)/role-management/page.jsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Plus, Pencil, Trash2, Search, Users } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Loader from '@/components/ui/Loader';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MODULES } from '@/lib/constants/permissions';
import RolesApi from '@/lib/api/rolesApi';

const RoleManagementPage = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleteModal, setDeleteModal] = useState({ open: false, role: null });
    const [deleting, setDeleting] = useState(false);

    const router = useRouter();
    const { canView, canAdd, canUpdate, canDelete } = usePermissions();

    useEffect(() => {
        if (canView(MODULES.ROLE_MANAGEMENT)) {
            fetchRoles();
        } else {
            toast.error('You do not have permission to view roles');
            router.push('/dashboard');
        }
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            const data = await RolesApi.getAllRoles();

            if (data.success) {
                setRoles(data.data?.roles);
            } else {
                toast.error('Failed to fetch roles');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            toast.error(error.message || 'Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteModal.role) return;

        setDeleting(true);
        try {
            const data = await RolesApi.deleteRole(deleteModal.role.id);

            if (data.success) {
                toast.success(`Role "${deleteModal.role.name}" deleted successfully`);
                fetchRoles();
                setDeleteModal({ open: false, role: null });
            } else {
                toast.error(data.error || 'Failed to delete role');
            }
        } catch (error) {
            console.error('Error deleting role:', error);
            toast.error(error.message || 'Failed to delete role');
        } finally {
            setDeleting(false);
        }
    };

    const filteredRoles = roles.filter((role) =>
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen px-4">
                <Loader size="large" color="#3b82f6" message="Loading roles..." />
            </div>
        );
    }

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 sm:mb-6">
                        <div className="bg-slate-800 px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg">
                                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                                            Role Management
                                        </h1>
                                        <p className="text-slate-300 text-xs sm:text-sm">
                                            Manage user roles and permissions
                                        </p>
                                    </div>
                                </div>

                                {canAdd(MODULES.ROLE_MANAGEMENT) && (
                                    <button
                                        onClick={() => router.push('/role-management/add')}
                                        className="flex items-center gap-1.5 px-3 py-2 sm:px-4 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all shadow-sm"
                                    >
                                        <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                        <span className="hidden sm:inline">New</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        <div className="p-3 sm:p-4 bg-slate-50/50 border-b border-slate-200">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search roles..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-100 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Sr No.
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Users
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredRoles.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-slate-500">
                                            No roles found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredRoles.map((role, index) => (
                                        <tr key={role.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-slate-700 text-white text-sm font-semibold rounded">
                                                    {index + 1}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-semibold text-slate-800 capitalize">
                                                        {role.name}
                                                    </div>
                                                    {role.description && (
                                                        <div className="text-xs text-slate-500 mt-1">
                                                            {role.description}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                                    <Users className="w-3 h-3" />
                                                    <span>{role._count?.users || 0}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    {canUpdate(MODULES.ROLE_MANAGEMENT) && (
                                                        <button
                                                            onClick={() => router.push(`/role-management/${role.id}/edit`)}
                                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </button>
                                                    )}

                                                    {canDelete(MODULES.ROLE_MANAGEMENT) && role.id > 4 && (
                                                        <button
                                                            onClick={() => setDeleteModal({ open: true, role })}
                                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                        {filteredRoles.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center text-slate-500">
                                No roles found
                            </div>
                        ) : (
                            filteredRoles.map((role, index) => (
                                <div key={role.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-700 text-white rounded flex items-center justify-center text-sm font-bold">
                                                {index + 1}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-slate-800 capitalize">{role.name}</h3>
                                                {role.description && (
                                                    <p className="text-xs text-slate-500">{role.description}</p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-sm font-medium">
                                            <Users className="w-3 h-3" />
                                            <span>{role._count?.users || 0}</span>
                                        </div>
                                    </div>

                                    <div className="p-4 flex justify-end gap-2">
                                        {canUpdate(MODULES.ROLE_MANAGEMENT) && (
                                            <button
                                                onClick={() => router.push(`/role-management/${role.id}/edit`)}
                                                className="flex items-center gap-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
                                                Edit
                                            </button>
                                        )}

                                        {canDelete(MODULES.ROLE_MANAGEMENT) && role.id > 4 && (
                                            <button
                                                onClick={() => setDeleteModal({ open: true, role })}
                                                className="flex items-center gap-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteModal.open && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-full bg-red-100">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-slate-800">
                                    Delete Role
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    This action cannot be undone
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 mb-6">
                            Are you sure you want to delete the role{' '}
                            <strong className="capitalize">"{deleteModal.role?.name}"</strong>?
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ open: false, role: null })}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default RoleManagementPage;
