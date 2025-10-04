// app/(protected)/cleaner-assignments/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from '@/components/ui/Loader';

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  
  // ✅ SOLUTION 1: Initialize loading as true to prevent flash of "no data" message
  const [loading, setLoading] = useState(true); // Start with true instead of false
  
  // ✅ SOLUTION 2: Track if we've made the initial API call
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const [deleting, setDeleting] = useState(null);

  const { companyId, hasCompanyContext } = useCompanyId();
  console.log(companyId, 'company_id from cleaner assignment');

  const fetchAssignments = async () => {
    // ✅ Guard clause: Don't proceed if companyId isn't ready
    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping - companyId not ready');
      // ✅ Still set loading to false if companyId is not available
      setLoading(false);
      setHasInitialized(true);
      return;
    }
    
    // ✅ Only set loading to true if this isn't the initial load
    // (since we initialized loading as true)
    if (hasInitialized) {
      setLoading(true);
    }
    
    try {
      const res = await AssignmentsApi.getAllAssignments(companyId);
      if (res.success) {
        setAssignments(res.data?.data || []);
      } else {
        toast.error(res.error);
        setAssignments([]); // Ensure assignments is empty on error
      }
    } catch (error) {
      console.error('Fetch assignments error:', error);
      toast.error('Failed to fetch assignments');
      setAssignments([]); // Ensure assignments is empty on error
    } finally {
      // ✅ Always set loading to false and mark as initialized
      setLoading(false);
      setHasInitialized(true);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    
    setDeleting(id);
    try {
      const res = await AssignmentsApi.deleteAssignment(id);
      if (res.success) {
        toast.success("Assignment deleted!");
        fetchAssignments();
      } else {
        toast.error(res.error);
      }
    } catch (error) {
      console.error('Delete assignment error:', error);
      toast.error('Failed to delete assignment');
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [companyId]);

  // ✅ SOLUTION 3: Show loading state until we've completed first API call
  // This prevents the "flash of no content" issue
  if (loading || !hasInitialized) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Cleaner Assignments</h1>
          <Link
            href={`/cleaner-assignments/add?companyId=${companyId}`}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
          >
            + Add Assignment
          </Link>
        </div>
        
        <div className="flex justify-center items-center h-64">
          <Loader 
            size="large" 
            color="#6366f1" 
            message="Loading assignments..." 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cleaner Assignments</h1>
        <Link
          href={`/cleaner-assignments/add?companyId=${companyId}`}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + Add Assignment
        </Link>
      </div>

      {/* ✅ Now this only shows AFTER we've confirmed there's no data */}
      {assignments.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <p className="text-gray-500 text-lg mb-2">No assignments found</p>
          <p className="text-gray-400 text-sm mb-6">Get started by creating your first cleaner assignment</p>
          <Link
            href={`/cleaner-assignments/add?companyId=${companyId}`}
            className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create First Assignment
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-slate-200 rounded-lg">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 border text-left">ID</th>
                <th className="p-3 border text-left">Cleaner Name</th>
                <th className="p-3 border text-left">Location Name</th>
                <th className="p-3 border text-left">Status</th>
                <th className="p-3 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="p-3 border">{a.id}</td>
                  <td className="p-3 border">
                    {a.user?.name || `User #${a.cleaner_user_id}`}
                  </td>
                  <td className="p-3 border">
                    {a.locations?.name || `Location #${a.location_id}`}
                  </td>
                  <td className="p-3 border">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      a.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : a.status === 'unassigned'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="p-3 border text-center">
                    <div className="flex gap-2 justify-center">
                      <Link
                        href={`/cleaner-assignments/${a.id}?companyId=${companyId}`}
                        className="px-3 py-1 bg-[#f2bb63] text-white rounded-md hover:bg-[#f1b54a] text-sm transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deleting === a.id}
                        className="px-3 py-1 bg-red-400 text-white rounded-md hover:bg-red-500 text-sm disabled:opacity-50 flex items-center gap-2 min-w-[80px] justify-center transition-colors"
                      >
                        {deleting === a.id ? (
                          <>
                            <Loader size="small" color="#ffffff" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          'Delete'
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
