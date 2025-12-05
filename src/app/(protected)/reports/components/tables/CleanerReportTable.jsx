import React, { useState } from "react";
import SingleCleanerReport from "./SingleCleanerReport";
import AllCleanersReport from "./AllCleanersReport";

// ============================================
// MAIN CLEANER REPORT TABLE (Auto-detects type)
// ============================================
export default function CleanerReportTable({ data, metadata }) {
    console.log("📊 CleanerReportTable received:", { data, metadata });

    // ✅ Determine report type from metadata
    const isSingleCleaner = metadata?.is_single_cleaner === true;

    // ✅ Render appropriate table based on report type
    if (isSingleCleaner) {
        return <SingleCleanerReport data={data} metadata={metadata} />;
    } else {
        return <AllCleanersReport data={data} metadata={metadata} />;
    }
}
