"use client";

import React from "react";
import { MapPin, Star, User, Phone, Calendar, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const ReportTable = ({ data, metadata }) => {
  const handleLocate = (latitude, longitude) => {
    if (latitude && longitude) {
      window.open(
        `https://www.google.com/maps?q=${latitude},${longitude}`,
        "_blank"
      );
    }
  };

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600 bg-green-50";
    if (score >= 6) return "text-yellow-600 bg-yellow-50";
    if (score >= 4) return "text-orange-600 bg-orange-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: "bg-green-100 text-green-700",
      ongoing: "bg-blue-100 text-blue-700",
      "No Reviews": "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${statusConfig[status] || statusConfig["No Reviews"]
          }`}
      >
        {status}
      </span>
    );
  };

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
        <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 text-lg">No data available for the selected filters</p>
        <p className="text-slate-400 text-sm mt-2">
          Try adjusting your filter criteria
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
      {/* Report Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-blue-100 text-xs uppercase mb-1">Organization</p>
            <p className="font-semibold">{metadata?.organization || "N/A"}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs uppercase mb-1">Zone</p>
            <p className="font-semibold">{metadata?.zone || "All Zones"}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs uppercase mb-1">Date Range</p>
            <p className="font-semibold">
              {metadata?.date_range?.start} to {metadata?.date_range?.end}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs uppercase mb-1">Report Type</p>
            <p className="font-semibold">{metadata?.report_type || "N/A"}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs uppercase mb-1">Generated On</p>
            <p className="font-semibold">
              {new Date(metadata?.generated_on).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        {/* Statistics Summary */}
        <div className="mt-4 pt-4 border-t border-blue-500/30 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-blue-100 text-xs">Total Locations</p>
            <p className="text-2xl font-bold">{metadata?.total_locations || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Total Reviews</p>
            <p className="text-2xl font-bold">{metadata?.total_reviews || 0}</p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Average Score</p>
            <p className="text-2xl font-bold">
              {metadata?.average_score_overall?.toFixed(2) || "0.00"}
            </p>
          </div>
          <div>
            <p className="text-blue-100 text-xs">Average Rating</p>
            <p className="text-2xl font-bold">
              {metadata?.average_rating_overall?.toFixed(2) || "0.00"}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                #
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Address
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Cleaner
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Current Score
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Avg Rating
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Last Review
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Facility Company
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {data.map((row, index) => (
              console.log(row, "single row", index),
              <motion.tr
                key={row.location_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-slate-50 transition-colors"
              >
                <td className="px-4 py-4 text-sm text-slate-600 font-medium">
                  {index + 1}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {row.location_name}
                      </p>
                      <p className="text-xs text-slate-500">{row.zone}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-sm text-slate-600 max-w-xs">
                  <p className="truncate">
                    {row.address !== "N/A" ? row.address : "No address"}
                  </p>
                  {row.city !== "N/A" && (
                    <p className="text-xs text-slate-500">
                      {row.city}, {row.state}
                    </p>
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-slate-800 text-sm">
                        {row.cleaner_name}
                      </p>
                      {row.cleaner_phone !== "N/A" && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {row.cleaner_phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-semibold text-sm ${getScoreColor(
                      row.current_score
                    )}`}
                  >
                    <Star className="w-4 h-4" fill="currentColor" />
                    {row.current_score.toFixed(2)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-500" />
                    <span className="font-medium text-slate-700 text-sm">
                      {row.average_rating.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({row.hygiene_score_count})
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  {getStatusBadge(row.review_status)}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {row.last_review_date ? (
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(row.last_review_date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-400">Never</span>
                  )}
                </td>
                <td className="px-4 py-4 text-sm text-slate-600">
                  {row.facility_company}
                </td>
                <td className="px-4 py-4 text-center">
                  {row.latitude && row.longitude ? (
                    <button
                      onClick={() => handleLocate(row.latitude, row.longitude)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <MapPin className="w-3 h-3" />
                      Locate
                    </button>
                  ) : (
                    <span className="text-slate-400 text-xs">N/A</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReportTable;
