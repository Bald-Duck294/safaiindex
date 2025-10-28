"use client";

import React, { useState, useEffect } from "react";
import {
  Filter,
  Download,
  FileText,
  Table as TableIcon,
  Calendar,
  MapPin,
  RefreshCw,
  Loader2,
} from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import ReportsApi from "@/lib/api/reportsApi";
import ReportTable from "./components/ReportTable";
import { exportToPDF, exportToExcel } from "./components/ExportUtils";
import Loader from "@/components/ui/Loader";

export default function ReportsPage() {
  const { companyId } = useCompanyId();

  // Filter states
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reviewFilter, setReviewFilter] = useState("all");

  // Data states
  const [reportData, setReportData] = useState([]);
  const [reportMetadata, setReportMetadata] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Fetch zones on mount
  useEffect(() => {
    if (companyId) {
      fetchZones();
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
      toast.error("Failed to load zones");
    }
  };

  const fetchReport = async () => {
    if (!companyId) {
      toast.error("Company ID is required");
      return;
    }

    setIsLoading(true);
    try {
      const params = {
        company_id: companyId,
        ...(selectedZone && { type_id: selectedZone }),
        ...(startDate && { start_date: startDate }),
        ...(endDate && { end_date: endDate }),
        ...(reviewFilter !== "all" && { review_filter: reviewFilter }),
      };

      const response = await ReportsApi.getZoneWiseReport(params);

      if (response.success) {
        setReportData(response.data);
        setReportMetadata(response.metadata);
        toast.success("Report generated successfully!");
      } else {
        toast.error(response.error || "Failed to generate report");
      }
    } catch (error) {
      console.error("Error fetching report:", error);
      toast.error("Failed to generate report");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      exportToPDF(reportData, reportMetadata);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (!reportData || reportData.length === 0) {
      toast.error("No data to export");
      return;
    }

    setIsExporting(true);
    try {
      exportToExcel(reportData, reportMetadata);
      toast.success("Excel exported successfully!");
    } catch (error) {
      console.error("Error exporting Excel:", error);
      toast.error("Failed to export Excel");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setSelectedZone("");
    setStartDate("");
    setEndDate("");
    setReviewFilter("all");
    setReportData([]);
    setReportMetadata(null);
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
                    Zone-wise Reports
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    Generate and export detailed cleaner activity reports
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Filters</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Zone Filter */}
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

              {/* Review Status Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <TableIcon className="w-4 h-4 inline mr-1" />
                  Review Status
                </label>
                <select
                  value={reviewFilter}
                  onChange={(e) => setReviewFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Locations</option>
                  <option value="with_reviews">With Reviews Only</option>
                  <option value="without_reviews">Without Reviews Only</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-6">
              <button
                onClick={fetchReport}
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

              {reportData.length > 0 && (
                <>
                  <button
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium ml-auto"
                  >
                    <Download className="w-4 h-4" />
                    Export PDF
                  </button>

                  <button
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    <Download className="w-4 h-4" />
                    Export Excel
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Report Table */}
          {isLoading ? (
            <div className="flex justify-center items-center h-96 bg-white rounded-lg border border-slate-200">
              <Loader size="large" color="#3b82f6" message="Generating report..." />
            </div>
          ) : reportData.length > 0 ? (
            <ReportTable data={reportData} metadata={reportMetadata} />
          ) : (
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
    </>
  );
}
