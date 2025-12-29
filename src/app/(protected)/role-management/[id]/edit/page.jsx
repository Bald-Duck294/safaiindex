// src/app/(protected)/role-management/[id]/edit/page.jsx

"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Shield, Save, Loader2, AlertTriangle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MODULES } from '@/lib/constants/permissions';
import RolesApi from '@/lib/api/rolesApi';

const EditRolePage = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissions: [],
    });
    const [originalRole, setOriginalRole] = useState(null);
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [userCount, setUserCount] = useState(0);

    const router = useRouter();
    const params = useParams();
    const roleId = params.id;
    const { canUpdate } = usePermissions();

    const isSystemRole = roleId && parseInt(roleId) <= 4;

    useEffect(() => {
        if (!canUpdate(MODULES.ROLE_MANAGEMENT)) {
            toast.error('You do not have permission to edit roles');
            router.push('/role-management');
            return;
        }

        if (roleId) {
            fetchRoleData();
            fetchAvailablePermissions();
        }
    }, [roleId]);

    const fetchRoleData = async () => {
        try {
            const res = await RolesApi.getById(roleId);

            if (res.success && res.data.role) {
                const role = res.data.role;
                setOriginalRole(role);
                setFormData({
                    name: role.name,
                    description: role.description || '',
                    permissions: role.permissions || [],
                });
                setUserCount(role._count?.users || 0);
            } else {
                toast.error('Role not found');
                router.push('/role-management');
            }
        } catch (error) {
            console.error('Error fetching role:', error);
            toast.error('Failed to load role');
            router.push('/role-management');
        }
    };

    const fetchAvailablePermissions = async () => {
        setLoading(true);
        try {
            const res = await RolesApi.getAvailablePermissions();

            if (res.success && res.data.modules) {
                setModules(res.data.modules);
            } else {
                toast.error('Failed to load permissions');
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            toast.error('Failed to load permissions');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handlePermissionToggle = (permissionKey) => {
        setFormData(prev => {
            const permissions = prev.permissions.includes(permissionKey)
                ? prev.permissions.filter(p => p !== permissionKey)
                : [...prev.permissions, permissionKey];

            return { ...prev, permissions };
        });
    };

    const handleModuleToggle = (module) => {
        const modulePermissions = module.permissions || [];
        const allSelected = modulePermissions.every(p =>
            formData.permissions.includes(p)
        );

        setFormData(prev => {
            let permissions = [...prev.permissions];

            if (allSelected) {
                permissions = permissions.filter(p => !modulePermissions.includes(p));
            } else {
                modulePermissions.forEach(p => {
                    if (!permissions.includes(p)) {
                        permissions.push(p);
                    }
                });
            }

            return { ...prev, permissions };
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Role name is required';
        }

        if (formData.permissions.length === 0) {
            newErrors.permissions = 'At least one permission is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error('Please fix the errors');
            return;
        }

        // Check what changed
        const updateData = {};
        if (formData.name !== originalRole.name) {
            updateData.name = formData.name.trim();
        }
        if (formData.description !== (originalRole.description || '')) {
            updateData.description = formData.description.trim() || null;
        }
        if (JSON.stringify(formData.permissions) !== JSON.stringify(originalRole.permissions)) {
            updateData.permissions = formData.permissions;
        }

        if (Object.keys(updateData).length === 0) {
            toast.error('No changes made');
            return;
        }

        setSubmitting(true);
        try {
            const res = await RolesApi.update(roleId, updateData);

            if (res.success) {
                toast.success('Role updated successfully');
                router.push('/role-management');
            } else {
                toast.error(res.error || 'Failed to update role');
            }
        } catch (error) {
            console.error('Error updating role:', error);
            toast.error('Failed to update role');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !originalRole) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-slate-600">Loading role data...</p>
                </div>
            </div>
        );
    }

    const isModuleFullySelected = (module) => {
        return (module.permissions || []).every(p =>
            formData.permissions.includes(p)
        );
    };

    const isModulePartiallySelected = (module) => {
        const modulePerms = module.permissions || [];
        return modulePerms.some(p => formData.permissions.includes(p)) &&
            !isModuleFullySelected(module);
    };

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 sm:mb-6">
                        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-4 sm:px-6 sm:py-5">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => router.back()}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-white" />
                                </button>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-lg">
                                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white capitalize">
                                            Edit Role: {originalRole.name}
                                        </h1>
                                        <p className="text-slate-300 text-xs sm:text-sm">
                                            Update role permissions and details
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* System Role Warning */}
                        {isSystemRole && (
                            <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium text-amber-900">
                                            System Role Warning
                                        </p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            This is a system role. Changes will affect {userCount} user(s). Please be careful when modifying permissions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* User Count Info */}
                        {userCount > 0 && (
                            <div className="bg-blue-50 border-b border-blue-200 px-4 py-3">
                                <p className="text-sm text-blue-800">
                                    <strong>{userCount}</strong> user{userCount !== 1 ? 's' : ''} currently assigned to this role
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h2 className="font-semibold text-slate-800">Basic Information</h2>
                            </div>
                            <div className="p-4 sm:p-6 space-y-4">
                                {/* Role Name */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Role Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., manager, operator"
                                        className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-500' : 'border-slate-300'
                                            } focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description (Optional)
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        placeholder="Brief description of this role"
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Permissions Card */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4">
                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                                <h2 className="font-semibold text-slate-800">
                                    Permissions <span className="text-red-500">*</span>
                                </h2>
                                <p className="text-xs text-slate-500 mt-1">
                                    Select the permissions this role should have
                                </p>
                                {errors.permissions && (
                                    <p className="text-red-500 text-xs mt-1">{errors.permissions}</p>
                                )}
                            </div>
                            <div className="p-4 sm:p-6">
                                <div className="space-y-4">
                                    {modules.map((module) => {
                                        const modulePerms = module.permissions || [];
                                        const isFullySelected = isModuleFullySelected(module);
                                        const isPartiallySelected = isModulePartiallySelected(module);

                                        return (
                                            <div
                                                key={module.key}
                                                className="border border-slate-200 rounded-lg overflow-hidden"
                                            >
                                                {/* Module Header */}
                                                <div
                                                    className={`px-4 py-3 cursor-pointer transition-colors ${isFullySelected
                                                            ? 'bg-blue-50 border-b border-blue-200'
                                                            : 'bg-slate-50 border-b border-slate-200'
                                                        }`}
                                                    onClick={() => handleModuleToggle(module)}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={isFullySelected}
                                                                onChange={() => { }}
                                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            />
                                                            <div>
                                                                <h3 className="font-semibold text-slate-800">
                                                                    {module.label}
                                                                </h3>
                                                                <p className="text-xs text-slate-500">
                                                                    {module.description}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {isPartiallySelected && (
                                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                                Partial
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Individual Permissions */}
                                                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white">
                                                    {modulePerms.map((permission) => {
                                                        const action = permission.split('.')[1];
                                                        const isChecked = formData.permissions.includes(permission);

                                                        return (
                                                            <label
                                                                key={permission}
                                                                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${isChecked
                                                                        ? 'bg-blue-50 border-blue-300'
                                                                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handlePermissionToggle(permission)}
                                                                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                                />
                                                                <span className="text-sm text-slate-700 capitalize font-medium">
                                                                    {action.replace('_', ' ')}
                                                                </span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                disabled={submitting}
                                className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="h-5 w-5" />
                                        Update Role
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default EditRolePage;
