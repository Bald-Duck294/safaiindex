"use client";

import { useState, useEffect } from "react";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
    Search,
    Filter,
    Edit2,
    Save,
    X,
    Eye,
    Image as ImageIcon,
    Shield,
    CheckCircle,
    Clock,
    AlertCircle,
    Calendar,
    ZoomIn,
    ZoomOut,
    ChevronLeft,
    ChevronRight,
    Maximize2
} from "lucide-react";

// Helper to get score color
const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-orange-500";
    return "text-red-500";
};

// Photo Modal Component

const PhotoModal = ({ photos, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Minimum swipe distance (in px)
    const minSwipeDistance = 50;

    if (!photos || ((!photos.before || photos.before.length === 0) && (!photos.after || photos.after.length === 0))) {
        return null;
    }

    // Combine all photos with labels
    const allPhotos = [
        ...(photos.before || []).map(url => ({ url, label: 'Before', color: 'blue' })),
        ...(photos.after || []).map(url => ({ url, label: 'After', color: 'green' }))
    ];

    const currentPhoto = allPhotos[currentIndex];

    // Navigation handlers
    const goToNext = () => {
        if (currentIndex < allPhotos.length - 1) {
            setCurrentIndex(currentIndex + 1);
            resetZoom();
        }
    };

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            resetZoom();
        }
    };

    // Touch handlers for swipe gestures
    const onTouchStart = (e) => {
        if (zoomLevel === 1) { // Only allow swipe when not zoomed
            setTouchEnd(null);
            setTouchStart(e.targetTouches[0].clientX);
        }
    };

    const onTouchMove = (e) => {
        if (zoomLevel === 1) {
            setTouchEnd(e.targetTouches[0].clientX);
        }
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || zoomLevel > 1) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            goToNext();
        } else if (isRightSwipe) {
            goToPrevious();
        }
    };

    // Zoom handlers
    const handleZoomIn = () => {
        setZoomLevel(prev => Math.min(prev + 0.5, 3));
    };

    const handleZoomOut = () => {
        if (zoomLevel > 1) {
            setZoomLevel(prev => Math.max(prev - 0.5, 1));
        } else {
            resetZoom();
        }
    };

    const resetZoom = () => {
        setZoomLevel(1);
        setPosition({ x: 0, y: 0 });
    };

    // Mouse drag handlers for panning
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setDragStart({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && zoomLevel > 1) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
        switch (e.key) {
            case 'ArrowLeft':
                goToPrevious();
                break;
            case 'ArrowRight':
                goToNext();
                break;
            case '+':
            case '=':
                handleZoomIn();
                break;
            case '-':
            case '_':
                handleZoomOut();
                break;
            case 'Escape':
                onClose();
                break;
            default:
                break;
        }
    };

    // Wheel zoom
    const handleWheel = (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            handleZoomIn();
        } else {
            handleZoomOut();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute cursor-pointer top-4 right-4 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-2 shadow-lg z-20 transition-all hover:scale-110"
                title="Close (Esc)"
            >
                <X size={24} />
            </button>

            {/* Image Counter */}
            <div className="absolute top-4 left-4 text-white bg-black bg-opacity-50 px-4 py-2 rounded-full text-sm font-medium z-20">
                {currentIndex + 1} / {allPhotos.length}
            </div>

            {/* Main Image Container with Touch Support */}
            <div
                className="relative w-full h-full flex items-center justify-center overflow-hidden pb-24"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
            >
                <img
                    src={currentPhoto.url}
                    alt={`${currentPhoto.label} ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain select-none transition-transform duration-200"
                    style={{
                        transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                        transformOrigin: 'center center'
                    }}
                    onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" fill="white"%3EImage not found%3C/text%3E%3C/svg%3E';
                    }}
                    draggable={false}
                />

                {/* Image Label Badge */}
                <div
                    className={`absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full text-white font-semibold text-lg shadow-lg ${currentPhoto.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                        }`}
                >
                    {currentPhoto.label}
                </div>
            </div>

            {/* Navigation Buttons - Hidden on Mobile/Touch Devices */}
            {currentIndex > 0 && (
                <button
                    onClick={goToPrevious}
                    className="absolute cursor-pointer left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
                    title="Previous (←)"
                >
                    <ChevronLeft size={32} />
                </button>
            )}

            {currentIndex < allPhotos.length - 1 && (
                <button
                    onClick={goToNext}
                    className="absolute cursor-pointer right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 bg-black bg-opacity-50 rounded-full p-3 shadow-lg transition-all hover:scale-110 z-20 hidden md:block"
                    title="Next (→)"
                >
                    <ChevronRight size={32} />
                </button>
            )}

            {/* Zoom Controls - Top Right Position to Avoid Overlap */}
            <div className="absolute right-4 top-20 flex flex-col items-center gap-3 bg-black bg-opacity-50 rounded-full px-3 py-4 z-20">
                <button
                    onClick={handleZoomIn}
                    disabled={zoomLevel >= 3}
                    className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Zoom In (+)"
                >
                    <ZoomIn size={22} />
                </button>

                <span className="text-white font-medium text-sm py-1">
                    {Math.round(zoomLevel * 100)}%
                </span>

                <button
                    onClick={handleZoomOut}
                    disabled={zoomLevel <= 1}
                    className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Zoom Out (-)"
                >
                    <ZoomOut size={22} />
                </button>

                <div className="w-6 h-px bg-gray-600 my-1"></div>

                <button
                    onClick={resetZoom}
                    disabled={zoomLevel === 1}
                    className="text-white cursor-pointer hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:scale-110"
                    title="Reset Zoom"
                >
                    <Maximize2 size={20} />
                </button>
            </div>

            {/* Swipe Indicator for Mobile - Optional */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-xs bg-black bg-opacity-50 px-3 py-1 rounded-full md:hidden">
                Swipe left/right to navigate
            </div>

            {/* Thumbnail Strip - Compact Single Row at Bottom */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 bg-black bg-opacity-60 rounded-lg p-2 max-w-[95vw] overflow-x-auto z-20 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
                {allPhotos.map((photo, idx) => (
                    <button
                        key={idx}
                        onClick={() => {
                            setCurrentIndex(idx);
                            resetZoom();
                        }}
                        className={`relative cursor-pointer flex-shrink-0 w-14 h-14 rounded overflow-hidden border-2 transition-all ${idx === currentIndex
                                ? photo.color === 'blue'
                                    ? 'border-blue-500 ring-2 ring-blue-400'
                                    : 'border-green-500 ring-2 ring-green-400'
                                : 'border-gray-600 hover:border-gray-400'
                            }`}
                    >
                        <img
                            src={photo.url}
                            alt={`Thumbnail ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.target.style.display = 'none')}
                        />
                        <span
                            className={`absolute top-0.5 left-0.5 ${photo.color === 'blue' ? 'bg-blue-500' : 'bg-green-500'
                                } text-white px-1.5 py-0.5 text-[10px] font-bold rounded`}
                        >
                            {photo.label[0]}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};


