// app/cleaner-management/assignments/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import LocationsApi from "@/lib/api/LocationApi"; // ✅ Add LocationsApi
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import Loader from '@/components/ui/Loader';
import { MapPin, User, Save, ArrowLeft } from 'lucide-react';

export default function EditAssignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState(null);
  const [status, setStatus] = useState("");
  const [locationId, setLocationId] = useState(""); // ✅ Add location state
  const [allLocations, setAllLocations] = useState([]); // ✅ Add locations state
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { companyId } = useCompanyId();

  // ✅ Enhanced fetch function to get assignment and locations
  const fetchAssignmentAndLocations = async () => {
    if (!id || !companyId) {
      console.log('Skipping - ID or company ID not ready');
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    try {
      // ✅ Fetch both assignment and locations in parallel
      const [assignmentRes, locationsRes] = await Promise.all([
        AssignmentsApi.getAssignmentById(id, companyId),
        LocationsApi.getAllLocations(companyId)
      ]);

      console.log('Assignment Response:', assignmentRes);
      console.log('Locations Response:', locationsRes);
      
      // Handle assignment data
      if (assignmentRes.success) {
        const assignmentData = assignmentRes.data?.data || assignmentRes.data;
        
        if (assignmentData) {
          setAssignment(assignmentData);
          setStatus(assignmentData.status || "assigned");
          setLocationId(assignmentData.location_id || ""); // ✅ Set current location
          
          console.log('Assignment loaded:', assignmentData);
        } else {
          toast.error("Assignment data not found");
        }
      } else {
        toast.error(assignmentRes.error || "Failed to fetch assignment");
      }

      // Handle locations data
      if (locationsRes.success) {
        setAllLocations(locationsRes.data || []);
        console.log('Locations loaded:', locationsRes.data?.length || 0);
      } else {
        console.error('Failed to fetch locations:', locationsRes.error);
        toast.error("Failed to load locations");
      }

    } catch (error) {
      console.error('Fetch data error:', error);
      toast.error('Failed to load assignment data');
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  // ✅ Enhanced update function with location support
  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!id || id === 'null' || id === null) {
      toast.error('Invalid assignment ID');
      return;
    }

    if (!locationId) {
      toast.error('Please select a location');
      return;
    }

    setUpdating(true);
    try {
      // ✅ Include location_id in update data
      const updateData = {
        status,
        location_id: locationId // ✅ Add location_id to update
      };

      console.log('Updating assignment with data:', updateData);

      const res = await AssignmentsApi.updateAssignment(id, updateData);
      
      console.log('Update response:', res);
      
      if (res.success) {
        toast.success("Assignment updated successfully!");
        router.push(`/cleaner-assignments?companyId=${companyId}`);
      } else {
        toast.error(res.error || "Failed to update assignment");
      }
    } catch (error) {
      console.error('Update assignment error:', error);
      toast.error('Failed to update assignment');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchAssignmentAndLocations();
  }, [id, companyId]);

  // ✅ Get location name for display
  const getLocationName = (locationId) => {
    const location = allLocations.find(loc => loc.id == locationId);
    return location?.name || `Location #${locationId}`;
  };

  // ✅ Loading state
  if (loading || !hasInitialized) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/cleaner-assignments?companyId=${companyId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Edit Assignment</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <Loader 
            size="large" 
            color="#6366f1" 
            message="Loading assignment details..." 
          />
        </div>
      </div>
    );
  }

  // ✅ Assignment not found
  if (!assignment) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push(`/cleaner-assignments?companyId=${companyId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Assignment Not Found</h1>
        </div>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Assignment Not Found</h2>
          <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push(`/cleaner-assignments?companyId=${companyId}`)}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push(`/cleaner-assignments?companyId=${companyId}`)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">Edit Assignment #{assignment.id}</h1>
          <p className="text-sm text-gray-600">Update assignment details and location</p>
        </div>
      </div>

      {/* ✅ Debug Information (Remove in production) */}
      {/* <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <details>
          <summary className="cursor-pointer text-sm font-medium text-yellow-800">
            Debug Info (Click to expand)
          </summary>
          <div className="mt-2 text-xs text-yellow-700 space-y-1">
            <p><strong>Assignment ID:</strong> {assignment.id}</p>
            <p><strong>Cleaner User ID:</strong> {assignment.cleaner_user_id}</p>
            <p><strong>Current Location ID:</strong> {assignment.location_id}</p>
            <p><strong>Selected Location ID:</strong> {locationId}</p>
            <p><strong>Status:</strong> {assignment.status}</p>
            <p><strong>Available Locations:</strong> {allLocations.length}</p>
          </div>
        </details>
      </div> */}

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Cleaner Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-600" />
            Cleaner Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-700">Cleaner User ID</label>
              <input
                type="text"
                value={assignment.cleaner_user_id || 'N/A'}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-700">Cleaner Name</label>
              <input
                type="text"
                value={assignment.cleaner_user?.name || 'Unknown Cleaner'}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-gray-600"
              />
            </div>

            {assignment.cleaner_user?.email && (
              <div>
                <label className="block font-semibold mb-2 text-sm text-gray-700">Email</label>
                <input
                  type="text"
                  value={assignment.cleaner_user.email}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100 text-gray-600"
                />
              </div>
            )}

            {assignment.cleaner_user?.phone && (
              <div>
                <label className="block font-semibold mb-2 text-sm text-gray-700">Phone</label>
                <input
                  type="text"
                  value={assignment.cleaner_user.phone}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100 text-gray-600"
                />
              </div>
            )}
          </div>
        </div>

        {/* ✅ Editable Location Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Location Assignment
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-700">Current Location</label>
              <input
                type="text"
                value={getLocationName(assignment.location_id)}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100 text-gray-600"
              />
              <p className="text-xs text-gray-500 mt-1">Original location: ID #{assignment.location_id}</p>
            </div>

            <div>
              <label className="block font-semibold mb-2 text-sm text-gray-700">
                New Location <span className="text-red-500">*</span>
              </label>
              <select
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select a location...</option>
                {allLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name} (ID: {location.id})
                  </option>
                ))}
              </select>
              {locationId && locationId !== assignment.location_id && (
                <p className="text-xs text-green-600 mt-1">
                  ✓ Location will be changed to: {getLocationName(locationId)}
                </p>
              )}
            </div>
          </div>

          {/* Location Type Info */}
          {assignment.locations?.location_types?.name && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Current Location Type:</strong> {assignment.locations.location_types.name}
              </p>
            </div>
          )}
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Assignment Status</h2>
          
          <div className="max-w-md">
            <label className="block font-semibold mb-2 text-sm text-gray-700">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              {/* <option value="completed">Completed</option> */}
              {/* <option value="in-progress">In Progress</option> */}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={updating || !locationId}
            className="flex-1 max-w-xs px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
          >
            {updating ? (
              <>
                <Loader size="small" color="#ffffff" />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Update Assignment</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/cleaner-assignments?companyId=${companyId}`)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
