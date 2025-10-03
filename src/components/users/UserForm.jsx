"use client";

import { useState, useEffect } from "react";
// NOTE: These API files will need to be created in your lib/api/ directory
import roleApi from "@/lib/api/roleApi";
// import { LocationsApi } from "../../lib/api/locationsApi";
import LocationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
export default function UserForm({ initialData, onSubmit, isEditing = false }) {

    const { companyId } = useCompanyId();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        role_id: '',
        company_id: companyId, // Default or fetch dynamically
        location_ids: [],
    });

    const [roles, setRoles] = useState([]);
    const [locations, setLocations] = useState([]);
    const [canAssignLocation, setCanAssignLocation] = useState(false);

    // --- MOCK USER DATA ---
    // FIXME: Replace this with your actual user state management (e.g., Redux, Context API)
    // const [currentUser, setCurrentUser] = useState({
    //     company_id: '1' // Default company_id for demonstration
    // });

    // Fetch roles and locations on component mount
    useEffect(() => {
        // const companyId = currentUser?.company_id;
        if (!companyId) return;

        setFormData(prev => ({ ...prev, company_id: companyId }));

        const fetchData = async () => {
            const rolesRes = await roleApi.getAllRoles(companyId);
            console.log(rolesRes, "roles res")
            if (rolesRes.success) setRoles(rolesRes.data?.data);

            const locationsRes = await LocationsApi.getAllLocations(companyId);
            if (locationsRes.success) setLocations(locationsRes.data);
        };
        fetchData();
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
                company_id: initialData.company_id || companyId,
                location_ids: initialData.location_assignments?.filter(a => a.is_active).map(a => a.location_id.toString()) || [],
            });
        }
    }, [initialData]);

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
        const dataToSend = {
            ...formData,
            role_id: formData.role_id ? parseInt(formData.role_id) : null,
        };
        onSubmit(dataToSend);
    };

    const inputClass = "w-full px-4 py-2.5 text-md bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition";

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className={inputClass} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required className={inputClass} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClass} maxLength={10} />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} className={inputClass} placeholder={isEditing ? "Leave blank to keep current password" : ""} />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                <select name="role_id" value={formData.role_id} onChange={handleChange} required className={inputClass}>
                    <option value="">Select a role</option>
                    {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                    ))}
                </select>
            </div>

            {canAssignLocation && (
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign Locations</label>
                    <div className="mt-2 p-4 border border-slate-300 rounded-lg max-h-48 overflow-y-auto space-y-2 bg-slate-50">
                        {locations.length > 0 ? locations.map(loc => (
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
                                <label htmlFor={`loc-${loc.id}`} className="ml-3 text-sm text-slate-700">{loc.name}</label>
                            </div>
                        )) : <p className="text-sm text-slate-500">No locations available.</p>}
                    </div>
                </div>
            )}

            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={() => window.history.back()} className="px-6 py-2 text-sm font-medium text-slate-700 bg-slate-200 rounded-md hover:bg-slate-300">
                    Cancel
                </button>
                <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                    {isEditing ? 'Save Changes' : 'Create User'}
                </button>
            </div>
        </form>
    );
}

