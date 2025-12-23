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

const formatScore = (score) => {
    if (!score && score !== 0) return "N/A";
    const rounded = Math.round(score * 10) / 10;
    return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1);
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
 * ✅ HELPER: Format duration in human-readable format
 */
const formatDuration = (minutes) => {
    if (!minutes || minutes < 0) return "N/A";

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;

    if (remainingMins === 0) {
        return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }

    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMins} min`;
};


const getTaskInfo = (task) => {
    const startTime = new Date(task.task_start_time);
    const endTime = task.task_end_time ? new Date(task.task_end_time) : new Date();

    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    // Check if task is overdue (ongoing for more than 36 hours)
    if (task.status === 'ongoing' && durationHours > 36) {
        return {
            status: 'OVERDUE',
            duration: durationMinutes,
            durationDisplay: `${Math.floor(durationHours)} hrs`,
            isOverdue: true
        };
    }

    // Check if task is incomplete (ongoing, between 2-36 hours)
    if (task.status === 'ongoing' && durationHours >= 2 && durationHours <= 36) {
        return {
            status: 'INCOMPLETE',
            duration: durationMinutes,
            durationDisplay: formatDuration(durationMinutes),
            isIncomplete: true
        };
    }

    // Normal task
    return {
        status: task.status.toUpperCase(),
        duration: durationMinutes,
        durationDisplay: formatDuration(durationMinutes),
        isOverdue: false,
        isIncomplete: false
    };
};


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
            new Date(metadata.generated_on).toLocaleString('en-CA', {
                year: 'numeric',
                month: 'short',
                day: '2-digit',
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
        head: [["Total Cleanings", "Completed", "Ongoing", "Completion Rate"]],
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
    doc.text("Cleaning Details", 14, currentY);

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

    // ✅ UPDATED: Use getTaskInfo for status and duration
    const tableData = data.map((task, index) => {
        const taskInfo = getTaskInfo(task);
        return [
            index + 1,
            task.cleaner_name,
            task.washroom_full_name,
            formatDateTimeForPDF(task.task_start_time),
            formatDateTimeForPDF(task.task_end_time),
            taskInfo.durationDisplay, // ✅ Formatted duration (e.g., "2 hrs 30 min")
            task.ai_score.toFixed(1),
            task.washroom_avg_rating.toFixed(1),
            taskInfo.status, // ✅ Shows COMPLETED, ONGOING, INCOMPLETE, or OVERDUE
        ];
    });

    autoTable(doc, {
        head: [
            [
                "#",
                "Cleaner Name",
                "Location / Washroom",
                "Start Time",
                "End Time",
                "Duration", // ✅ Changed header
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
            5: { halign: 'center' }, // Duration column
            6: { halign: 'center' },
            7: { halign: 'center' },
            8: {
                halign: 'center',
                fontStyle: 'bold'
            }
        },
        // ✅ UPDATED: Color status cells based on status
        didParseCell: function (data) {
            if (data.column.index === 8 && data.section === 'body') {
                const status = data.cell.raw;
                if (status === 'COMPLETED') {
                    data.cell.styles.textColor = [22, 163, 74]; // Green
                } else if (status === 'ONGOING') {
                    data.cell.styles.textColor = [59, 130, 246]; // Blue
                } else if (status === 'INCOMPLETE') {
                    data.cell.styles.textColor = [234, 179, 8]; // Orange
                } else if (status === 'OVERDUE') {
                    data.cell.styles.textColor = [220, 38, 38]; // Red
                    data.cell.styles.fontStyle = 'bold';
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    //  addLogosToAllPages(doc);

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
        ["Total Cleanings", metadata.total_tasks],
        ["Completed", metadata.completed_tasks],
        ["Ongoing", metadata.ongoing_tasks],
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
        "Location / Washroom",
        "Start Time",
        "End Time",
        "Duration", // ✅ Changed header
        "AI Score (0-10)",
        "Average Rating (0-10)",
        "Status"
    ];

    // ✅ UPDATED: Use getTaskInfo for status and duration
    const tableData = data.map((task, index) => {
        const taskInfo = getTaskInfo(task);
        return [
            index + 1,
            task.cleaner_name,
            task.washroom_full_name,
            formatDateTimeForExcel(task.task_start_time),
            formatDateTimeForExcel(task.task_end_time),
            taskInfo.durationDisplay, // ✅ Formatted duration
            task.ai_score.toFixed(1),
            task.washroom_avg_rating.toFixed(1),
            taskInfo.status, // ✅ Shows COMPLETED, ONGOING, INCOMPLETE, or OVERDUE
        ];
    });

    const worksheetData = [...headerRows, tableHeaders, ...tableData];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    ws["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 25 },
        { wch: 20 },
        { wch: 20 },
        { wch: 15 }, // Duration column
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
    ];

    ws["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "2563EB" } },
        alignment: { horizontal: "center" },
    };

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 8 } }];

    // ✅ BONUS: Add status colors to Excel
    const statusColIndex = 8; // Status is column I (index 8)
    const headerRowIndex = headerRows.length + 1; // Account for header rows

    data.forEach((task, dataIndex) => {
        const taskInfo = getTaskInfo(task);
        const excelRowIndex = headerRowIndex + dataIndex;
        const cellRef = `I${excelRowIndex + 1}`; // Excel uses 1-based indexing

        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: {
                    bold: true,
                    color: {
                        rgb: taskInfo.status === 'COMPLETED' ? "16A34A" : // Green
                            taskInfo.status === 'OVERDUE' ? "DC2626" :   // Red
                                taskInfo.status === 'INCOMPLETE' ? "EA930B" : // Orange
                                    "3B82F6"  // Blue for ONGOING
                    }
                },
                alignment: { horizontal: "center" }
            };
        }
    });

    XLSX.utils.book_append_sheet(wb, ws, "Daily Task Report");

    const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
};


const createImageLinksText = (images) => {
    if (!images || images.length === 0) return "No images";
    return images.map((_, idx) => `Img${idx + 1}`).join(", ");
};



const exportDetailedCleaningReport = (data, metadata, format = 'pdf') => {
    const reportTitle = metadata.dynamic_report_name || metadata.report_type || "Detailed Cleaning Report";

    // Common data processing
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

    const formatDateTimeForReport = (date) => {
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



    // Main table data with image links text
    const tableData = data.map((task, index) => {
        const taskInfo = getTaskInfo(task);
        const beforeImages = task.before_photo || [];
        const afterImages = task.after_photo || [];

        return [
            index + 1,
            task.cleaner_name,
            task.zone_name,
            task.washroom_name,
            formatDateTimeForReport(task.task_start_time),
            formatDateTimeForReport(task.task_end_time),
            formatScore(task.ai_score),
            formatScore(task.final_rating),
            taskInfo.status,
            createImageLinksText(beforeImages.slice(0, 6)), // Before images column
            createImageLinksText(afterImages.slice(0, 6)),  // After images column
        ];
    });

    // ==================== PDF EXPORT ====================
    if (format === 'pdf') {
        const doc = new jsPDF("l", "mm", "a4");
        let currentY = 25;

        // Header
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(30, 58, 138);
        doc.text(reportTitle, 14, 15);

        doc.setDrawColor(30, 58, 138);
        doc.setLineWidth(0.5);
        doc.line(14, 18, 283, 18);

        // Metadata table
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

        // Statistics table
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

        // Main details heading
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(51, 65, 85);
        doc.text("Cleaning Details with Image Links", 14, currentY);
        currentY += 3;

        // ✅ Store cell positions for overlaying clickable links
        let cellPositions = [];

        // Main table
        autoTable(doc, {
            head: [[
                "#",
                "Cleaner",
                "Zone Name",
                "Location",
                "Start Time",
                "End Time",
                "AI Score",
                "Average Rating",
                "Status",
                "Before Images",
                "After Images"
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
                7: { halign: 'center', fontStyle: 'bold' },
                8: {
                    halign: 'center',
                    textColor: [37, 99, 235],
                    fontStyle: 'italic',
                },
                9: {
                    halign: 'center',
                    textColor: [22, 163, 74],
                    fontStyle: 'italic',
                    cellWidth: 45

                },
                10: {
                    halign: 'center',
                    textColor: [101, 148, 224],
                    fontStyle: 'italic',
                    cellWidth: 45

                }
            },
            didDrawCell: function (cellData) {
                // ✅ Color status cells
                if (cellData.column.index === 7 && cellData.section === 'body') {
                    const status = tableData[cellData.row.index][7];
                    if (status === 'COMPLETED') {
                        doc.setTextColor(22, 163, 74);
                    } else if (status === 'INCOMPLETE') {
                        doc.setTextColor(234, 179, 8);
                    } else if (status === 'OVERDUE') {
                        doc.setTextColor(220, 38, 38);
                    }
                }

                // ✅ Store positions of image cells (columns 8 and 9)
                if (cellData.section === 'body' && (cellData.column.index === 8 || cellData.column.index === 9)) {
                    cellPositions.push({
                        rowIndex: cellData.row.index,
                        colIndex: cellData.column.index,
                        x: cellData.cell.x,
                        y: cellData.cell.y,
                        width: cellData.cell.width,
                        height: cellData.cell.height,
                        pageNumber: doc.internal.getCurrentPageInfo().pageNumber
                    });
                }
            },
            margin: { left: 14, right: 14 },
        });

        // ✅ FIXED: Add clickable link rectangles over each "ImgX" text
        data.forEach((task, taskIndex) => {
            const beforeImages = task.before_photo || [];
            const afterImages = task.after_photo || [];

            // Find cells for this row
            const beforeCell = cellPositions.find(c => c.rowIndex === taskIndex && c.colIndex === 8);
            const afterCell = cellPositions.find(c => c.rowIndex === taskIndex && c.colIndex === 9);

            // Set font for width calculation
            doc.setFontSize(7);

            // Add links for BEFORE images
            if (beforeCell && beforeImages.length > 0) {
                // Go to the correct page
                doc.setPage(beforeCell.pageNumber);

                const textParts = beforeImages.map((_, idx) => `Img${idx + 1}`);
                const fullText = textParts.join(", ");
                const textWidth = doc.getTextWidth(fullText);
                const startX = beforeCell.x + (beforeCell.width - textWidth) / 2;
                const linkY = beforeCell.y + (beforeCell.height / 2) - 1;

                let currentX = startX;
                beforeImages.forEach((url, idx) => {
                    const linkText = `Img${idx + 1}`;
                    const linkWidth = doc.getTextWidth(linkText);

                    // Add clickable link rectangle
                    doc.link(currentX, linkY, linkWidth, 3.5, { url: url });

                    // Move to next position (add width + comma + space)
                    currentX += linkWidth;
                    if (idx < beforeImages.length - 1) {
                        currentX += doc.getTextWidth(", ");
                    }
                });
            }

            // Add links for AFTER images
            if (afterCell && afterImages.length > 0) {
                // Go to the correct page
                doc.setPage(afterCell.pageNumber);

                const textParts = afterImages.map((_, idx) => `Img${idx + 1}`);
                const fullText = textParts.join(", ");
                const textWidth = doc.getTextWidth(fullText);
                const startX = afterCell.x + (afterCell.width - textWidth) / 2;
                const linkY = afterCell.y + (afterCell.height / 2) - 1;

                let currentX = startX;
                afterImages.forEach((url, idx) => {
                    const linkText = `Img${idx + 1}`;
                    const linkWidth = doc.getTextWidth(linkText);

                    // Add clickable link rectangle
                    doc.link(currentX, linkY, linkWidth, 3.5, { url: url });

                    // Move to next position
                    currentX += linkWidth;
                    if (idx < afterImages.length - 1) {
                        currentX += doc.getTextWidth(", ");
                    }
                });
            }
        });

        // Add note
        currentY = doc.lastAutoTable.finalY + 5;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.setFont("helvetica", "italic");
        doc.text("Note: Image links (Img1, Img2, etc.) in the table are clickable. Full URLs available in Excel export.", 14, currentY);

        //  addLogosToAllPages(doc);

        // Footer
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
    }

    // ==================== EXCEL EXPORT ====================
    else if (format === 'excel') {
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
            ["Completed", completedTasks],
            ["Ongoing", ongoingTasks],
            ["Avg AI Score", avgAiScore.toFixed(1)],
            ["Avg Final Rating", avgFinalRating.toFixed(1)],
            ["Total Images", totalImages],
            [],
        ];

        const tableHeaders = [
            "#",
            "Cleaner Name",
            "Location / Washroom",
            "Start Time",
            "End Time",
            "AI Score (0-10)",
            "Average Rating (0-10)",
            "Status",
            "Before Images",
            "After Images"
        ];

        // Excel table data - we'll add hyperlinks separately
        const excelTableData = tableData.map(row => [...row]);

        const worksheetData = [...headerRows, tableHeaders, ...excelTableData];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(worksheetData);

        ws["!cols"] = [
            { wch: 5 },
            { wch: 20 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 12 },
            { wch: 12 },
            { wch: 12 },
            { wch: 20 }, // Before images column
            { wch: 20 }  // After images column
        ];

        // Format title
        ws["A1"].s = {
            font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
            alignment: { horizontal: "center" },
        };

        ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];

        const headerRowIndex = headerRows.length;

        // ✅ Add hyperlinks to Excel image cells
        data.forEach((task, dataIndex) => {
            const taskInfo = getTaskInfo(task);
            const excelRowIndex = headerRowIndex + 1 + dataIndex;

            // Format status column
            const statusCellRef = `H${excelRowIndex + 1}`;
            if (ws[statusCellRef]) {
                ws[statusCellRef].s = {
                    font: {
                        bold: true,
                        color: {
                            rgb: taskInfo.status === 'COMPLETED' ? "16A34A" :
                                taskInfo.status === 'OVERDUE' ? "DC2626" :
                                    taskInfo.status === 'INCOMPLETE' ? "EA930B" :
                                        "EA930B"
                        }
                    },
                    alignment: { horizontal: "center" }
                };
            }

            // ✅ Add clickable hyperlinks for BEFORE images in Excel
            const beforeImages = task.before_photo || [];
            const beforeCellRef = `I${excelRowIndex + 1}`;
            if (beforeImages.length > 0 && ws[beforeCellRef]) {
                // Create hyperlink formula for first image
                const firstImageUrl = beforeImages[0];
                ws[beforeCellRef].l = { Target: firstImageUrl, Tooltip: "Click to view image" };
                ws[beforeCellRef].s = {
                    font: { color: { rgb: "2563EB" }, underline: true },
                    alignment: { horizontal: "center" }
                };
            }

            // ✅ Add clickable hyperlinks for AFTER images in Excel
            const afterImages = task.after_photo || [];
            const afterCellRef = `J${excelRowIndex + 1}`;
            if (afterImages.length > 0 && ws[afterCellRef]) {
                // Create hyperlink formula for first image
                const firstImageUrl = afterImages[0];
                ws[afterCellRef].l = { Target: firstImageUrl, Tooltip: "Click to view image" };
                ws[afterCellRef].s = {
                    font: { color: { rgb: "16A34A" }, underline: true },
                    alignment: { horizontal: "center" }
                };
            }
        });

        // ✅ Add separate sheet with full image URLs
        const imageUrlsData = [
            ["Image URLs Reference"],
            []
        ];

        data.forEach((task, taskIndex) => {
            const beforeImages = task.before_photo || [];
            const afterImages = task.after_photo || [];

            if (beforeImages.length > 0 || afterImages.length > 0) {
                imageUrlsData.push([`Task ${taskIndex + 1} - ${task.cleaner_name}`]);
                imageUrlsData.push([]);

                if (beforeImages.length > 0) {
                    imageUrlsData.push(["Before Images"]);
                    beforeImages.forEach((url, idx) => {
                        imageUrlsData.push([`Image ${idx + 1}`, url]);
                    });
                    imageUrlsData.push([]);
                }

                if (afterImages.length > 0) {
                    imageUrlsData.push(["After Images"]);
                    afterImages.forEach((url, idx) => {
                        imageUrlsData.push([`Image ${idx + 1}`, url]);
                    });
                    imageUrlsData.push([]);
                }
            }
        });

        const wsUrls = XLSX.utils.aoa_to_sheet(imageUrlsData);
        wsUrls["!cols"] = [{ wch: 30 }, { wch: 80 }];

        XLSX.utils.book_append_sheet(wb, ws, "Detailed Report");
        XLSX.utils.book_append_sheet(wb, wsUrls, "Image URLs");

        const fileName = `${reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split("T")[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
        console.log(`✅ Excel file exported: ${fileName}`);
    }
};




