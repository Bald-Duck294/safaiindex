"use client";

import React, { useState } from "react";
import {
    User, Star, TrendingUp, Eye, Clock, CheckCircle,
    AlertTriangle, Camera, Shield, Timer, MapPin
} from "lucide-react";

import PhotoModal from "./../PhotoModal";

// ✅ Enhanced Time Display with Date + Status
const SmartTimeDisplay = ({ task }) => {
    const { task_start_time, task_end_time, duration_minutes, time_status, task_age_days, status } = task;

    const formatDateTime = (date) => {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Status Badge
    const StatusBadge = () => {
        if (status === "completed") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Completed
                </span>
            );
        }
        if (task.is_overdue) {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    Overdue
                </span>
            );
        }
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                <Clock className="w-3 h-3" />
                Ongoing
            </span>
        );
    };

    // ✅ Completed - Same Day
    if (time_status === "completed_same_day") {
        const date = new Date(task_start_time).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
        const startTime = new Date(task_start_time).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });
        const endTime = new Date(task_end_time).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        return (
            <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{date}</div>
                <div className="text-sm text-slate-700">
                    {startTime} - {endTime}
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge />
                    <span className="text-xs text-green-600 font-medium">
                        ✓ {duration_minutes} min
                    </span>
                </div>
            </div>
        );
    }

    // ✅ Completed - Different Day
    if (time_status === "completed_different_day") {
        return (
            <div className="space-y-1">
                <div className="text-xs text-slate-600">
                    <div>Start: {formatDateTime(task_start_time)}</div>
                    <div>End: {formatDateTime(task_end_time)}</div>
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge />
                    <span className="text-xs text-green-600 font-medium">
                        {duration_minutes} min
                    </span>
                </div>
            </div>
        );
    }

    // ✅ Ongoing - Same Day
    if (time_status === "ongoing_same_day") {
        const date = new Date(task_start_time).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short'
        });
        const startTime = new Date(task_start_time).toLocaleTimeString('en-IN', {
            hour: '2-digit', minute: '2-digit', hour12: true
        });

        return (
            <div className="space-y-1">
                <div className="text-xs text-slate-500 font-medium">{date}</div>
                <div className="text-sm text-slate-700">
                    Started: {startTime}
                </div>
                <div className="flex items-center gap-2">
                    <StatusBadge />
                    <span className="text-xs text-yellow-600 font-medium">
                        ({duration_minutes} min elapsed)
                    </span>
                </div>
            </div>
        );
    }

    // ✅ Incomplete - Overdue (> 2 days)
    if (time_status === "incomplete_overdue") {
        return (
            <div className="space-y-1">
                <div className="text-xs text-slate-600">
                    Started: {formatDateTime(task_start_time)}
                </div>
                <StatusBadge />
                <div className="text-xs text-red-600 font-medium">
                    {task_age_days} days overdue
                </div>
            </div>
        );
    }

    // ✅ Ongoing - Different Day (but not overdue yet)
    return (
        <div className="space-y-1">
            <div className="text-xs text-slate-600">
                Started: {formatDateTime(task_start_time)}
            </div>
            <StatusBadge />
            <div className="text-xs text-yellow-600 font-medium">
                {task_age_days}d {duration_minutes % 60}m elapsed
            </div>
        </div>
    );
};

