import * as XLSX from "xlsx";

export const generateProfessionalExcel = (data, metadata) => {
  // Create a new workbook
  const wb = XLSX.utils.book_new();

  // ===== SHEET 1: REPORT SUMMARY =====
  const summaryData = [
    ["ZONE-WISE CLEANER ACTIVITY REPORT"],
    [""],
    ["Report Details"],
    ["Organization:", metadata?.organization || "N/A"],
    ["Zone:", metadata?.zone || "All Zones"],
    ["Date Range:", `${metadata?.date_range?.start} to ${metadata?.date_range?.end}`],
    ["Generated On:", new Date(metadata?.generated_on).toLocaleString()],
    [""],
    ["Statistics"],
    ["Total Locations:", metadata?.total_locations || 0],
    ["Total Reviews:", metadata?.total_reviews || 0],
    ["Locations with Reviews:", metadata?.locations_with_reviews || 0],
    ["Locations without Reviews:", metadata?.locations_without_reviews || 0],
    ["Average Score:", metadata?.average_score_overall?.toFixed(2) || "0.00"],
    ["Average Rating:", metadata?.average_rating_overall?.toFixed(2) || "0.00"],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);

  // Style the summary sheet
  summarySheet["!cols"] = [{ wch: 30 }, { wch: 40 }];
  
  // Merge cells for title
  summarySheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
  ];

  XLSX.utils.book_append_sheet(wb, summarySheet, "Report Summary");

  // ===== SHEET 2: DETAILED DATA =====
  const headers = [
    "#",
    "Location Name",
    "Zone",
    "Address",
    "City",
    "State",
    "Facility Company",
    "Cleaner Name",
    "Cleaner Phone",
    "Current Score",
    "Average Rating",
    "Hygiene Score Count",
    "Review Status",
    "Last Review Date",
    "Total Reviews",
    "Latitude",
    "Longitude",
  ];

  const tableData = data.map((row, index) => [
    index + 1,
    row.location_name || "N/A",
    row.zone || "N/A",
    row.address !== "N/A" ? row.address : "No address",
    row.city || "N/A",
    row.state || "N/A",
    row.facility_company || "Not Assigned", // ✅ Now shows actual facility company
    row.cleaner_name || "Not Assigned",
    row.cleaner_phone || "N/A",
    row.current_score?.toFixed(2) || "0.00",
    row.average_rating?.toFixed(2) || "0.00",
    row.hygiene_score_count || 0,
    row.review_status || "No Reviews",
    row.last_review_date
      ? new Date(row.last_review_date).toLocaleDateString("en-US")
      : "Never",
    row.total_reviews || 0,
    row.latitude || "",
    row.longitude || "",
  ]);

  const detailedData = [headers, ...tableData];
  const detailedSheet = XLSX.utils.aoa_to_sheet(detailedData);

  // Set column widths
  detailedSheet["!cols"] = [
    { wch: 5 },  // #
    { wch: 25 }, // Location Name
    { wch: 20 }, // Zone
    { wch: 35 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 25 }, // Facility Company
    { wch: 20 }, // Cleaner Name
    { wch: 15 }, // Cleaner Phone
    { wch: 12 }, // Current Score
    { wch: 12 }, // Average Rating
    { wch: 12 }, // Hygiene Score Count
    { wch: 15 }, // Review Status
    { wch: 15 }, // Last Review Date
    { wch: 12 }, // Total Reviews
    { wch: 12 }, // Latitude
    { wch: 12 }, // Longitude
  ];

  // Apply styles to header row
  const headerStyle = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2563EB" } }, // Blue background
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "000000" } },
      bottom: { style: "thin", color: { rgb: "000000" } },
      left: { style: "thin", color: { rgb: "000000" } },
      right: { style: "thin", color: { rgb: "000000" } },
    },
  };

  // Apply header styles (Row 1)
  for (let col = 0; col < headers.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!detailedSheet[cellRef]) continue;
    detailedSheet[cellRef].s = headerStyle;
  }

  // Apply alternating row colors
  for (let row = 1; row <= tableData.length; row++) {
    const isEvenRow = row % 2 === 0;
    const rowStyle = {
      fill: { fgColor: { rgb: isEvenRow ? "F8FAFC" : "FFFFFF" } },
      border: {
        top: { style: "thin", color: { rgb: "E2E8F0" } },
        bottom: { style: "thin", color: { rgb: "E2E8F0" } },
        left: { style: "thin", color: { rgb: "E2E8F0" } },
        right: { style: "thin", color: { rgb: "E2E8F0" } },
      },
    };

    for (let col = 0; col < headers.length; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (!detailedSheet[cellRef]) continue;
      detailedSheet[cellRef].s = rowStyle;

      // Special styling for score columns
      if (col === 9) { // Current Score column
        const score = parseFloat(detailedSheet[cellRef].v);
        if (!isNaN(score)) {
          if (score >= 8) {
            detailedSheet[cellRef].s.fill = { fgColor: { rgb: "D1FAE5" } }; // Green
            detailedSheet[cellRef].s.font = { color: { rgb: "065F46" }, bold: true };
          } else if (score >= 6) {
            detailedSheet[cellRef].s.fill = { fgColor: { rgb: "FEF3C7" } }; // Yellow
            detailedSheet[cellRef].s.font = { color: { rgb: "92400E" }, bold: true };
          } else if (score >= 4) {
            detailedSheet[cellRef].s.fill = { fgColor: { rgb: "FED7AA" } }; // Orange
            detailedSheet[cellRef].s.font = { color: { rgb: "9A3412" }, bold: true };
          } else {
            detailedSheet[cellRef].s.fill = { fgColor: { rgb: "FEE2E2" } }; // Red
            detailedSheet[cellRef].s.font = { color: { rgb: "991B1B" }, bold: true };
          }
        }
      }
    }
  }

  XLSX.utils.book_append_sheet(wb, detailedSheet, "Location Details");

  // ===== SHEET 3: FACILITY COMPANIES SUMMARY =====
  const facilityStats = {};
  
  data.forEach((row) => {
    const facilityName = row.facility_company || "Not Assigned";
    if (!facilityStats[facilityName]) {
      facilityStats[facilityName] = {
        total_locations: 0,
        total_reviews: 0,
        avg_score: 0,
        scores: [],
      };
    }
    facilityStats[facilityName].total_locations++;
    facilityStats[facilityName].total_reviews += row.total_reviews || 0;
    facilityStats[facilityName].scores.push(row.current_score || 0);
  });

  const facilityHeaders = [
    "Facility Company",
    "Total Locations",
    "Total Reviews",
    "Average Score",
    "Performance Rating",
  ];

  const facilityData = Object.entries(facilityStats).map(([name, stats]) => {
    const avgScore = stats.scores.reduce((a, b) => a + b, 0) / stats.scores.length;
    const rating = avgScore >= 8 ? "Excellent" : avgScore >= 6 ? "Good" : avgScore >= 4 ? "Average" : "Poor";
    return [
      name,
      stats.total_locations,
      stats.total_reviews,
      avgScore.toFixed(2),
      rating,
    ];
  });

  const facilitySheetData = [facilityHeaders, ...facilityData];
  const facilitySheet = XLSX.utils.aoa_to_sheet(facilitySheetData);

  facilitySheet["!cols"] = [
    { wch: 30 }, // Facility Company
    { wch: 15 }, // Total Locations
    { wch: 15 }, // Total Reviews
    { wch: 15 }, // Average Score
    { wch: 20 }, // Performance Rating
  ];

  // Style facility sheet header
  for (let col = 0; col < facilityHeaders.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!facilitySheet[cellRef]) continue;
    facilitySheet[cellRef].s = headerStyle;
  }

  XLSX.utils.book_append_sheet(wb, facilitySheet, "Facility Summary");

  // Generate Excel file
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `Zone_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
  
  // Download file
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);

  return fileName;
};
