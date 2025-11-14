// app/(protected)/cleaner-assignments/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from '@/components/ui/Loader';
import { Search, Filter, UserCheck, MapPin, Trash2, Edit, Plus, X } from "lucide-react";

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [deleting, setDeleting] = useState(null);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const { companyId, hasCompanyContext } = useCompanyId();

  const fetchAssignments = async () => {
    if (!companyId || companyId === 'null' || companyId === null) {
      setLoading(false);
      setHasInitialized(true);
      return;
    }

    if (hasInitialized) {
      setLoading(true);
    }

    try {
      const res = await AssignmentsApi.getAllAssignments(companyId);
      if (res.success) {
        setAssignments(res.data?.data || []);
      } else {
        toast.error(res.error);
        setAssignments([]);
      }
    } catch (error) {
      console.error('Fetch mapping error:', error);
      toast.error('Failed to fetch mappings');
      setAssignments([]);
    } finally {
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

  // Filter and search logic
  const filteredAssignments = useMemo(() => {
    let filtered = [...assignments];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((assignment) => {
        const locationName = assignment.locations?.name?.toLowerCase() || '';
        const userName = assignment.user?.name?.toLowerCase() || '';
        return locationName.includes(query) || userName.includes(query);
      });
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((assignment) => assignment.status === statusFilter);
    }

    return filtered;
  }, [assignments, searchQuery, statusFilter]);

  // Get unique statuses for filter dropdown
  const uniqueStatuses = useMemo(() => {
    const statuses = [...new Set(assignments.map(a => a.status))];
    return statuses;
  }, [assignments]);

  // Count assignments by status
  const statusCounts = useMemo(() => {
    return {
      all: assignments.length,
      assigned: assignments.filter(a => a.status === 'assigned').length,
      unassigned: assignments.filter(a => a.status === 'unassigned').length,
    };
  }, [assignments]);

  useEffect(() => {
    fetchAssignments();
  }, [companyId]);

  if (loading || !hasInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Cleaner Assignments</h1>
              <p className="text-sm text-slate-500 mt-1">Manage your cleaner-location mappings</p>
            </div>
          </div>

          <div className="flex justify-center items-center h-64">
            <Loader
              size="large"
              color="#6366f1"
              message="Loading assignments..."
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Cleaner Assignments</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your cleaner-location mappings</p>
          </div>
          <Link
            href={`/cleaner-assignments/add?companyId=${companyId}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Assignment</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Total</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{statusCounts.all}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 font-medium">Assigned</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{statusCounts.assigned}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div>
              <p className="text-sm text-slate-500 font-medium">Unassigned</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">{statusCounts.unassigned}</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by location or cleaner name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </button>

              <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-wrap gap-2`}>
                <button
                  onClick={() => setStatusFilter("all")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "all"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  All ({statusCounts.all})
                </button>
                <button
                  onClick={() => setStatusFilter("assigned")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "assigned"
                      ? "bg-green-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  Assigned ({statusCounts.assigned})
                </button>
                <button
                  onClick={() => setStatusFilter("unassigned")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === "unassigned"
                      ? "bg-yellow-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                >
                  Unassigned ({statusCounts.unassigned})
                </button>
              </div>
            </div>
          </div>

          {/* Active filters display */}
          {(searchQuery || statusFilter !== "all") && (
            <div className="mt-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm text-slate-600">Active filters:</span>
                {searchQuery && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
                    Search: "{searchQuery}"
                    <button onClick={() => setSearchQuery("")} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {statusFilter !== "all" && (
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium flex items-center gap-1">
                    Status: {statusFilter}
                    <button onClick={() => setStatusFilter("all")} className="hover:text-indigo-900">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-slate-600 text-lg font-medium mb-2">
              {searchQuery || statusFilter !== "all" ? "No assignments found" : "No assignments yet"}
            </p>
            <p className="text-slate-400 text-sm mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Get started by creating your first cleaner assignment"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link
                href={`/cleaner-assignments/add?companyId=${companyId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                Create First Assignment
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Cleaner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Assigned On
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredAssignments.map((assignment, index) => (
                      <tr key={assignment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4 text-sm font-medium text-slate-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserCheck className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {assignment.user?.name || `User #${assignment.cleaner_user_id}`}
                              </p>
                              <p className="text-xs text-slate-500">{assignment.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            <span className="text-sm text-slate-900">
                              {assignment.locations?.name || `Location #${assignment.location_id}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${assignment.status === "assigned"
                                ? "bg-green-100 text-green-800"
                                : assignment.status === "unassigned"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            {assignment.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-sm text-slate-600">
                          {assignment.assigned_on
                            ? new Date(assignment.assigned_on).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/cleaner-assignments/${assignment.id}?companyId=${companyId}`}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(assignment.id)}
                              disabled={deleting === assignment.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              {deleting === assignment.id ? (
                                <Loader size="small" color="#dc2626" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredAssignments.map((assignment, index) => (
                <div
                  key={assignment.id}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <UserCheck className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          #{index + 1}
                        </p>
                        <p className="text-sm font-medium text-slate-900">
                          {assignment.user?.name || `User #${assignment.cleaner_user_id}`}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${assignment.status === "assigned"
                          ? "bg-green-100 text-green-800"
                          : assignment.status === "unassigned"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                    >
                      {assignment.status}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{assignment.locations?.name || `Location #${assignment.location_id}`}</span>
                    </div>
                    <p className="text-xs text-slate-500">
                      Assigned: {assignment.assigned_on
                        ? new Date(assignment.assigned_on).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-200">
                    <Link
                      href={`/cleaner-assignments/${assignment.id}?companyId=${companyId}`}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(assignment.id)}
                      disabled={deleting === assignment.id}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {deleting === assignment.id ? (
                        <>
                          <Loader size="small" color="#ffffff" />
                          <span>Deleting...</span>
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Results count */}
            <div className="mt-4 text-center text-sm text-slate-500">
              Showing {filteredAssignments.length} of {assignments.length} assignments
            </div>
          </>
        )}
      </div>
    </div>
  );
}
