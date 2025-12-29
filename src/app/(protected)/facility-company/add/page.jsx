"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Building2,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calendar,
    Save,
    X,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi";
import Loader from "@/components/ui/Loader";
import { State, City } from 'country-state-city';
import { useRequirePermission } from '@/lib/hooks/useRequirePermission';
import { usePermissions } from '@/lib/hooks/usePermissions';
import { MODULES } from '@/lib/constants/permissions';

export default function AddFacilityCompanyPage() {

    useRequirePermission(MODULES.FACILITY_COMPANIES);

    const { canAdd } = usePermissions();
    const canAddFacility = canAdd(MODULES.FACILITY_COMPANIES);

    const router = useRouter();
    const { companyId } = useCompanyId();
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ✅ State and City dropdowns
    const [availableStates, setAvailableStates] = useState([]);
    const [availableCities, setAvailableCities] = useState([]);
    const [stateSearch, setStateSearch] = useState("");
    const [citySearch, setCitySearch] = useState("");
    const [showStateDropdown, setShowStateDropdown] = useState(false);
    const [showCityDropdown, setShowCityDropdown] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        // Basic Information
        name: "",
        email: "",
        phone: "",

        // Contact Person Details
        contact_person_name: "",
        contact_person_phone: "",
        contact_person_email: "",

        // Address
        address: "",
        city: "",
        state: "",
        pincode: "",

        // Business/Legal
        registration_number: "",
        pan_number: "",
        license_number: "",
        license_expiry_date: "",

        // Contract Details
        contract_start_date: "",
        contract_end_date: "",

        // Additional Info
        description: "",

        // Status (always true by default)
        status: true,
    });

    // Errors
    const [errors, setErrors] = useState({});

    // ✅ Load Indian states on mount
    useEffect(() => {
        const indiaStates = State.getStatesOfCountry('IN');
        const stateNames = indiaStates.map(state => state.name);
        setAvailableStates(stateNames);
    }, []);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear error when user types
        if (errors[name]) {
            setErrors((prev) => ({
                ...prev,
                [name]: "",
            }));
        }
    };

    // ✅ Handle state selection - updates cities when state changes
    const handleStateSelect = (state) => {
        setFormData((prev) => ({
            ...prev,
            state: state,
            city: "" // ✅ Reset city when state changes
        }));
        setStateSearch(state);
        setCitySearch(""); // ✅ Reset city search
        setShowStateDropdown(false);

        // ✅ Load cities for selected state
        const indiaStates = State.getStatesOfCountry('IN');
        const selectedState = indiaStates.find(s => s.name === state);

        if (selectedState) {
            const cities = City.getCitiesOfState('IN', selectedState.isoCode);
            const cityNames = cities.map(city => city.name);
            setAvailableCities(cityNames);
        } else {
            setAvailableCities([]);
        }

        if (errors.state) {
            setErrors((prev) => ({
                ...prev,
                state: "",
            }));
        }
    };

    // ✅ Handle city selection
    const handleCitySelect = (city) => {
        setFormData((prev) => ({
            ...prev,
            city: city,
        }));
        setCitySearch(city);
        setShowCityDropdown(false);

        if (errors.city) {
            setErrors((prev) => ({
                ...prev,
                city: "",
            }));
        }
    };

    // ✅ Filter states
    const filteredStates = availableStates.filter((state) =>
        state.toLowerCase().includes(stateSearch.toLowerCase())
    );

    // ✅ Filter cities
    const filteredCities = availableCities.filter((city) =>
        city.toLowerCase().includes(citySearch.toLowerCase())
    );

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        // Required fields
        if (!formData.name?.trim()) {
            newErrors.name = "Company name is required";
        }

        if (!formData.phone?.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (!/^\d{10}$/.test(formData.phone.trim())) {
            newErrors.phone = "Phone number must be 10 digits";
        }

        if (!formData.contact_person_name?.trim()) {
            newErrors.contact_person_name = "Contact person name is required";
        }

        if (!formData.city?.trim()) {
            newErrors.city = "City is required";
        }

        if (!formData.state?.trim()) {
            newErrors.state = "State is required";
        }

        if (!formData.pincode?.trim()) {
            newErrors.pincode = "Pincode is required";
        } else if (!/^\d{6}$/.test(formData.pincode.trim())) {
            newErrors.pincode = "Pincode must be 6 digits";
        }

        // Optional validations
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }

        if (
            formData.contact_person_email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact_person_email)
        ) {
            newErrors.contact_person_email = "Invalid email format";
        }

        if (
            formData.contact_person_phone &&
            !/^\d{10}$/.test(formData.contact_person_phone.trim())
        ) {
            newErrors.contact_person_phone = "Phone number must be 10 digits";
        }

        if (formData.pan_number && !/^[A-Z]{5}\d{4}[A-Z]$/.test(formData.pan_number)) {
            newErrors.pan_number = "Invalid PAN format (e.g., ABCDE1234F)";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle submit
    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!canAddFacility) {
            toast.error("You don't have permission to add facility companies");
            return;
        }

        if (!validateForm()) {
            toast.error("Please fix the errors in the form");
            return;
        }

        if (!companyId) {
            toast.error("Company ID not found");
            return;
        }

        setIsSubmitting(true);

        // Prepare data
        const submitData = {
            ...formData,
            company_id: companyId,
            // Convert date strings to proper format
            license_expiry_date: formData.license_expiry_date || null,
            contract_start_date: formData.contract_start_date || null,
            contract_end_date: formData.contract_end_date || null,
        };

        const result = await FacilityCompanyApi.create(submitData);

        if (result.success) {
            toast.success("Facility company added successfully!");
            setTimeout(() => {
                router.push(`/facility-company?companyId=${companyId}`);
            }, 1000);
        } else {
            toast.error(result.error || "Failed to add facility company");
            setIsSubmitting(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (
            confirm(
                "Are you sure you want to cancel? All unsaved changes will be lost."
            )
        ) {
            router.push(`/facility-company?companyId=${companyId}`);
        }
    };

    return (
        <>
            <Toaster position="top-right" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => router.back()}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-slate-600" />
                            </button>
                            <div className="flex items-center gap-3">
                                <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                                    <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
                                        Add Facility Company
                                    </h1>
                                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                                        Fill in the details below
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* ✅ Permission Warning */}
                    {!canAddFacility && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 sm:mb-6">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="text-sm font-semibold text-red-800 mb-1">
                                        No Permission
                                    </h4>
                                    <p className="text-sm text-red-700">
                                        You don't have permission to add facility companies. Please contact your administrator.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        {/* Basic Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Building2 className="w-5 h-5 text-blue-600" />
                                Basic Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Company Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Company Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter company name"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.name
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="company@example.com"
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300"
                                                }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phone
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300"
                                                }`}
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Contact Person Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <User className="w-5 h-5 text-blue-600" />
                                Contact Person Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Contact Person Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contact Person Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="contact_person_name"
                                        value={formData.contact_person_name}
                                        onChange={handleChange}
                                        placeholder="Enter contact person name"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contact_person_name
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    {errors.contact_person_name && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.contact_person_name}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Person Phone */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contact Person Phone
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="tel"
                                            name="contact_person_phone"
                                            value={formData.contact_person_phone}
                                            onChange={handleChange}
                                            placeholder="10-digit phone number"
                                            maxLength="10"
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contact_person_phone
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300"
                                                }`}
                                        />
                                    </div>
                                    {errors.contact_person_phone && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.contact_person_phone}
                                        </p>
                                    )}
                                </div>

                                {/* Contact Person Email */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contact Person Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            name="contact_person_email"
                                            value={formData.contact_person_email}
                                            onChange={handleChange}
                                            placeholder="person@example.com"
                                            className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.contact_person_email
                                                ? "border-red-300 bg-red-50"
                                                : "border-slate-300"
                                                }`}
                                        />
                                    </div>
                                    {errors.contact_person_email && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.contact_person_email}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Address Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-600" />
                                Address Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Enter full address"
                                        rows="3"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* State - Searchable Dropdown */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={stateSearch || formData.state}
                                        onChange={(e) => {
                                            setStateSearch(e.target.value);
                                            setShowStateDropdown(true);
                                            if (!e.target.value) {
                                                setFormData((prev) => ({ ...prev, state: "", city: "" }));
                                                setAvailableCities([]);
                                            }
                                        }}
                                        onFocus={() => setShowStateDropdown(true)}
                                        placeholder="Search and select state"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.state
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    {errors.state && (
                                        <p className="mt-1 text-sm text-red-600">{errors.state}</p>
                                    )}

                                    {/* State Dropdown */}
                                    {showStateDropdown && filteredStates.length > 0 && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredStates.map((state) => (
                                                <button
                                                    key={state}
                                                    type="button"
                                                    onClick={() => handleStateSelect(state)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm"
                                                >
                                                    {state}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* City - Searchable Dropdown (dependent on state) */}
                                <div className="relative">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={citySearch || formData.city}
                                        onChange={(e) => {
                                            setCitySearch(e.target.value);
                                            setShowCityDropdown(true);
                                            if (!e.target.value) {
                                                setFormData((prev) => ({ ...prev, city: "" }));
                                            }
                                        }}
                                        onFocus={() => {
                                            if (formData.state) {
                                                setShowCityDropdown(true);
                                            }
                                        }}
                                        placeholder={formData.state ? "Search and select city" : "Select state first"}
                                        disabled={!formData.state}
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.city
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            } ${!formData.state ? "bg-slate-100 cursor-not-allowed" : ""}`}
                                    />
                                    {errors.city && (
                                        <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                                    )}
                                    {!formData.state && (
                                        <p className="mt-1 text-xs text-slate-500">Please select a state first</p>
                                    )}

                                    {/* City Dropdown */}
                                    {showCityDropdown && filteredCities.length > 0 && formData.state && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                            {filteredCities.map((city) => (
                                                <button
                                                    key={city}
                                                    type="button"
                                                    onClick={() => handleCitySelect(city)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors text-sm"
                                                >
                                                    {city}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Pincode */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        placeholder="6-digit pincode"
                                        maxLength="6"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pincode
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    {errors.pincode && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.pincode}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business/Legal Information */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Business & Legal Information
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Registration Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Registration Number (GST)
                                    </label>
                                    <input
                                        type="text"
                                        name="registration_number"
                                        value={formData.registration_number}
                                        onChange={handleChange}
                                        placeholder="Enter GST number"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* PAN Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        PAN Number
                                    </label>
                                    <input
                                        type="text"
                                        name="pan_number"
                                        value={formData.pan_number}
                                        onChange={handleChange}
                                        placeholder="ABCDE1234F"
                                        maxLength="10"
                                        className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pan_number
                                            ? "border-red-300 bg-red-50"
                                            : "border-slate-300"
                                            }`}
                                    />
                                    {errors.pan_number && (
                                        <p className="mt-1 text-sm text-red-600">
                                            {errors.pan_number}
                                        </p>
                                    )}
                                </div>

                                {/* License Number */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        License Number
                                    </label>
                                    <input
                                        type="text"
                                        name="license_number"
                                        value={formData.license_number}
                                        onChange={handleChange}
                                        placeholder="Enter license number"
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* License Expiry Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-slate-400" />
                                        License Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        name="license_expiry_date"
                                        value={formData.license_expiry_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Contract Details */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Contract Details
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Contract Start Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contract Start Date
                                    </label>
                                    <input
                                        type="date"
                                        name="contract_start_date"
                                        value={formData.contract_start_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Contract End Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Contract End Date
                                    </label>
                                    <input
                                        type="date"
                                        name="contract_end_date"
                                        value={formData.contract_end_date}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">
                                Additional Information
                            </h2>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter any additional details about the facility company"
                                    rows="4"
                                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <X className="w-5 h-5" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !canAddFacility}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={!canAddFacility ? "You don't have permission to add facility companies" : ""}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader size="small" color="#ffffff" />
                                            Adding...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Add Facility Company
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showStateDropdown || showCityDropdown) && (
                <div
                    className="fixed inset-0 z-0"
                    onClick={() => {
                        setShowStateDropdown(false);
                        setShowCityDropdown(false);
                    }}
                />
            )}
        </>
    );
}
