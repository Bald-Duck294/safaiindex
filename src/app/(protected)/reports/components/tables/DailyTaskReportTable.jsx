"use client";

import React, { useState } from "react";
import {
    User,
    MapPin,
    Clock,
    Star,
    CheckCircle2,
    AlertCircle,
    TrendingUp,
    ListChecks,
    Activity,
    AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";

/**
 * Reusable component to display formatted date and time
 */
const DateTimeDisplay = ({ date }) => {
    if (!date) {
        return <span className="text-slate-500">Ongoing</span>;
    }

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

/**
 * ✅ NEW: Format duration in human-readable format
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

/**
 * ✅ NEW: Calculate task status and duration
 */
const getTaskInfo = (task) => {
    const startTime = new Date(task.task_start_time);
    const endTime = task.task_end_time ? new Date(task.task_end_time) : new Date();

    // Calculate duration in minutes
    const durationMs = endTime - startTime;
    const durationMinutes = Math.floor(durationMs / (1000 * 60));
    const durationHours = durationMinutes / 60;

    // ✅ Check if task is overdue (ongoing for more than 36 hours)
    if (task.status === 'ongoing' && durationHours > 36) {
        return {
            status: 'overdue',
            duration: durationMinutes,
            durationDisplay: `${Math.floor(durationHours)} hrs`,
            isOverdue: true
        };
    }

    // ✅ Check if task is taking too long (incomplete, between 2-36 hours)
    if (task.status === 'ongoing' && durationHours >= 2 && durationHours <= 36) {
        return {
            status: 'incomplete',
            duration: durationMinutes,
            durationDisplay: formatDuration(durationMinutes),
            isIncomplete: true
        };
    }

    // Normal task
    return {
        status: task.status,
        duration: durationMinutes,
        durationDisplay: formatDuration(durationMinutes),
        isOverdue: false,
        isIncomplete: false
    };
};

export default function DailyCleaningReportTable({ data, metadata }) {
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc',
    });

    const handleSort = (key) => {
        setSortConfig((prev) => {
            if (prev.key === key) {
                return {
                    key,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortedData = () => {
        if (!data || !sortConfig.key) return data;

        const sorted = [...data];

        sorted.sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;

            switch (sortConfig.key) {
                case 'cleaner_name': {
                    const nameA = (a.cleaner_name || '').toLowerCase();
                    const nameB = (b.cleaner_name || '').toLowerCase();
                    if (nameA < nameB) return -1 * dir;
                    if (nameA > nameB) return 1 * dir;
                    return 0;
                }
                case 'washroom': {
                    const washroomA = (a.washroom_full_name || '').toLowerCase();
                    const washroomB = (b.washroom_full_name || '').toLowerCase();
                    if (washroomA < washroomB) return -1 * dir;
                    if (washroomA > washroomB) return 1 * dir;
                    return 0;
                }
                case 'start_time': {
                    const dateA = new Date(a.task_start_time || 0).getTime();
                    const dateB = new Date(b.task_start_time || 0).getTime();
                    return (dateA - dateB) * dir;
                }
                case 'end_time': {
                    const dateA = new Date(a.task_end_time || 0).getTime();
                    const dateB = new Date(b.task_end_time || 0).getTime();
                    return (dateA - dateB) * dir;
                }
                case 'duration': {
                    const taskInfoA = getTaskInfo(a);
                    const taskInfoB = getTaskInfo(b);
                    return (taskInfoA.duration - taskInfoB.duration) * dir;
                }
                case 'ai_score': {
                    const scoreA = Number(a.ai_score) || 0;
                    const scoreB = Number(b.ai_score) || 0;
                    return (scoreA - scoreB) * dir;
                }
                case 'avg_rating': {
                    const ratingA = Number(a.washroom_avg_rating) || 0;
                    const ratingB = Number(b.washroom_avg_rating) || 0;
                    return (ratingA - ratingB) * dir;
                }
                case 'status': {
                    const taskInfoA = getTaskInfo(a);
                    const taskInfoB = getTaskInfo(b);
                    const statusA = taskInfoA.status.toLowerCase();
                    const statusB = taskInfoB.status.toLowerCase();
                    if (statusA < statusB) return -1 * dir;
                    if (statusA > statusB) return 1 * dir;
                    return 0;
                }
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const sortedData = getSortedData();

    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600 bg-green-50";
        if (score >= 6) return "text-yellow-600 bg-yellow-50";
        if (score >= 4) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    const getStatusBadge = (taskInfo) => {
        const statusConfig = {
            completed: {
                bg: "bg-green-100",
                text: "text-green-700",
                icon: CheckCircle2,
                label: "Completed"
            },
            ongoing: {
                bg: "bg-blue-100",
                text: "text-blue-700",
                icon: AlertCircle,
                label: "Ongoing"
            },
            incomplete: {
                bg: "bg-orange-100",
                text: "text-orange-700",
                icon: Clock,
                label: "Incomplete"
            },
            overdue: {
                bg: "bg-red-100",
                text: "text-red-700",
                icon: AlertTriangle,
                label: "Overdue"
            },
        };

        const config = statusConfig[taskInfo.status] || statusConfig.ongoing;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Cleanings</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">{metadata?.total_tasks || 0}</p>
                        </div>
                        <ListChecks className="w-8 h-8 text-blue-400" />
                    </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Completed</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">{metadata?.completed_tasks || 0}</p>
                        </div>
                        <CheckCircle2 className="w-8 h-8 text-green-400" />
                    </div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-orange-600 font-medium">Ongoing</p>
                            <p className="text-2xl font-bold text-orange-900 mt-1">{metadata?.ongoing_tasks || 0}</p>
                        </div>
                        <Activity className="w-8 h-8 text-orange-400" />
                    </div>
                </div>
            </div>

            {/* Cleanings Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                Sr. No.
                            </th>

                            {/* Sortable: Cleaner Name */}
                            <th
                                onClick={() => handleSort('cleaner_name')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Cleaner Name {sortConfig.key === 'cleaner_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: Location/Washroom */}
                            <th
                                onClick={() => handleSort('washroom')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Location / Washroom {sortConfig.key === 'washroom' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: Start Time */}
                            <th
                                onClick={() => handleSort('start_time')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Start Time {sortConfig.key === 'start_time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: End Time */}
                            <th
                                onClick={() => handleSort('end_time')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                End Time {sortConfig.key === 'end_time' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: Duration */}
                            <th
                                onClick={() => handleSort('duration')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Duration {sortConfig.key === 'duration' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: AI Score */}
                            <th
                                onClick={() => handleSort('ai_score')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                AI Score {sortConfig.key === 'ai_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: Avg Rating */}
                            <th
                                onClick={() => handleSort('avg_rating')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Avg. Score/Rating {sortConfig.key === 'avg_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>

                            {/* Sortable: Status */}
                            <th
                                onClick={() => handleSort('status')}
                                className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200"
                            >
                                Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {sortedData && sortedData.length > 0 ? (
                            sortedData.map((task, index) => {
                                const taskInfo = getTaskInfo(task);

                                return (
                                    <tr
                                        key={task.task_id}
                                        className={`hover:bg-slate-50 transition-colors ${taskInfo.isOverdue ? 'bg-red-50' :
                                            taskInfo.isIncomplete ? 'bg-orange-50' : ''
                                            }`}
                                    >
                                        <td className="px-4 py-3 font-medium text-slate-700">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <p className="font-medium text-slate-800">{task.cleaner_name}</p>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-700">{task.washroom_full_name}</td>
                                        <td className="px-4 py-3">
                                            <DateTimeDisplay date={task.task_start_time} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <DateTimeDisplay date={task.task_end_time} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {/* ✅ UPDATED: Show formatted duration with warning colors */}
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${taskInfo.isOverdue ? 'bg-red-100 text-red-700' :
                                                taskInfo.isIncomplete ? 'bg-orange-100 text-orange-700' :
                                                    'bg-slate-100 text-slate-700'
                                                }`}>
                                                {taskInfo.isOverdue && <AlertTriangle className="w-3 h-3 mr-1" />}
                                                {taskInfo.durationDisplay}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-sm ${getScoreColor(task.ai_score)}`}>
                                                <Star className="w-3 h-3" />
                                                {task.ai_score?.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-sm ${getScoreColor(task.washroom_avg_rating)}`}>
                                                <TrendingUp className="w-3 h-3" />
                                                {task.washroom_avg_rating.toFixed(1)}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">{getStatusBadge(taskInfo)}</td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="9" className="px-4 py-8 text-center text-slate-500">
                                    No tasks found for the selected filters
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
