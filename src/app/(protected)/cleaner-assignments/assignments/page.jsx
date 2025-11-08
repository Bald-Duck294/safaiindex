// app/cleaner-assignments/assignments/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";

export default function AssignmentListPage() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    const res = await AssignmentsApi.getAllAssignments();
    // console.log(res.data?.data[2].user.name , "res data ");
    if (res.success) {
      setAssignments(res.data?.data);
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this assignment?")) return;
    const res = await AssignmentsApi.deleteAssignment(id);
    if (res.success) {
      toast.success("Assignment deleted!");
      fetchAssignments();
    } else {
      toast.error(res.error);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  return (
    <div className="p-6">
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cleaner Assignments</h1>
        <Link
          href="/cleaner-assignments/assignments/add"
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + Add Assignment
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <table className="w-full border border-slate-200 rounded-lg">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Cleaner User ID</th>
              <th className="p-2 border">Location ID</th>
              <th className="p-2 border">Status</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((a) => (
              <tr key={a.id}>
                <td className="p-2 border">{a.id}</td>

                {/* Show user name instead of ID */}
                <td className="p-2 border">
                  {a.user?.name || `User #${a.cleaner_user_id}`}
                </td>

                {/* Show location name instead of ID */}
                <td className="p-2 border">
                  {a.locations?.name || `Location #${a.location_id}`}
                </td>

                <td className="p-2 border">{a.status}</td>

                <td className="p-2 border space-x-2">
                  <Link
                    href={`/cleaner-assignments/assignments/${a.id}`}
                    className="px-3 py-1 bg-yellow-500 text-white rounded-md"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(a.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
