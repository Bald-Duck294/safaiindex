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


export default function DailyTaskReportTable({ data, metadata }) {


    const getScoreColor = (score) => {
        if (score >= 8) return "text-green-600 bg-green-50";
        if (score >= 6) return "text-yellow-600 bg-yellow-50";
        if (score >= 4) return "text-orange-600 bg-orange-50";
        return "text-red-600 bg-red-50";
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            completed: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle2 },
            ongoing: { bg: "bg-blue-100", text: "text-blue-700", icon: AlertCircle },
        };
        const config = statusConfig[status] || statusConfig.ongoing;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3 h-3" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* ✅ FIXED: Simplified Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Tasks</p>
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

            {/* Tasks Table */}
            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full">
                    <thead className="bg-slate-100 border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Cleaner Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location / Washroom</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task Start</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task End</th>
                            {/* <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Duration (min)</th> */}
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">AI Score</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Avg. Score/Rating</th>
                            {/* <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th> */}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                        {data && data.length > 0 ? (
                            data.map((task, index) => (
                                <tr key={task.task_id} className="hover:bg-slate-50 transition-colors">
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
                                        {/* ✅ FIXED: Now correctly visible */}
                                        <DateTimeDisplay date={task.task_start_time} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <DateTimeDisplay date={task.task_end_time} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 rounded text-sm font-medium">
                                            {task.duration_minutes} min
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-semibold text-sm ${getScoreColor(task.ai_score)}`}>
                                            <Star className="w-3 h-3" />
                                            {task.ai_score.toFixed(1)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded font-bold text-sm ${getScoreColor(task.final_rating)}`}>
                                            <TrendingUp className="w-3 h-3" />
                                            {task.final_rating.toFixed(1)}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">{getStatusBadge(task.status)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
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
