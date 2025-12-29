// src/app/(protected)/location-types/[id]/edit/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
// ✅ NEW: Permission imports
import { useRequirePermission } from '@/lib/hooks/useRequirePermission';
import { MODULES } from '@/lib/constants/permissions';

export default function EditLocationTypePage() {
  // ✅ NEW: Page protection (requires location_types.update permission)
  useRequirePermission(MODULES.LOCATION_TYPES, { action: 'update' });

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();
  
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [allTypes, setAllTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentType, setCurrentType] = useState(null);

  const locationTypeId = params.id;

  // Fetch all types and current type data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all location types for parent dropdown
        const types = await locationTypesApi.getAll(companyId);
        setAllTypes(types);

        // Find current type being edited
        const current = types.find(t => t.id.toString() === locationTypeId);
        if (current) {
          setCurrentType(current);
          setName(current.name);
          setParentId(current.parent_id || "");
        } else {
          toast.error("Location type not found");
          router.push(`/location-types${companyId ? `?companyId=${companyId}` : ''}`);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load location type data");
      } finally {
        setIsLoading(false);
      }
    };

    if (companyId && locationTypeId) {
      fetchData();
    }
  }, [companyId, locationTypeId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Location type name is required");
      return;
    }

    // Prevent circular reference
    if (parentId === locationTypeId) {
      toast.error("A location type cannot be its own parent");
      return;
    }

    setIsSaving(true);
    try {
      await locationTypesApi.update(locationTypeId, {
        name: name.trim(),
        parent_id: parentId ? parseInt(parentId) : null,
      });

      toast.success("Location type updated successfully");
      router.push(`/location-types${companyId ? `?companyId=${companyId}` : ''}`);
    } catch (error) {
      console.error("Error updating location type:", error);
      toast.error("Failed to update location type");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter out self and descendants from parent options
  const getAvailableParents = () => {
    const getDescendants = (typeId) => {
      const descendants = [];
      const findChildren = (id) => {
        allTypes.forEach(type => {
          if (type.parent_id === id) {
            descendants.push(type.id);
            findChildren(type.id);
          }
        });
      };
      findChildren(typeId);
      return descendants;
    };

    const excludeIds = [locationTypeId, ...getDescendants(locationTypeId)];
    return allTypes.filter(type => !excludeIds.includes(type.id));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-gray-600">Loading location type...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-2">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Location Type</h1>
              <p className="text-sm text-gray-500 mt-1">
                Update location type information
              </p>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ward, Floor, Platform"
                required
              />
            </div>

            {/* Parent Type Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Parent Type (optional)
              </label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No Parent (Top Level)</option>
                {getAvailableParents().map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Select a parent type to create a hierarchy
              </p>
            </div>

            {/* Current Parent Info */}
            {currentType?.parent_id && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Current Parent:</span>{" "}
                  {allTypes.find(t => t.id === currentType.parent_id)?.name || "Unknown"}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !name.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
