"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  Download,
  FileText,
  Calendar,
  MapPin,
  RefreshCw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import ReportsApi from "@/lib/api/reportsApi";
import ReportModal from "./components/ReportModal";
import Loader from "@/components/ui/Loader";
import { useSelector } from "react-redux";


const REPORT_TYPES = [
  {
    value: "daily_task",
    label: "Daily Task Report",
    description: "View cleaner tasks with AI scores and compliance",
    endpoint: "daily-task",
  },
  {
    value: "zone_wise",
    label: "Zone-wise Report",
    description: "Location-wise cleaner activity and scores",
    endpoint: "zone-wise",
  },
  {
    value: "ai_scoring",
    label: "AI Scoring Report",
    description: "Track the average AI hygiene score and improvement trend for each location.",
    endpoint: "ai-scoring",
  },
  {
    value: "cleaner_performance_summary",
    label: "Cleaner Performance Summary",
    description: "Aggregate performance metrics for cleaners.",
    endpoint: "cleaner-performance-summary",
  },
  {
    value: "detailed_cleaning",
    label: "Detailed Cleaning Report",
    description: "Aggregate performance metrics for cleaners.",
    endpoint: "daily-task",
  }
];

export default function ReportsPage() {
  const { companyId } = useCompanyId();
  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const isPermitted = userRoleId === 1 || userRoleId === 2;

  // ✅ Report type selection
  const [selectedReportType, setSelectedReportType] = useState("daily_task");

  // ✅ Common filter states
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [cleaners, setCleaners] = useState([]);

  const [selectedZone, setSelectedZone] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedCleaner, setSelectedCleaner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // ✅ Data states
  const [reportData, setReportData] = useState([]);
  const [reportMetadata, setReportMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // ✅ Fetch dropdown data on mount
  useEffect(() => {
    if (companyId) {
      fetchZones();
      fetchLocations();
      fetchCleaners();
    }
  }, [companyId]);

  const fetchZones = async () => {
    try {
      const response = await ReportsApi.getAvailableZones(companyId);
      if (response.success) {
        setZones(response.data);
      }
    } catch (error) {
      console.error("Error fetching zones:", error);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await ReportsApi.getLocationsForReport(companyId);
      if (response.success) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchCleaners = async () => {
    try {
      const response = await ReportsApi.getCleanersForReport(companyId);
      if (response.success) {
        setCleaners(response.data);
      }
    } catch (error) {
      console.error("Error fetching cleaners:", error);
    }
  };

  // ✅ Generate report based on selected type
  const generateReport = async () => {
    if (!companyId) {
      toast.error("Company ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const selectedReport = REPORT_TYPES.find(
        (r) => r.value === selectedReportType
      );

      let effectiveStartDate = startDate;
      let effectiveEndDate = endDate;
      // Build params based on report type
      let params = {
        company_id: companyId,
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
      };

      if (selectedReportType === "daily_task") {
        const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
        if (!effectiveStartDate) effectiveStartDate = today;
        if (!effectiveEndDate) effectiveEndDate = today;
      }

      // Add report-specific filters
      if (selectedReportType === "daily_task") {
        params = {
          ...params,
          ...(selectedLocation && { location_id: selectedLocation }),
          ...(selectedCleaner && { cleaner_id: selectedCleaner }),
          ...(statusFilter !== "all" && { status_filter: statusFilter }),
          ...(effectiveStartDate && { start_date: effectiveStartDate }),
          ...(effectiveEndDate && { end_date: effectiveEndDate }),
        };
      } else if (selectedReportType === "zone_wise") {
        params = {
          ...params,
          ...(selectedZone && { type_id: selectedZone }),
          // ...(reviewFilter !== "all" && { review_filter: reviewFilter }), // ✅ Commented out
        };
      }

      console.log("Generating report with params:", params);

      const response = await ReportsApi.getReport(
        selectedReport.endpoint,
        params
      );

      if (response.success || response.status === "success") {
        setReportData(response.data);
        setReportMetadata(response.metadata);
        setShowModal(true);
        toast.success("Report generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedZone("");
    setSelectedLocation("");
    setSelectedCleaner("");
    setStartDate("");
    setEndDate("");
    setStatusFilter("all");
    setReportData([]);
    setReportMetadata(null);
    setShowModal(false);
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-800">
                    Reports Dashboard
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Generate and export detailed reports
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Select Report Type
              </label>
              <div className="relative">
                <select
                  value={selectedReportType}
                  onChange={(e) => {
                    setSelectedReportType(e.target.value);
                    handleReset(); // Reset filters when changing report type
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white pr-10"
                >
                  {REPORT_TYPES.map((report) => (
                    <option key={report.value} value={report.value}>
                      {report.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {
                  REPORT_TYPES.find((r) => r.value === selectedReportType)
                    ?.description
                }
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Zone Filter - Only for Zone-wise report */}
              {selectedReportType === "zone_wise" && isPermitted && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Zone / Location Type
                  </label>
                  <select
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Zones</option>
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ✅ Location Filter - For Daily Task Report */}
              {selectedReportType === "daily_task" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Location / Washroom
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Locations</option>
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.display_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* ✅ Cleaner Filter - For Daily Task Report */}
              {selectedReportType === "daily_task" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Cleaner
                  </label>
                  <select
                    value={selectedCleaner}
                    onChange={(e) => setSelectedCleaner(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="">All Cleaners</option>
                    {cleaners.map((cleaner) => (
                      <option key={cleaner.id} value={cleaner.id}>
                        {cleaner.name} {cleaner.phone && `(${cleaner.phone})`}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              {/* ✅ Status Filter - For Daily Task Report */}
              {selectedReportType === "daily_task" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="ongoing">Ongoing</option>
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={generateReport}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-96 bg-white rounded-lg border border-slate-200">
              <Loader
                size="large"
                color="#3b82f6"
                message="Generating report..."
              />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !showModal && (
            <div className="text-center py-12 bg-white rounded-lg border border-slate-200">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No report generated yet</p>
              <p className="text-slate-400 text-sm mt-2">
                Select your filters and click "Generate Report" to view data
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Report Modal */}
      {showModal && reportData && reportMetadata && (
        <ReportModal
          reportType={selectedReportType}
          data={reportData}
          metadata={reportMetadata}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