// Editable Score Cell Component
const EditableScoreCell = ({ review, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [score, setScore] = useState(review.score || 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (score < 0 || score > 10) {
            toast.error("Score must be between 0 and 10");
            return;
        }

        setIsSaving(true);
        const result = await CleanerReviewApi.updateReviewScore(review.id, score);

        if (result.success) {
            toast.success("Score updated successfully!");
            onSave(review.id, score);
            setIsEditing(false);
        } else {
            toast.error(result.error || "Failed to update score");
        }
        setIsSaving(false);
    };

    const handleCancel = () => {
        setScore(review.score || 0);
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    autoFocus
                />
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="cursor-pointer p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    title="Save"
                >
                    <Save size={16} />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="cursor-pointer p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                    title="Cancel"
                >
                    <X size={16} />
                </button>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <span className={`font-semibold ${getScoreColor(review.score)}`}>
                {review.score?.toFixed(1) || "N/A"}
            </span>
            <button
                onClick={() => setIsEditing(true)}
                className="cursor-pointer p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                title="Edit Score"
            >
                <Edit2 size={14} />
            </button>
        </div>
    );
};

export default function ScoreManagement() {
    const router = useRouter();
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modifiedFilter, setModifiedFilter] = useState("all");
    const [scoreFilter, setScoreFilter] = useState("all");
    const [selectedPhotos, setSelectedPhotos] = useState(null);

    // ✅ NEW: Company and Date filters
    const [companyFilter, setCompanyFilter] = useState("24"); // Default company_id
    const [dateFilter, setDateFilter] = useState(() => {
        const today = new Date();
        return today.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    });

    useEffect(() => {
        fetchReviews();
    }, [companyFilter, dateFilter]); // ✅ Refetch when company or date changes

    useEffect(() => {
        filterReviews();
    }, [reviews, searchTerm, statusFilter, modifiedFilter, scoreFilter]);

    const fetchReviews = async () => {
        setIsLoading(true);

        // ✅ Pass company_id and date to API
        const params = {
            date: dateFilter || null,
        };

        const response = await CleanerReviewApi.getAllCleanerReviews(params, companyFilter);

        if (response.success) {
            setReviews(response.data);
        } else {
            toast.error("Failed to load reviews");
        }
        setIsLoading(false);
    };

    const filterReviews = () => {
        let filtered = [...reviews];

        // Search filter (cleaner name or location)
        if (searchTerm) {
            filtered = filtered.filter(
                (r) =>
                    r.cleaner_user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    r.location?.name?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Status filter
        if (statusFilter !== "all") {
            filtered = filtered.filter((r) => r.status === statusFilter);
        }

        // Modified flag filter
        if (modifiedFilter === "modified") {
            filtered = filtered.filter((r) => r.is_modified === true);
        } else if (modifiedFilter === "unmodified") {
            filtered = filtered.filter((r) => r.is_modified === false);
        }

        // Score range filter
        if (scoreFilter === "high") {
            filtered = filtered.filter((r) => r.score >= 8);
        } else if (scoreFilter === "medium") {
            filtered = filtered.filter((r) => r.score >= 5 && r.score < 8);
        } else if (scoreFilter === "low") {
            filtered = filtered.filter((r) => r.score < 5);
        }

        setFilteredReviews(filtered);
    };

    const handleScoreUpdate = (reviewId, newScore) => {
        setReviews((prev) =>
            prev.map((r) =>
                r.id === reviewId
                    ? {
                        ...r,
                        original_score: r.original_score || r.score,
                        score: newScore,
                        is_modified: true,
                    }
                    : r
            )
        );
    };

    const openPhotoModal = (review) => {
        setSelectedPhotos({
            before: review.before_photo || [],
            after: review.after_photo || [],
        });
    };

    return (
        <>
            <Toaster position="top-center" />

            <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                            <div className="flex items-center gap-3">
                                <Shield className="w-8 h-8 text-indigo-600" />
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
                                    Score Management
                                </h1>
                            </div>
                            {/* <span className="text-sm text-slate-500 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200">
                                Superadmin Only
                            </span> */}
                        </div>

                        {/* Search & Filters */}
                        <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Search by cleaner name or location..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            {/* ✅ NEW: Company and Date Filters Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="relative">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Company
                                    </label>
                                    <select
                                        value={companyFilter}
                                        onChange={(e) => setCompanyFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    >
                                        <option value="24">Nagpur Municipal Corporation Pilot</option>
                                        {/* Add more companies dynamically if needed */}
                                    </select>
                                </div>

                                <div className="relative">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Date
                                    </label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                                        <input
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="ongoing">Ongoing</option>
                                </select>

                                <select
                                    value={modifiedFilter}
                                    onChange={(e) => setModifiedFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                    <option value="all">All Scores</option>
                                    <option value="modified">Modified Only</option>
                                    <option value="unmodified">Original Only</option>
                                </select>

                                <select
                                    value={scoreFilter}
                                    onChange={(e) => setScoreFilter(e.target.value)}
                                    className="px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                >
                                    <option value="all">All Scores</option>
                                    <option value="high">High (8-10)</option>
                                    <option value="medium">Medium (5-7)</option>
                                    <option value="low">Low (0-4)</option>
                                </select>

                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                        setModifiedFilter("all");
                                        setScoreFilter("all");
                                        const today = new Date();
                                        setDateFilter(today.toISOString().split('T')[0]);
                                    }}
                                    className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
                                >
                                    Reset Filters
                                </button>

                                <button
                                    onClick={fetchReviews}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Apply Filters
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Table - Desktop View */}
                    <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Cleaner
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Photos
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Score
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Modified
                                        </th>
                                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                                            Date
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                                Loading reviews...
                                            </td>
                                        </tr>
                                    ) : filteredReviews.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                                                No reviews found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredReviews.map((review) => (
                                            <tr key={review.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="text-sm font-medium text-slate-800">
                                                        {review.cleaner_user?.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-sm text-slate-600">
                                                        {review.location?.name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center gap-1">
                                                        {review.before_photo?.[0] && (
                                                            <img
                                                                src={review.before_photo[0]}
                                                                alt="Before"
                                                                className="w-10 h-10 object-cover rounded border border-blue-300 cursor-pointer hover:scale-110 transition-transform"
                                                                onClick={() => openPhotoModal(review)}
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        )}
                                                        {review.after_photo?.[0] && (
                                                            <img
                                                                src={review.after_photo[0]}
                                                                alt="After"
                                                                className="w-10 h-10 object-cover rounded border border-green-300 cursor-pointer hover:scale-110 transition-transform"
                                                                onClick={() => openPhotoModal(review)}
                                                                onError={(e) => (e.target.style.display = "none")}
                                                            />
                                                        )}
                                                        {(!review.before_photo?.[0] && !review.after_photo?.[0]) && (
                                                            <ImageIcon size={16} className="text-slate-300" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <EditableScoreCell review={review} onSave={handleScoreUpdate} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        <span
                                                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${review.status === "completed"
                                                                ? "bg-emerald-100 text-emerald-700"
                                                                : "bg-amber-100 text-amber-700"
                                                                }`}
                                                        >
                                                            {review.status === "completed" ? (
                                                                <CheckCircle size={12} />
                                                            ) : (
                                                                <Clock size={12} />
                                                            )}
                                                            {review.status}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex justify-center">
                                                        {/* ✅ FIXED: Show AlertCircle if NOT modified, CheckCircle if modified */}
                                                        {!review.is_modified ? (
                                                            <AlertCircle size={18} className="text-orange-500" title="Original Score (Not Modified)" />
                                                        ) : (
                                                            <CheckCircle size={18} className="text-green-500" title="Score Modified" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs text-slate-600">
                                                        {new Date(review.updated_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Card View - Mobile/Tablet */}
                    <div className="lg:hidden space-y-4">
                        {isLoading ? (
                            <div className="text-center py-8 text-slate-500">Loading reviews...</div>
                        ) : filteredReviews.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">No reviews found</div>
                        ) : (
                            filteredReviews.map((review) => (
                                <div key={review.id} className="bg-white rounded-lg shadow-sm border p-4">
                                    {/* Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-slate-800">
                                                {review.cleaner_user?.name || "N/A"}
                                            </h3>
                                            <p className="text-sm text-slate-600">{review.location?.name || "N/A"}</p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${review.status === "completed"
                                                ? "bg-emerald-100 text-emerald-700"
                                                : "bg-amber-100 text-amber-700"
                                                }`}
                                        >
                                            {review.status === "completed" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                            {review.status}
                                        </span>
                                    </div>

                                    {/* Photos */}
                                    {(review.before_photo?.[0] || review.after_photo?.[0]) && (
                                        <div className="flex gap-2 mb-3">
                                            {review.before_photo?.[0] && (
                                                <img
                                                    src={review.before_photo[0]}
                                                    alt="Before"
                                                    className="w-16 h-16 object-cover rounded border-2 border-blue-300 cursor-pointer"
                                                    onClick={() => openPhotoModal(review)}
                                                    onError={(e) => (e.target.style.display = "none")}
                                                />
                                            )}
                                            {review.after_photo?.[0] && (
                                                <img
                                                    src={review.after_photo[0]}
                                                    alt="After"
                                                    className="w-16 h-16 object-cover rounded border-2 border-green-300 cursor-pointer"
                                                    onClick={() => openPhotoModal(review)}
                                                    onError={(e) => (e.target.style.display = "none")}
                                                />
                                            )}
                                        </div>
                                    )}

                                    {/* Score & Flag */}
                                    <div className="flex items-center justify-between pt-3 border-t">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Score:</span>
                                            <EditableScoreCell review={review} onSave={handleScoreUpdate} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {/* ✅ FIXED: Show AlertCircle if NOT modified, CheckCircle if modified */}
                                            {!review.is_modified ? (
                                                <>
                                                    <AlertCircle size={16} className="text-orange-500" />
                                                    <span className="text-xs text-orange-600">Original</span>
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle size={16} className="text-green-500" />
                                                    <span className="text-xs text-green-600">Modified</span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div className="text-xs text-slate-500 mt-2">
                                        Updated: {new Date(review.updated_at).toLocaleDateString()}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            {selectedPhotos && (
                <PhotoModal photos={selectedPhotos} onClose={() => setSelectedPhotos(null)} />
            )}
        </>
    );
}
