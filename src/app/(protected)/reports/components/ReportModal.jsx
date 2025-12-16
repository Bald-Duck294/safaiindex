"use client";

import React, { useEffect } from "react";
import { X, Download, Printer, Calendar } from "lucide-react";
import DailyTaskReportTable from "./tables/DailyTaskReportTable";
import ZoneWiseReportTable from "./tables/ZoneWiseReportTable";
import AiScoringReportTable from "./tables/AiScoringReportTable";
import CleanerPerformanceSummaryTable from "./tables/CleanerPerformanceSummaryTable";
import DetailedCleaningReportTable from "./tables/DetailedCleaningReportTable";
import WashroomReportTable from "./tables/WashroomReportTable";
import WashroomHygieneTrendTable from "./tables/WashroomHygieneTrendTable";
import CleanerReportTable from "./tables/CleanerReportTable";
import { exportToPDF, exportToExcel } from "./ExportUtils";
import DetailedCleaningReportTableVirtualized from "./tables/DetailedCleaningReportTableVirtualized";

export default function ReportModal({ reportType, data, metadata, onClose }) {
  console.log(reportType, "report type in modal");

  // Prevent background scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleExportPDF = () => exportToPDF(data, metadata, reportType);
  const handleExportExcel = () => exportToExcel(data, metadata, reportType);
  const handlePrint = () => window.print();

  // ✅ Format date range display
  const getDateRangeDisplay = () => {
    const startDate = metadata?.date_range?.start;
    const endDate = metadata?.date_range?.end;

    // Format helper
    const formatDate = (dateStr) => {
      if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
      try {
        return new Date(dateStr).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      } catch {
        return dateStr;
      }
    };

    // Case 1: No dates selected
    if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
      return "Beginning to Now";
    }

    // Case 2: Only start date
    if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
      return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })}`;
    }

    // Case 3: Both dates
    if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
      const formattedStart = formatDate(startDate);
      const formattedEnd = formatDate(endDate);

      // Single date check
      if (formattedStart === formattedEnd) {
        return formattedStart;
      }

      return `${formattedStart} to ${formattedEnd}`;
    }

    // Case 4: Only end date (edge case)
    if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
      return `Beginning to ${formatDate(endDate)}`;
    }

    return "Date Range Not Specified";
  };

  // Render appropriate table based on report type
  const renderTable = () => {
    switch (reportType) {
      case "daily_task":
        return <DailyTaskReportTable data={data} metadata={metadata} />;
      case "zone_wise":
        return <ZoneWiseReportTable data={data} metadata={metadata} />;
      case "ai_scoring":
        return <AiScoringReportTable data={data} metadata={metadata} />;
      case "cleaner_performance_summary":
        return <CleanerPerformanceSummaryTable data={data} metadata={metadata} />;
      case "detailed_cleaning":
        return <DetailedCleaningReportTableVirtualized data={data} metadata={metadata} />;
      case "washroom_report":
        return <WashroomReportTable data={data} metadata={metadata} />;
      case "cleaner_report":
        return <CleanerReportTable data={data} metadata={metadata} />;
      case "washroom_hygiene_trend":
        return <WashroomHygieneTrendTable data={data} metadata={metadata} />;
      default:
        return <div className="text-center py-8 text-slate-500">Unknown report type</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-7xl h-screen overflow-y-auto py-8 px-4">
        <div className="relative bg-white rounded-2xl shadow-2xl">
          {/* ✅ Enhanced Sticky Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-white to-slate-50 border-b border-slate-200 px-6 py-4 rounded-t-2xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Section */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900">
                  {metadata?.report_type || "Report"}
                </h2>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-600">
                  {/* Organization */}
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    {metadata?.organization || "N/A"}
                  </span>

                  {/* Date Range */}
                  <span className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-blue-700 rounded-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="font-medium">{getDateRangeDisplay()}</span>
                  </span>

                  {/* Generated On */}
                  <span className="text-slate-500">
                    Generated: {new Date(metadata?.generated_on).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </span>
                </div>
              </div>

              {/* Right Section - Action Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* PDF Export */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Export as PDF"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">PDF</span>
                </button>

                {/* Excel Export */}
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Export as Excel"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Excel</span>
                </button>

                {/* Print */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 active:scale-95 transition-all text-sm font-medium shadow-sm"
                  title="Print Report"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors ml-2"
                  title="Close"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">
            {renderTable()}
          </div>
        </div>
      </div>
    </div>
  );
}
