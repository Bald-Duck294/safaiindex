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
} from "lucide-react";

// Helper to get score color
const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 5) return "text-orange-500";
    return "text-red-500";
};

// Photo Modal Component
const PhotoModal = ({ photos, onClose }) => {
    if (!photos || photos.length === 0) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div className="relative max-w-6xl w-full max-h-[90vh] overflow-auto bg-white rounded-lg p-4 sm:p-6">
                <button
                    onClick={onClose}
                    className="absolute top-2 right-2 text-slate-600 hover:text-slate-800 bg-white rounded-full p-2 shadow-lg z-10"
                >
                    <X size={20} />
                </button>

                <h3 className="text-lg font-semibold mb-4">Review Photos</h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                    {photos.before?.map((url, idx) => (
                        <div key={`before-${idx}`} className="relative group">
                            <img
                                src={url}
                                alt={`Before ${idx + 1}`}
                                className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-blue-300"
                                onError={(e) => (e.target.style.display = "none")}
                            />
                            <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                B
                            </span>
                        </div>
                    ))}
                    {photos.after?.map((url, idx) => (
                        <div key={`after-${idx}`} className="relative group">
                            <img
                                src={url}
                                alt={`After ${idx + 1}`}
                                className="w-full h-32 sm:h-40 object-cover rounded-lg border-2 border-green-300"
                                onError={(e) => (e.target.style.display = "none")}
                            />
                            <span className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 text-xs font-semibold rounded">
                                A
                            </span>
                        </div>
                    ))}
                </div>
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
                    className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors disabled:opacity-50"
                    title="Save"
                >
                    <Save size={16} />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
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
                className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
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
                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors text-sm font-medium"
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
