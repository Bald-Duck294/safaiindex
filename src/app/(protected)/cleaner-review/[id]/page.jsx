"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  User,
  MessageSquare,
  Image as ImageIcon,
  Phone,
  Mail,
  Badge,
  Star,
  Activity
} from "lucide-react";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import toast, { Toaster } from "react-hot-toast";

// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return '';
  return String(str).replace(/^["'\s]+|["'\s,]+$/g, '').trim();
};

// Helper function to safely render role (handles both string and object)
const getRoleDisplay = (role) => {
  if (!role) return 'N/A';

  // If role is an object, extract the name or description
  if (typeof role === 'object') {
    return role.name || role.description || JSON.stringify(role);
  }

  // If role is a string, return as is
  return String(role);
};

// Helper function to calculate completion time
const getCompletionTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Helper function to get time elapsed for ongoing tasks
const getTimeElapsed = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export default function ReviewDetails() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params?.id;

  const [review, setReview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null); // ✅ Updated state

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setIsLoading(true);
        const response = await CleanerReviewApi.getCleanerReviewById(reviewId);
        console.log(response, "rs");

        if (response.success) {
          // Get the first review (since we're fetching by ID, there should be only one)
          const reviewData = response.data?.data?.reviews?.[0];
          console.log(reviewData, "review data from details");

          if (!reviewData) {
            toast.error("No review data found.");
            return;
          }

          // Clean the data
          const cleanedReview = {
            ...reviewData,
            name: cleanString(reviewData.name),
            address: cleanString(reviewData.address),
            initial_comment: cleanString(reviewData.initial_comment),
            final_comment: cleanString(reviewData.final_comment),
          };

          setReview(cleanedReview);
          console.log("Review set successfully:", cleanedReview);
        } else {
          toast.error("Failed to load review details.");
        }
      } catch (error) {
        toast.error("Error loading review details.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (reviewId) {
      fetchReviewDetails();
    }
  }, [reviewId]);

  // ✅ Keyboard navigation for image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedImageIndex === null) return;

      const allImages = [
        ...(review?.before_photo || []).map(url => ({ url, type: 'before' })),
        ...(review?.after_photo || []).map(url => ({ url, type: 'after' }))
      ];

      switch (e.key) {
        case 'Escape':
          setSelectedImageIndex(null);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (allImages.length > 1) {
            setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (allImages.length > 1) {
            setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
          }
          break;
      }
    };

    if (selectedImageIndex !== null) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImageIndex, review]);

  // Add debugging
  console.log("Current review state:", review);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading review details...</p>
        </div>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Review Not Found</h2>
          <p className="text-slate-600 mb-4">The requested review could not be found.</p>
          <button
            onClick={() => router.back()}
            className="bg-indigo-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const allImages = [
    ...(review.before_photo || []).map(url => ({ url, type: 'before' })),
    ...(review.after_photo || []).map(url => ({ url, type: 'after' }))
  ];

  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4 sm:p-6">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back to Reviews
            </button>

            {/* ✅ Improved Responsive Header */}
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
                    Cleaning Review #{review.id}
                  </h1>
                  <p className="flex items-center gap-2 text-slate-600 text-sm sm:text-base">
                    <MapPin size={16} />
                    <span className="break-words">{review.address || "No address provided"}</span>
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap ${review?.status === "completed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                    }`}
                >
                  {review?.status === "completed" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Clock size={16} />
                  )}
                  {String(review?.status || '').toUpperCase()}
                </span>
              </div>

              {/* ✅ Responsive Cleaner Details */}
              {review.cleaner_details && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <User size={18} className="text-blue-600" />
                    Cleaner Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-slate-700 text-sm sm:text-base">
                        <strong className="text-slate-900">Name:</strong> {review.cleaner_details.name || 'N/A'}
                      </p>
                      {review.cleaner_details.phone && (
                        <p className="flex items-center gap-2 text-slate-700 text-sm sm:text-base">
                          <Phone size={14} className="text-blue-600 flex-shrink-0" />
                          <strong>Phone:</strong>
                          <span className="break-all">{review.cleaner_details.phone}</span>
                        </p>
                      )}
                      {review.cleaner_details.email && (
                        <p className="flex items-center gap-2 text-slate-700 text-sm sm:text-base">
                          <Mail size={14} className="text-blue-600 flex-shrink-0" />
                          <strong>Email:</strong>
                          <span className="break-all">{review.cleaner_details.email}</span>
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-700 text-sm sm:text-base">
                        <Badge size={14} className="text-blue-600 flex-shrink-0" />
                        <strong>Role:</strong>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {getRoleDisplay(review.cleaner_details.role)}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Cleaner ID:</strong> {review.cleaner_details.id || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Responsive Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar size={18} />
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <strong>Started:</strong>
                      <span className="block sm:inline sm:ml-1">
                        {new Date(review.created_at).toLocaleString()}
                      </span>
                    </p>

                    {review?.status === 'ongoing' && (
                      <p className="text-sm text-amber-600 font-medium">
                        <Clock size={14} className="inline mr-2" />
                        Running for {getTimeElapsed(review.created_at)}
                      </p>
                    )}

                    {review?.status === 'completed' && (
                      <>
                        <p className="text-sm text-slate-600">
                          <strong>Finished:</strong>
                          <span className="block sm:inline sm:ml-1">
                            {new Date(review.updated_at).toLocaleString()}
                          </span>
                        </p>
                        <p className="text-sm text-emerald-600 font-medium">
                          <CheckCircle size={14} className="inline mr-2" />
                          Completed in {getCompletionTime(review.created_at, review.updated_at)}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Activity size={18} />
                    Task Details
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p><strong>Location ID:</strong> {review.location_id || 'N/A'}</p>
                    {review.company_id && (
                      <p><strong>Company ID:</strong> {review.company_id}</p>
                    )}
                    {review.tasks && Array.isArray(review.tasks) && review.tasks.length > 0 && (
                      <div>
                        <p className="font-semibold mb-2">Tasks Completed:</p>
                        <div className="flex flex-wrap gap-1">
                          {review.tasks.map((task, index) => (
                            <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                              Task {String(task)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Comments */}
              {(review.initial_comment || review.final_comment) && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <MessageSquare size={18} />
                    Comments
                  </h3>
                  <div className="space-y-3">
                    {review.initial_comment && review.initial_comment !== 'null' && (
                      <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Initial Comment</p>
                        <p className="text-slate-700 text-sm sm:text-base break-words">{review.initial_comment}</p>
                      </div>
                    )}
                    {review.final_comment && review.final_comment !== 'null' && (
                      <div className="bg-emerald-50 p-3 sm:p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-800 mb-1">Final Comment</p>
                        <p className="text-slate-700 text-sm sm:text-base break-words">{review.final_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>



          {/* ✅ Responsive Images Grid */}
          {allImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <ImageIcon size={18} />
                Photos ({allImages.length})
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer aspect-square"
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image.url}
                      alt={`${image.type} photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-slate-200 hover:shadow-md hover:scale-105 transition-all duration-200"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2">
                      <span
                        className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded ${image.type === 'before'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                          }`}
                      >
                        {image.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ✅ FIXED Image Modal with Better Layout */}
          {selectedImageIndex !== null && (
            <div
              className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
              onClick={(e) => {
                if (e.target === e.currentTarget) {
                  setSelectedImageIndex(null);
                }
              }}
            >
              <div className="relative w-full h-full flex flex-col max-w-7xl mx-auto">
                {/* Header - Fixed height */}
                <div className="flex items-center justify-between p-3 sm:p-4 text-white bg-black bg-opacity-50 flex-shrink-0">
                  <div className="flex items-center space-x-2 sm:space-x-4">
                    <span className="text-sm sm:text-lg font-medium">
                      {selectedImageIndex + 1} of {allImages.length}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs sm:text-sm font-medium rounded ${allImages[selectedImageIndex]?.type === 'before'
                        ? 'bg-blue-500 text-white'
                        : 'bg-emerald-500 text-white'
                        }`}
                    >
                      {allImages[selectedImageIndex]?.type?.toUpperCase()} PHOTO
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedImageIndex(null)}
                    className="text-white hover:text-gray-300 text-2xl sm:text-3xl font-bold leading-none p-2 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
                    title="Close (ESC)"
                  >
                    ×
                  </button>
                </div>

                {/* Main image container - Flexible height */}
                <div className="flex-1 flex items-center justify-center relative min-h-0 p-2 sm:p-4">
                  {/* Previous button */}
                  {allImages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : allImages.length - 1);
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 text-2xl sm:text-4xl font-bold p-2 sm:p-3 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
                      title="Previous image (←)"
                    >
                      ‹
                    </button>
                  )}

                  {/* Image with proper constraints */}
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={allImages[selectedImageIndex]?.url}
                      alt={`${allImages[selectedImageIndex]?.type} photo ${selectedImageIndex + 1}`}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                      style={{
                        maxWidth: 'calc(100% - 80px)', // Account for nav buttons
                        maxHeight: 'calc(100% - 20px)', // Account for padding
                        width: 'auto',
                        height: 'auto'
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>

                  {/* Next button */}
                  {allImages.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImageIndex(selectedImageIndex < allImages.length - 1 ? selectedImageIndex + 1 : 0);
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 z-20 text-white hover:text-gray-300 text-2xl sm:text-4xl font-bold p-2 sm:p-3 hover:bg-black hover:bg-opacity-50 rounded-full transition-colors"
                      title="Next image (→)"
                    >
                      ›
                    </button>
                  )}
                </div>

                {/* Thumbnail strip - Fixed height */}
                {allImages.length > 1 && (
                  <div className="p-2 sm:p-4 bg-black bg-opacity-50 flex-shrink-0">
                    <div className="flex justify-center items-center space-x-2 overflow-x-auto max-w-full">
                      <div className="flex space-x-2 min-w-max px-4">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedImageIndex(index);
                            }}
                            className={`flex-shrink-0 relative ${index === selectedImageIndex
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110'
                              : 'opacity-70 hover:opacity-100 hover:scale-105'
                              } transition-all duration-200`}
                          >
                            <img
                              src={image.url}
                              alt={`${image.type} thumbnail ${index + 1}`}
                              className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded border-2 border-white"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="absolute top-0 left-0">
                              <span
                                className={`px-1 py-0.5 text-xs font-medium rounded-br ${image.type === 'before'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-emerald-500 text-white'
                                  }`}
                              >
                                {image.type.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
