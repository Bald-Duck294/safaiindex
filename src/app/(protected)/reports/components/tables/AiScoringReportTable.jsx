"use client";

import React from "react";
import { TrendingUp, TrendingDown, Star, MapPin, Calendar } from "lucide-react";

export default function AiScoringReportTable({ data, metadata }) {

    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600";
        if (score >= 6) return "text-yellow-600";
        return "text-red-600";
    };

    const formatDateRange = (range) => {
        if (!range || (!range.start && !range.end) || (range.start === 'Beginning' && range.end === 'Now')) {
            return "-"; // Show placeholder if no dates are selected
        }
        const start = range.start !== 'Beginning' ? new Date(range.start).toLocaleDateString('en-IN') : 'Beginning';
        const end = range.end !== 'Now' ? new Date(range.end).toLocaleDateString('en-IN') : 'Now';
        return `${start} to ${end}`;
    };

    const ImprovementIndicator = ({ value }) => {
        if (value > 0) {
            return (
                <span className="flex items-center text-green-600 font-semibold">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {value.toFixed(1)}%
                </span>
            );
        } else if (value < 0) {
            return (
                <span className="flex items-center text-red-600 font-semibold">
                    <TrendingDown className="w-4 h-4 mr-1" />
                    {value.toFixed(1)}%
                </span>
            );
        }
        return <span className="text-slate-500">-</span>;
    };

    return (
        <div className="space-y-6">
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-600">Total Locations Inspected</p>
                    <p className="text-2xl font-bold text-blue-900 mt-1">{metadata?.total_locations_inspected || 0}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium text-gray-600 flex items-center"><Calendar className="w-4 h-4 mr-1.5" />Date Range</p>
                    <p className="text-lg font-semibold text-gray-800 mt-2">
                        {formatDateRange(metadata?.date_range)}
                    </p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Washroom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Total Inspections</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Average Score (0-10)</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">Improvement Trend</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data && data.length > 0 ? (
                            data.map((row) => (
                                <tr key={row.location_id}>
                                    <td className="px-4 py-3 font-medium text-slate-800 flex items-center">
                                        <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                                        {row.location_name}
                                    </td>
                                    <td className="px-4 py-3 text-slate-700">{row.total_inspections}</td>
                                    <td className="px-4 py-3">
                                        <span className={`font-bold text-lg ${getScoreColor(row.average_score)}`}>
                                            {row.average_score.toFixed(1)}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <ImprovementIndicator value={row.improvement_percentage} />
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="py-8 text-center text-slate-500">
                                    No data available for the selected filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
