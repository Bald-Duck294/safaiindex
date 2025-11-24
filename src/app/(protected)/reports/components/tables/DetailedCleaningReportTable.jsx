"use client";

import React, { useState } from "react";
import { User, Star, TrendingUp, Eye, Download, FileSpreadsheet } from "lucide-react";
import PhotoModal from "./../PhotoModal";
// import { exportDetailedCleaningToPDF, exportDetailedCleaningToExcel } from "./ExportUtils";
import { exportCleanerPerformanceSummaryToExcel, exportCleanerPerformanceSummaryToPDF } from "../ExportUtils";


const DateTimeDisplay = ({ date }) => {
    if (!date) return <span className="text-slate-500">Ongoing</span>;

    const d = new Date(date);
    const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    const timePart = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });

    return (
        <div className="text-sm text-slate-700">
            <span>{datePart}</span>
            <strong className="ml-1 font-semibold text-slate-800">{timePart}</strong>
        </div>
    );
};

export default function DetailedCleaningReportTable({ data, metadata }) {
    const [selectedPhotos, setSelectedPhotos] = useState(null);

    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600 bg-green-50";
        if (score >= 6) return "text-yellow-600 bg-yellow-50";
        if (score >= 4) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    const openImageModal = (beforeImages, afterImages) => {
        setSelectedPhotos({
            before: beforeImages || [],
            after: afterImages || []
        });
    };

    const formatScore = (score) => {
        if (!score && score !== 0) return "N/A";
        const rounded = Math.round(score * 10) / 10;
        return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1);
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Reviews</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{metadata?.total_tasks || 0}</p>
                        </div>
                        <User className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Avg AI Score</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {formatScore(metadata?.average_ai_score) || "N/A"}
                            </p>
                        </div>
                        <Star className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Final Rating</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {formatScore(metadata?.average_final_rating) || "N/A"}
                            </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* Export Buttons */}
            <div className="flex gap-3 justify-end">
                <button
                    onClick={() => exportDetailedCleaningToPDF(data, metadata)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                    <Download className="w-4 h-4" />
                    Export PDF
                </button>
                <button
                    onClick={() => exportDetailedCleaningToExcel(data, metadata)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                    <FileSpreadsheet className="w-4 h-4" />
                    Export Excel
                </button>
            </div>

            {/* Detailed Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Cleaner Name
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Location / Washroom
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Task Start
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Task End
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                AI Score
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Final Rating
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Before Images
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                After Images
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data && data.length > 0 ? (
                            data.map((task) => (
                                <tr key={task.task_id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <p className="font-medium text-slate-800">{task.cleaner_name}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-700">
                                        {task.washroom_full_name}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DateTimeDisplay date={task.task_start_time} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <DateTimeDisplay date={task.task_end_time} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-sm ${getScoreColor(task.ai_score)}`}>
                                                <Star className="w-3 h-3" />
                                                {formatScore(task.ai_score)}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-sm ${getScoreColor(task.final_rating)}`}>
                                                <TrendingUp className="w-3 h-3" />
                                                {formatScore(task.final_rating)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Before Images Column */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {task.before_photo?.slice(0, 5).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded border-2 border-blue-300 overflow-hidden hover:scale-110 transition-transform"
                                                    title={`Before Image ${idx + 1}`}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`Before ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                </a>
                                            ))}
                                            {!task.before_photo?.length && (
                                                <span className="text-xs text-slate-400">No images</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* After Images Column */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {task.after_photo?.slice(0, 5).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-10 h-10 rounded border-2 border-green-300 overflow-hidden hover:scale-110 transition-transform"
                                                    title={`After Image ${idx + 1}`}
                                                >
                                                    <img
                                                        src={url}
                                                        alt={`After ${idx + 1}`}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => e.target.style.display = 'none'}
                                                    />
                                                </a>
                                            ))}
                                            {!task.after_photo?.length && (
                                                <span className="text-xs text-slate-400">No images</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions Column */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <button
                                                onClick={() => openImageModal(task.before_photo, task.after_photo)}
                                                disabled={!task.before_photo?.length && !task.after_photo?.length}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-full text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <Eye className="w-3 h-3" />
                                                View All
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                                    No cleaning records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Photo Modal */}
            {selectedPhotos && (
                <PhotoModal
                    photos={selectedPhotos}
                    onClose={() => setSelectedPhotos(null)}
                />
            )}
        </div>
    );
}
