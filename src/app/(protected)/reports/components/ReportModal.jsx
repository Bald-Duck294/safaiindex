"use client";

import React from "react";
import { X, Download, Printer } from "lucide-react";
import DailyTaskReportTable from "./tables/DailyTaskReportTable";
import ZoneWiseReportTable from "./tables/ZoneWiseReportTable";

import AiScoringReportTable from "./tables/AiScoringReportTable";
import CleanerPerformanceSummaryTable from "./tables/CleanerPerformanceSummaryTable";
import DetailedCleaningReportTable from "./tables/DetailedCleaningReportTable";
import { exportToPDF, exportToExcel } from "./ExportUtils";

export default function ReportModal({ reportType, data, metadata, onClose }) {
  const handleExportPDF = () => {
    exportToPDF(data, metadata, reportType);
  };

  const handleExportExcel = () => {
    exportToExcel(data, metadata, reportType);
  };

  const handlePrint = () => {
    window.print();
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
        return <DetailedCleaningReportTable data={data} metadata={metadata} />;
      default:
        return <div>Unknown report type</div>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-8">
        <div className="relative bg-white rounded-2xl shadow-2xl max-w-7xl mx-auto">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {metadata?.report_type || "Report"}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {metadata?.organization || "N/A"} • Generated on{" "}
                  {new Date(metadata?.generated_on).toLocaleString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {/* Export Buttons */}
                <button
                  onClick={handleExportPDF}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  PDF
                </button>

                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Excel
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>

                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Report Content */}
          <div className="p-6">{renderTable()}</div>
        </div>
      </div>
    </div>
  );
}
