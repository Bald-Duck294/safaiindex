"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  Calendar,
  Edit,
  CheckCircle,
  XCircle,
  Loader2,
  Building,
  Shield,
  Briefcase,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi";
import Loader from "@/components/ui/Loader";

export default function ViewFacilityCompanyPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId");
  const facilityCompanyId = params.id;

  const [facilityCompany, setFacilityCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (facilityCompanyId) {
      fetchFacilityCompany();
    }
  }, [facilityCompanyId]);


  const handleViewLocations = () => {
    sessionStorage.setItem('selectedFacilityCompanyId', facilityCompanyId);
    sessionStorage.setItem('selectedFacilityCompanyName', facilityCompany?.name)

    router.push(`/washrooms?companyId=${companyId}`);

  }


  const fetchFacilityCompany = async () => {
    setIsLoading(true);
    const result = await FacilityCompanyApi.getById(facilityCompanyId);

    if (result.success) {
      setFacilityCompany(result.data);
    } else {
      toast.error(result.error || "Failed to load facility company details");
      setTimeout(() => {
        router.push(`/facility-company?companyId=${companyId}`);
      }, 2000);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader size="large" color="#3b82f6" />
          <p className="mt-4 text-slate-600">Loading facility company details...</p>
        </div>
      </div>
    );
  }

  if (!facilityCompany) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center p-4">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-600">Facility company not found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push(`/facility-company?companyId=${companyId}`)}
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
                      {facilityCompany.name}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      {facilityCompany.status ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>



              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={handleViewLocations}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  View Assigned Locations
                </button>

                <button
                  onClick={() =>
                    router.push(
                      `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`
                    )
                  }
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Edit Details
                </button>
              </div>


              {/* <button
                onClick={() =>
                  router.push(
                    `/facility-company/${facilityCompanyId}/edit?companyId=${companyId}`
                  )
                }
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
              >
                <Edit className="w-4 h-4" />
                Edit Details
              </button> */}
            </div>
          </div>

          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500">Company Name</label>
                <p className="mt-1 text-slate-800 font-medium">{facilityCompany.name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email
                </label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.email || "Not specified"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </label>
                <p className="mt-1 text-slate-800 font-medium">{facilityCompany.phone}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Organization
                </label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.company?.name || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Contact Person Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Contact Person Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Contact Person Name
                </label>
                <p className="mt-1 text-slate-800 font-medium">
                  {facilityCompany.contact_person_name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Contact Phone
                </label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.contact_person_phone || "Not specified"}
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Contact Email
                </label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.contact_person_email || "Not specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              Address Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Full Address</label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.address || "Not specified"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-500">City</label>
                  <p className="mt-1 text-slate-800">{facilityCompany.city || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">State</label>
                  <p className="mt-1 text-slate-800">{facilityCompany.state || "N/A"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-500">Pincode</label>
                  <p className="mt-1 text-slate-800">{facilityCompany.pincode || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Business & Legal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Business & Legal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500">
                  Registration Number (GST)
                </label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.registration_number || "Not specified"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">PAN Number</label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.pan_number || "Not specified"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">License Number</label>
                <p className="mt-1 text-slate-800">
                  {facilityCompany.license_number || "Not specified"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  License Expiry Date
                </label>
                <p className="mt-1 text-slate-800">
                  {formatDate(facilityCompany.license_expiry_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Contract Details */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-blue-600" />
              Contract Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Contract Start Date
                </label>
                <p className="mt-1 text-slate-800">
                  {formatDate(facilityCompany.contract_start_date)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Contract End Date
                </label>
                <p className="mt-1 text-slate-800">
                  {formatDate(facilityCompany.contract_end_date)}
                </p>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          {/* <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Performance & Additional Info
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-slate-500">Rating</label>
                <p className="mt-1 text-slate-800 font-medium text-2xl">
                  {facilityCompany.rating || 0} / 10
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Total Locations Managed
                </label>
                <p className="mt-1 text-slate-800 font-medium text-2xl">
                  {facilityCompany.total_locations_managed || 0}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">
                  Active Locations
                </label>
                <p className="mt-1 text-slate-800 font-medium text-2xl">
                  {facilityCompany.active_locations || 0}
                </p>
              </div>
            </div>

            {facilityCompany.description && (
              <div className="mt-6">
                <label className="text-sm font-medium text-slate-500">Description</label>
                <p className="mt-1 text-slate-800 whitespace-pre-wrap">
                  {facilityCompany.description}
                </p>
              </div>
            )}
          </div> */}

          {/* Assigned Locations */}
          {/* {facilityCompany.locations && facilityCompany.locations.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 mb-4 sm:mb-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                Assigned Locations ({facilityCompany.locations.length})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilityCompany.locations.map((location) => (
                  <div
                    key={location.id}
                    className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-medium text-slate-800">{location.name}</p>
                    {location.address && (
                      <p className="text-xs text-slate-500 mt-1">{location.address}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )} */}

          {/* Metadata */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Record Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-500">Created At</label>
                <p className="mt-1 text-slate-800">
                  {formatDate(facilityCompany.created_at)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-500">Last Updated</label>
                <p className="mt-1 text-slate-800">
                  {formatDate(facilityCompany.updated_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
