"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Eye, Edit, Navigation, Search, X, Plus, Trash2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

function WashroomsPage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
  const [deleting, setDeleting] = useState(false);
  const { companyId } = useCompanyId();

  const router = useRouter();

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await LocationsApi.getAllLocations(companyId);
      setList(response.data);
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Failed to fetch locations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping fetch - companyId not ready:', companyId);
      setLoading(false);
      return;
    }

    fetchList();
  }, [companyId]);

  useEffect(() => {
    // Apply filters and search
    let filtered = [...list];

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (minRating) {
      filtered = filtered.filter(
        (item) =>
          item.averageRating !== null &&
          parseFloat(item.averageRating) >= parseFloat(minRating)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredList(filtered);
  }, [searchQuery, minRating, sortOrder, list]);

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleView = (id) => {
    router.push(`/washrooms/item/${id}?companyId=${companyId}`);
  };

  const handleEdit = (id) => {
    router.push(`/washrooms/item/${id}/edit?companyId=${companyId}`);
  };

  const handleAddToilet = () => {
    router.push(`/washrooms/add-location?companyId=${companyId}`);
  };

  // ✅ Delete location handler
  const handleDelete = (location) => {
    setDeleteModal({ open: true, location });
  };

  const confirmDelete = async () => {
    if (!deleteModal.location) return;

    const locationId = deleteModal.location.id;
    const locationName = deleteModal.location.name;

    console.log(`Deleting location: ${locationName} (ID: ${locationId})`);

    setDeleting(true);

    try {
      const response = await LocationsApi.deleteLocation(locationId, companyId, true); // Use soft delete

      console.log("Full delete response:", response);

      if (response && response.success) {
        console.log("Delete successful!");

        // Show success message
        const successMessage = response.data?.message || `"${locationName}" deleted successfully`;
        toast.success(successMessage);

        // Update the list by removing the deleted item
        setList(prevList => {
          const newList = prevList.filter(item => item.id !== locationId);
          console.log(`Removed location from list. New count: ${newList.length}`);
          return newList;
        });

        // Close modal
        setDeleteModal({ open: false, location: null });

      } else if (response && !response.success) {
        console.log("Delete failed:", response.error);
        toast.error(response.error || "Failed to delete location");
      } else {
        console.log("Unexpected response structure:", response);
        toast.error("Unexpected response from server");
      }
    } catch (error) {
      console.error("Exception during delete:", error);

      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || "Server error occurred";
        toast.error(errorMessage);
      } else if (error.request) {
        // Network error
        toast.error("Network error - please check your connection");
      } else {
        // Other error
        toast.error("An unexpected error occurred");
      }
    } finally {
      setDeleting(false);
    }
  };


  const clearAllFilters = () => {
    setSearchQuery("");
    setMinRating("");
    setSortOrder("desc");
  };

  const renderEmojiRating = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    const getEmojiAndColor = (rating) => {
      if (rating >= 7.5) return { emoji: "🤩", color: "text-emerald-600 ", bg: "bg-emerald-50 ", label: "Amazing" };
      if (rating >= 4) return { emoji: "😊", color: "text-orange-600 ", bg: "bg-orange-50 ", label: "Great" };
      if (rating >= 3) return { emoji: "😐", color: "text-yellow-600 ", bg: "bg-yellow-50 ", label: "Okay" };
      if (rating >= 2) return { emoji: "😕", color: "text-red-600 ", bg: "bg-orange-50 ", label: "Poor" };
      if (rating > 0) return { emoji: "😰", color: "text-red-600 ", bg: "bg-red-50 ", label: "Terrible" };
      return { emoji: "❓", color: "text-slate-500 ", bg: "bg-slate-50 ", label: "Unrated" };
    };

    const { emoji, color, bg, label } = getEmojiAndColor(actualRating);
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
        <span className="text-lg">{emoji}</span>
        <div className="flex flex-col">
          <div className={`font-semibold text-sm ${color}`}>
            {actualRating > 0 ? actualRating.toFixed(1) : "-"} · {label}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500 ">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ Render images preview
  const renderImagesPreview = (images) => {
    if (!images || images.length === 0) {
      return (
        <div className="text-xs text-slate-400 ">
          No images
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1">
        <ImageIcon className="h-3 w-3 text-blue-500" />
        <span className="text-xs text-blue-600  font-medium">
          {images.length} {images.length === 1 ? 'image' : 'images'}
        </span>
        {images.length > 0 && (
          <div className="flex -space-x-1 ml-1">
            {images.slice(0, 3).map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Preview ${index + 1}`}
                className="w-6 h-6 rounded border-2 border-white object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ))}
            {images.length > 3 && (
              <div className="w-6 h-6 rounded bg-slate-200  border-white flex items-center justify-center">
                <span className="text-xs font-medium text-slate-600 ">
                  +{images.length - 3}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <Loader size="large" color="#3b82f6" message="Loading locations..." />
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card - Responsive */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">Toilet Locations</h1>
                    <p className="text-slate-300 text-xs sm:text-sm hidden sm:block">Manage and view all toilet locations</p>
                  </div>
                </div>
                <button
                  onClick={handleAddToilet}
                  className="cursor-pointer flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Add Toilet</span>
                  <span className="xs:hidden">Add</span>
                </button>
              </div>
            </div>

            {/* Filters Section - Responsive */}
            <div className="p-3 sm:p-4 md:p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Search Input - Full Width on Mobile */}
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search locations..."
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Filter Controls - Responsive Grid */}
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">
                  <select
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    <option value="2">2+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="6">6+ Stars</option>
                    <option value="8">8+ Stars</option>
                  </select>
                  <select
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <button
                    onClick={clearAllFilters}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-sm hover:shadow-md"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View (md and above) */}
          <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              {filteredList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No toilets found</h3>
                  <p className="text-slate-500">Try adjusting your filters or add a new location</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">#</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Location Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Images</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Rating</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Coordinates</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Date Added</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                          {index + 1}
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-slate-800">
                            {item.name}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {renderImagesPreview(item.images)}
                        </td>
                        <td className="py-4 px-6">
                          {renderEmojiRating(item.averageRating, item.ratingCount)}
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-slate-600 space-y-1">
                            <div>Lat: {parseFloat(item.latitude).toFixed(4)}</div>
                            <div>Lng: {parseFloat(item.longitude).toFixed(4)}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => handleViewLocation(item.latitude, item.longitude)}
                              className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                              title="View on Map"
                            >
                              <Navigation className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleView(item.id)}
                              className="cursor-pointer p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-150"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEdit(item.id)}
                              className="cursor-pointer p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors duration-150"
                              title="Edit Location"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item)}
                              className="cursor-pointer p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-150"
                              title="Delete Location"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Desktop Footer */}
            <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span className="font-medium">
                  Showing {filteredList.length} of {list.length} locations
                </span>
                <span>
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Mobile/Tablet Card View (below md) */}
          <div className="md:hidden space-y-3">
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 sm:p-12 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                  <MapPin className="h-6 w-6 sm:h-8 sm:w-8 text-slate-400" />
                </div>
                <h3 className="text-base sm:text-lg font-medium text-slate-600 mb-2">No toilets found</h3>
                <p className="text-sm text-slate-500 mb-4">Try adjusting your filters or add a new location</p>
                <button
                  onClick={handleAddToilet}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  Add First Location
                </button>
              </div>
            ) : (
              <>
                {filteredList.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-3 py-2.5 flex justify-between items-center">
                      <span className="text-xs font-semibold text-white">#{index + 1}</span>
                      <div className="flex items-center gap-2">
                        {renderEmojiRating(item.averageRating, item.ratingCount)}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-3 sm:p-4 space-y-3">
                      {/* Location Name */}
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                          {item.name}
                        </h3>
                      </div>

                      {/* Images Preview */}
                      {item.images && item.images.length > 0 && (
                        <div className="border-t border-slate-100 pt-3">
                          <label className="text-xs font-medium text-slate-500 block mb-2">Images</label>
                          <div className="flex flex-wrap gap-2">
                            {renderImagesPreview(item.images)}
                          </div>
                        </div>
                      )}

                      {/* Coordinates */}
                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        <div>
                          <label className="text-xs font-medium text-slate-500 block mb-1">Latitude</label>
                          <p className="text-sm text-slate-700 font-mono">{parseFloat(item.latitude).toFixed(4)}</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 block mb-1">Longitude</label>
                          <p className="text-sm text-slate-700 font-mono">{parseFloat(item.longitude).toFixed(4)}</p>
                        </div>
                      </div>

                      {/* Date Added */}
                      <div className="pt-2 border-t border-slate-100">
                        <label className="text-xs font-medium text-slate-500 block mb-1">Date Added</label>
                        <p className="text-sm text-slate-600">
                          {new Date(item.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="bg-slate-50 px-3 py-2.5 sm:py-3 border-t border-slate-200 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleViewLocation(item.latitude, item.longitude)}
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        <span>Map</span>
                      </button>
                      <button
                        onClick={() => handleView(item.id)}
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => handleEdit(item.id)}
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
                      >
                        <Edit className="h-3.5 w-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item)}
                        className="cursor-pointer inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Mobile Footer */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <span className="font-medium">
                      Showing {filteredList.length} of {list.length} locations
                    </span>
                    <span className="text-xs">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Delete Confirmation Modal - Responsive */}
          {deleteModal.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                      Delete Location
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-5 sm:mb-6">
                  <p className="text-sm sm:text-base text-slate-700">
                    Are you sure you want to delete "<strong className="font-semibold">{deleteModal.location?.name}</strong>"?
                    This will permanently remove the location and all associated data.
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                  <button
                    onClick={() => setDeleteModal({ open: false, location: null })}
                    className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 font-medium"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
                  >
                    {deleting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {deleting ? 'Deleting...' : 'Delete Location'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );

}

export default WashroomsPage;
