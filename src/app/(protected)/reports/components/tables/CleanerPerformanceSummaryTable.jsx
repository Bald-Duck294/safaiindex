"use client";
import React from "react";


export default function CleanerPerformanceSummaryTable({ data, metadata }) {
    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <div>
                    <div className="text-xs text-gray-500 uppercase">Total Cleaners</div>
                    <div className="text-2xl font-bold text-blue-900">{metadata?.total_cleaners || 0}</div>
                </div>
                <div>
                    <div className="text-xs text-gray-500 uppercase">Date Range</div>
                    <div className="text-lg text-gray-800">
                        {(metadata?.date_range?.start && metadata?.date_range?.end)
                            ? `${metadata.date_range.start} to ${metadata.date_range.end}`
                            : "-"}
                    </div>
                </div>
            </div>
            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full">
                    <thead className="bg-slate-100">
                        <tr>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Cleaner</th>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Total Tasks</th>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Avg. AI Score</th>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Avg. Compliance (100%)</th>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Avg. Duration (min)</th>
                            <th className="p-3 text-left text-xs font-semibold uppercase">Last Task Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {data && data.length > 0 ? (
                            data.map(row => (
                                <tr key={row.cleaner_name}>
                                    <td className="p-3 font-medium">{row.cleaner_name}</td>
                                    <td className="p-3">{row.total_tasks}</td>
                                    <td className="p-3">{row.avg_ai_score}</td>
                                    <td className="p-3">{row.avg_compliance}</td>
                                    <td className="p-3">{row.avg_duration}</td>
                                    <td className="p-3">
                                        {row.last_task_date
                                            ? new Date(row.last_task_date).toLocaleString('en-IN')
                                            : "-"}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="p-6 text-center text-gray-500">No data for selected filters</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
