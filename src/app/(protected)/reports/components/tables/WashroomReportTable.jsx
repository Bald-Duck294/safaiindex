// components/reports/WashroomReportTable.jsx

"use client";

import React, { useState } from "react";
import {
    User, Star, Clock, CheckCircle, AlertTriangle,
    MapPin, Calendar, TrendingUp, Building
} from "lucide-react";
import PhotoModal from "../PhotoModal";
// import AllWashoomsTable from "./AllWashoomsTable";
// AllWashroomsTable
import AllWashroomsTable from "./AllWashroomReport"
import SingleWashroomTable from "./SingleWashroomTable"

// ============================================
// MAIN WASHROOM REPORT TABLE (Auto-detects type)
// ============================================
export default function WashroomReportTable({ data, metadata }) {
    console.log("📊 WashroomReportTable received:", { data, metadata });

    // ✅ Determine report type from metadata
    const isSingleWashroom = metadata?.is_single_washroom === true;

    // ✅ Render appropriate table based on report type
    if (isSingleWashroom) {
        return <SingleWashroomTable data={data} metadata={metadata} />;
    } else {
        return <AllWashroomsTable data={data} metadata={metadata} />;
    }
}



