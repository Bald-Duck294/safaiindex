import jsPDF from "jspdf";
// import "jspdf-autotable";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

export const exportToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4"); // Landscape orientation

    // Add header
    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text("Zone-wise Cleaner Activity Report", 14, 15);

    // Add metadata
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

    // Add statistics
    doc.text(
        `Total Locations: ${metadata.total_locations} | Total Reviews: ${metadata.total_reviews} | Avg Score: ${metadata.average_score_overall.toFixed(2)}`,
        14,
        metadataY + 20
    );

    // Prepare table data
    const tableData = data.map((row, index) => [
        index + 1,
        row.location_name,
        row.address !== "N/A" ? row.address : "No address",
        row.cleaner_name,
        row.current_score.toFixed(2),
        row.average_rating.toFixed(2),
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
        columnStyles: {
            0: { cellWidth: 10 },
            1: { cellWidth: 35 },
            2: { cellWidth: 40 },
            3: { cellWidth: 30 },
            4: { cellWidth: 20, halign: "center" },
            5: { cellWidth: 20, halign: "center" },
            6: { cellWidth: 20, halign: "center" },
            7: { cellWidth: 25 },
            8: { cellWidth: 30 },
            9: { cellWidth: 30 },
        },
    });

    // Save PDF
    const fileName = `Zone_Report_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};

export const exportToExcel = (data, metadata) => {
    // Prepare header rows
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
        ["Average Score", metadata.average_score_overall.toFixed(2)],
        ["Average Rating", metadata.average_rating_overall.toFixed(2)],
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
        row.current_score.toFixed(2),
        row.average_rating.toFixed(2),
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

    // Combine all data
    const worksheetData = [...headerRows, tableHeaders, ...tableData];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    ws["!cols"] = [
        { wch: 5 },  // #
        { wch: 25 }, // Location Name
        { wch: 35 }, // Address
        { wch: 15 }, // City
        { wch: 15 }, // State
        { wch: 20 }, // Zone
        { wch: 20 }, // Cleaner Name
        { wch: 15 }, // Cleaner Phone
        { wch: 12 }, // Current Score
        { wch: 12 }, // Average Rating
        { wch: 15 }, // Hygiene Score Count
        { wch: 15 }, // Review Status
        { wch: 15 }, // Last Review Date
        { wch: 12 }, // Total Reviews
        { wch: 12 }, // Unique Cleaners
        { wch: 25 }, // Facility Company
        { wch: 12 }, // Latitude
        { wch: 12 }, // Longitude
        { wch: 50 }, // Google Maps Link
    ];

    // Style the title row
    ws["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
        alignment: { horizontal: "center" },
    };

    // Merge title row
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }];

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Zone Report");

    // Save file
    const fileName = `Zone_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};
