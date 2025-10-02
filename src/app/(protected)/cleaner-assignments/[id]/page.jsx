// app/cleaner-management/assignments/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";

export default function EditAssignmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [assignment, setAssignment] = useState(null);
  const [status, setStatus] = useState("assigned");
  const [loading, setLoading] = useState(false);

  const fetchAssignment = async () => {
    const res = await AssignmentsApi.getAllAssignments();
    // console.log(res?.data?.data , "res")
    if (res.success) {
      const found = res.data.data.find((a) => a.id == id);
      if (found) {
        setAssignment(found);
        setStatus(found.status);
      }
    } else {
      toast.error(res.error);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await AssignmentsApi.updateAssignment(id, { status });
    if (res.success) {
      toast.success("Assignment updated!");
      router.push("/cleaner-assignments/assignments");
    } else {
      toast.error(res.error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAssignment();
  }, [id]);

  if (!assignment) return <p>Loading assignment...</p>;

  return (
    <div className="p-6">
      <Toaster />
      <h1 className="text-2xl font-bold mb-6">Edit Assignment #{id}</h1>
      <form onSubmit={handleUpdate} className="space-y-4 max-w-md">
        <div>
          <label className="block font-semibold mb-2">Cleaner User ID</label>
          <input
            type="text"
            value={assignment.cleaner_user_id}
            disabled
            className="w-full p-2 border rounded-lg bg-slate-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Location ID</label>
          <input
            type="text"
            value={assignment.location_id}
            disabled
            className="w-full p-2 border rounded-lg bg-slate-100"
          />
        </div>
        <div>
          <label className="block font-semibold mb-2">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="assigned">Assigned</option>
            <option value="unassigned">Unassigned</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
        >
          {loading ? "Updating..." : "Update Assignment"}
        </button>
      </form>
    </div>
  );
}
