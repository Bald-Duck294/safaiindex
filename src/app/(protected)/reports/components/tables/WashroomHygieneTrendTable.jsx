"use client";

import React, { useRef, useState, useEffect } from "react";
import { MapPin, Star, Calendar, Award, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function WashroomHygieneTrendTable({ data, metadata }) {
    // ✅ Scroll state management
    const tableContainerRef = useRef(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [maxScroll, setMaxScroll] = useState(0);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // ✅ NEW: Sort state management
    const [sortConfig, setSortConfig] = useState({
        key: null,
        direction: 'asc',
    });

    const formatScore = (score) => {
        if (!score && score !== 0) return "-";
        return typeof score === "number" ? score.toFixed(1) : score;
    };

    const getScoreColor = (score) => {
        if (!score) return "bg-slate-100 text-slate-500";
        if (score >= 9) return "bg-green-200 text-green-900 font-semibold";
        if (score >= 8) return "bg-green-100 text-green-800";
        if (score >= 7) return "bg-yellow-100 text-yellow-800";
        if (score >= 6) return "bg-orange-100 text-orange-800";
        return "bg-red-100 text-red-800 font-semibold";
    };

    // ✅ NEW: Sort handler
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

    // ✅ NEW: Get sorted data
    const getSortedData = () => {
        if (!data || !sortConfig.key) return data;

        const sorted = [...data];

        sorted.sort((a, b) => {
            const dir = sortConfig.direction === 'asc' ? 1 : -1;

            switch (sortConfig.key) {
                case 'washroom_name': {
                    const nameA = (a.washroom_name || '').toLowerCase();
                    const nameB = (b.washroom_name || '').toLowerCase();
                    if (nameA < nameB) return -1 * dir;
                    if (nameA > nameB) return 1 * dir;
                    return 0;
                }
                case 'zone_type': {
                    const zoneA = (a.zone_type || '').toLowerCase();
                    const zoneB = (b.zone_type || '').toLowerCase();
                    if (zoneA < zoneB) return -1 * dir;
                    if (zoneA > zoneB) return 1 * dir;
                    return 0;
                }
                case 'city': {
                    const cityA = (a.city || '').toLowerCase();
                    const cityB = (b.city || '').toLowerCase();
                    if (cityA < cityB) return -1 * dir;
                    if (cityA > cityB) return 1 * dir;
                    return 0;
                }
                case 'average_score': {
                    const scoreA = Number(a.average_score) || 0;
                    const scoreB = Number(b.average_score) || 0;
                    return (scoreA - scoreB) * dir;
                }
                default:
                    return 0;
            }
        });

        return sorted;
    };

    const sortedData = getSortedData();

    // ✅ Update scroll state
    const updateScrollState = () => {
        if (tableContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tableContainerRef.current;
            setScrollPosition(scrollLeft);
            setMaxScroll(scrollWidth - clientWidth);
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    // ✅ Setup scroll listener
    useEffect(() => {
        updateScrollState();
        window.addEventListener("resize", updateScrollState);
        return () => window.removeEventListener("resize", updateScrollState);
    }, [data]);

    // ✅ Scroll functions
    const scrollTo = (direction) => {
        if (tableContainerRef.current) {
            const scrollAmount = direction === "left" ? -300 : 300;
            tableContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
    };

    const scrollToEnd = (direction) => {
        if (tableContainerRef.current) {
            const scrollTo = direction === "start" ? 0 : tableContainerRef.current.scrollWidth;
            tableContainerRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Washrooms</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                                {metadata?.total_washrooms || 0}
                            </p>
                        </div>
                        <MapPin className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Date Range</p>
                            <p className="text-lg font-bold text-purple-900 mt-1">
                                {metadata?.total_days || 0} Days
                            </p>
                        </div>
                        <Calendar className="w-8 h-8 text-purple-400" />
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Overall Avg Score</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {formatScore(metadata?.overall_avg_score)}
                            </p>
                        </div>
                        <Star className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-amber-600 font-medium">Top Performer</p>
                            <p className="text-sm font-bold text-amber-900 mt-1 truncate">
                                {sortedData?.length > 0
                                    ? [...sortedData].sort((a, b) => b.average_score - a.average_score)[0]?.washroom_name?.substring(0, 20)
                                    : "N/A"}
                            </p>
                        </div>
                        <Award className="w-8 h-8 text-amber-400" />
                    </div>
                </div>
            </div>

            {/* ✅ Desktop Table with Scroll Controls */}
            <div className="hidden lg:block">
                {/* ✅ Scroll Hint Banner */}
                {canScrollRight && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="animate-bounce">
                                <ChevronRight className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-sm text-blue-700 font-medium">
                                💡 Scroll horizontally to view all dates
                            </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-blue-600">
                            <kbd className="px-2 py-1 bg-white rounded border border-blue-300">Shift + Scroll</kbd>
                            <span>or use buttons below</span>
                        </div>
                    </div>
                )}

                {/* ✅ Scroll Control Buttons & Progress Bar */}
                <div className="flex items-center justify-between mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scrollToEnd("start")}
                            disabled={!canScrollLeft}
                            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Scroll to start"
                        >
                            <ChevronsLeft className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                            onClick={() => scrollTo("left")}
                            disabled={!canScrollLeft}
                            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Scroll left"
                        >
                            <ChevronLeft className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>

                    {/* ✅ Scroll Progress Bar */}
                    <div className="flex-1 mx-4">
                        <div className="relative h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className="absolute h-full bg-blue-500 rounded-full transition-all duration-300"
                                style={{
                                    width: maxScroll > 0 ? `${((scrollPosition / maxScroll) * 100)}%` : "100%"
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs text-slate-500 mt-1">
                            <span>Start</span>
                            <span className="font-medium text-blue-600">
                                {maxScroll > 0 ? Math.round((scrollPosition / maxScroll) * 100) : 100}%
                            </span>
                            <span>End</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => scrollTo("right")}
                            disabled={!canScrollRight}
                            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Scroll right"
                        >
                            <ChevronRight className="w-4 h-4 text-slate-600" />
                        </button>
                        <button
                            onClick={() => scrollToEnd("end")}
                            disabled={!canScrollRight}
                            className="p-2 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Scroll to end"
                        >
                            <ChevronsRight className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                </div>

                {/* ✅ Table with sorting */}
                <div
                    ref={tableContainerRef}
                    onScroll={updateScrollState}
                    className="overflow-x-auto rounded-lg border border-slate-200 bg-white scroll-smooth"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#cbd5e1 #f1f5f9"
                    }}
                >
                    {/* ✅ Custom Scrollbar Styles */}
                    <style jsx>{`
                        div::-webkit-scrollbar {
                            height: 12px;
                        }
                        div::-webkit-scrollbar-track {
                            background: #f1f5f9;
                            border-radius: 10px;
                        }
                        div::-webkit-scrollbar-thumb {
                            background: #cbd5e1;
                            border-radius: 10px;
                            border: 2px solid #f1f5f9;
                        }
                        div::-webkit-scrollbar-thumb:hover {
                            background: #94a3b8;
                        }
                    `}</style>

                    <table className="w-full">
                        <thead className="bg-slate-100 border-b border-slate-200 sticky top-0 z-10">
                            <tr>
                                {/* Non-sortable: Sr No */}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-0 bg-slate-100 shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                    Sr No
                                </th>

                                {/* Sortable: Washroom */}
                                <th
                                    onClick={() => handleSort('washroom_name')}
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase sticky left-[60px] bg-slate-100 min-w-[200px] shadow-[2px_0_5px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-200"
                                >
                                    Washroom {sortConfig.key === 'washroom_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>

                                {/* Sortable: Zone */}
                                <th
                                    onClick={() => handleSort('zone_type')}
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-200"
                                >
                                    Zone {sortConfig.key === 'zone_type' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>

                                {/* Non-sortable: Cleaners */}
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Cleaners
                                </th>

                                {metadata?.date_columns?.map((date, idx) => (
                                    <th key={idx} className="px-3 py-3 text-center text-xs font-semibold text-slate-600 uppercase min-w-[80px]">
                                        {date}
                                    </th>
                                ))}

                                {/* Sortable: Average */}
                                <th
                                    onClick={() => handleSort('average_score')}
                                    className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase sticky right-0 bg-slate-100 shadow-[-2px_0_5px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-200"
                                >
                                    Average {sortConfig.key === 'average_score' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedData?.map((washroom, index) => (
                                <tr key={washroom.washroom_id} className="hover:bg-slate-50 border-b border-slate-100">
                                    {/* ✅ UPDATED: Use index from sorted data */}
                                    <td className="px-4 py-3 sticky left-0 bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">{index + 1}</td>
                                    <td className="px-4 py-3 sticky left-[60px] bg-white shadow-[2px_0_5px_rgba(0,0,0,0.03)]">
                                        <p className="font-medium text-sm">{washroom.washroom_name}</p>
                                        <p className="text-xs text-slate-500">{washroom.city}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">{washroom.zone_type}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {washroom.assigned_cleaners?.slice(0, 2).map((c, i) => <div key={i}>• {c}</div>)}
                                        {washroom.assigned_cleaners?.length > 2 && (
                                            <span className="text-blue-600">+{washroom.assigned_cleaners.length - 2} more</span>
                                        )}
                                    </td>

                                    {metadata?.date_columns?.map((_, idx) => {
                                        const dateKey = Object.keys(washroom.daily_scores)[idx];
                                        const score = washroom.daily_scores[dateKey];
                                        return (
                                            <td key={idx} className={`px-3 py-3 text-center text-sm ${getScoreColor(score)}`}>
                                                {formatScore(score)}
                                            </td>
                                        );
                                    })}

                                    <td className={`px-4 py-3 text-center font-bold sticky right-0 bg-white shadow-[-2px_0_5px_rgba(0,0,0,0.03)] ${getScoreColor(washroom.average_score)}`}>
                                        {formatScore(washroom.average_score)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile View */}
            <div className="lg:hidden space-y-4">
                {sortedData?.map((washroom) => (
                    <div key={washroom.washroom_id} className="bg-white rounded-lg border p-4">
                        <div className="flex justify-between mb-2">
                            <div>
                                <p className="font-semibold">{washroom.washroom_name}</p>
                                <p className="text-xs text-slate-500">{washroom.city}</p>
                            </div>
                            <div className={`px-3 py-1 rounded ${getScoreColor(washroom.average_score)}`}>
                                <p className="text-xs">Avg</p>
                                <p className="font-bold">{formatScore(washroom.average_score)}</p>
                            </div>
                        </div>

                        {/* ✅ Mobile Scroll Hint */}
                        <div className="bg-blue-50 rounded p-2 mb-2 flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-blue-600 animate-bounce" />
                            <p className="text-xs text-blue-700">Swipe to see all dates →</p>
                        </div>

                        <div className="overflow-x-auto">
                            <div className="flex gap-2">
                                {metadata?.date_columns?.map((date, idx) => {
                                    const score = Object.values(washroom.daily_scores)[idx];
                                    return (
                                        <div key={idx} className="flex flex-col items-center min-w-[60px]">
                                            <p className="text-xs text-slate-500">{date}</p>
                                            <div className={`px-2 py-1 rounded text-xs ${getScoreColor(score)}`}>
                                                {formatScore(score)}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
