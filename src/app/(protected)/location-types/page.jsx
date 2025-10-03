"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import locationTypesApi from "@/lib/api/locationTypesApi";
import TreeView from "./TreeView";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';

import {
  Plus,
  FolderTree,
  List,
  ArrowLeft,
  Loader2,
  FolderPlus,
  Search
} from "lucide-react";

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="min-w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-gray-300 rounded w-8"></div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-gray-300 rounded w-20"></div>
            </th>
            <th className="px-6 py-4 text-left">
              <div className="h-4 bg-gray-300 rounded w-16"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {[...Array(5)].map((_, i) => (
            <tr key={i} className="border-b border-gray-100">
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-6"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </td>
              <td className="px-6 py-4">
                <div className="h-8 bg-gray-200 rounded w-20"></div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const EmptyState = ({ companyId }) => (
  <div className="text-center py-16 px-4">
    <div className="max-w-md mx-auto">
      <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
        <FolderPlus className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">
        No Location Types Found
      </h3>
      <p className="text-gray-500 mb-6">
        You haven't created any location types yet. Start by adding your first location type to organize your washroom locations.
      </p>
      <Link
        href={companyId ? `/location-types/add?companyId=${companyId}` : "/location-types/add"}
        className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        Create First Location Type
      </Link>
    </div>
  </div>
);

export default function LocationTypesPage() {
  const [types, setTypes] = useState([]);
  const [filteredTypes, setFilteredTypes] = useState([]);
  const [showTree, setShowTree] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const { companyId, hasCompanyContext } = useCompanyId();

  const fetchTypes = async () => {
    setIsLoading(true);
    try {
      const data = await locationTypesApi.getAll(companyId);
      console.log(data, "data from location types");
      setTypes(data);
      setFilteredTypes(data);
    } catch (err) {
      console.error("Failed to fetch location types", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, [companyId]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTypes(types);
      return;
    }

    const filtered = types.filter(type =>
      type.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTypes(filtered);
  }, [searchTerm, types]);

  // Helper function to get parent name by parent_id
  const getParentName = (parentId) => {
    if (!parentId) return "—";
    const parent = types.find(type => type.id === parentId);
    return parent ? parent.name : "Unknown";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Location Types</h1>
                <p className="text-sm text-gray-500 mt-1">
                  {hasCompanyContext
                    ? `Company-specific location types`
                    : 'Manage all location types'
                  }
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              {types.length > 0 && (
                <button
                  onClick={() => setShowTree((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium order-2 sm:order-1"
                >
                  {showTree ? (
                    <>
                      <List className="w-4 h-4" />
                      Show List View
                    </>
                  ) : (
                    <>
                      <FolderTree className="w-4 h-4" />
                      Show Hierarchy
                    </>
                  )}
                </button>
              )}

              <Link
                href={companyId ? `/location-types/add?companyId=${companyId}` : "/location-types/add"}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium order-1 sm:order-2"
              >
                <Plus className="w-4 h-4" />
                Add Location Type
              </Link>
            </div>
          </div>
        </div>

        {/* Search Bar - Only show if there are types */}
        {types.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border mb-6 p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search location types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border">
          {isLoading ? (
            <div className="p-6">
              <LoadingSkeleton />
            </div>
          ) : types.length === 0 ? (
            <EmptyState companyId={companyId} />
          ) : (
            <>
              {/* Table View */}
              {!showTree ? (
                <div>
                  <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                      All Location Types
                      {searchTerm && (
                        <span className="text-sm font-normal text-gray-500 ml-2">
                          ({filteredTypes.length} of {types.length})
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Parent Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTypes.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-8 text-center">
                              <div className="text-gray-500">
                                <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                <p className="font-medium">No location types found</p>
                                <p className="text-sm">Try adjusting your search terms</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredTypes.map((type) => (
                            <tr key={type.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                #{type.id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {type.name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {getParentName(type.parent_id)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/location-types/${type.id}/edit${companyId ? `?companyId=${companyId}` : ''}`}
                                    className="text-blue-600 hover:text-blue-900 font-medium"
                                  >
                                    Edit
                                  </Link>
                                  <span className="text-gray-300">|</span>
                                  <button className="text-red-600 hover:text-red-900 font-medium">
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Table Footer */}
                  {filteredTypes.length > 0 && (
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <p className="text-sm text-gray-700">
                          Showing {filteredTypes.length} of {types.length} location types
                        </p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Tree View */
                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Hierarchy View
                    </h3>
                    <p className="text-sm text-gray-500">
                      Drag and drop to reorganize the location type hierarchy
                    </p>
                  </div>
                  <TreeView types={types} onUpdate={fetchTypes} flag={false} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
