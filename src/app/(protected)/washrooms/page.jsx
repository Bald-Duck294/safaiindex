"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Eye, Edit, Navigation, Search, X } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
// import useCompanyId from "@/lib/utils/getCompanyId";
import { useCompanyId } from '@/lib/providers/CompanyProvider';


function WashroomsPage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortOrder, setSortOrder] = useState("desc"); // or 'asc'
  const { companyId } = useCompanyId();

  const fetchList = async () => {
    try {
      const response = await LocationsApi.getAllLocations(companyId);
      setList(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching list:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

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
      return sortOrder === "asc"
        ? dateA - dateB
        : dateB - dateA;
    });

    setFilteredList(filtered);
  }, [searchQuery, minRating, sortOrder, list]);

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };


  const handleView = (id) => {
    window.location.href = `/item/${id}`;
  };


  const handleEdit = (id) => {
    window.location.href = `/washroom/edit/${id}`;
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinRating("");
    setSortOrder("desc");
  };

  // Use your `renderEmojiRating` function here — unchanged
  const renderEmojiRating = (rating, reviewCount = 0) => {
    console.log('average ratings');
    const actualRating = rating || 0;
    const getEmojiAndColor = (rating) => {
      if (rating >= 7.5) return { emoji: "🤩", color: "text-emerald-600", bg: "bg-emerald-50", label: "Amazing" };
      if (rating >= 4) return { emoji: "😊", color: "text-orange-600", bg: "bg-orange-50", label: "Great" };
      if (rating >= 3) return { emoji: "😐", color: "text-yellow-600", bg: "bg-yellow-50", label: "Okay" };
      if (rating >= 2) return { emoji: "😕", color: "text-red-600", bg: "bg-orange-50", label: "Poor" };
      if (rating > 0) return { emoji: "😰", color: "text-red-600", bg: "bg-red-50", label: "Terrible" };
      return { emoji: "❓", color: "text-slate-500", bg: "bg-slate-50", label: "Unrated" };
    };

    const { emoji, color, bg, label } = getEmojiAndColor(actualRating);
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
        <div className="flex flex-col">
          <div className={`font-semibold text-sm ${color}`}>
            {actualRating > 0 ? actualRating.toFixed(1) : "-"} · {label}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6">Loading...</div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">

          {/* Header */}
          <div className="bg-slate-800 px-6 py-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-slate-300" />
                <h2 className="text-2xl font-bold text-white">
                  Public Washrooms Directory
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search washrooms..."
                    className="pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200 w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <select
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
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
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                >
                  <option value="desc">Newest First</option>
                  <option value="asc">Oldest First</option>
                </select>
                <button
                  onClick={clearAllFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            </div>
            <p className="text-slate-300 mt-2">
              Find and rate washrooms near you
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {filteredList.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">No washrooms found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">#</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Name</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Rating</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Coordinates</th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">Added</th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredList.map((item, index) => (
                    <tr key={item.id} className="border-b hover:bg-slate-50">
                      <td className="py-4 px-6 text-sm text-slate-700">{index + 1}</td>
                      <td className="py-4 px-6 text-slate-800 font-medium">{item.name}</td>
                      <td className="py-4 px-6">{renderEmojiRating(item.averageRating, item.ratingCount)}</td>
                      <td className="py-4 px-6 text-slate-600 text-sm">
                        <div>Lat: {parseFloat(item.latitude).toFixed(4)}</div>
                        <div>Lng: {parseFloat(item.longitude).toFixed(4)}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">
                        {new Date(item.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => handleViewLocation(item.latitude, item.longitude)} className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg">
                            <Navigation className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleView(item.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button onClick={() => handleEdit(item.id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg">
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
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 text-sm text-slate-600 flex justify-between">
            <span>Total: {filteredList.length} washrooms</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WashroomsPage;