const getScoreColor = (score) => {
    if (!score && score !== 0) return { fillColor: [226, 232, 240], textColor: [100, 116, 139] };
    if (score >= 9) return { fillColor: [187, 247, 208], textColor: [20, 83, 45] }; // Green
    if (score >= 8) return { fillColor: [187, 247, 208], textColor: [22, 101, 52] }; // Light Green
    if (score >= 7) return { fillColor: [254, 243, 199], textColor: [113, 63, 18] }; // Yellow
    if (score >= 6) return { fillColor: [254, 215, 170], textColor: [124, 45, 18] }; // Orange
    return { fillColor: [254, 202, 202], textColor: [127, 29, 29] }; // Red
};

// ==================== FIXED HYGIENE TREND PDF EXPORT ====================

const exportHygieneTrendToPDF = (data, metadata) => {
    const reportTitle = metadata?.dynamic_report_name || metadata?.report_type || "Hygiene Trend Report";
    const doc = new jsPDF("l", "mm", "a4");
    let currentY = 25;

    // ============ HEADER ============
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 58, 138);
    doc.text(reportTitle, 14, 15);

    doc.setDrawColor(30, 58, 138);
    doc.setLineWidth(0.5);
    doc.line(14, 18, 283, 18);

    // ============ EXTRACT DATE COLUMNS FROM DATA ============
    // Since metadata.date_columns is empty, extract from first washroom's daily_scores
    let dateColumns = [];
    if (data && data.length > 0 && data[0].daily_scores) {
        dateColumns = Object.keys(data[0].daily_scores).sort();

        // Format dates to "DD MMM" (e.g., "15 Nov")
        dateColumns = dateColumns.map(dateStr => {
            const date = new Date(dateStr);
            const day = date.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames[date.getMonth()];
            return { key: dateStr, label: `${day} ${month}` };
        });
    }

    console.log(`📅 Extracted ${dateColumns.length} date columns`);

    // ============ SUMMARY STATISTICS ============
    const totalWashrooms = metadata?.total_washrooms || data?.length || 0;
    const totalDays = dateColumns.length;
    const overallAvgScore = metadata?.overall_avg_score || 0;

    // Calculate top & low performers
    let topPerformer = "N/A", topPerformerScore = 0;
    let lowPerformer = "N/A", lowPerformerScore = 10;

    if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => b.average_score - a.average_score);
        topPerformer = sorted[0]?.washroom_name || "N/A";
        topPerformerScore = sorted[0]?.average_score || 0;

        const sortedLow = [...data].sort((a, b) => a.average_score - b.average_score);
        lowPerformer = sortedLow[0]?.washroom_name || "N/A";
        lowPerformerScore = sortedLow[0]?.average_score || 10;
    }

    // Count scores in ranges
    const excellentCount = data?.filter(w => w.average_score >= 9).length || 0;
    const goodCount = data?.filter(w => w.average_score >= 7 && w.average_score < 9).length || 0;
    const averageCount = data?.filter(w => w.average_score >= 5 && w.average_score < 7).length || 0;
    const poorCount = data?.filter(w => w.average_score < 5).length || 0;

    // ============ METADATA TABLE ============
    autoTable(doc, {
        head: [["Organization", "Date Range", "Total Washrooms", "Generated On"]],
        body: [[
            metadata?.organization || "N/A",
            `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`,
            totalWashrooms,
            new Date(metadata?.generated_on).toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }),
        ]],
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [241, 245, 249],
            textColor: [51, 65, 85],
            fontStyle: "bold",
            fontSize: 9,
            halign: "center",
        },
        bodyStyles: {
            fontSize: 9,
            textColor: [30, 41, 59],
            halign: "center",
            cellPadding: 3,
        },
        margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 3;

    // ============ STATISTICS SUMMARY TABLE ============
    autoTable(doc, {
        head: [["Overall Avg Score", "Top Performer", "Low Performer", "Excellent (9+)", "Good (7-9)", "Average (5-7)", "Poor (<5)"]],
        body: [[
            formatScore(overallAvgScore),
            `${topPerformer} (${formatScore(topPerformerScore)})`,
            `${lowPerformer} (${formatScore(lowPerformerScore)})`,
            excellentCount,
            goodCount,
            averageCount,
            poorCount,
        ]],
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 8,
            halign: "center",
        },
        bodyStyles: {
            fontSize: 8,
            textColor: [30, 41, 59],
            halign: "center",
            cellPadding: 3,
            fontStyle: "bold",
            fillColor: [236, 253, 245],
        },
        margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // ============ MAIN TABLE HEADING ============
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Daily Hygiene Trend - Washroom Wise", 14, currentY);
    currentY += 3;

    // ============ BUILD TABLE DATA ============
    const dailyScoresArray = data?.map((washroom, index) => {
        const dailyScores = dateColumns.map(dateObj => {
            return formatScore(washroom.daily_scores?.[dateObj.key]);
        });

        return [
            index + 1,
            washroom.washroom_name,
            washroom.city || "N/A",
            washroom.zone_type || "N/A",
            ...dailyScores,
            formatScore(washroom.average_score),
        ];
    }) || [];

    // ============ BUILD COLUMN HEADERS ============
    const tableHeaders = [
        "Sr",
        "Washroom",
        "City",
        "Zone",
        ...dateColumns.map(d => d.label),
        "Avg",
    ];

    // ============ DYNAMIC COLUMN WIDTHS (CRITICAL FOR FITTING ALL DATES) ============
    const dateColumnCount = dateColumns.length;
    const fixedColumnsWidth = 8 + 35 + 15 + 20 + 10; // Sr + Washroom + City + Zone + Avg
    const availableWidth = 297 - 28; // Page width - margins
    const remainingWidth = availableWidth - fixedColumnsWidth;
    const dateColumnWidth = Math.max(6, Math.floor(remainingWidth / dateColumnCount)); // Min 6mm per date

    console.log(`📏 Date column width: ${dateColumnWidth}mm for ${dateColumnCount} dates`);

    const columnStyles = {
        0: { halign: "center", cellWidth: 8 },
        1: { halign: "left", cellWidth: 35 },
        2: { halign: "center", cellWidth: 15 },
        3: { halign: "center", cellWidth: 20 },
    };

    // Add date column styles
    dateColumns.forEach((_, idx) => {
        columnStyles[4 + idx] = {
            halign: "center",
            cellWidth: dateColumnWidth,
            fontSize: 5.5  // Very small font for dates
        };
    });

    // Average column
    columnStyles[4 + dateColumns.length] = {
        halign: "center",
        cellWidth: 10,
        fontStyle: "bold"
    };

    // ============ MAIN TABLE WITH COLOR CODING ============
    autoTable(doc, {
        head: [tableHeaders],
        body: dailyScoresArray,
        startY: currentY,
        theme: "grid",
        headStyles: {
            fillColor: [37, 99, 235],
            textColor: 255,
            fontStyle: "bold",
            fontSize: 5.5,
            halign: "center",
            cellPadding: 1,
        },
        bodyStyles: {
            fontSize: 5.5,
            textColor: 50,
            cellPadding: 1,
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252],
        },
        columnStyles: columnStyles,
        didDrawCell: function (cellData) {
            const columnIndex = cellData.column.index;
            const isDateColumn = columnIndex >= 4 && columnIndex < 4 + dateColumns.length;
            const isAvgColumn = columnIndex === 4 + dateColumns.length;

            // Color code both date columns and average column
            if ((isDateColumn || isAvgColumn) && cellData.section === "body") {
                const scoreValue = dailyScoresArray[cellData.row.index]?.[columnIndex];

                if (scoreValue && scoreValue !== "N/A") {
                    const numScore = parseFloat(scoreValue);
                    const colors = getScoreColor(numScore);

                    // Draw colored background
                    doc.setFillColor(...colors.fillColor);
                    doc.rect(
                        cellData.cell.x,
                        cellData.cell.y,
                        cellData.cell.width,
                        cellData.cell.height,
                        "F"
                    );

                    // Draw text with appropriate color
                    doc.setTextColor(...colors.textColor);
                    doc.setFontSize(5.5);
                    if (isAvgColumn) {
                        doc.setFont("helvetica", "bold");
                    }
                    doc.text(
                        scoreValue,
                        cellData.cell.x + cellData.cell.width / 2,
                        cellData.cell.y + cellData.cell.height / 2,
                        { align: "center", baseline: "middle" }
                    );
                }
            }
        },
        margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 5;

    // ============ LEGEND ============
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text("Score Legend:", 14, currentY);
    currentY += 4;

    const legendItems = [
        { color: [187, 247, 208], text: "Excellent (9.0 - 10.0)" },
        { color: [254, 243, 199], text: "Good (7.0 - 8.9)" },
        { color: [254, 215, 170], text: "Average (5.0 - 6.9)" },
        { color: [254, 202, 202], text: "Poor (< 5.0)" },
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    legendItems.forEach((item) => {
        doc.setFillColor(...item.color);
        doc.rect(14, currentY - 2, 3, 3, "F");
        doc.setTextColor(51, 65, 85);
        doc.text(item.text, 18, currentY);
        currentY += 4;
    });

    // ============ PAGE FOOTER ============
    const pageCount = doc.internal.getNumberOfPages();
    doc.setFontSize(8);
    doc.setTextColor(100);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
            `Page ${i} of ${pageCount}`,
            doc.internal.pageSize.width / 2,
            doc.internal.pageSize.height - 8,
            { align: "center" }
        );
        doc.text(
            `Generated on ${new Date().toLocaleString("en-IN")}`,
            14,
            doc.internal.pageSize.height - 8
        );
    }

    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
    console.log(`✅ Hygiene Trend PDF exported: ${fileName} with ${dateColumns.length} date columns`);
};


