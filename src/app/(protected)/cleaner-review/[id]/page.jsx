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
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchReviewDetails = async () => {
      try {
        setIsLoading(true);
        const response = await CleanerReviewApi.getCleanerReviewById(reviewId);
        console.log(response, "rs");

        if (response.success) {
          // Get the first review (since we're fetching by ID, there should be only one)
          const reviewData = response.data?.data?.[0];
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
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
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
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Back to Reviews
            </button>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-slate-800 mb-2">
                    Cleaning Review #{review.id}
                  </h1>
                  <p className="flex items-center gap-2 text-slate-600">
                    <MapPin size={16} />
                    {review.address || "No address provided"}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full ${
                    review?.status === "completed"
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

              {/* Cleaner Details Card */}
              {review.cleaner_details && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-3">
                    <User size={18} className="text-blue-600" />
                    Cleaner Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p className="text-slate-700">
                        <strong className="text-slate-900">Name:</strong> {review.cleaner_details.name || 'N/A'}
                      </p>
                      {review.cleaner_details.phone && (
                        <p className="flex items-center gap-2 text-slate-700">
                          <Phone size={14} className="text-blue-600" />
                          <strong>Phone:</strong> {review.cleaner_details.phone}
                        </p>
                      )}
                      {review.cleaner_details.email && (
                        <p className="flex items-center gap-2 text-slate-700">
                          <Mail size={14} className="text-blue-600" />
                          <strong>Email:</strong> {review.cleaner_details.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="flex items-center gap-2 text-slate-700">
                        <Badge size={14} className="text-blue-600" />
                        <strong>Role:</strong> 
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          {getRoleDisplay(review.cleaner_details.role)}
                        </span>
                      </p>
                      <p className="text-sm text-slate-600">
                        <strong>Cleaner ID:</strong> {review.cleaner_details.id || 'N/A'}
                      </p>
                      {review.cleaner_details.joined_date && (
                        <p className="text-sm text-slate-600">
                          <strong>Joined:</strong> {new Date(review.cleaner_details.joined_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Calendar size={18} />
                    Timeline
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">
                      <strong>Started:</strong> {new Date(review.created_at).toLocaleString()}
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
                          <strong>Finished:</strong> {new Date(review.updated_at).toLocaleString()}
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
                        <p className="font-semibold mb-1">Tasks Completed:</p>
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
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800 mb-1">Initial Comment</p>
                        <p className="text-slate-700">{review.initial_comment}</p>
                      </div>
                    )}
                    {review.final_comment && review.final_comment !== 'null' && (
                      <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <p className="text-sm font-medium text-emerald-800 mb-1">Final Comment</p>
                        <p className="text-slate-700">{review.final_comment}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Images */}
          {allImages.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2 mb-4">
                <ImageIcon size={18} />
                Photos ({allImages.length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {allImages.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(image)}
                  >
                    <img
                      src={image.url}
                      alt={`${image.type} photo ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border border-slate-200 hover:shadow-md transition-shadow"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          image.type === 'before'
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

          {/* Image Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImage(null)}
            >
              <div className="relative max-w-3xl max-h-full">
                <img
                  src={selectedImage.url}
                  alt={`${selectedImage.type} photo`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold"
                >
                  ×
                </button>
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-3 py-1 text-sm font-medium rounded ${
                      selectedImage.type === 'before'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {selectedImage.type.toUpperCase()} PHOTO
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
