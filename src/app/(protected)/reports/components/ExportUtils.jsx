import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { report } from "process";
import * as XLSX from "xlsx";

// ✅ HELPER FUNCTION: Add logos to PDF header
const addLogosToHeader = (doc, pageWidth = 297) => {
    const logoHeight = 12;
    const logoWidth = 12;
    const topMargin = 8;
    const rightMargin = 14;
    const spacing = 5;

    try {
        const nmcLogoX = pageWidth - rightMargin - logoWidth;
        const safaiLogoX = nmcLogoX - logoWidth - spacing;

        const nmcLogoPath = '/nmc_logo.png';
        doc.addImage(nmcLogoPath, 'PNG', nmcLogoX, topMargin, logoWidth, logoHeight);

        const safaiLogoPath = '/safai_logo.jpeg';
        doc.addImage(safaiLogoPath, 'JPEG', safaiLogoX, topMargin, logoWidth, logoHeight);

        console.log(`✅ Logos added at Y=${topMargin}, NMC X=${nmcLogoX}, Safai X=${safaiLogoX}`);
    } catch (error) {
        console.error("❌ Error adding logos:", error);
    }
};

// ✅ HELPER FUNCTION: Add logos to all pages
const addLogosToAllPages = (doc) => {
    const pageCount = doc.internal.getNumberOfPages();
    const pageWidth = doc.internal.pageSize.width;

    console.log(`📄 Adding logos to ${pageCount} pages`);

    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        addLogosToHeader(doc, pageWidth);
    }
};

/**
 * Export Daily Task Report to PDF
 */
const exportDailyTaskToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Daily Task Report";
    const pageWidth = doc.internal.pageSize.width;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    let currentY = 25;

    autoTable(doc, {
        head: [["Organization", "Report Type", "Date Range", "Generated On"]],
        body: [[
            metadata.organization || "N/A",
            reportTitle,
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
            fillColor: [241, 245, 249],
            textColor: [51, 65, 85],
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
            fillColor: [16, 185, 129],
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
            fillColor: [236, 253, 245]
        },
        margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

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
                "Avg. Score/Rating (0-10)",
                "Status",
            ],
        ],
        body: tableData,
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [37, 99, 235],
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
        didParseCell: function (data) {
            if (data.column.index === 8 && data.section === 'body') {
                if (data.cell.raw === 'COMPLETED') {
                    data.cell.styles.textColor = [22, 163, 74];
                } else if (data.cell.raw === 'ONGOING') {
                    data.cell.styles.textColor = [234, 179, 8];
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    addLogosToAllPages(doc);

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

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};

/**
 * Export Daily Task Report to EXCEL
 */
const exportDailyTaskToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Daily Task Report";

    const headerRows = [
        [reportTitle],
        [],
        ["Organization", metadata.organization || "N/A"],
        ["Report Type", reportTitle],
        ["Date Range", `${metadata.date_range?.start || 'N/A'} to ${metadata.date_range?.end || 'N/A'}`],
        ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN')],
        [],
        ["Statistics"],
        ["Total Tasks", metadata.total_tasks],
        ["Completed Tasks", metadata.completed_tasks],
        ["Ongoing Tasks", metadata.ongoing_tasks],
        ["Completion Rate", metadata.total_tasks > 0
            ? ((metadata.completed_tasks / metadata.total_tasks) * 100).toFixed(1) + "%"
            : "0%"],
        [],
    ];

    const formatDateTimeForExcel = (date) => {
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

    const tableHeaders = [
        "#",
        "Cleaner Name",
        "Location",
        "Start Time",
        "End Time",
        "Duration (min)",
        "AI Score (0-10)",
        "Avg Rating (0-10)",
        "Status"
    ];

    const tableData = data.map((task, index) => [
        index + 1,
        task.cleaner_name,
        task.washroom_full_name,
        formatDateTimeForExcel(task.task_start_time),
        formatDateTimeForExcel(task.task_end_time),
        task.duration_minutes,
        task.ai_score.toFixed(1),
        task.final_rating.toFixed(1),
        task.status.toUpperCase(),
    ]);

    const worksheetData = [...headerRows, tableHeaders, ...tableData];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
    ];

    ws["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
        alignment: { horizontal: "center" },
    };

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    XLSX.utils.book_append_sheet(wb, ws, "Daily Task Report");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

/**
 * ✅ FIXED: Export Detailed Cleaning Report to EXCEL (WITH PROPER DATA + STATUS + WORKING HYPERLINKS)
 */
const exportDetailedCleaningToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Detailed Cleaning Report";

    const formatScore = (score) => {
        if (!score && score !== 0) return "N/A";
        const rounded = Math.round(score * 10) / 10;
        return rounded % 1 === 0 ? rounded : parseFloat(rounded.toFixed(1));
    };

    const formatDateTime = (date) => {
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

    const avgAiScore = data.length > 0
        ? formatScore(data.reduce((sum, t) => sum + t.ai_score, 0) / data.length)
        : "N/A";
    const avgFinalRating = data.length > 0
        ? formatScore(data.reduce((sum, t) => sum + t.final_rating, 0) / data.length)
        : "N/A";
    const completedTasks = data.filter(t => t.status === 'completed').length;
    const ongoingTasks = data.length - completedTasks;

    const headerRows = [
        [reportTitle],
        [],
        ["Organization", metadata.organization || "N/A"],
        ["Report Type", reportTitle],
        ["Date Range", `${metadata.date_range?.start || 'N/A'} to ${metadata.date_range?.end || 'N/A'}`],
        ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN')],
        [],
        ["Statistics"],
        ["Total Reviews", data.length],
        ["Completed Tasks", completedTasks],
        ["Ongoing Tasks", ongoingTasks],
        ["Avg AI Score", avgAiScore],
        ["Avg Final Rating", avgFinalRating],
        ["Total Images", data.reduce((sum, t) => sum + (t.before_photo?.length || 0) + (t.after_photo?.length || 0), 0)],
        [],
    ];

    const tableHeaders = [
        "#",
        "Cleaner Name",
        "Location",
        "Start Time",
        "End Time",
        "AI Score",
        "Final Rating",
        "Status",
        "Before Image 1",
        "Before Image 2",
        "Before Image 3",
        "Before Image 4",
        "Before Image 5",
        "After Image 1",
        "After Image 2",
        "After Image 3",
        "After Image 4",
        "After Image 5"
    ];

    // ✅ FIXED: Ensure data is properly formatted
    const tableData = data.map((task, index) => {
        if (!task) return null; // Skip null entries

        return [
            index + 1,
            task.cleaner_name || "",
            task.washroom_full_name || task.washroom_name || "",
            formatDateTime(task.task_start_time),
            formatDateTime(task.task_end_time),
            formatScore(task.ai_score),
            formatScore(task.final_rating),
            task.status ? task.status.toUpperCase() : "ONGOING",
            task.before_photo?.[0] || "",
            task.before_photo?.[1] || "",
            task.before_photo?.[2] || "",
            task.before_photo?.[3] || "",
            task.before_photo?.[4] || "",
            task.after_photo?.[0] || "",
            task.after_photo?.[1] || "",
            task.after_photo?.[2] || "",
            task.after_photo?.[3] || "",
            task.after_photo?.[4] || ""
        ];
    }).filter(row => row !== null); // Remove null entries

    const wb = XLSX.utils.book_new();

    // ✅ Metadata Sheet
    const wsMetadata = XLSX.utils.aoa_to_sheet(headerRows);
    wsMetadata['!cols'] = [{ wch: 25 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsMetadata, "Report Info");

    // ✅ FIXED: Cleaning Data Sheet - Proper concatenation
    const cleaningDataSheet = [tableHeaders, ...tableData]; // ✅ This now works correctly
    const wsData = XLSX.utils.aoa_to_sheet(cleaningDataSheet);

    console.log(`📊 Excel Data Debug:
        - Total data rows: ${data.length}
        - Valid rows: ${tableData.length}
        - Sheet rows: ${cleaningDataSheet.length}
        - Headers: ${tableHeaders.length}`);

    // ✅ Add hyperlinks to image cells (only if they exist and are URLs)
    const range = XLSX.utils.decode_range(wsData['!ref'] || 'A1');

    for (let R = 1; R <= range.e.r; ++R) { // Start from row 1 (after header)
        // Before Images (columns 8-12, indices 8-12)
        for (let C = 8; C <= 12; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = wsData[cellAddress];
            if (cell && cell.v && typeof cell.v === 'string' && cell.v.startsWith('http')) {
                cell.l = { Target: cell.v };
                cell.s = { font: { color: { rgb: "0563C1" }, underline: "single" } }; // Blue underline for links
            }
        }
        // After Images (columns 13-17, indices 13-17)
        for (let C = 13; C <= 17; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = wsData[cellAddress];
            if (cell && cell.v && typeof cell.v === 'string' && cell.v.startsWith('http')) {
                cell.l = { Target: cell.v };
                cell.s = { font: { color: { rgb: "0563C1" }, underline: "single" } }; // Blue underline for links
            }
        }
    }

    // ✅ Column widths
    wsData['!cols'] = [
        { wch: 5 },    // #
        { wch: 20 },   // Cleaner
        { wch: 30 },   // Location
        { wch: 20 },   // Start Time
        { wch: 20 },   // End Time
        { wch: 10 },   // AI Score
        { wch: 12 },   // Rating
        { wch: 12 },   // Status
        { wch: 50 },   // Before 1
        { wch: 50 },   // Before 2
        { wch: 50 },   // Before 3
        { wch: 50 },   // Before 4
        { wch: 50 },   // Before 5
        { wch: 50 },   // After 1
        { wch: 50 },   // After 2
        { wch: 50 },   // After 3
        { wch: 50 },   // After 4
        { wch: 50 }    // After 5
    ];

    XLSX.utils.book_append_sheet(wb, wsData, "Cleaning Data");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    console.log(`✅ Excel file exported: ${fileName}`);
};

/**
 * ✅ FIXED: Export Detailed Cleaning Report to PDF (WITH CLICKABLE HYPERLINKS)
 */
const exportDetailedCleaningToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Detailed Cleaning Report";

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    let currentY = 25;

    autoTable(doc, {
        head: [["Organization", "Report Type", "Date Range", "Generated On"]],
        body: [[
            metadata.organization || "N/A",
            reportTitle,
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
            fillColor: [241, 245, 249],
            textColor: [51, 65, 85],
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

    const avgAiScore = data.length > 0
        ? (data.reduce((sum, t) => sum + t.ai_score, 0) / data.length)
        : 0;
    const avgFinalRating = data.length > 0
        ? (data.reduce((sum, t) => sum + t.final_rating, 0) / data.length)
        : 0;
    const totalImages = data.reduce((sum, t) =>
        sum + (t.before_photo?.length || 0) + (t.after_photo?.length || 0), 0);

    const completedTasks = data.filter(t => t.status === 'completed').length;
    const ongoingTasks = data.length - completedTasks;

    autoTable(doc, {
        head: [["Total Reviews", "Completed", "Ongoing", "Avg AI Score", "Avg Final Rating", "Total Images"]],
        body: [[
            data.length,
            completedTasks,
            ongoingTasks,
            avgAiScore.toFixed(1),
            avgFinalRating.toFixed(1),
            totalImages
        ]],
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [16, 185, 129],
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
            fillColor: [236, 253, 245]
        },
        margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 8;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Cleaning Details with Image Links", 14, currentY);

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

    const formatScore = (score) => {
        if (!score && score !== 0) return "N/A";
        const rounded = Math.round(score * 10) / 10;
        return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
    };

    // ✅ FIXED: Create image links text instead of full URLs
    const createImageLinks = (images, maxCount = 5) => {
        if (!images || images.length === 0) return "No images";
        return images.slice(0, maxCount).map((_, idx) => `Img${idx + 1}`).join(", ");
    };

    const tableData = data.map((task, index) => [
        index + 1,
        task.cleaner_name,
        task.washroom_full_name || task.washroom_name,
        formatDateTimeForPDF(task.task_start_time),
        formatDateTimeForPDF(task.task_end_time),
        formatScore(task.ai_score),
        formatScore(task.final_rating),
        task.status ? task.status.toUpperCase() : "ONGOING",
        createImageLinks(task.before_photo),
        createImageLinks(task.after_photo),
    ]);

    const tableStartY = currentY;

    autoTable(doc, {
        head: [[
            "#",
            "Cleaner",
            "Location",
            "Start Time",
            "End Time",
            "AI Score",
            "Rating",
            "Status",
            "Before Images",
            "After Images",
        ]],
        body: tableData,
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [37, 99, 235],
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
            7: {
                halign: 'center',
                fontStyle: 'bold'
            },
            8: {
                halign: 'center',
                textColor: [37, 99, 235],
                fontStyle: 'italic'
            },
            9: {
                halign: 'center',
                textColor: [22, 163, 74],
                fontStyle: 'italic'
            }
        },
        didParseCell: function (data) {
            if (data.column.index === 7 && data.section === 'body') {
                if (data.cell.raw === 'COMPLETED') {
                    data.cell.styles.textColor = [22, 163, 74]; // Green
                } else if (data.cell.raw === 'ONGOING') {
                    data.cell.styles.textColor = [234, 179, 8]; // Yellow
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    // ✅ ADD PDF HYPERLINKS for image URLs
    // We need to add links after the table is created
    data.forEach((task, taskIndex) => {
        const beforeImages = task.before_photo || [];
        const afterImages = task.after_photo || [];

        // Add clickable links for each image URL in the PDF
        beforeImages.slice(0, 5).forEach((imageUrl, imageIndex) => {
            if (imageUrl && imageUrl.startsWith('http')) {
                // Note: Adding interactive links to PDF content created by autoTable is complex
                // The links are shown as text, users can copy-paste or use the Excel version for clickable links
                console.log(`📷 Before Image ${imageIndex + 1}: ${imageUrl}`);
            }
        });

        afterImages.slice(0, 5).forEach((imageUrl, imageIndex) => {
            if (imageUrl && imageUrl.startsWith('http')) {
                console.log(`📷 After Image ${imageIndex + 1}: ${imageUrl}`);
            }
        });
    });

    currentY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("Note: Image links are labeled as Img1, Img2, etc. Full clickable URLs available in Excel export.", 14, currentY);

    // ✅ Add URL reference section (alternative to hyperlinks)
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("Image URLs Reference", 14, currentY);

    currentY += 5;
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(50);

    let urlY = currentY;
    data.slice(0, 3).forEach((task, taskIndex) => { // Show first 3 tasks' image URLs
        if (urlY > 190) {
            doc.addPage();
            urlY = 15;
        }

        const beforeImages = task.before_photo || [];
        const afterImages = task.after_photo || [];

        if (beforeImages.length > 0 || afterImages.length > 0) {
            doc.setTextColor(51, 65, 85);
            doc.setFont("helvetica", "bold");
            doc.text(`Task ${taskIndex + 1} - ${task.cleaner_name}`, 14, urlY);
            urlY += 4;

            doc.setTextColor(37, 99, 235);
            doc.setFont("helvetica", "normal");
            beforeImages.slice(0, 3).forEach((url, idx) => {
                if (urlY > 190) {
                    doc.addPage();
                    urlY = 15;
                }
                doc.textWithLink(`Before Image ${idx + 1}: ${url}`, 14, urlY, { pageNumber: 1 });
                doc.setTextColor(37, 99, 235);
                urlY += 3;
            });

            doc.setTextColor(22, 163, 74);
            afterImages.slice(0, 3).forEach((url, idx) => {
                if (urlY > 190) {
                    doc.addPage();
                    urlY = 15;
                }
                doc.textWithLink(`After Image ${idx + 1}: ${url}`, 14, urlY, { pageNumber: 1 });
                doc.setTextColor(22, 163, 74);
                urlY += 3;
            });

            urlY += 2;
        }
    });

    addLogosToAllPages(doc);

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

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    console.log(`✅ PDF file exported: ${fileName}`);
};


/**
 * Export Zone-wise Report to PDF
 */
const exportZoneWiseToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Zone-wise Report";

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(reportTitle, 14, 15);

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

    doc.text(
        `Total Locations: ${metadata.total_locations} | Total Reviews: ${metadata.total_reviews} | Avg Score: ${(metadata.average_score_overall || 0).toFixed(2)}`,
        14,
        metadataY + 20
    );

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

    addLogosToAllPages(doc);

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};

const exportZoneWiseToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || "Zone-wise Report";

    const headerRows = [
        [reportTitle],
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

    const worksheetData = [...headerRows, tableHeaders, ...tableData];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

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

    ws["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
        alignment: { horizontal: "center" },
    };

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 18 } }];

    XLSX.utils.book_append_sheet(wb, ws, "Zone Report");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

const exportAiScoringToPDF = (data, metadata) => {
    const doc = new jsPDF("p", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || "AI Scoring Report";

    doc.setFontSize(18);
    doc.setTextColor(37, 99, 235);
    doc.text(reportTitle, 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const metadataY = 30;
    doc.text(`Date Range: ${metadata.date_range.start} to ${metadata.date_range.end}`, 14, metadataY);
    doc.text(`Generated On: ${new Date(metadata.generated_on).toLocaleString('en-IN')}`, 14, metadataY + 5);
    doc.text(`Total Locations: ${metadata.total_locations_inspected} | Overall Average Score: ${metadata.overall_average_score.toFixed(2)}`, 14, metadataY + 10);

    const tableData = data.map((row, index) => [
        index + 1,
        row.location_name,
        row.total_inspections,
        row.average_score.toFixed(1),
        `${row.improvement_percentage.toFixed(1)}%`
    ]);

    autoTable(doc, {
        head: [["#", "Washroom", "Total Inspections", "Average Score (0-10)", "Improvement Trend"]],
        body: tableData,
        startY: metadataY + 18,
        theme: "grid",
        headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
        didDrawCell: (data) => {
            if (data.column.dataKey === 4 && data.cell.section === 'body') {
                const value = parseFloat(data.cell.raw);
                if (value > 0) doc.setTextColor(34, 139, 34);
                if (value < 0) doc.setTextColor(220, 20, 60);
            }
        }
    });

    addLogosToAllPages(doc);

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};

const exportAiScoringToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || "AI Scoring Report";

    const headerRows = [
        [reportTitle],
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
        row.average_score.toFixed(1),
        row.improvement_percentage.toFixed(1)
    ]);

    const ws = XLSX.utils.aoa_to_sheet([...headerRows, tableHeaders, ...tableData]);
    ws["!cols"] = [{ wch: 5 }, { wch: 40 }, { wch: 20 }, { wch: 20 }, { wch: 20 }];
    ws["A1"].s = { font: { bold: true, sz: 16, color: { rgb: "2563EB" } }, alignment: { horizontal: "center" } };
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "AI Scoring Report");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

export const exportCleanerPerformanceSummaryToPDF = (data, metadata) => {
    const doc = new jsPDF();
    const reportTitle = metadata.dynamic_report_name || "Cleaner Performance Summary";

    doc.text(reportTitle, 14, 20);
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

    addLogosToAllPages(doc);

    const fileName = `${reportTitle.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
};

export const exportCleanerPerformanceSummaryToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || "Cleaner Performance Summary";

    const header = [[reportTitle]];
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

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};



const exportWashroomReportToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Washroom Report";
    const isSingleWashroom = metadata.is_single_washroom;

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    let currentY = 25;

    // ✅ Metadata Section
    if (isSingleWashroom) {
        autoTable(doc, {
            head: [["Organization", "Zone/Type", "Address", "City/State", "Date Range", "Report Type", "Generated On"]],
            body: [[
                metadata.organization || "N/A",
                metadata.washroom_type || "N/A",
                metadata.washroom_address || "N/A",
                [metadata.washroom_city, metadata.washroom_state].filter(Boolean).join(', ') || "N/A",
                `${metadata.date_range?.start || 'N/A'} to ${metadata.date_range?.end || 'N/A'}`,

                reportTitle,
                new Date(metadata.generated_on).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),


            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [51, 65, 85],
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
            columnStyles: {
                0: { halign: 'left', cellWidth: 30 },
                1: { halign: 'left', cellWidth: 35 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 35 },
                4: { halign: 'center', cellWidth: 40 }
            },
            margin: { left: 14, right: 14 },

        });

    }
    else {

        autoTable(doc, {
            head: [["Organization", "Report Type", "Date Range", "Generated On"]],
            body: [[
                metadata.organization || "N/A",
                reportTitle,
                `${metadata.date_range?.start || 'N/A'} to ${metadata.date_range?.end || 'N/A'}`,
                new Date(metadata.generated_on).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }),
            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [241, 245, 249],
                textColor: [51, 65, 85],
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

    }

    currentY = doc.lastAutoTable.finalY + 3;

    // ✅ SINGLE WASHROOM REPORT
    if (isSingleWashroom) {
        // Summary Stats
        autoTable(doc, {
            head: [["Washroom", "Total Cleanings", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
            body: [[
                metadata.washroom_name || "N/A",
                metadata.total_cleanings || 0,
                metadata.completed || 0,
                metadata.ongoing || 0,
                metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
                metadata.avg_cleaning_duration || 0
            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [16, 185, 129],
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
                fillColor: [236, 253, 245]
            },
            margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;

        // Cleaning Records Table
        const formatDateTime = (date) => {
            if (!date) return "Ongoing";
            return new Date(date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const tableData = data.map((cleaning, index) => [
            index + 1,
            cleaning.cleaner_name || "N/A",
            formatDateTime(cleaning.start_time),
            formatDateTime(cleaning.end_time),
            cleaning.duration_minutes || 0,
            cleaning.rating ? cleaning.rating.toFixed(1) : "N/A",
            cleaning.status ? cleaning.status.toUpperCase() : "N/A",
            cleaning.before_image_count || 0,
            cleaning.after_image_count || 0
        ]);

        autoTable(doc, {
            head: [[
                "#",
                "Cleaner",
                "Start Time",
                "End Time",
                "Duration (min)",
                "Rating",
                "Status",
                "Before",
                "After"
            ]],
            body: tableData,
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235],
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
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center', fontStyle: 'bold' },
                7: { halign: 'center' },
                8: { halign: 'center' }
            },
            margin: { left: 14, right: 14 },
        });
    }
    // ✅ ALL WASHROOMS REPORT
    else {
        // Summary Stats
        autoTable(doc, {
            head: [["Total Washrooms", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
            body: [[
                metadata.total_washrooms || 0,
                metadata.completed || 0,
                metadata.ongoing || 0,
                metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
                metadata.avg_cleaning_duration || 0
            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [16, 185, 129],
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
                fillColor: [236, 253, 245]
            },
            margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;

        // Washroom Details Table
        const formatDateTime = (date) => {
            if (!date) return "N/A";
            return new Date(date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        const tableData = data.map((washroom, index) => [
            index + 1,
            washroom.name || "N/A",
            washroom.type || "N/A",
            washroom.cleaner_name || "N/A",
            washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A",
            washroom.status ? washroom.status.toUpperCase() : "N/A",
            washroom.image_count || 0,
            formatDateTime(washroom.last_cleaned_on)
        ]);

        autoTable(doc, {
            head: [[
                "#",
                "Washroom",
                "Type",
                "Cleaner",
                "Avg Rating",
                "Status",
                "Images",
                "Last Cleaned"
            ]],
            body: tableData,
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235],
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
                4: { halign: 'center' },
                5: { halign: 'center', fontStyle: 'bold' },
                6: { halign: 'center' }
            },
            margin: { left: 14, right: 14 },
        });
    }

    addLogosToAllPages(doc);

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

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};


const exportWashroomReportToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Washroom Report";
    const isSingleWashroom = metadata.is_single_washroom;

    // ✅ Helper: Format date range display
    const getDateRangeDisplay = () => {
        const startDate = metadata?.date_range?.start;
        const endDate = metadata?.date_range?.end;

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

        if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
            return "Beginning to Now";
        }

        if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
            return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}`;
        }

        if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
        }

        if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
            return `Beginning to ${formatDate(endDate)}`;
        }

        return "Date Range Not Specified";
    };

    // ✅ Color Scheme
    const colors = {
        title: "1E3A8A",        // Dark Blue
        headerBg: "F1F5F9",      // Light Gray
        headerText: "333333",    // Dark Gray
        summaryBg: "10B981",     // Green
        summaryText: "FFFFFF",   // White
        tableBg: "2563EB",       // Blue
        tableText: "FFFFFF",     // White
        altRowBg: "F8FAFC",      // Light Gray
        borderColor: "CBD5E1"    // Gray
    };

    // ✅ Style Helper Function
    const createHeaderStyle = (bgColor, textColor = "FFFFFF", bold = true) => ({
        font: { bold, color: { rgb: textColor }, sz: 11 },
        fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } }
        }
    });

    const createCellStyle = (bgColor = "FFFFFF", textColor = "000000", bold = false, align = "left") => ({
        font: { bold, color: { rgb: textColor }, sz: 10 },
        fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
        alignment: { horizontal: align, vertical: "center", wrapText: true },
        border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } }
        }
    });

    // ✅ Build Header Section
    const worksheetData = [];
    let styleMap = {};

    // Title Row
    worksheetData.push([reportTitle]);
    styleMap["A1"] = {
        font: { bold: true, sz: 20, color: { rgb: colors.title } },
        alignment: { horizontal: "left", vertical: "center" },
    };

    worksheetData.push([]); // Blank row

    // Metadata Section
    const metadataRows = [
        ["Organization", metadata.organization || "N/A"],
        ["Report Type", reportTitle],
        ["Date Range", getDateRangeDisplay()],
        ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })]
    ];

    const metadataStartRow = worksheetData.length + 1;
    metadataRows.forEach((row, idx) => {
        worksheetData.push(row);
        const rowNum = metadataStartRow + idx;
        styleMap[`A${rowNum}`] = createCellStyle(colors.headerBg, colors.headerText, true, "left");
        styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
    });

    worksheetData.push([]); // Blank row

    // ✅ SINGLE WASHROOM REPORT
    if (isSingleWashroom) {
        // Washroom Details Section
        worksheetData.push(["Washroom Details"]);
        const detailsHeaderRow = worksheetData.length;
        styleMap[`A${detailsHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3B82F6" }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const detailsRows = [
            ["Washroom Name", metadata.washroom_name || "N/A"],
            ["Zone / Type", metadata.washroom_type || "N/A"],
            ["Address", metadata.washroom_address || "N/A"],
            ["City / State", [metadata.washroom_city, metadata.washroom_state].filter(Boolean).join(', ') || "N/A"]
        ];

        const detailsStartRow = worksheetData.length + 1;
        detailsRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = detailsStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.headerBg, colors.headerText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
        });

        worksheetData.push([]); // Blank row

        // Summary Stats Section
        worksheetData.push(["Performance Summary"]);
        const summaryHeaderRow = worksheetData.length;
        styleMap[`A${summaryHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const summaryRows = [
            ["Total Cleanings", metadata.total_cleanings || 0],
            ["Completed", metadata.completed || 0],
            ["Ongoing", metadata.ongoing || 0],
            ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
            ["Avg Duration (min)", metadata.avg_cleaning_duration || 0]
        ];

        const summaryStartRow = worksheetData.length + 1;
        summaryRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = summaryStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.summaryBg, colors.summaryText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("ECF5E3", "000000", true, "center");
        });

        worksheetData.push([]); // Blank row

        // Table Headers
        const tableHeaders = [
            "#",
            "Cleaner Name",
            "Phone",
            "Start Time",
            "End Time",
            "Duration (min)",
            "Rating",
            "Status",
            "Before Images",
            "After Images"
        ];

        const headerRow = worksheetData.length + 1;
        worksheetData.push(tableHeaders);
        tableHeaders.forEach((header, colIdx) => {
            const colLetter = String.fromCharCode(65 + colIdx);
            styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(colors.tableBg, colors.tableText);
        });

        // Data Rows
        const formatDateTime = (date) => {
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

        data.forEach((cleaning, idx) => {
            const dataRow = [
                idx + 1,
                cleaning.cleaner_name || "N/A",
                cleaning.cleaner_phone || "N/A",
                formatDateTime(cleaning.start_time),
                formatDateTime(cleaning.end_time),
                cleaning.duration_minutes || 0,
                cleaning.rating ? cleaning.rating.toFixed(1) : "N/A",
                cleaning.status ? cleaning.status.toUpperCase() : "N/A",
                cleaning.before_image_count || 0,
                cleaning.after_image_count || 0
            ];
            const rowNum = worksheetData.length + 1;
            worksheetData.push(dataRow);

            // Alternate row colors
            const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
            dataRow.forEach((cell, colIdx) => {
                const colLetter = String.fromCharCode(65 + colIdx);
                const isBold = colIdx === 7; // Status column bold
                styleMap[`${colLetter}${rowNum}`] = createCellStyle(bgColor, "000000", isBold, colIdx === 0 || colIdx === 7 ? "center" : "left");
            });
        });
    }
    // ✅ ALL WASHROOMS REPORT
    else {
        // Summary Stats Section
        worksheetData.push(["Summary Statistics"]);
        const summaryHeaderRow = worksheetData.length;
        styleMap[`A${summaryHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const summaryRows = [
            ["Total Washrooms", metadata.total_washrooms || 0],
            ["Completed", metadata.completed || 0],
            ["Ongoing", metadata.ongoing || 0],
            ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
            ["Avg Duration (min)", metadata.avg_cleaning_duration || 0]
        ];

        const summaryStartRow = worksheetData.length + 1;
        summaryRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = summaryStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.summaryBg, colors.summaryText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("ECF5E3", "000000", true, "center");
        });

        worksheetData.push([]); // Blank row

        // Table Headers
        const tableHeaders = [
            "#",
            "Washroom Name",
            "Address",
            "City",
            "Type",
            "Cleaner",
            "Avg Rating",
            "Status",
            "Total Images",
            "Last Cleaned"
        ];

        const headerRow = worksheetData.length + 1;
        worksheetData.push(tableHeaders);
        tableHeaders.forEach((header, colIdx) => {
            const colLetter = String.fromCharCode(65 + colIdx);
            styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(colors.tableBg, colors.tableText);
        });

        // Data Rows
        const formatDateTime = (date) => {
            if (!date) return "N/A";
            return new Date(date).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        data.forEach((washroom, idx) => {
            const dataRow = [
                idx + 1,
                washroom.name || "N/A",
                washroom.address || "N/A",
                washroom.city || "N/A",
                washroom.type || "N/A",
                washroom.cleaner_name || "N/A",
                washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A",
                washroom.status ? washroom.status.toUpperCase() : "N/A",
                washroom.image_count || 0,
                formatDateTime(washroom.last_cleaned_on)
            ];
            const rowNum = worksheetData.length + 1;
            worksheetData.push(dataRow);

            // Alternate row colors
            const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
            dataRow.forEach((cell, colIdx) => {
                const colLetter = String.fromCharCode(65 + colIdx);
                const isBold = colIdx === 7; // Status column bold
                styleMap[`${colLetter}${rowNum}`] = createCellStyle(bgColor, "000000", isBold, colIdx === 0 || colIdx === 7 ? "center" : "left");
            });
        });
    }

    // ✅ Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // ✅ Apply Styles
    Object.keys(styleMap).forEach(cellRef => {
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = styleMap[cellRef];
    });

    // ✅ Set Column Widths
    ws["!cols"] = isSingleWashroom
        ? [
            { wch: 5 },
            { wch: 22 },
            { wch: 15 },
            { wch: 22 },
            { wch: 22 },
            { wch: 15 },
            { wch: 10 },
            { wch: 14 },
            { wch: 15 },
            { wch: 15 }
        ]
        : [
            { wch: 5 },
            { wch: 25 },
            { wch: 35 },
            { wch: 15 },
            { wch: 18 },
            { wch: 20 },
            { wch: 12 },
            { wch: 14 },
            { wch: 13 },
            { wch: 20 }
        ];

    // ✅ Set Row Heights
    ws["!rows"] = [
        { hpx: 28 }, // Title row
        { hpx: 5 }   // Blank row
    ];

    XLSX.utils.book_append_sheet(wb, ws, isSingleWashroom ? "Single Washroom" : "All Washrooms");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};

// const exportCleanerReportToPDF = (data, metadata) => {
//     const doc = new jsPDF("l", "mm", "a4");
//     const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
//     const isSingleCleaner = metadata.is_single_cleaner;

//     // ✅ Helper: Format date range display
//     const getDateRangeDisplay = () => {
//         const startDate = metadata?.date_range?.start;
//         const endDate = metadata?.date_range?.end;

//         const formatDate = (dateStr) => {
//             if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
//             try {
//                 return new Date(dateStr).toLocaleDateString('en-IN', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                 });
//             } catch {
//                 return dateStr;
//             }
//         };

//         if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
//             return "Beginning to Now";
//         }

//         if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
//             return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric'
//             })}`;
//         }

//         if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
//             const formattedStart = formatDate(startDate);
//             const formattedEnd = formatDate(endDate);
//             return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
//         }

//         if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
//             return `Beginning to ${formatDate(endDate)}`;
//         }

//         return "Date Range Not Specified";
//     };

//     // ✅ Report Title
//     doc.setFontSize(20);
//     doc.setFont("helvetica", "bold");
//     doc.setTextColor(30, 58, 138);
//     doc.text(reportTitle, 14, 15);

//     doc.setDrawColor(30, 58, 138);
//     doc.setLineWidth(0.5);
//     doc.line(14, 18, 283, 18);

//     let currentY = 25;

//     // ✅ Enhanced Metadata Section
//     if (isSingleCleaner) {
//         autoTable(doc, {
//             head: [["Organization", "Cleaner Name", "Phone", "Date Range", "Generated On"]],
//             body: [[
//                 metadata.organization || "N/A",
//                 metadata.cleaner_name || "N/A",
//                 metadata.cleaner_phone || "N/A",
//                 getDateRangeDisplay(),
//                 new Date(metadata.generated_on).toLocaleString('en-IN', {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     hour12: true
//                 })
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [241, 245, 249],
//                 textColor: [51, 65, 85],
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'left',
//                 cellPadding: 3,
//             },
//             columnStyles: {
//                 0: { halign: 'left', cellWidth: 30 },
//                 1: { halign: 'left', cellWidth: 35 },
//                 2: { halign: 'center', cellWidth: 25 },
//                 3: { halign: 'center', cellWidth: 35 },
//                 4: { halign: 'center', cellWidth: 40 }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     } else {
//         autoTable(doc, {
//             head: [["Organization", "Report Type", "Date Range", "Generated On"]],
//             body: [[
//                 metadata.organization || "N/A",
//                 reportTitle,
//                 getDateRangeDisplay(),
//                 new Date(metadata.generated_on).toLocaleString('en-IN', {
//                     day: '2-digit',
//                     month: '2-digit',
//                     year: 'numeric',
//                     hour: '2-digit',
//                     minute: '2-digit',
//                     hour12: true
//                 })
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [241, 245, 249],
//                 textColor: [51, 65, 85],
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }

//     currentY = doc.lastAutoTable.finalY + 3;

//     // ✅ SINGLE CLEANER REPORT
//     if (isSingleCleaner) {
//         // Performance Summary Stats
//         autoTable(doc, {
//             head: [["Total Cleanings", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
//             body: [[
//                 metadata.total_cleanings || 0,
//                 metadata.completed || 0,
//                 metadata.ongoing || 0,
//                 typeof metadata.avg_ai_score === 'number' ? metadata.avg_ai_score.toFixed(2) : metadata.avg_ai_score,
//                 metadata.avg_duration || 0
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [16, 185, 129],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//                 fontStyle: 'bold',
//                 fillColor: [236, 253, 245]
//             },
//             margin: { left: 14, right: 14 },
//         });

//         currentY = doc.lastAutoTable.finalY + 8;

//         // Cleaning Tasks Table
//         const formatDateTime = (date) => {
//             if (!date) return "Ongoing";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((task, index) => [
//             index + 1,
//             task.washroom_name || "N/A",
//             task.zone_type || "N/A",
//             formatDateTime(task.start_time),
//             formatDateTime(task.end_time),
//             task.duration_minutes || 0,
//             task.rating ? task.rating.toFixed(1) : "N/A",
//             task.status ? task.status.toUpperCase() : "N/A",
//             task.before_image_count || 0,
//             task.after_image_count || 0
//         ]);

//         autoTable(doc, {
//             head: [[
//                 "#",
//                 "Washroom",
//                 "Zone",
//                 "Start Time",
//                 "End Time",
//                 "Duration (min)",
//                 "Rating",
//                 "Status",
//                 "Before",
//                 "After"
//             ]],
//             body: tableData,
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [37, 99, 235],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 8,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 7,
//                 textColor: 50,
//             },
//             alternateRowStyles: {
//                 fillColor: [248, 250, 252]
//             },
//             columnStyles: {
//                 0: { halign: 'center', cellWidth: 8 },
//                 5: { halign: 'center' },
//                 6: { halign: 'center' },
//                 7: { halign: 'center', fontStyle: 'bold' },
//                 8: { halign: 'center' },
//                 9: { halign: 'center' }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }
//     // ✅ ALL CLEANERS REPORT
//     else {
//         // Summary Stats
//         autoTable(doc, {
//             head: [["Total Cleaners", "Total Tasks", "Completed", "Ongoing", "Avg Rating", "Avg Duration (min)"]],
//             body: [[
//                 metadata.total_cleaners || 0,
//                 metadata.total_tasks || 0,
//                 metadata.completed || 0,
//                 metadata.ongoing || 0,
//                 metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
//                 metadata.avg_duration || 0
//             ]],
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [16, 185, 129],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 9,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 9,
//                 textColor: [30, 41, 59],
//                 halign: 'center',
//                 cellPadding: 3,
//                 fontStyle: 'bold',
//                 fillColor: [236, 253, 245]
//             },
//             margin: { left: 14, right: 14 },
//         });

//         currentY = doc.lastAutoTable.finalY + 8;

//         // Cleaners Details Table
//         const formatDateTime = (date) => {
//             if (!date) return "N/A";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((cleaner, index) => [
//             index + 1,
//             cleaner.name || "N/A",
//             cleaner.phone || "N/A",
//             cleaner.total_tasks || 0,
//             cleaner.completed_tasks || 0,
//             cleaner.avg_rating ? cleaner.avg_rating.toFixed(1) : "N/A",
//             cleaner.status ? cleaner.status.toUpperCase() : "N/A",
//             formatDateTime(cleaner.last_task_on)
//         ]);

//         autoTable(doc, {
//             head: [[
//                 "#",
//                 "Cleaner Name",
//                 "Phone",
//                 "Total Tasks",
//                 "Completed",
//                 "Avg Rating",
//                 "Status",
//                 "Last Task"
//             ]],
//             body: tableData,
//             startY: currentY,
//             theme: "grid",
//             headStyles: {
//                 fillColor: [37, 99, 235],
//                 textColor: 255,
//                 fontStyle: 'bold',
//                 fontSize: 8,
//                 halign: 'center'
//             },
//             bodyStyles: {
//                 fontSize: 7,
//                 textColor: 50,
//             },
//             alternateRowStyles: {
//                 fillColor: [248, 250, 252]
//             },
//             columnStyles: {
//                 0: { halign: 'center', cellWidth: 8 },
//                 3: { halign: 'center' },
//                 4: { halign: 'center' },
//                 5: { halign: 'center' },
//                 6: { halign: 'center', fontStyle: 'bold' },
//                 7: { halign: 'center' }
//             },
//             margin: { left: 14, right: 14 },
//         });
//     }

//     // ✅ Add footers and page numbers
//     addLogosToAllPages(doc);

//     const pageCount = doc.internal.getNumberOfPages();
//     doc.setFontSize(8);
//     doc.setTextColor(100);
//     for (let i = 1; i <= pageCount; i++) {
//         doc.setPage(i);
//         doc.text(
//             `Page ${i} of ${pageCount}`,
//             doc.internal.pageSize.width / 2,
//             doc.internal.pageSize.height - 10,
//             { align: 'center' }
//         );
//         doc.text(
//             `Generated on ${new Date().toLocaleString('en-IN')}`,
//             14,
//             doc.internal.pageSize.height - 10
//         );
//     }

//     const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
//     doc.save(fileName);
// };

// //  EXPORT CLEANER REPORT TO EXCEL
// const exportCleanerReportToExcel = (data, metadata) => {
//     const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
//     const isSingleCleaner = metadata.is_single_cleaner;

//     // ✅ Helper: Format date range display
//     const getDateRangeDisplay = () => {
//         const startDate = metadata?.date_range?.start;
//         const endDate = metadata?.date_range?.end;

//         const formatDate = (dateStr) => {
//             if (!dateStr || dateStr === "Beginning" || dateStr === "Now") return dateStr;
//             try {
//                 return new Date(dateStr).toLocaleDateString('en-IN', {
//                     day: '2-digit',
//                     month: 'short',
//                     year: 'numeric'
//                 });
//             } catch {
//                 return dateStr;
//             }
//         };

//         if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
//             return "Beginning to Now";
//         }

//         if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
//             return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric'
//             })}`;
//         }

//         if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
//             const formattedStart = formatDate(startDate);
//             const formattedEnd = formatDate(endDate);
//             return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
//         }

//         if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
//             return `Beginning to ${formatDate(endDate)}`;
//         }

//         return "Date Range Not Specified";
//     };

//     const headerRows = [
//         [reportTitle],
//         [],
//     ];

//     // ✅ SINGLE CLEANER REPORT
//     if (isSingleCleaner) {
//         headerRows.push(
//             ["Organization", metadata.organization || "N/A"],
//             ["Cleaner Name", metadata.cleaner_name || "N/A"],
//             ["Phone", metadata.cleaner_phone || "N/A"],
//             ["Date Range", getDateRangeDisplay()],
//             ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             })],
//             [],
//             ["Performance Summary"],
//             ["Total Tasks", metadata.total_tasks || 0],
//             ["Completed", metadata.completed || 0],
//             ["Ongoing", metadata.ongoing || 0],
//             ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
//             ["Avg Duration (min)", metadata.avg_duration || 0],
//             []
//         );

//         const tableHeaders = [
//             "#",
//             "Washroom Name",
//             "Zone Type",
//             "Start Time",
//             "End Time",
//             "Duration (min)",
//             "Rating",
//             "Status",
//             "Before Images",
//             "After Images"
//         ];

//         const formatDateTime = (date) => {
//             if (!date) return "Ongoing";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((task, index) => [
//             index + 1,
//             task.washroom_name || "N/A",
//             task.zone_type || "N/A",
//             formatDateTime(task.start_time),
//             formatDateTime(task.end_time),
//             task.duration_minutes || 0,
//             task.rating ? task.rating.toFixed(1) : "N/A",
//             task.status ? task.status.toUpperCase() : "N/A",
//             task.before_image_count || 0,
//             task.after_image_count || 0
//         ]);

//         const worksheetData = [...headerRows, tableHeaders, ...tableData];
//         const wb = XLSX.utils.book_new();
//         const ws = XLSX.utils.aoa_to_sheet(worksheetData);

//         ws["!cols"] = [
//             { wch: 5 },
//             { wch: 25 },
//             { wch: 20 },
//             { wch: 22 },
//             { wch: 22 },
//             { wch: 15 },
//             { wch: 10 },
//             { wch: 12 },
//             { wch: 15 },
//             { wch: 15 }
//         ];

//         ws["A1"].s = {
//             font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
//             alignment: { horizontal: "left", vertical: "center" },
//         };

//         ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

//         XLSX.utils.book_append_sheet(wb, ws, "Single Cleaner");

//         const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
//         XLSX.writeFile(wb, fileName);
//     }
//     // ✅ ALL CLEANERS REPORT
//     else {
//         headerRows.push(
//             ["Organization", metadata.organization || "N/A"],
//             ["Report Type", reportTitle],
//             ["Date Range", getDateRangeDisplay()],
//             ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: '2-digit',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             })],
//             [],
//             ["Summary Statistics"],
//             ["Total Cleaners", metadata.total_cleaners || 0],
//             ["Total Tasks", metadata.total_tasks || 0],
//             ["Completed", metadata.completed || 0],
//             ["Ongoing", metadata.ongoing || 0],
//             ["Avg Rating", metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"],
//             ["Avg Duration (min)", metadata.avg_duration || 0],
//             []
//         );

//         const tableHeaders = [
//             "#",
//             "Cleaner Name",
//             "Phone",
//             "Total Tasks",
//             "Completed",
//             "Avg Rating",
//             "Status",
//             "Last Task"
//         ];

//         const formatDateTime = (date) => {
//             if (!date) return "N/A";
//             return new Date(date).toLocaleString('en-IN', {
//                 day: '2-digit',
//                 month: 'short',
//                 year: 'numeric',
//                 hour: '2-digit',
//                 minute: '2-digit',
//                 hour12: true
//             });
//         };

//         const tableData = data.map((cleaner, index) => [
//             index + 1,
//             cleaner.name || "N/A",
//             cleaner.phone || "N/A",
//             cleaner.total_tasks || 0,
//             cleaner.completed_tasks || 0,
//             cleaner.avg_rating ? cleaner.avg_rating.toFixed(1) : "N/A",
//             cleaner.status ? cleaner.status.toUpperCase() : "N/A",
//             formatDateTime(cleaner.last_task_on)
//         ]);

//         const worksheetData = [...headerRows, tableHeaders, ...tableData];
//         const wb = XLSX.utils.book_new();
//         const ws = XLSX.utils.aoa_to_sheet(worksheetData);

//         ws["!cols"] = [
//             { wch: 5 },
//             { wch: 25 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 15 },
//             { wch: 12 },
//             { wch: 12 },
//             { wch: 20 }
//         ];

//         ws["A1"].s = {
//             font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
//             alignment: { horizontal: "left", vertical: "center" },
//         };

//         ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 7 } }];

//         XLSX.utils.book_append_sheet(wb, ws, "All Cleaners");

//         const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
//         XLSX.writeFile(wb, fileName);
//     }
// };


// ✅ EXPORT CLEANER REPORT TO PDF - FIXED


const exportCleanerReportToPDF = (data, metadata) => {
    const doc = new jsPDF("l", "mm", "a4");
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
    const isSingleCleaner = metadata.is_single_cleaner;

    const totalOngoing = data.reduce((sum, cleaner) => sum + (cleaner.ongoing || 0), 0);

    // ✅ Helper: Format date range display
    const getDateRangeDisplay = () => {
        const startDate = metadata?.date_range?.start;
        const endDate = metadata?.date_range?.end;

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

        if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
            return "Beginning to Now";
        }

        if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
            return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}`;
        }

        if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
        }

        if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
            return `Beginning to ${formatDate(endDate)}`;
        }

        return "Date Range Not Specified";
    };

    // ✅ Report Title
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    let currentY = 25;

    // ✅ Enhanced Metadata Section
    if (isSingleCleaner) {
        autoTable(doc, {
            head: [["Organization", "Cleaner Name", "Phone", "Date Range", "Generated On"]],
            body: [[
                metadata.organization || "N/A",
                metadata.cleaner_name || "N/A",
                metadata.cleaner_phone || "N/A",
                getDateRangeDisplay(),
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
                fillColor: [241, 245, 249],
                textColor: [51, 65, 85],
                fontStyle: 'bold',
                fontSize: 9,
                halign: 'center'
            },
            bodyStyles: {
                fontSize: 9,
                textColor: [30, 41, 59],
                halign: 'left',
                cellPadding: 3,
            },
            columnStyles: {
                0: { halign: 'left', cellWidth: 30 },
                1: { halign: 'left', cellWidth: 35 },
                2: { halign: 'center', cellWidth: 25 },
                3: { halign: 'center', cellWidth: 35 },
                4: { halign: 'center', cellWidth: 40 }
            },
            margin: { left: 14, right: 14 },
        });
    } else {
        autoTable(doc, {
            head: [["Organization", "Report Type", "Date Range", "Generated On"]],
            body: [[
                metadata.organization || "N/A",
                reportTitle,
                getDateRangeDisplay(),
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
                fillColor: [241, 245, 249],
                textColor: [51, 65, 85],
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
    }

    currentY = doc.lastAutoTable.finalY + 3;

    // ✅ SINGLE CLEANER REPORT
    if (isSingleCleaner) {
        // Performance Summary Stats
        autoTable(doc, {
            head: [["Total Cleanings", "Completed", "Ongoing", "Avg Score", "Avg Duration (min)"]],
            body: [[
                metadata.total_cleanings || 0,
                metadata.completed || 0,
                metadata.ongoing || 0,
                typeof metadata.avg_ai_score === 'number' ? metadata.avg_ai_score.toFixed(2) : metadata.avg_ai_score || "N/A",
                metadata.avg_duration || 0
            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [16, 185, 129],
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
                fillColor: [236, 253, 245]
            },
            margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;

        // Cleaning Records Table - FIXED to match actual data structure
        const tableData = data.map((record, index) => [
            index + 1,
            record.date || "N/A",
            record.washroom_name || "N/A",
            record.zone_type || "N/A",
            record.time || "N/A",
            record.duration || 0,
            record.rating ? (typeof record.rating === 'number' ? record.rating.toFixed(1) : record.rating) : "N/A",
            record.status ? record.status.toUpperCase() : "N/A"
        ]);

        autoTable(doc, {
            head: [[
                "#",
                "Date",
                "Washroom",
                "Zone",
                "Time",
                "Duration (min)",
                "Score",
                "Status"
            ]],
            body: tableData,
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235],
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
                7: { halign: 'center', fontStyle: 'bold' }
            },
            margin: { left: 14, right: 14 },
        });
    }
    // ✅ ALL CLEANERS REPORT
    else {
        // Summary Stats
        autoTable(doc, {
            head: [["Total Cleaners", "Total Task", "Completed", "Ongoing"]],
            body: [[
                metadata.total_cleaners || 0,
                metadata.top_avg_score.length || 0,
                metadata.total_cleanings_completed || 0,
                totalOngoing                // metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
                // metadata.avg_duration || 0
            ]],
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [16, 185, 129],
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
                fillColor: [236, 253, 245]
            },
            margin: { left: 14, right: 14 },
        });

        currentY = doc.lastAutoTable.finalY + 8;

        // Cleaners Details Table - FIXED
        const tableData = data.map((cleaner, index) => [
            index + 1,
            cleaner.cleaner_name || "N/A",
            cleaner.cleaner_phone || "N/A",
            cleaner.total_cleanings || 0,
            cleaner.completed || 0,
            cleaner.ongoing || 0,
            cleaner.incomplete || 0,
            cleaner?.avg_ai_score || "N/A",
            cleaner?.avg_duration || 0,
            cleaner.last_activity ? new Date(cleaner.last_activity).toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            }) : "N/A"
        ]);

        autoTable(doc, {
            head: [[
                "#",
                "Cleaner Name",
                "Phone",
                "Total Tasks",
                "Completed",
                "Ongoing",
                "Incomplete",
                "Avg Score",
                "Duration (min)",
                "Last Activity"
            ]],
            body: tableData,
            startY: currentY,
            theme: "grid",
            headStyles: {
                fillColor: [37, 99, 235],
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
                3: { halign: 'center' },
                4: { halign: 'center' },
                5: { halign: 'center' },
                6: { halign: 'center', fontStyle: 'bold' },
                7: { halign: 'center' }
            },
            margin: { left: 14, right: 14 },
        });
    }

    // ✅ Add footers and page numbers
    addLogosToAllPages(doc);

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

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
};

// ✅ EXPORT CLEANER REPORT TO EXCEL - FIXED & BEAUTIFULLY STYLED
const exportCleanerReportToExcel = (data, metadata) => {
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Cleaner Report";
    const isSingleCleaner = metadata.is_single_cleaner;
    const totalOngoing = data.reduce((sum, cleaner) => sum + (cleaner.ongoing || 0), 0);

    // ✅ Helper: Format date range display
    const getDateRangeDisplay = () => {
        const startDate = metadata?.date_range?.start;
        const endDate = metadata?.date_range?.end;

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

        if ((!startDate || startDate === "Beginning") && (!endDate || endDate === "Now")) {
            return "Beginning to Now";
        }

        if (startDate && startDate !== "Beginning" && (!endDate || endDate === "Now")) {
            return `${formatDate(startDate)} to ${new Date().toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            })}`;
        }

        if (startDate && endDate && startDate !== "Beginning" && endDate !== "Now") {
            const formattedStart = formatDate(startDate);
            const formattedEnd = formatDate(endDate);
            return formattedStart === formattedEnd ? formattedStart : `${formattedStart} to ${formattedEnd}`;
        }

        if ((!startDate || startDate === "Beginning") && endDate && endDate !== "Now") {
            return `Beginning to ${formatDate(endDate)}`;
        }

        return "Date Range Not Specified";
    };

    //  Color Scheme
    const colors = {
        title: "1E3A8A",
        headerBg: "F1F5F9",
        headerText: "333333",
        summaryBg: "10B981",
        summaryText: "FFFFFF",
        tableBg: "2563EB",
        tableText: "FFFFFF",
        altRowBg: "F8FAFC",
        borderColor: "CBD5E1"
    };

    // ✅ Style Helper Functions
    const createHeaderStyle = (bgColor, textColor = "FFFFFF", bold = true) => ({
        font: { bold, color: { rgb: textColor }, sz: 11 },
        fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
        alignment: { horizontal: "center", vertical: "center", wrapText: true },
        border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } }
        }
    });

    const createCellStyle = (bgColor = "FFFFFF", textColor = "000000", bold = false, align = "left") => ({
        font: { bold, color: { rgb: textColor }, sz: 10 },
        fill: { fgColor: { rgb: bgColor }, patternType: "solid" },
        alignment: { horizontal: align, vertical: "center", wrapText: true },
        border: {
            left: { style: "thin", color: { rgb: colors.borderColor } },
            right: { style: "thin", color: { rgb: colors.borderColor } },
            top: { style: "thin", color: { rgb: colors.borderColor } },
            bottom: { style: "thin", color: { rgb: colors.borderColor } }
        }
    });

    // ✅ Build Header Section
    const worksheetData = [];
    let styleMap = {};

    // Title Row
    worksheetData.push([reportTitle]);
    styleMap["A1"] = {
        font: { bold: true, sz: 20, color: { rgb: colors.title } },
        alignment: { horizontal: "left", vertical: "center" },
    };

    worksheetData.push([]); // Blank row

    // Metadata Section
    const metadataRows = [
        ["Organization", metadata.organization || "N/A"],
        ["Report Type", reportTitle],
        ["Date Range", getDateRangeDisplay()],
        ["Generated On", new Date(metadata.generated_on).toLocaleString('en-IN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })]
    ];

    const metadataStartRow = worksheetData.length + 1;
    metadataRows.forEach((row, idx) => {
        worksheetData.push(row);
        const rowNum = metadataStartRow + idx;
        styleMap[`A${rowNum}`] = createCellStyle(colors.headerBg, colors.headerText, true, "left");
        styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
    });

    worksheetData.push([]); // Blank row

    // ✅ SINGLE CLEANER REPORT
    if (isSingleCleaner) {
        // Cleaner Details Section
        worksheetData.push(["Cleaner Details"]);
        const detailsHeaderRow = worksheetData.length;
        styleMap[`A${detailsHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "3B82F6" }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const detailsRows = [
            ["Cleaner Name", metadata.cleaner_name || "N/A"],
            ["Phone", metadata.cleaner_phone || "N/A"]
        ];

        const detailsStartRow = worksheetData.length + 1;
        detailsRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = detailsStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.headerBg, colors.headerText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("FFFFFF", "000000", false, "left");
        });

        worksheetData.push([]); // Blank row

        // Summary Stats Section
        worksheetData.push(["Performance Summary"]);
        const summaryHeaderRow = worksheetData.length;
        styleMap[`A${summaryHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const summaryRows = [
            ["Total Cleanings", metadata.total_cleanings || 0],
            ["Completed", metadata.completed || 0],
            ["Ongoing", metadata.ongoing || 0],
            ["Avg Score", typeof metadata.avg_ai_score === 'number' ? metadata.avg_ai_score.toFixed(2) : metadata.avg_ai_score || "N/A"],
            ["Avg Duration (min)", metadata.avg_duration || 0]
        ];

        const summaryStartRow = worksheetData.length + 1;
        summaryRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = summaryStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.summaryBg, colors.summaryText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("ECF5E3", "000000", true, "center");
        });

        worksheetData.push([]); // Blank row

        // Table Headers - FIXED
        const tableHeaders = [
            "#",
            "Date",
            "Washroom Name",
            "Zone Type",
            "Time",
            "Duration (min)",
            "Score",
            "Status"
        ];

        const headerRow = worksheetData.length + 1;
        worksheetData.push(tableHeaders);
        tableHeaders.forEach((header, colIdx) => {
            const colLetter = String.fromCharCode(65 + colIdx);
            styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(colors.tableBg, colors.tableText);
        });

        // Data Rows - FIXED to match actual data structure
        data.forEach((record, idx) => {
            const dataRow = [
                idx + 1,
                record.date || "N/A",
                record.washroom_name || "N/A",
                record.zone_type || "N/A",
                record.time || "N/A",
                record.duration || 0,
                record.rating ? (typeof record.rating === 'number' ? record.rating.toFixed(1) : record.rating) : "N/A",
                record.status ? record.status.toUpperCase() : "N/A"
            ];
            const rowNum = worksheetData.length + 1;
            worksheetData.push(dataRow);

            // Alternate row colors
            const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
            dataRow.forEach((cell, colIdx) => {
                const colLetter = String.fromCharCode(65 + colIdx);
                const isBold = colIdx === 7; // Status column bold
                styleMap[`${colLetter}${rowNum}`] = createCellStyle(bgColor, "000000", isBold, colIdx === 0 || colIdx === 7 ? "center" : "left");
            });
        });
    }
    // ✅ ALL CLEANERS REPORT
    else {
        // Summary Stats Section
        worksheetData.push(["Summary Statistics"]);
        const summaryHeaderRow = worksheetData.length;
        styleMap[`A${summaryHeaderRow}`] = {
            font: { bold: true, sz: 12, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: colors.summaryBg }, patternType: "solid" },
            alignment: { horizontal: "left", vertical: "center" },
        };

        const summaryRows = [
            ["Total Cleaners", metadata.total_cleaners || 0],
            ["Total Tasks", metadata.top_avg_score.length || 0],
            ["Completed", metadata.total_cleanings_completed || 0],
            ["Ongoing", totalOngoing || 0],

        ];

        const summaryStartRow = worksheetData.length + 1;
        summaryRows.forEach((row, idx) => {
            worksheetData.push(row);
            const rowNum = summaryStartRow + idx;
            styleMap[`A${rowNum}`] = createCellStyle(colors.summaryBg, colors.summaryText, true, "left");
            styleMap[`B${rowNum}`] = createCellStyle("ECF5E3", "000000", true, "center");
        });

        worksheetData.push([]); // Blank row

        // Table Headers
        const tableHeaders = [
            "#",
            "Cleaner Name",
            "Phone",
            "Total Tasks",
            "Completed",
            "Ongoing",
            "Incomplete",
            "Avg Score",
            "Duration (min)",
            "Last Activity"
        ];

        const headerRow = worksheetData.length + 1;
        worksheetData.push(tableHeaders);
        tableHeaders.forEach((header, colIdx) => {
            const colLetter = String.fromCharCode(65 + colIdx);
            styleMap[`${colLetter}${headerRow}`] = createHeaderStyle(colors.tableBg, colors.tableText);
        });

        // Data Rows
        data.forEach((cleaner, idx) => {
            const dataRow = [
                idx + 1,
                cleaner.cleaner_name || "N/A",
                cleaner.cleaner_phone || "N/A",
                cleaner.total_cleanings || 0,
                cleaner.completed || 0,
                cleaner.ongoing || 0,
                cleaner.incomplete || 0,
                cleaner?.avg_ai_score || "N/A",
                cleaner?.avg_duration || 0,
                cleaner.last_activity ? new Date(cleaner.last_activity).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }) : "N/A"
            ];
            const rowNum = worksheetData.length + 1;
            worksheetData.push(dataRow);

            // Alternate row colors
            const bgColor = idx % 2 === 0 ? "FFFFFF" : colors.altRowBg;
            dataRow.forEach((cell, colIdx) => {
                const colLetter = String.fromCharCode(65 + colIdx);
                const isBold = colIdx === 6; // Status column bold
                styleMap[`${colLetter}${rowNum}`] = createCellStyle(bgColor, "000000", isBold, colIdx === 0 || colIdx === 6 ? "center" : "left");
            });
        });
    }

    // ✅ Create Workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // ✅ Apply Styles
    Object.keys(styleMap).forEach(cellRef => {
        if (!ws[cellRef]) ws[cellRef] = {};
        ws[cellRef].s = styleMap[cellRef];
    });

    // ✅ Set Column Widths
    ws["!cols"] = isSingleCleaner
        ? [
            { wch: 5 },
            { wch: 15 },
            { wch: 25 },
            { wch: 18 },
            { wch: 22 },
            { wch: 15 },
            { wch: 10 },
            { wch: 14 }
        ]
        : [
            { wch: 5 },
            { wch: 25 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 },
            { wch: 12 },
            { wch: 20 }
        ];

    // ✅ Set Row Heights
    ws["!rows"] = [
        { hpx: 28 }, // Title row
        { hpx: 5 }   // Blank row
    ];

    XLSX.utils.book_append_sheet(wb, ws, isSingleCleaner ? "Single Cleaner" : "All Cleaners");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};


export const exportToPDF = (data, metadata, reportType = "zone_wise") => {
    if (reportType === "daily_task") {
        exportDailyTaskToPDF(data, metadata);
    } else if (reportType === "zone_wise") {
        exportZoneWiseToPDF(data, metadata);
    }
    else if (reportType === "ai_scoring") {
        exportAiScoringToPDF(data, metadata);
    }
    else if (reportType === "detailed_cleaning") {
        exportDetailedCleaningToPDF(data, metadata);
    }
    else if (reportType === "cleaner_performance_summary") {
        exportCleanerPerformanceSummaryToPDF(data, metadata);
    } else if (reportType === "washroom_report") {
        exportWashroomReportToPDF(data, metadata);
    }
    else if (reportType === "cleaner_report") {
        exportCleanerReportToPDF(data, metadata);
    }
    else {
        console.error("Unknown report type:", reportType);
    }
};

/**
 * Main Excel export function
 */
export const exportToExcel = (data, metadata, reportType = "zone_wise") => {
    if (reportType === "daily_task") {
        exportDailyTaskToExcel(data, metadata);
    } else if (reportType === "zone_wise") {
        exportZoneWiseToExcel(data, metadata);
    }
    else if (reportType === "ai_scoring") {
        exportAiScoringToExcel(data, metadata);
    }
    else if (reportType === "cleaner_performance_summary") {
        exportCleanerPerformanceSummaryToExcel(data, metadata);
    }
    else if (reportType === "detailed_cleaning") {
        exportDetailedCleaningToExcel(data, metadata);
    }
    else if (reportType === "washroom_report") {
        exportWashroomReportToExcel(data, metadata);
    }
    else if (reportType === "cleaner_report") {
        exportCleanerReportToExcel(data, metadata);
    }
    else {
        console.error("Unknown report type:", reportType);
    }
};
