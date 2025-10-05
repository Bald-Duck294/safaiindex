
"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Eye, Edit, Navigation, Search, X, Plus } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader"; // Import the loader component

function WashroomsPage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const { companyId } = useCompanyId();

  const router = useRouter();

  const fetchList = async () => {
    // Only proceed if companyId exists and is valid


    setLoading(true);
    try {
      const response = await LocationsApi.getAllLocations(companyId);
      setList(response.data);
    } catch (error) {
      console.error("Error fetching list:", error);
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

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinRating("");
    setSortOrder("desc");
  };

  const renderEmojiRating = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    const getEmojiAndColor = (rating) => {
      if (rating >= 7.5) return { emoji: "🤩", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", label: "Amazing" };
      if (rating >= 4) return { emoji: "😊", color: "text-orange-600 dark:text-orange-400", bg: "bg-orange-50 dark:bg-orange-900/20", label: "Great" };
      if (rating >= 3) return { emoji: "😐", color: "text-yellow-600 dark:text-yellow-400", bg: "bg-yellow-50 dark:bg-yellow-900/20", label: "Okay" };
      if (rating >= 2) return { emoji: "😕", color: "text-red-600 dark:text-red-400", bg: "bg-orange-50 dark:bg-orange-900/20", label: "Poor" };
      if (rating > 0) return { emoji: "😰", color: "text-red-600 dark:text-red-400", bg: "bg-red-50 dark:bg-red-900/20", label: "Terrible" };
      return { emoji: "❓", color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-50 dark:bg-slate-800/50", label: "Unrated" };
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
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="flex justify-center items-center h-94">
      <Loader
        size="large"
        color="#3b82f6"
        message="Loading organizations..."
      />
    </div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden mb-6">
          {/* Top Section with Title and Add Button */}
          <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Toilet Locations</h1>
                  <p className="text-slate-300 text-sm">Manage and view all toilet locations</p>
                </div>
              </div>
              <button
                onClick={handleAddToilet}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Plus className="h-4 w-4" />
                Add Toilet
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative flex-1 min-w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search locations..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400 dark:placeholder-slate-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <select
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-32"
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
                className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 min-w-32"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-4 py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-sm hover:shadow-md"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-300 mb-2">No toilets found</h3>
                <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or add a new location</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">#</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">Location Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">Rating</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">Coordinates</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">Date Added</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700 dark:text-slate-200 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors duration-150"
                    >
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400 font-medium">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 dark:text-slate-200">
                          {item.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {renderEmojiRating(item.averageRating, item.ratingCount)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <div>Lat: {parseFloat(item.latitude).toFixed(4)}</div>
                          <div>Lng: {parseFloat(item.longitude).toFixed(4)}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600 dark:text-slate-400">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleViewLocation(item.latitude, item.longitude)}
                            className=" cursor-pointer p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors duration-150"
                            title="View on Map"
                          >
                            <Navigation className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleView(item.id)}
                            className="cursor-pointer p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-150"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className=" cursor-pointer p-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors duration-150"
                            title="Edit Location"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 dark:bg-slate-700/30 px-6 py-4 border-t border-slate-200 dark:border-slate-600">
            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">
                Showing {filteredList.length} of {list.length} locations
              </span>
              <span>
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WashroomsPage;
