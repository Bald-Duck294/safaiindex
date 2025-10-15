"use client";

import { useState } from "react";
// import { useGetUserReviewsQuery } from "@/store/slices/reviewSlice";
import { useGetUserReviewsQuery } from "@/store/slices/reviewSlice.js";
import { useRouter } from "next/navigation";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import {
  MessageSquare,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Image as ImageIcon,
  Eye,
  RotateCcw,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";

// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return '';
  return String(str).replace(/^["'\s]+|["'\s,]+$/g, '').trim();
};

// Helper to get star rating color
const getRatingColor = (rating) => {
  if (rating >= 8) return "text-emerald-600";
  if (rating >= 5) return "text-amber-600";
  return "text-red-600";
};

// Helper to get star rating background
const getRatingBg = (rating) => {
  if (rating >= 8) return "bg-emerald-100";
  if (rating >= 5) return "bg-amber-100";
  return "bg-red-100";
};

// Skeleton component for loading state
const ReviewCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
      <div className="w-16 h-8 bg-slate-200 rounded"></div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-20 h-20 bg-slate-200 rounded"></div>
      <div className="w-20 h-20 bg-slate-200 rounded"></div>
    </div>
    <div className="w-full h-4 bg-slate-200 rounded mb-2"></div>
    <div className="w-2/3 h-4 bg-slate-200 rounded"></div>
  </div>
);

export default function UserReviewsPage() {
  const router = useRouter();
  const [toiletId, setToiletId] = useState("");
  const [limit, setLimit] = useState(50);
  const { companyId } = useCompanyId();

  // Fetch reviews using RTK Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching
  } = useGetUserReviewsQuery(
    toiletId ? { toilet_id: toiletId, limit } : { limit }
  );

  const handleReset = () => {
    setToiletId("");
    setLimit(50);
    toast.success("Filters reset");
  };

  const handleCardClick = (reviewId) => {
    router.push(`/user-activity/${reviewId}?companyId=${companyId}`);
  };

  // Show loader while fetching
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading reviews..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Error: {error?.data?.error || "Failed to load reviews"}
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { reviews, count } = data || { reviews: [], count: 0 };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800">
                  User Reviews
                </h1>
              </div>
              <div className="text-sm text-slate-600">
                Total Reviews: <span className="font-bold">{count}</span>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-4 flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
              <div className="w-full md:w-auto">
                <label
                  htmlFor="toilet-filter"
                  className="text-sm font-semibold text-slate-600 mr-2"
                >
                  Filter by Toilet ID:
                </label>
                <input
                  type="number"
                  id="toilet-filter"
                  value={toiletId}
                  onChange={(e) => setToiletId(e.target.value)}
                  placeholder="Enter toilet ID"
                  className="px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
              {isFetching && (
                <span className="text-sm text-indigo-600">Refreshing...</span>
              )}
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                <ReviewCardSkeleton key={i} />
              ))
              : reviews.length > 0
                ? reviews.map((review) => {
                  const displayImages = review.images?.slice(0, 2) || [];
                  return (
                    <div
                      key={review.id}
                      onClick={() => handleCardClick(review.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {cleanString(review.name) || 'Anonymous'}
                          </h3>
                          {review.toilet_id && (
                            <p className="text-xs text-slate-500 mt-1">
                              Toilet ID: {review.toilet_id}
                            </p>
                          )}
                        </div>
                        <div className={`flex items-center gap-1 px-2.5 py-1 rounded-md ${getRatingBg(review.rating)}`}>
                          <Star size={14} className={`${getRatingColor(review.rating)} fill-current`} />
                          <span className={`text-sm font-bold ${getRatingColor(review.rating)}`}>
                            {review.rating}/10
                          </span>
                        </div>
                      </div>

                      {/* Images */}
                      {displayImages.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {displayImages.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`Review photo ${index + 1}`}
                                className="w-20 h-20 object-cover rounded border border-slate-200"
                                onError={(e) => {
                                  e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                          {review.images?.length > 2 && (
                            <div className="w-20 h-20 bg-slate-100 rounded border border-slate-200 flex flex-col items-center justify-center">
                              <ImageIcon size={20} className="text-slate-400" />
                              <span className="text-xs text-slate-500 mt-1">
                                +{review.images.length - 2}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Description */}
                      {review.description && (
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                          {cleanString(review.description)}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-1 mb-3 text-xs text-slate-500">
                        {review.phone && (
                          <p className="flex items-center gap-2">
                            <Phone size={12} />
                            {cleanString(review.phone)}
                          </p>
                        )}
                        {review.email && (
                          <p className="flex items-center gap-2">
                            <Mail size={12} />
                            {cleanString(review.email)}
                          </p>
                        )}
                      </div>

                      {/* Date and Location */}
                      <div className="space-y-1 mb-3">
                        <p className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar size={12} />
                          {new Date(review.created_at).toLocaleString()}
                        </p>
                        {review.latitude && review.longitude && (
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin size={12} />
                            {review.latitude.toFixed(4)}, {review.longitude.toFixed(4)}
                          </p>
                        )}
                      </div>

                      {/* View Details Button */}
                      <div className="pt-3 border-t border-slate-200">
                        <button className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group-hover:gap-3">
                          <Eye size={14} />
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })
                : (
                  <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm">
                    <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700">
                      No Reviews Found
                    </h3>
                    <p className="text-slate-500 mt-2">
                      There are no reviews matching the current filter.
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>
    </>
  );
}
