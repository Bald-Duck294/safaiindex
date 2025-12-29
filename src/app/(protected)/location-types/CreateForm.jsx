// src/app/(protected)/location-types/CreateForm.jsx

"use client";

import { useState } from "react";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import toast from "react-hot-toast";

export default function CreateForm({ onCreated, allTypes }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { companyId } = useCompanyId();


  const normalizeName = (name) => {
    if (!name) return '';

    return name
      .trim()                          //  leading/trailing spaces
      .replace(/\s+/g, ' ')            // Replace multiple spaces with single space
      .toLowerCase();                  // Case insensitive comparison
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const normalizedName = normalizeName(name);

    if (!normalizedName) {
      toast.error("Location hierarchy name is required");
      return;
    }

    const isDuplicate = allTypes?.some(type => {
      const sameLevel = (!parentId && !type.parent_id) ||
        (parentId && type.parent_id === parentId);

      return sameLevel &&
        normalizeName(type.name) === normalizedName;
    });

    if (isDuplicate) {
      const level = parentId ? "under this parent" : "at top level";
      toast.error(`A location hierarchy with this name already exists ${level}`);
      return;
    }


    // if (isDuplicate) {
    //   toast.error("A location hirarchy with this name already exists");
    //   return;
    // }

    setIsSubmitting(true);

    const loadingToast = toast.loading("Creating location hirarchy...");

    try {
      console.log('beofre createing location ')
      await locationTypesApi.create({
        name: name.trim(),
        parent_id: parentId ? parseInt(parentId) : null,
      }, companyId);

      toast.success("Location Hierarchy created successfully!", {
        id: loadingToast,
      });

      // Reset form
      setName("");
      setParentId("");

      // Refresh list
      onCreated();

    } catch (error) {
      console.error("Error creating location type:", error);

      const errorMessage = error.response?.data?.message ||
        error.message ||
        "Failed to create location type";

      toast.error(errorMessage, {
        id: loadingToast,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6 space-y-4 max-w-md">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Hierarchy Name *
        </label>
        <input
          type="text"
          className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Ward, Floor, Platform"
          required
          disabled={isSubmitting}
          maxLength={100}
        />
        {name.trim() && (
          <p className="text-xs text-gray-500 mt-1">
            {name.trim().length}/100 characters
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Parent Hierarchy (optional)
        </label>
        <select
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
          className="border border-gray-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          <option value="">No Parent (Top Level)</option>
          {allTypes?.length > 0 ? (
            allTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))
          ) : (
            <option disabled>No hierarchy available</option>
          )}
        </select>
        <p className="text-xs text-gray-500 mt-1">
          Select a parent to create a hierarchy
        </p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !name.trim()}
        className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Creating...
          </>
        ) : (
          "Create Location Hierarchy"
        )}
      </button>
    </form>
  );
}
