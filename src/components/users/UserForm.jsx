"use client";

import { useState, useEffect } from "react";
import roleApi from "@/lib/api/roleApi";
import LocationsApi from "@/lib/api/LocationApi";
import { CompanyApi } from "@/lib/api/companyApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";

export default function UserForm({ initialData, onSubmit, isEditing = false }) {
    const { companyId } = useCompanyId(); // Current user's company context

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role_id: '',
        company_id: companyId, // Fixed to current company
        location_ids: [],
    });

    const [currentCompany, setCurrentCompany] = useState(null);
    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [canAssignLocation, setCanAssignLocation] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);

    // Fetch current company details and company-specific data
    useEffect(() => {
        const fetchCompanyData = async () => {
            if (!companyId) {
                console.error('No company ID available');
                setIsLoadingData(false);
                return;
            }

            setIsLoadingData(true);
            try {
                // Fetch current company details
                const companyRes = await CompanyApi.getCompanyById(companyId);
                if (companyRes.success) {
                    setCurrentCompany(companyRes.data);
                }

                // Fetch roles for current company
                const rolesRes = await roleApi.getAllRoles(companyId);
                console.log(rolesRes, "roles res");
                if (rolesRes.success) {
                    setRoles(rolesRes.data?.data || []);
                }

                // Fetch locations for current company
                const locationsRes = await LocationsApi.getAllLocations(companyId);
                if (locationsRes.success) {
                    setLocations(locationsRes.data || []);
                }
            } catch (error) {
                console.error('Error fetching company data:', error);
            }
            setIsLoadingData(false);
        };

        fetchCompanyData();
    }, [companyId]);

    // Pre-fill form if editing
    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                password: '', // Never pre-fill password
                phone: initialData.phone || '',
                role_id: initialData.role_id || '',
                company_id: companyId, // Always use current company
                location_ids: initialData.location_assignments?.filter(a => a.is_active).map(a => a.location_id.toString()) || [],
            });
        }
    }, [initialData, companyId]);

    // Determine if location assignment should be visible
    useEffect(() => {
        const selectedRole = roles.find(r => r.id.toString() === formData.role_id.toString());
        if (selectedRole && ['Admin', 'Supervisor'].includes(selectedRole.name)) {
            setCanAssignLocation(true);
        } else {
            setCanAssignLocation(false);
            setFormData(prev => ({ ...prev, location_ids: [] }));
        }
    }, [formData.role_id, roles]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (e) => {
        const { value, checked } = e.target;
        const locId = value;
        setFormData(prev => ({
            ...prev,
            location_ids: checked
                ? [...prev.location_ids, locId]
                : prev.location_ids.filter(id => id !== locId)
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!companyId) {
            alert('Company context not available');
            return;
        }
        
        const dataToSend = {
            ...formData,
            company_id: companyId, // Ensure company_id is current company
            role_id: formData.role_id ? parseInt(formData.role_id) : null,
        };
        
        console.log('Submitting user data:', dataToSend);
        onSubmit(dataToSend);
    };

    const inputClass = "w-full px-4 py-2.5 text-md bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Display (Read-only) */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                <div className="w-full px-4 py-2.5 text-md bg-gray-50 border border-slate-300 rounded-lg">
                    <div className="flex items-center justify-between">
                        <span className="text-slate-800 font-medium">
                            {currentCompany?.name || 'Loading...'}
                        </span>
                        <span className="text-xs text-slate-500 bg-slate-200 px-2 py-1 rounded">
                            Current Company
                        </span>
                    </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                    New user will be added to your company
                </p>
            </div>

            {/* Name Field */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    required 
                    className={inputClass} 
                    placeholder="Enter full name"
                />
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                    <input 
                        type="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        className={inputClass} 
                        placeholder="Enter email address"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input 
                        type="tel" 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className={inputClass} 
                        maxLength={10} 
                        placeholder="Enter 10-digit phone number"
                    />
                </div>
            </div>

            {/* Password Field */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    Password {!isEditing && '*'}
                </label>
                <input 
                    type="password" 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    required={!isEditing} 
                    className={inputClass} 
                    placeholder={isEditing ? "Leave blank to keep current password" : "Enter password (min 6 characters)"} 
                    minLength={!isEditing ? 6 : undefined}
                />
            </div>

            {/* Role Selection */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role *</label>
                <select 
                    name="role_id" 
                    value={formData.role_id} 
                    onChange={handleChange} 
                    required 
                    className={inputClass}
                    disabled={isLoadingData}
                >
                    <option value="">
                        {isLoadingData ? 'Loading roles...' : 'Select a role'}
                    </option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>
                            {role.name}
                        </option>
                    ))}
                </select>
                {roles.length === 0 && !isLoadingData && (
                    <p className="text-sm text-amber-600 mt-1">
                        No roles available for your company. Contact support.
                    </p>
                )}
            </div>

            {/* Location Assignment */}
            {canAssignLocation && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                        Assign Locations (Optional)
                    </label>
                    <div className="mt-2 p-4 border border-slate-300 rounded-lg max-h-48 overflow-y-auto space-y-2 bg-slate-50">
                        {isLoadingData ? (
                            <p className="text-sm text-slate-500">Loading locations...</p>
                        ) : locations.length > 0 ? (
                            locations.map(loc => (
                                <div key={loc.id} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`loc-${loc.id}`}
                                        name="location_ids"
                                        value={loc.id.toString()}
                                        checked={formData.location_ids.includes(loc.id.toString())}
                                        onChange={handleLocationChange}
                                        className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                                    />
                                    <label htmlFor={`loc-${loc.id}`} className="ml-3 text-sm text-slate-700">
                                        {loc.name}
                                        {loc.address && (
                                            <span className="text-xs text-slate-500 ml-1">
                                                - {loc.address}
                                            </span>
                                        )}
                                    </label>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-slate-500">
                                No locations available. Create locations first to assign them.
                            </p>
                        )}
                    </div>
                    {formData.location_ids.length > 0 && (
                        <p className="text-sm text-indigo-600 mt-2">
                            {formData.location_ids.length} location(s) selected
                        </p>
                    )}
                </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4">
                <button 
                    type="button" 
                    onClick={() => window.history.back()} 
                    className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300 transition-colors"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors disabled:bg-slate-400"
                    disabled={isLoadingData}
                >
                    {isEditing ? 'Save Changes' : 'Create User'}
                </button>
            </div>
        </form>
    );
}