// ✅ Main Component
export default function DetailedCleaningReportTable({ data, metadata }) {
    const [selectedPhotos, setSelectedPhotos] = useState(null);

    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 7) return "text-green-600 bg-green-50 border-green-200";
        if (score >= 6) return "text-yellow-600 bg-yellow-50 border-yellow-200";
        if (score >= 4) return "text-orange-600 bg-orange-50 border-orange-200";
        return "text-red-600 bg-red-50 border-red-200";
    };

    const getComplianceColor = (rate) => {
        if (rate >= 80) return "text-green-600 bg-green-50";
        if (rate >= 60) return "text-yellow-600 bg-yellow-50";
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
            {/* ✅ Summary Cards - 4 Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Reviews */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Reviews</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                                {metadata?.total_tasks || data.length || 0}
                            </p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                {/* Task Status Card - NEW */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600 font-medium">Task Status</p>
                        <CheckCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">✓ Completed</span>
                            <span className="font-bold text-green-700">
                                {data.filter(t => t.status === 'completed').length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-yellow-700">⏳ Ongoing</span>
                            <span className="font-bold text-yellow-700">
                                {data.filter(t => t.status !== 'completed').length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Avg AI Score */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Avg AI Score</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {formatScore(metadata?.average_ai_score) || formatScore(data.reduce((sum, t) => sum + t.ai_score, 0) / data.length) || "N/A"}
                            </p>
                        </div>
                        <Star className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                {/* Avg Cleaning Time - NEW */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Cleaning Time</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {metadata?.average_duration_minutes || Math.round(data.reduce((sum, t) => sum + (t.duration_minutes || 0), 0) / data.length) || 0} min
                            </p>
                        </div>
                        <Timer className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* ✅ Responsive Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
                {/* Desktop Table */}
                <table className="w-full hidden lg:table">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                Cleaner
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                Zone / Location
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                Time Info
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                AI Score
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                Average Rating
                            </th>
                            {/* ✅ ADDED STATUS COLUMN */}
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                Status
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                Before Images
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                After Images
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data && data.length > 0 ? (
                            data.map((task) => (
                                <tr
                                    key={task.task_id}
                                    className={`hover:bg-slate-50 transition-colors ${task.is_overdue ? 'bg-red-50' : ''
                                        }`}
                                >
                                    {/* Cleaner */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800">{task.cleaner_name}</p>
                                                {task.cleaner_phone && task.cleaner_phone !== "N/A" && (
                                                    <p className="text-xs text-slate-500">{task.cleaner_phone}</p>
                                                )}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Zone / Location */}
                                    <td className="px-4 py-3">
                                        <div className="space-y-1">
                                            {task.zone_name && task.zone_name !== "N/A" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    <MapPin className="w-3 h-3" />
                                                    {task.zone_name}
                                                </span>
                                            )}
                                            <p className="font-medium text-slate-800 text-sm">
                                                {task.washroom_name || task.washroom_full_name}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Time Info */}
                                    <td className="px-4 py-3">
                                        <SmartTimeDisplay task={task} />
                                    </td>

                                    {/* AI Score */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getScoreColor(task.ai_score)}`}>
                                                <Star className="w-3 h-3" />
                                                <span className="font-semibold text-sm">
                                                    {formatScore(task.ai_score)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Final Rating */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${getScoreColor(task.final_rating)}`}>
                                                <TrendingUp className="w-3 h-3" />
                                                <span className="font-semibold text-sm">
                                                    {formatScore(task.final_rating)}
                                                </span>
                                            </div>
                                        </div>
                                    </td>

                                    {/* ✅ STATUS COLUMN */}
                                    <td className="px-4 py-3">
                                        <div className="flex justify-center">
                                            {task.status === 'completed' ? (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                                    <CheckCircle className="w-3 h-3" />
                                                    COMPLETED
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                                    <Clock className="w-3 h-3" />
                                                    ONGOING
                                                </span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Before Images */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {task.before_photo?.slice(0, 2).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 rounded border-2 border-blue-300 overflow-hidden hover:scale-110 transition-transform"
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
                                            {task.before_photo?.length > 3 && (
                                                <div className="w-12 h-12 rounded border-2 border-blue-300 bg-blue-50 flex items-center justify-center text-xs font-medium text-blue-700">
                                                    +{task.before_photo.length - 3}
                                                </div>
                                            )}
                                            {!task.before_photo?.length && (
                                                <span className="text-xs text-slate-400">No images</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* After Images */}
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {task.after_photo?.slice(0, 2).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-12 h-12 rounded border-2 border-green-300 overflow-hidden hover:scale-110 transition-transform"
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
                                            {task.after_photo?.length > 3 && (
                                                <div className="w-12 h-12 rounded border-2 border-green-300 bg-green-50 flex items-center justify-center text-xs font-medium text-green-700">
                                                    +{task.after_photo.length - 3}
                                                </div>
                                            )}
                                            {!task.after_photo?.length && (
                                                <span className="text-xs text-slate-400">No images</span>
                                            )}
                                        </div>
                                    </td>

                                    {/* Actions */}
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

                {/* ✅ Mobile Card View */}
                <div className="lg:hidden divide-y divide-slate-200">
                    {data && data.length > 0 ? (
                        data.map((task) => (
                            <div
                                key={task.task_id}
                                className={`p-4 space-y-3 ${task.is_overdue ? 'bg-red-50' : ''}`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{task.cleaner_name}</p>
                                            {task.zone_name && task.zone_name !== "N/A" && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mt-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {task.zone_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {/* ✅ Mobile Status Badge */}
                                    {task.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                            <CheckCircle className="w-3 h-3" />
                                            COMPLETED
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                            <Clock className="w-3 h-3" />
                                            ONGOING
                                        </span>
                                    )}
                                </div>

                                {/* Location */}
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Location</p>
                                    <p className="text-sm text-slate-800">{task.washroom_name || task.washroom_full_name}</p>
                                </div>

                                {/* Time Info */}
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Time Info</p>
                                    <SmartTimeDisplay task={task} />
                                </div>

                                {/* Scores */}
                                <div className="flex gap-2">
                                    <div className={`flex-1 px-3 py-2 rounded border ${getScoreColor(task.ai_score)}`}>
                                        <p className="text-xs font-medium mb-1">AI Score</p>
                                        <div className="flex items-center gap-1">
                                            <Star className="w-4 h-4" />
                                            <span className="font-bold text-lg">{formatScore(task.ai_score)}</span>
                                        </div>
                                    </div>
                                    <div className={`flex-1 px-3 py-2 rounded border ${getScoreColor(task.final_rating)}`}>
                                        <p className="text-xs font-medium mb-1">Rating</p>
                                        <div className="flex items-center gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            <span className="font-bold text-lg">{formatScore(task.final_rating)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="space-y-2">
                                    {/* Before Images */}
                                    <div>
                                        <p className="text-xs font-medium text-slate-600 mb-1">Before Images</p>
                                        <div className="flex flex-wrap gap-1">
                                            {task.before_photo?.slice(0, 2).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-16 h-16 rounded border-2 border-blue-300 overflow-hidden"
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
                                    </div>

                                    {/* After Images */}
                                    <div>
                                        <p className="text-xs font-medium text-slate-600 mb-1">After Images</p>
                                        <div className="flex flex-wrap gap-1">
                                            {task.after_photo?.slice(0, 2).map((url, idx) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-16 h-16 rounded border-2 border-green-300 overflow-hidden"
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
                                    </div>
                                </div>

                                {/* View All Button */}
                                <button
                                    onClick={() => openImageModal(task.before_photo, task.after_photo)}
                                    disabled={!task.before_photo?.length && !task.after_photo?.length}
                                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Eye className="w-4 h-4" />
                                    View All Images
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No cleaning records found
                        </div>
                    )}
                </div>
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
