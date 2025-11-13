import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { report } from "process";
import * as XLSX from "xlsx";

/**
 * Export Daily Task Report to PDF
 */
const exportDailyTaskToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4"); // Landscape A4
  
  // ========== HEADER SECTION ==========
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 58, 138); // Dark blue
  doc.text("Daily Task Report", 14, 15);
  
  // Add a horizontal line under the title
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.line(14, 18, 283, 18);
  
  let currentY = 25;
  
  // ========== METADATA TABLE (HORIZONTAL LAYOUT) ==========
  autoTable(doc, {
    head: [["Organization", "Report Type", "Date Range", "Generated On"]],
    body: [[
      metadata.organization || "N/A",
      metadata.report_type || "Daily Task Report",
      `${metadata.date_range?.start || 'N/A'} to ${metadata.date_range?.end || 'N/A'}`,
      new Date(metadata.generated_on).toLocaleString('en-IN', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true
      })
    ]],
    startY: currentY,
    theme: "grid",
    headStyles: { 
      fillColor: [241, 245, 249], // Light gray header
      textColor: [51, 65, 85], // Dark gray text
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: 'center',
      cellPadding: 3,
    },
    margin: { left: 14, right: 14 },
  });
  
  currentY = doc.lastAutoTable.finalY + 3;
  
  // ========== ANALYTICS/STATISTICS TABLE (HORIZONTAL LAYOUT with Green Header) ==========
  const completionRate = metadata.total_tasks > 0 
    ? ((metadata.completed_tasks / metadata.total_tasks) * 100).toFixed(1) 
    : 0;
  
  autoTable(doc, {
    head: [["Total Tasks", "Completed Tasks", "Ongoing Tasks", "Completion Rate"]],
    body: [[
      metadata.total_tasks,
      metadata.completed_tasks,
      metadata.ongoing_tasks,
      `${completionRate}%`
    ]],
    startY: currentY,
    theme: "grid",
    headStyles: { 
      fillColor: [16, 185, 129], // Green header for analytics
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
      halign: 'center',
      cellPadding: 3,
      fontStyle: 'bold',
      fillColor: [236, 253, 245] // Light green tint
    },
    margin: { left: 14, right: 14 },
  });
  
  currentY = doc.lastAutoTable.finalY + 8;
  
  // ========== TASK DETAILS TABLE (Main data) ==========
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text("Task Details", 14, currentY);
  
  currentY += 3;
  
  const formatDateTimeForPDF = (date) => {
    if (!date) return "Ongoing";
    return new Date(date).toLocaleString('en-IN', {
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };
  
  const tableData = data.map((task, index) => [
    index + 1,
    task.cleaner_name,
    task.washroom_full_name,
    formatDateTimeForPDF(task.task_start_time),
    formatDateTimeForPDF(task.task_end_time),
    task.duration_minutes,
    task.ai_score.toFixed(1),
    task.final_rating.toFixed(1),
    task.status.toUpperCase(),
  ]);
  
  autoTable(doc, {
    head: [
      [
        "#",
        "Cleaner Name",
        "Location",
        "Start Time",
        "End Time",
        "Duration (min)",
        "AI Score (0-10)",
        "Final Rating (0-10)",
        "Status",
      ],
    ],
    body: tableData,
    startY: currentY,
    theme: "grid",
    headStyles: { 
      fillColor: [37, 99, 235], // Blue header (original)
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'center'
    },
    bodyStyles: { 
      fontSize: 7,
      textColor: 50,
    },
    alternateRowStyles: { 
      fillColor: [248, 250, 252] 
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { 
        halign: 'center',
        fontStyle: 'bold'
      }
    },
    // Add conditional formatting for status column
    didParseCell: function(data) {
      if (data.column.index === 8 && data.section === 'body') {
        if (data.cell.raw === 'COMPLETED') {
          data.cell.styles.textColor = [22, 163, 74]; // Green
        } else if (data.cell.raw === 'ONGOING') {
          data.cell.styles.textColor = [234, 179, 8]; // Yellow/Orange
        }
      }
    },
    margin: { left: 14, right: 14 },
  });
  
  // ========== FOOTER ==========
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(8);
  doc.setTextColor(100);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      `Generated on ${new Date().toLocaleString('en-IN')}`,
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  const fileName = `Daily_Task_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};


/**
 * Export Zone-wise Report to PDF
 */
const exportZoneWiseToPDF = (data, metadata) => {
  const doc = new jsPDF("l", "mm", "a4");

  // Header
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("Zone-wise Cleaner Activity Report", 14, 15);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  const metadataY = 25;
  doc.text(`Organization: ${metadata.organization}`, 14, metadataY);
  doc.text(`Zone: ${metadata.zone}`, 14, metadataY + 5);
  doc.text(
    `Date Range: ${metadata.date_range.start} to ${metadata.date_range.end}`,
    14,
    metadataY + 10
  );
  doc.text(
    `Generated On: ${new Date(metadata.generated_on).toLocaleString()}`,
    14,
    metadataY + 15
  );

  // Statistics
  doc.text(
    `Total Locations: ${metadata.total_locations} | Total Reviews: ${metadata.total_reviews} | Avg Score: ${(metadata.average_score_overall || 0).toFixed(2)}`,
    14,
    metadataY + 20
  );

  // Table data
  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.address !== "N/A" ? row.address : "No address",
    row.cleaner_name,
    (row.current_score || 0).toFixed(2),
    (row.average_rating || 0).toFixed(2),
    row.review_status,
    row.last_review_date
      ? new Date(row.last_review_date).toLocaleDateString()
      : "Never",
    row.facility_company,
    row.latitude && row.longitude
      ? `${row.latitude.toFixed(4)}, ${row.longitude.toFixed(4)}`
      : "N/A",
  ]);

  // Add table
  autoTable(doc, {
    head: [
      [
        "#",
        "Location",
        "Address",
        "Cleaner",
        "Current Score",
        "Avg Rating",
        "Status",
        "Last Review",
        "Facility Company",
        "Coordinates",
      ],
    ],
    body: tableData,
    startY: metadataY + 25,
    theme: "grid",
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 8,
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  // Save
  const fileName = `Zone_Report_${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
};

/**
 * Main PDF export function - routes to appropriate function based on report type
 */
export const exportToPDF = (data, metadata, reportType = "zone_wise") => {
  if (reportType === "daily_task") {
    exportDailyTaskToPDF(data, metadata);
  } else if (reportType === "zone_wise") {
    exportZoneWiseToPDF(data, metadata);
  }
  else if (reportType === "ai_scoring") {
    exportAiScoringToPDF(data, metadata);
  }
  else if (reportType === "cleaner_performance_summary") {
    exportCleanerPerformanceSummaryToPDF(data, metadata);
  }
  else {
    console.error("Unknown report type:", reportType);
  }
};

/**
 * Export Daily Task Report to Excel
 */



const exportZoneWiseToExcel = (data, metadata) => {
  // Header rows
  const headerRows = [
    ["Zone-wise Cleaner Activity Report"],
    [],
    ["Organization", metadata.organization],
    ["Zone", metadata.zone],
    [
      "Date Range",
      `${metadata.date_range.start} to ${metadata.date_range.end}`,
    ],
    ["Generated On", new Date(metadata.generated_on).toLocaleString()],
    ["Total Locations", metadata.total_locations],
    ["Total Reviews", metadata.total_reviews],
    ["Average Score", (metadata.average_score_overall || 0).toFixed(2)],
    ["Average Rating", (metadata.average_rating_overall || 0).toFixed(2)],
    [],
  ];

  // Table headers
  const tableHeaders = [
    "#",
    "Location Name",
    "Address",
    "City",
    "State",
    "Zone",
    "Cleaner Name",
    "Cleaner Phone",
    "Current Score",
    "Average Rating",
    "Hygiene Score Count",
    "Review Status",
    "Last Review Date",
    "Total Reviews",
    "Unique Cleaners",
    "Facility Company",
    "Latitude",
    "Longitude",
    "Google Maps Link",
  ];

  // Table data
  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.address !== "N/A" ? row.address : "",
    row.city !== "N/A" ? row.city : "",
    row.state !== "N/A" ? row.state : "",
    row.zone,
    row.cleaner_name,
    row.cleaner_phone !== "N/A" ? row.cleaner_phone : "",
    (row.current_score || 0).toFixed(2),
    (row.average_rating || 0).toFixed(2),
    row.hygiene_score_count,
    row.review_status,
    row.last_review_date
      ? new Date(row.last_review_date).toLocaleDateString()
      : "",
    row.total_reviews,
    row.unique_cleaners,
    row.facility_company,
    row.latitude || "",
    row.longitude || "",
    row.latitude && row.longitude
      ? `https://www.google.com/maps?q=${row.latitude},${row.longitude}`
      : "",
  ]);

  // Combine
  const worksheetData = [...headerRows, tableHeaders, ...tableData];

  // Create workbook
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Column widths
  ws["!cols"] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 35 },
    { wch: 15 },
    { wch: 15 },
    { wch: 20 },
    { wch: 20 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 12 },
    { wch: 25 },
    { wch: 12 },
    { wch: 12 },
    { wch: 50 },
  ];

  // Style title
  ws["A1"].s = {
    font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
    alignment: { horizontal: "center" },
  };

  // Merge title
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }];

  // Add sheet
  XLSX.utils.book_append_sheet(wb, ws, "Zone Report");

  // Save
  const fileName = `Zone_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};


const exportAiScoringToPDF = (data, metadata) => {
  const doc = new jsPDF("p", "mm", "a4"); // Portrait orientation

  // Header
  doc.setFontSize(18);
  doc.setTextColor(37, 99, 235);
  doc.text("AI Scoring Report", 14, 20);

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100);
  const metadataY = 30;
  doc.text(`Date Range: ${metadata.date_range.start} to ${metadata.date_range.end}`, 14, metadataY);
  doc.text(`Generated On: ${new Date(metadata.generated_on).toLocaleString('en-IN')}`, 14, metadataY + 5);
  doc.text(`Total Locations: ${metadata.total_locations_inspected} | Overall Average Score: ${metadata.overall_average_score.toFixed(2)}`, 14, metadataY + 10);

  // Table Data
  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.total_inspections,
    row.average_score.toFixed(2),
    `${row.improvement_percentage.toFixed(1)}%`
  ]);

  // Add Table
  autoTable(doc, {
    head: [["#", "Washroom", "Total Inspections", "Average Score (0-10)", "Improvement Trend"]],
    body: tableData,
    startY: metadataY + 18,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
    didDrawCell: (data) => {
      // Color the 'Improvement' cell text
      if (data.column.dataKey === 4 && data.cell.section === 'body') {
        const value = parseFloat(data.cell.raw);
        if (value > 0) doc.setTextColor(34, 139, 34); // Green
        if (value < 0) doc.setTextColor(220, 20, 60); // Red
      }
    }
  });

  doc.save(`AI_Scoring_Report_${new Date().toISOString().split("T")[0]}.pdf`);
};

/**
 * ✅ NEW: Export AI Scoring Report to Excel
 */
const exportAiScoringToExcel = (data, metadata) => {
  const headerRows = [
    ["AI Scoring Report"],
    [],
    ["Date Range", `${metadata.date_range.start} to ${metadata.date_range.end}`],
    ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN')],
    ["Total Locations Inspected", metadata.total_locations_inspected],
    ["Overall Average Score", metadata.overall_average_score.toFixed(2)],
    [],
  ];

  const tableHeaders = ["#", "Washroom", "Total Inspections", "Average Score (0-10)", "Improvement Trend (%)"];

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name,
    row.total_inspections,
    row.average_score.toFixed(2),
    row.improvement_percentage.toFixed(1)
  ]);

  const ws = XLSX.utils.aoa_to_sheet([...headerRows, tableHeaders, ...tableData]);
  ws["!cols"] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
  ws["A1"].s = { font: { bold: true, sz: 16, color: { rgb: "2563EB" } }, alignment: { horizontal: "center" } };
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "AI Scoring Report");
  XLSX.writeFile(wb, `AI_Scoring_Report_${new Date().toISOString().split("T")[0]}.xlsx`);
};


export const exportCleanerPerformanceSummaryToPDF = (data, metadata) => {
  const doc = new jsPDF();
  doc.text("Cleaner Performance Summary", 14, 20);
  doc.setFontSize(10);
  doc.text(
    `Date Range: ${metadata?.date_range?.start && metadata?.date_range?.end
      ? metadata.date_range.start + " to " + metadata.date_range.end
      : "-"
    }`,
    14,
    30
  );

  autoTable(doc, {
    head: [
      [
        "Cleaner",
        "Total Tasks",
        "Avg. AI Score",
        "Avg. Compliance (%)",
        "Avg. Duration (min)",
        "Last Task Date",
      ],
    ],
    body: data.map(row => [
      row.cleaner_name,
      row.total_tasks,
      row.avg_ai_score,
      row.avg_compliance,
      row.avg_duration,
      row.last_task_date ? new Date(row.last_task_date).toLocaleString('en-IN') : "-"
    ]),
    startY: 35,
  });

  doc.save("Cleaner_Performance_Summary.pdf");
};



export const exportCleanerPerformanceSummaryToExcel = (data, metadata) => {
  const header = [["Cleaner Performance Summary"]];
  const subHeader = [[
    "Date Range",
    (metadata?.date_range?.start && metadata?.date_range?.end)
      ? `${metadata.date_range.start} to ${metadata.date_range.end}`
      : "-"
  ]];
  const tableHeaders = [
    "Cleaner",
    "Total Tasks",
    "Avg. AI Score",
    "Avg. Compliance (%)",
    "Avg. Duration (min)",
    "Last Task Date"
  ];
  const tableData = data.map(row => [
    row.cleaner_name,
    row.total_tasks,
    row.avg_ai_score,
    row.avg_compliance,
    row.avg_duration,
    row.last_task_date ? new Date(row.last_task_date).toLocaleString('en-IN') : "-"
  ]);
  const ws = XLSX.utils.aoa_to_sheet([...header, ...subHeader, [], tableHeaders, ...tableData]);
  ws['!cols'] = Array(tableHeaders.length).fill({ wch: 22 });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Performance Summary");
  XLSX.writeFile(wb, "Cleaner_Performance_Summary.xlsx");
};



export const exportToExcel = (data, metadata, reportType = "zone_wise") => {
  if (reportType === "daily_task") {
    exportDailyTaskToPDF(data, metadata);
  } else if (reportType === "zone_wise") {
    exportZoneWiseToExcel(data, metadata);
  }
  else if (reportType === "ai_scoring") {
    exportAiScoringToExcel(data, metadata);
  }
  else if (reportType === "cleaner_performance_summary") {
    exportCleanerPerformanceSummaryToExcel(data, metadata);
  }
  else {
    console.error("Unknown report type:", reportType);
  }
};



