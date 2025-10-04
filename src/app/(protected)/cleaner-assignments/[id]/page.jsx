// app/cleaner-management/assignments/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import Loader from '@/components/ui/Loader';

export default function EditAssignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [assignment, setAssignment] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true); // ✅ Start with true
  const [updating, setUpdating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const { companyId } = useCompanyId(); // ✅ Use consistent naming

  const fetchAssignment = async () => {
    if (!id || !companyId) {
      console.log('Skipping - ID or company ID not ready');
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    try {
      const res = await AssignmentsApi.getAssignmentById(id, companyId);
      console.log('Full API Response:', res);
      
      if (res.success) {
        // ✅ Get the assignment data (adjust based on your API structure)
        const assignmentData = res.data?.data || res.data; // Handle both structures
        console.log('Assignment Data:', assignmentData);
        
        if (assignmentData) {
          setAssignment(assignmentData);
          setStatus(assignmentData.status || "assigned");
          console.log('Set assignment:', assignmentData);
          console.log('Cleaner User ID:', assignmentData.cleaner_user_id);
          console.log('Location ID:', assignmentData.location_id);
        } else {
          toast.error("Assignment data not found");
        }
      } else {
        toast.error(res.error || "Failed to fetch assignment");
      }
    } catch (error) {
      console.error('Fetch assignment error:', error);
      toast.error('Failed to load assignment');
    } finally {
      setLoading(false);
      setHasInitialized(true);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!id || id === 'null' || id === null) {
      toast.error('Invalid assignment ID');
      return;
    }

    setUpdating(true);
    try {
      const res = await AssignmentsApi.updateAssignment(id, { status });
      console.log(res , "updated response")
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
    fetchAssignment();
  }, [id, companyId]);

  // ✅ Loading state
  if (loading || !hasInitialized) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Assignment</h1>
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
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Assignment Not Found</h1>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">The assignment could not be loaded.</p>
          <button
            onClick={() => router.push(`/cleaner-assignments/assignments?companyId=${companyId}`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            Back to Assignments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster />
      
      <h1 className="text-2xl font-bold mb-6">Edit Assignment #{assignment.id}</h1>

      {/* ✅ Debug Information (Remove in production) */}
      <div className="mb-4 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p><strong>Cleaner User ID:</strong> {assignment.cleaner_user_id || 'Not found'}</p>
        <p><strong>Location ID:</strong> {assignment.location_id || 'Not found'}</p>
        <p><strong>Status:</strong> {assignment.status || 'Not found'}</p>
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-600">View Full Assignment Object</summary>
          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
            {JSON.stringify(assignment, null, 2)}
          </pre>
        </details>
      </div>

      <form onSubmit={handleUpdate} className="space-y-6">
        {/* Cleaner Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Cleaner Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Cleaner User ID</label>
              <input
                type="text"
                value={assignment.cleaner_user_id || ''} // ✅ Add fallback
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Cleaner Name</label>
              <input
                type="text"
                value={assignment.cleaner_user?.name || 'Unknown Cleaner'}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100"
              />
            </div>

            {assignment.cleaner_user?.email && (
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input
                  type="text"
                  value={assignment.cleaner_user.email}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100"
                />
              </div>
            )}

            {assignment.cleaner_user?.phone && (
              <div>
                <label className="block font-semibold mb-2">Phone</label>
                <input
                  type="text"
                  value={assignment.cleaner_user.phone}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Location Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold mb-2">Location ID</label>
              <input
                type="text"
                value={assignment.location_id || ''} // ✅ Add fallback
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold mb-2">Location Name</label>
              <input
                type="text"
                value={assignment.locations?.name || assignment.name || 'Unknown Location'}
                disabled
                className="w-full p-3 border rounded-lg bg-slate-100"
              />
            </div>

            {assignment.locations?.location_types?.name && (
              <div>
                <label className="block font-semibold mb-2">Location Type</label>
                <input
                  type="text"
                  value={assignment.locations.location_types.name}
                  disabled
                  className="w-full p-3 border rounded-lg bg-slate-100"
                />
              </div>
            )}
          </div>
        </div>

        {/* Status Update */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Update Status</h2>
          
          <div className="mb-4">
            <label className="block font-semibold mb-2">Assignment Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="assigned">Assigned</option>
              <option value="unassigned">Unassigned</option>
              {/* <option value="completed">Completed</option> */}
              {/* <option value="in-progress">In Progress</option> */}
            </select>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updating}
              className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {updating ? (
                <>
                  <Loader size="small" color="#ffffff" />
                  <span>Updating...</span>
                </>
              ) : (
                'Update Assignment'
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/cleaner-assignments/assignments?companyId=${companyId}`)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