const exportHygieneTrendToExcel = (data, metadata) => {
    const reportTitle = metadata?.dynamic_report_name || metadata?.report_type || "Hygiene Trend Report";
    const dateColumns = metadata?.date_columns || [];

    // Calculate statistics
    const totalWashrooms = metadata?.total_washrooms || 0;
    const totalDays = metadata?.total_days || 0;
    const overallAvgScore = metadata?.overall_avg_score || 0;

    let topPerformer = "N/A", topPerformerScore = 0;
    let lowPerformer = "N/A", lowPerformerScore = 10;

    if (data && data.length > 0) {
        const sorted = [...data].sort((a, b) => b.average_score - a.average_score);
        topPerformer = sorted[0]?.washroom_name || "N/A";
        topPerformerScore = sorted[0]?.average_score || 0;

        const sortedLow = [...data].sort((a, b) => a.average_score - b.average_score);
        lowPerformer = sortedLow[0]?.washroom_name || "N/A";
        lowPerformerScore = sortedLow[0]?.average_score || 10;
    }

    const excellentCount = data?.filter(w => w.average_score >= 9).length || 0;
    const goodCount = data?.filter(w => w.average_score >= 7 && w.average_score < 9).length || 0;
    const averageCount = data?.filter(w => w.average_score >= 5 && w.average_score < 7).length || 0;
    const poorCount = data?.filter(w => w.average_score < 5).length || 0;

    // ============ BUILD HEADER ROWS ============
    const headerRows = [
        [reportTitle],
        [],
        ["Organization", metadata?.organization || "N/A"],
        ["Date Range", `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`],
        ["Total Washrooms", totalWashrooms],
        ["Total Days", totalDays],
        ["Generated On", new Date(metadata?.generated_on).toLocaleString("en-IN")],
        [],
        ["Summary Statistics"],
        ["Overall Average Score", formatScore(overallAvgScore)],
        ["Top Performer", `${topPerformer} (${formatScore(topPerformerScore)})`],
        ["Low Performer", `${lowPerformer} (${formatScore(lowPerformerScore)})`],
        ["Excellent Count (9+)", excellentCount],
        ["Good Count (7-9)", goodCount],
        ["Average Count (5-7)", averageCount],
        ["Poor Count (<5)", poorCount],
        [],
    ];

    // ============ BUILD TABLE HEADERS ============
    const tableHeaders = [
        "Sr No",
        "Washroom Name",
        "City",
        "Zone Type",
        "Assigned Cleaners",
        ...dateColumns,
        "Average Score",
    ];

    // ============ BUILD TABLE DATA ============
    const tableData = data?.map((washroom, index) => {
        const dailyScores = metadata?.date_columns?.map((_, idx) => {
            const dateKey = Object.keys(washroom.daily_scores || {})[idx];
            return formatScore(washroom.daily_scores?.[dateKey]);
        }) || [];

        return [
            index + 1,
            washroom.washroom_name,
            washroom.city || "N/A",
            washroom.zone_type || "N/A",
            washroom.assigned_cleaners?.join(", ") || "N/A",
            ...dailyScores,
            formatScore(washroom.average_score),
        ];
    }) || [];

    // ============ COMBINE DATA ============
    const worksheetData = [...headerRows, tableHeaders, ...tableData];

    // ============ CREATE WORKBOOK ============
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // ============ SET COLUMN WIDTHS ============
    const colWidths = [8, 22, 12, 12, 25, ...dateColumns.map(() => 14), 14];
    ws["!cols"] = colWidths.map(wch => ({ wch }));

    // ============ FORMAT TITLE ============
    ws["A1"].s = {
        font: { bold: true, sz: 16, color: { rgb: "1E3A8A" } },
        alignment: { horizontal: "center", vertical: "center" },
    };

    // ============ MERGE TITLE ============
    ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: tableHeaders.length - 1 } },
    ];

    // ============ FORMAT HEADER ROW ============
    const headerRowIndex = headerRows.length;
    for (let col = 0; col < tableHeaders.length; col++) {
        const cellRef = XLSX.utils.encode_col(col) + (headerRowIndex + 1);
        if (ws[cellRef]) {
            ws[cellRef].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2563EB" } },
                alignment: { horizontal: "center", vertical: "center" },
            };
        }
    }

    // ============ COLOR CODE DATA ROWS ============
    const rgbToHex = (rgb) => {
        return (
            "FF" +
            rgb.map(x => {
                const hex = x.toString(16);
                return hex.length === 1 ? "0" + hex : hex;
            }).join("").toUpperCase()
        );
    };

    tableData.forEach((row, rowIdx) => {
        const excelRowIndex = headerRowIndex + 1 + rowIdx;

        for (let col = 5; col < tableHeaders.length; col++) {
            const cellRef = XLSX.utils.encode_col(col) + (excelRowIndex + 1);
            const scoreValue = row[col];
            if (scoreValue && scoreValue !== "N/A" && ws[cellRef]) {
                const numScore = parseFloat(scoreValue);
                const colors = getScoreColor(numScore);

                ws[cellRef].s = {
                    fill: { fgColor: { rgb: rgbToHex(colors.fillColor) } },
                    font: {
                        color: { rgb: rgbToHex(colors.textColor) },
                        bold: col === tableHeaders.length - 1
                    },
                    alignment: { horizontal: "center" },
                };
            }
        }
    });

    // ============ CREATE SUMMARY SHEET ============
    const summaryData = [
        ["Hygiene Trend Report Summary"],
        [],
        ["Metric", "Value"],
        ["Organization", metadata?.organization || "N/A"],
        ["Report Period", `${metadata?.date_range?.start || "N/A"} to ${metadata?.date_range?.end || "N/A"}`],
        ["Total Washrooms", totalWashrooms],
        ["Total Days", totalDays],
        ["Overall Average Score", formatScore(overallAvgScore)],
        [],
        ["Performance Distribution"],
        ["Excellent (9+)", excellentCount],
        ["Good (7-9)", goodCount],
        ["Average (5-7)", averageCount],
        ["Poor (<5)", poorCount],
        [],
        ["Top & Low Performers"],
        ["Top Performer", `${topPerformer} (${formatScore(topPerformerScore)})`],
        ["Low Performer", `${lowPerformer} (${formatScore(lowPerformerScore)})`],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    wsSummary["!cols"] = [{ wch: 25 }, { wch: 40 }];

    wsSummary["A1"].s = {
        font: { bold: true, sz: 14, color: { rgb: "1E3A8A" } },
    };

    // ============ ADD SHEETS TO WORKBOOK ============
    XLSX.utils.book_append_sheet(wb, ws, "Hygiene Trend");
    XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

    // ============ SAVE FILE ============
    const fileName = `${reportTitle.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
    console.log(`✅ Hygiene Trend Excel exported: ${fileName}`);
};


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

    //   addLogosToAllPages(doc);

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

    // addLogosToAllPages(doc);

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

    //addLogosToAllPages(doc);

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

    const formatDateForReport = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    // ✅ Metadata Section
    formatDateForReport();
    if (isSingleWashroom) {
        autoTable(doc, {
            head: [["Organization", "Zone/Type", "Address", "City/State", "Date Range", "Report Type", "Generated On"]],
            body: [[
                metadata.organization || "N/A",
                metadata.washroom_type || "N/A",
                metadata.washroom_address || "N/A",
                [metadata.washroom_city, metadata.washroom_state].filter(Boolean).join(', ') || "N/A",
                `${formatDateForReport(metadata.date_range?.start)} to ${formatDateForReport(metadata.date_range?.end)}`, reportTitle,
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
                `${formatDateForReport(metadata.date_range?.start)} to ${formatDateForReport(metadata.date_range?.end)}`, new Date(metadata.generated_on).toLocaleString('en-IN', {
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
            head: [["Washroom", "Total Cleanings", "Completed", "Ongoing", "Avg Rating", "Avg Duration"]],
            body: [[
                metadata.washroom_name || "N/A",
                metadata.total_cleanings || 0,
                metadata.completed || 0,
                metadata.ongoing || 0,
                metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
                metadata.avg_cleaning_duration ? formatDuration(metadata.avg_cleaning_duration) : "N/A"
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

        const tableData = data.map((cleaning, index) => {
            const taskInfo = cleaning.duration_minutes ? getTaskInfo({
                task_start_time: cleaning.start_time,
                task_end_time: cleaning.end_time,
                status: cleaning.status
            }) : null;

            return [
                index + 1,
                cleaning.cleaner_name || "N/A",
                formatDateTime(cleaning.start_time),
                formatDateTime(cleaning.end_time),
                taskInfo ? taskInfo.durationDisplay : (cleaning.duration_minutes ? formatDuration(cleaning.duration_minutes) : "N/A"),
                cleaning.rating ? cleaning.rating.toFixed(1) : "N/A",
                taskInfo ? taskInfo.status : (cleaning.status ? cleaning.status.toUpperCase() : "N/A"),
                cleaning.before_image_count || 0,
                cleaning.after_image_count || 0
            ];
        });

        autoTable(doc, {
            head: [[
                "#",
                "Cleaner",
                "Start Time",
                "End Time",
                "Duration",
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
            // ✅ Color code status cells
            didParseCell: function (data) {
                if (data.column.index === 6 && data.section === 'body') {
                    const status = data.cell.raw;
                    if (status === 'COMPLETED') {
                        data.cell.styles.textColor = [22, 163, 74]; // Green (text-green-700)
                        data.cell.styles.fillColor = [220, 252, 231]; // Light green (bg-green-100)
                    } else if (status === 'ONGOING') {
                        data.cell.styles.textColor = [161, 98, 7]; // Yellow-700 (text-yellow-700)
                        data.cell.styles.fillColor = [254, 249, 195]; // Yellow-100 (bg-yellow-100)
                    } else if (status === 'INCOMPLETE') {
                        data.cell.styles.textColor = [234, 179, 8]; // Orange
                        data.cell.styles.fillColor = [255, 237, 213]; // Orange-100
                    } else if (status === 'OVERDUE') {
                        data.cell.styles.textColor = [220, 38, 38]; // Red
                        data.cell.styles.fillColor = [254, 226, 226]; // Red-100
                    }
                }
            },
            margin: { left: 14, right: 14 },
        });
    }
    // ✅ ALL WASHROOMS REPORT
    else {
        // Summary Stats
        autoTable(doc, {
            head: [["Total Washrooms", "Completed", "Ongoing", "Avg Rating", "Avg Duration"]],
            body: [[
                metadata.total_washrooms || 0,
                metadata.completed || 0,
                metadata.ongoing || 0,
                metadata.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A",
                metadata.avg_cleaning_duration ? formatDuration(metadata.avg_cleaning_duration) : "N/A"
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
            washroom.address || "N/A",
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
                "Address",
                "Type",
                "Cleaner",
                "Avg Rating",
                "Status",
                "Images",
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
                cellPadding: 2,
                overflow: 'linebreak',  // ✅ Wraps text to multiple lines
                valign: 'top'
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252]
            },
            columnStyles: {
                0: { halign: 'center', cellWidth: 8 },
                1: { halign: 'left', overflow: 'linebreak' },
                2: { halign: 'left', overflow: 'linebreak' },
                3: { halign: 'left', overflow: 'linebreak' },
                4: { halign: 'left', overflow: 'linebreak' },
                5: { halign: 'center', },
                6: { halign: 'center', },
                7: { halign: 'center', },
                8: { halign: 'left', overflow: 'linebreak' }
            },
            // ✅ Color code status cells
            didParseCell: function (data) {
                if (data.column.index === 6 && data.section === 'body') {
                    const status = data.cell.raw;
                    if (status === 'COMPLETED') {
                        data.cell.styles.textColor = [22, 163, 74]; // Green (text-green-700)
                        data.cell.styles.fillColor = [220, 252, 231]; // Light green (bg-green-100)
                    } else if (status === 'ONGOING') {
                        data.cell.styles.textColor = [161, 98, 7]; // Yellow-700 (text-yellow-700)
                        data.cell.styles.fillColor = [254, 249, 195]; // Yellow-100 (bg-yellow-100)
                    } else if (status === 'INCOMPLETE') {
                        data.cell.styles.textColor = [234, 179, 8]; // Orange
                        data.cell.styles.fillColor = [255, 237, 213]; // Orange-100
                    } else if (status === 'OVERDUE') {
                        data.cell.styles.textColor = [220, 38, 38]; // Red
                        data.cell.styles.fillColor = [254, 226, 226]; // Red-100
                    }
                }
            },
            margin: { left: 14, right: 14 },
        });
    }

    //   addLogosToAllPages(doc);

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
            "Last Activity"
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
            (record.status === 'Incomplete') ? "N/A" : record.duration,
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
    //addLogosToAllPages(doc);

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
                (record.status === 'Incomplete') ? "N/A" : record.duration,
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
        exportDetailedCleaningReport(data, metadata, 'pdf')
    }
    else if (reportType === "cleaner_performance_summary") {
        exportCleanerPerformanceSummaryToPDF(data, metadata);
    } else if (reportType === "washroom_report") {
        exportWashroomReportToPDF(data, metadata);
    }
    else if (reportType === "cleaner_report") {
        exportCleanerReportToPDF(data, metadata);
    }
    else if (reportType === "washroom_hygiene_trend") {
        exportHygieneTrendToPDF(data, metadata);
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
        exportDetailedCleaningReport(data, metadata, 'excel')
    }
    else if (reportType === "washroom_report") {
        exportWashroomReportToExcel(data, metadata);
    }
    else if (reportType === "cleaner_report") {
        exportCleanerReportToExcel(data, metadata);
    }
    else if (reportType === "washroom_hygiene_trend") {
        exportHygieneTrendToExcel(data, metadata);
    }
    else {
        console.error("Unknown report type:", reportType);
    }
};
