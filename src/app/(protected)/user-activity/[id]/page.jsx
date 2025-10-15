"use client";

import { useParams, useRouter } from "next/navigation";
import { useGetUserReviewByIdQuery } from "@/store/slices/reviewSlice";
import {
  ArrowLeft,
  Star,
  Calendar,
  MapPin,
  Phone,
  Mail,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import { useState } from "react";

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

// Reason IDs mapping (you can customize this based on your actual reasons)
const REASON_MAP = {
  1: "Broken Flush",
  2: "Wet Floor",
  3: "No Water",
  4: "Bad Odor",
  5: "Dirty",
  6: "No Soap",
  7: "No Tissue",
  8: "Poor Maintenance",
};

// Image Modal Component
const ImageModal = ({ imageUrl, onClose }) => {
  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-full">
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-slate-300"
        >
          ✕ Close
        </button>
        <img
          src={imageUrl}
          alt="Review"
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );
};

export default function UserReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id;
  const [selectedImage, setSelectedImage] = useState(null);

  // Fetch single review using RTK Query
  const { data: review, isLoading, isError, error } = useGetUserReviewByIdQuery(reviewId);

  // Show loader while fetching
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading review details..." />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">
            {error?.data?.error || "Review not found"}
          </p>
          <button
            onClick={() => router.back()}
            className="cursor-pointer px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Back to Reviews
          </button>
        </div>
      </div>
    );
  }

  if (!review) {
    return null;
  }

  return (
    <>
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className=" cursor-pointer flex items-center gap-2 text-slate-600 hover:text-slate-800 mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Reviews</span>
          </button>

          {/* Main Card */}
          <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold mb-2">
                    {cleanString(review.name) || 'Anonymous Review'}
                  </h1>
                  {review.toilet_id && (
                    <p className="text-indigo-100">
                      Toilet ID: <span className="font-semibold">{review.toilet_id}</span>
                    </p>
                  )}
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-white`}>
                  <Star size={20} className={`${getRatingColor(review.rating)} fill-current`} />
                  <span className={`text-2xl font-bold ${getRatingColor(review.rating)}`}>
                    {review.rating}
                  </span>
                  <span className="text-slate-500">/10</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {review.phone && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Phone className="text-indigo-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Phone</p>
                      <p className="font-semibold text-slate-800">
                        {cleanString(review.phone)}
                      </p>
                    </div>
                  </div>
                )}
                {review.email && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <Mail className="text-indigo-600" size={20} />
                    <div>
                      <p className="text-xs text-slate-500">Email</p>
                      <p className="font-semibold text-slate-800 break-all">
                        {cleanString(review.email)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              {review.description && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-2">
                    Review Description
                  </h3>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg">
                    {cleanString(review.description)}
                  </p>
                </div>
              )}

              {/* Reasons */}
              {review.reason_ids && review.reason_ids.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">
                    Issues Reported
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {review.reason_ids.map((reasonId) => (
                      <span
                        key={reasonId}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                      >
                        {REASON_MAP[reasonId] || `Issue #${reasonId}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Images */}
              {review.images && review.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <ImageIcon size={20} />
                    Photos ({review.images.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {review.images.map((imageUrl, index) => (
                      <div 
                        key={index} 
                        className="relative aspect-square cursor-pointer group"
                        onClick={() => setSelectedImage(imageUrl)}
                      >
                        <img
                          src={imageUrl}
                          alt={`Review photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border-2 border-slate-200 group-hover:border-indigo-500 transition-all"
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
                            e.target.parentElement.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 font-semibold">
                            View
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date and Location Info */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">
                  Additional Information
                </h3>
                
                <div className="flex items-center gap-3 text-slate-600">
                  <Calendar size={18} className="text-indigo-600" />
                  <div>
                    <p className="text-sm text-slate-500">Submitted on</p>
                    <p className="font-medium">
                      {new Date(review.created_at).toLocaleString('en-US', {
                        dateStyle: 'full',
                        timeStyle: 'short'
                      })}
                    </p>
                  </div>
                </div>

                {review.latitude && review.longitude && (
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={18} className="text-indigo-600" />
                    <div>
                      <p className="text-sm text-slate-500">Location Coordinates</p>
                      <p className="font-medium">
                        Lat: {review.latitude.toFixed(6)}, Long: {review.longitude.toFixed(6)}
                      </p>
                      <a
                        href={`https://www.google.com/maps?q=${review.latitude},${review.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:underline"
                      >
                        View on Google Maps →
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal 
          imageUrl={selectedImage} 
          onClose={() => setSelectedImage(null)} 
        />
      )}
    </>
  );
}
