"use client";
import React, { useState } from "react";
import {
    User, Star, Clock, CheckCircle, AlertTriangle,
    MapPin, Calendar, TrendingUp, Building,
    ChevronsUpDown, ChevronUp, ChevronDown
} from "lucide-react";
import PhotoModal from "../PhotoModal";

export default function SingleWashroomTable({ data, metadata }) {
    const [selectedPhotos, setSelectedPhotos] = useState(null);
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
        if (!sortConfig.key || !data) return data;

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
                case 'start_time': {
                    const dateA = new Date(a.start_time || 0).getTime();
                    const dateB = new Date(b.start_time || 0).getTime();
                    return (dateA - dateB) * dir;
                }
                case 'end_time': {
                    const dateA = new Date(a.end_time || 0).getTime();
                    const dateB = new Date(b.end_time || 0).getTime();
                    return (dateA - dateB) * dir;
                }
                case 'status': {
                    const statusA = (a.status || '').toLowerCase();
                    const statusB = (b.status || '').toLowerCase();
                    if (statusA < statusB) return -1 * dir;
                    if (statusA > statusB) return 1 * dir;
                    return 0;
                }
                case 'rating': {
                    const ratingA = typeof a.rating === 'number' ? a.rating : parseFloat(a.rating) || 0;
                    const ratingB = typeof b.rating === 'number' ? b.rating : parseFloat(b.rating) || 0;
                    return (ratingA - ratingB) * dir;
                }
                case 'before_images': {
                    return (Number(a.before_image_count) - Number(b.before_image_count)) * dir;
                }
                case 'after_images': {
                    return (Number(a.after_image_count) - Number(b.after_image_count)) * dir;
                }
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const sortedData = getSortedData();

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) {
            return <ChevronsUpDown className="w-3 h-3 text-slate-400 ml-1" />;
        }
        return sortConfig.direction === 'asc' ? (
            <ChevronUp className="w-3 h-3 text-slate-600 ml-1" />
        ) : (
            <ChevronDown className="w-3 h-3 text-slate-600 ml-1" />
        );
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

    const getStatusBadge = (status) => {
        if (status === "completed") {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle className="w-3 h-3" />
                    Completed
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

    return (
        <div className="space-y-6">
            {/* ✅ Header Section with Address & Zone */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <div className="space-y-4">
                    {/* Washroom Name */}
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {metadata?.washroom_name || "Washroom Report"}
                        </h2>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        {/* Zone/Type */}
                        <div className="flex items-start gap-2">
                            <Building className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-500 text-xs">Zone / Type</p>
                                <p className="text-slate-800 font-medium">
                                    {metadata?.washroom_type || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* City & State */}
                        <div className="flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-500 text-xs">Location</p>
                                <p className="text-slate-800 font-medium">
                                    {[metadata?.washroom_city, metadata?.washroom_state]
                                        .filter(Boolean)
                                        .join(', ') || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Address - Full Width */}
                        <div className="md:col-span-2 flex items-start gap-2">
                            <MapPin className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-slate-500 text-xs">Address</p>
                                <p className="text-slate-800 font-medium break-words">
                                    {metadata?.washroom_address || "N/A"}
                                </p>
                            </div>
                        </div>

                        {/* Generated Time */}
                        <div className="md:col-span-2 flex items-start gap-2">
                            <Calendar className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="text-slate-500 text-xs">Report Generated</p>
                                <p className="text-slate-800 font-medium">
                                    {formatDateTime(metadata?.generated_on)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ✅ Performance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Avg Rating */}
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Avg Rating</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                                {metadata?.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"}
                            </p>
                            <p className="text-xs text-blue-600 mt-1">out of 10</p>
                        </div>
                        <Star className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600 font-medium">Status</p>
                        <CheckCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">✓ Completed</span>
                            <span className="font-bold text-green-700">
                                {metadata?.completed || 0}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-yellow-700">⏳ Ongoing</span>
                            <span className="font-bold text-yellow-700">
                                {metadata?.ongoing || 0}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Avg Images */}
                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Images</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {metadata?.avg_images_uploaded ? metadata.avg_images_uploaded.toFixed(1) : "N/A"}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">per cleaning</p>
                        </div>
                        <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                {/* Avg Duration */}
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Avg Duration</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {metadata?.avg_cleaning_duration || 0}
                            </p>
                            <p className="text-xs text-green-600 mt-1">minutes</p>
                        </div>
                        <Clock className="w-8 h-8 text-green-400" />
                    </div>
                </div>
            </div>

            {/* ✅ Score Trend Chart */}
            {metadata?.score_trend_last_7_days && metadata.score_trend_last_7_days.length > 0 && (
                <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                        Score Trend (Last 7 Days)
                    </h3>
                    <div className="flex items-end justify-around gap-2 h-48">
                        {metadata.score_trend_last_7_days.map((trend, idx) => {
                            const height = (trend.score / 10) * 100;
                            return (
                                <div key={idx} className="flex flex-col items-center flex-1 max-w-[80px]">
                                    <div className="relative w-full bg-blue-100 rounded-t"
                                        style={{ height: `${height}%`, minHeight: '20px' }}>
                                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-blue-300 rounded-t flex items-start justify-center pt-1">
                                            <span className="text-xs font-bold text-white">
                                                {trend.score}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-600 mt-2 text-center">
                                        {new Date(trend.date).toLocaleDateString('en-IN', {
                                            day: '2-digit',
                                            month: 'short'
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ✅ Cleaning Records Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">
                        Cleaning Records
                    </h3>
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                {/* Sortable: Cleaner */}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('cleaner_name')}
                                        className="flex items-center gap-1 hover:text-slate-900"
                                    >
                                        <span>Cleaner</span>
                                        <SortIcon columnKey="cleaner_name" />
                                    </button>
                                </th>

                                {/* Sortable: Start Time */}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('start_time')}
                                        className="flex items-center gap-1 hover:text-slate-900"
                                    >
                                        <span>Start Time</span>
                                        <SortIcon columnKey="start_time" />
                                    </button>
                                </th>

                                {/* Sortable: End Time */}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('end_time')}
                                        className="flex items-center gap-1 hover:text-slate-900"
                                    >
                                        <span>End Time</span>
                                        <SortIcon columnKey="end_time" />
                                    </button>
                                </th>

                                {/* Sortable: Status */}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('status')}
                                        className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                                    >
                                        <span>Status</span>
                                        <SortIcon columnKey="status" />
                                    </button>
                                </th>

                                {/* Sortable: Rating */}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('rating')}
                                        className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                                    >
                                        <span>Rating</span>
                                        <SortIcon columnKey="rating" />
                                    </button>
                                </th>

                                {/* Sortable: Before Images */}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('before_images')}
                                        className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                                    >
                                        <span>Before</span>
                                        <SortIcon columnKey="before_images" />
                                    </button>
                                </th>

                                {/* Sortable: After Images */}
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    <button
                                        type="button"
                                        onClick={() => handleSort('after_images')}
                                        className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                                    >
                                        <span>After</span>
                                        <SortIcon columnKey="after_images" />
                                    </button>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {sortedData && sortedData.length > 0 ? (
                                sortedData.map((cleaning) => (
                                    <tr key={cleaning.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-slate-800">{cleaning.cleaner_name}</p>
                                                    {cleaning.cleaner_phone && (
                                                        <p className="text-xs text-slate-500">{cleaning.cleaner_phone}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {formatDateTime(cleaning.start_time)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {formatDateTime(cleaning.end_time)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(cleaning.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <div className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded border border-yellow-200">
                                                <Star className="w-3 h-3" />
                                                <span className="font-semibold text-sm">
                                                    {cleaning?.rating ? (typeof cleaning.rating === 'number' ? cleaning.rating.toFixed(1) : cleaning.rating) : "N/A"}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-slate-700">
                                                {cleaning.before_image_count || 0}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-sm font-medium text-slate-700">
                                                {cleaning.after_image_count || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                        No cleaning records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-200">
                    {sortedData && sortedData.length > 0 ? (
                        sortedData.map((cleaning) => (
                            <div key={cleaning.id} className="p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{cleaning.cleaner_name}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(cleaning.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-slate-500">Start:</p>
                                        <p className="font-medium">{formatDateTime(cleaning.start_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">End:</p>
                                        <p className="font-medium">{formatDateTime(cleaning.end_time)}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Rating:</p>
                                        <p className="font-medium">
                                            {cleaning?.rating ? (typeof cleaning.rating === 'number' ? cleaning.rating.toFixed(1) : cleaning.rating) : "N/A"} ⭐
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Images:</p>
                                        <p className="font-medium">
                                            {cleaning.before_image_count || 0} + {cleaning.after_image_count || 0}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No cleaning records found
                        </div>
                    )}
                </div>
            </div>

            {selectedPhotos && (
                <PhotoModal
                    photos={selectedPhotos}
                    onClose={() => setSelectedPhotos(null)}
                />
            )}
        </div>
    );
}
