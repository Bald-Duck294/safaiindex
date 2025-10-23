// "use client";

// import { useState, useEffect } from "react";
// import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
// import toast, { Toaster } from "react-hot-toast";
// import { useSearchParams } from "next/navigation";
// import {
//   ListChecks,
//   Clock,
//   CheckCircle,
//   Calendar,
//   MapPin,
//   RotateCcw,
// } from "lucide-react";

// import { useCompanyId } from '@/lib/providers/CompanyProvider';

// // Skeleton component for loading state
// const ReviewCardSkeleton = () => (
//   <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 animate-pulse">
//     <div className="flex justify-between items-start">
//       <div className="w-3/4 h-6 bg-slate-200 rounded"></div>
//       <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
//     </div>
//     <div className="w-1/2 h-4 bg-slate-200 rounded mt-4"></div>
//     <div className="w-1/3 h-4 bg-slate-200 rounded mt-2"></div>
//   </div>
// );

// // This is your original component, just renamed.
// export default function ReviewContent({ companyId }) {
//   const searchParams = useSearchParams();
//   console.log('review page mounted');

//   // Initialize filter state directly from URL params.
//   const [filter, setFilter] = useState(() => {
//     const statusFromUrl = searchParams.get("status");
//     return statusFromUrl || "all";
//   });

//   // const { companyId } = useCompanyId();

//   const [date, setDate] = useState("");
//   const [reviews, setReviews] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);

//   // A single, clean useEffect for all data fetching.
//   useEffect(() => {
//     const fetchReviews = async () => {
//       setIsLoading(true);
//       const params = {
//         status: filter === "all" ? null : filter,
//         date: date || null,
//       };

//       console.log('sedning company_id', companyId);
//       const response = await CleanerReviewApi.getAllCleanerReviews(params, companyId);
//       console.log(response, "response")
//       if (response.success) {
//         setReviews(response.data);
//       } else {
//         toast.error("Failed to load reviews.");
//       }
//       setIsLoading(false);
//     };

//     fetchReviews();
//   }, [filter, date]); // Dependencies are the single source of truth

//   const handleReset = () => {
//     setFilter("all");
//     setDate("");
//     toast.success("Filters reset");
//   };

//   const FilterButton = ({ value, label }) => (
//     <button
//       onClick={() => setFilter(value)}
//       className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === value
//         ? "bg-indigo-600 text-white shadow"
//         : "bg-white text-slate-600 hover:bg-slate-100"
//         }`}
//     >
//       {label}
//     </button>
//   );

//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//         <div className="max-w-7xl mx-auto">
//           {/* Header */}
//           <div className="mb-6">
//             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
//               <div className="flex items-center gap-3">
//                 <ListChecks className="w-8 h-8 text-indigo-600" />
//                 <h1 className="text-3xl font-bold text-slate-800">
//                   Cleaner Activity
//                 </h1>
//               </div>
//               <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg">
//                 <FilterButton value="all" label="All Tasks" />
//                 <FilterButton value="ongoing" label="Ongoing" />
//                 <FilterButton value="completed" label="Completed" />
//               </div>
//             </div>
//             {/* Filter Bar */}
//             <div className="mt-4 flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
//               <div className="w-full md:w-auto">
//                 <label
//                   htmlFor="date-filter"
//                   className="text-sm font-semibold text-slate-600 mr-2"
//                 >
//                   Filter by Date:
//                 </label>
//                 <input
//                   type="date"
//                   id="date-filter"
//                   value={date}
//                   onChange={(e) => setDate(e.target.value)}
//                   className="px-3 py-1.5 border border-slate-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
//                 />
//               </div>
//               <button
//                 onClick={handleReset}
//                 className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition"
//               >
//                 <RotateCcw size={14} />
//                 Reset Filters
//               </button>
//             </div>
//           </div>

//           {/* Reviews Grid */}
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {isLoading
//               ? Array.from({ length: 6 }).map((_, i) => (
//                 <ReviewCardSkeleton key={i} />
//               ))
//               : reviews.length > 0
//                 ? reviews.map((review) => (
//                   <div
//                     key={review.id}
//                     className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between"
//                   >
//                     <div>
//                       <div className="flex justify-between items-start">
//                         <h3 className="text-lg font-bold text-slate-800 pr-2">
//                           {review.name}
//                         </h3>
//                         <span
//                           className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${review.status === "completed"
//                             ? "bg-emerald-100 text-emerald-800"
//                             : "bg-amber-100 text-amber-800"
//                             }`}
//                         >
//                           {review.status === "completed" ? (
//                             <CheckCircle size={14} />
//                           ) : (
//                             <Clock size={14} />
//                           )}
//                           {review.status}
//                         </span>
//                       </div>
//                       <p className="flex items-center gap-2 mt-2 text-sm text-slate-500">
//                         <MapPin size={14} />
//                         {review.address || "No address provided"}
//                       </p>
//                     </div>
//                     <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
//                       <p className="flex items-center gap-2 text-xs text-slate-500">
//                         <Calendar size={14} />
//                         {new Date(review.created_at).toLocaleDateString()}
//                       </p>
//                       <button className="text-xs font-semibold text-indigo-600 hover:underline">
//                         View Details
//                       </button>
//                     </div>
//                   </div>
//                 ))
//                 : (
//                   <div className="col-span-full text-center py-16 bg-white rounded-lg shadow-sm">
//                     <h3 className="text-xl font-semibold text-slate-700">
//                       No Reviews Found
//                     </h3>
//                     <p className="text-slate-500 mt-2">
//                       There are no tasks matching the current filter.
//                     </p>
//                   </div>
//                 )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }


"use client";

import { useState, useEffect } from "react";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ListChecks,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  RotateCcw,
  Eye,
  Image as ImageIcon,
} from "lucide-react";


// Helper function to clean malformed strings
const cleanString = (str) => {
  if (!str) return '';
  return String(str).replace(/^["'\s]+|["'\s,]+$/g, '').trim();
};

// Helper function to calculate time elapsed
const getTimeElapsed = (startTime) => {
  const start = new Date(startTime);
  const now = new Date();
  const diffMs = now - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m ago`;
  }
  return `${minutes}m ago`;
};

// Helper function to get completion time
const getCompletionTime = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diffMs = end - start;

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `Completed in ${hours}h ${minutes}m`;
  }
  return `Completed in ${minutes}m`;
};

// Skeleton component for loading state
const ReviewCardSkeleton = () => (
  <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="w-3/4 h-5 bg-slate-200 rounded"></div>
      <div className="w-20 h-5 bg-slate-200 rounded-full"></div>
    </div>
    <div className="flex gap-2 mb-3">
      <div className="w-12 h-12 bg-slate-200 rounded"></div>
      <div className="w-12 h-12 bg-slate-200 rounded"></div>
    </div>
    <div className="w-1/2 h-4 bg-slate-200 rounded mb-2"></div>
    <div className="w-1/3 h-4 bg-slate-200 rounded"></div>
  </div>
);

export default function ReviewContent({ companyId }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [filter, setFilter] = useState(() => {
    const statusFromUrl = searchParams.get("status");
    return statusFromUrl || "all";
  });

  // const [date, setDate] = useState("");
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    // if (!companyId || companyId === 'null' || companyId === null) {
    //   console.log('Skipping fetch - companyId not ready:', companyId);
    //   // setLoading(false);
    //   setIsLoading(false)
    //   return;
    // }

    const fetchReviews = async () => {

      setIsLoading(true);
      const params = {
        status: filter === "all" ? null : filter,
        date: date || null,
      };

      console.log('sending company_id', companyId);
      const response = await CleanerReviewApi.getAllCleanerReviews(params, companyId);

      console.log(response?.data, "cleaner data");
      console.log(response?.data?.[0]?.cleaner_user.name, "cleaner user");
      if (response.success) {
        // Clean the data
        const cleanedReviews = response.data.map(review => ({
          ...review,
          name: cleanString(review?.cleaner_user?.name),
          address: cleanString(review.address),
          initial_comment: cleanString(review.initial_comment),
          final_comment: cleanString(review.final_comment),
        }));
        setReviews(cleanedReviews);
      } else {
        toast.error("Failed to load reviews.");
      }
      setIsLoading(false);
    };

    fetchReviews();
  }, [filter, date, companyId]);

  const handleReset = () => {
    setFilter("all");
    setDate("");
    toast.success("Filters reset");
  };

  const handleCardClick = (reviewId) => {
    router.push(`/cleaner-review/${reviewId}?companyId=${companyId}`);
  };

  const FilterButton = ({ value, label }) => (
    <button
      onClick={() => setFilter(value)}
      className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${filter === value
        ? "bg-indigo-600 text-white shadow"
        : "bg-white text-slate-600 hover:bg-slate-100"
        }`}
    >
      {label}
    </button>
  );

  // Helper function to get images to display
  const getDisplayImages = (review) => {
    if (review.status === 'completed' && review.after_photo?.length > 0) {
      return review.after_photo.slice(0, 2); // Show max 2 after photos for completed
    }
    return review.before_photo?.slice(0, 2) || []; // Show max 2 before photos
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div className="flex items-center gap-3">
                <ListChecks className="w-8 h-8 text-indigo-600" />
                <h1 className="text-3xl font-bold text-slate-800">
                  Cleaner Activity
                </h1>
              </div>
              <div className="flex items-center gap-2 p-1 bg-slate-200 rounded-lg">
                <FilterButton value="all" label="All Tasks" />
                <FilterButton value="ongoing" label="Ongoing" />
                <FilterButton value="completed" label="Completed" />
              </div>
            </div>

            {/* Filter Bar */}
            <div className="mt-4 flex flex-col md:flex-row items-center gap-4 p-4 bg-white rounded-lg shadow-sm border">
              <div className="w-full md:w-auto">
                <label
                  htmlFor="date-filter"
                  className="text-sm font-semibold text-slate-600 mr-2"
                >
                  Filter by Date:
                </label>
                <input
                  type="date"
                  id="date-filter"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
                  const displayImages = getDisplayImages(review);
                  return (
                    <div
                      key={review.id}
                      onClick={() => handleCardClick(review.id)}
                      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow cursor-pointer group"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-slate-800 pr-2 group-hover:text-indigo-600 transition-colors">
                          {review.cleaner_user?.name || 'Unnamed Cleaner'}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${review.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
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

                      {/* Images */}
                      {displayImages.length > 0 && (
                        <div className="flex gap-2 mb-3">
                          {displayImages.map((imageUrl, index) => (
                            <div key={index} className="relative">
                              <img
                                src={imageUrl}
                                alt={`${review.status} photo ${index + 1}`}
                                className="w-12 h-12 object-cover rounded border border-slate-200"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            </div>
                          ))}
                          {displayImages.length < (review.before_photo?.length || 0) + (review.after_photo?.length || 0) && (
                            <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center">
                              <ImageIcon size={16} className="text-slate-400" />
                              <span className="text-xs text-slate-500 ml-1">
                                +{((review.before_photo?.length || 0) + (review.after_photo?.length || 0)) - displayImages.length}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Address */}
                      <p className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                        <MapPin size={12} />
                        {review.location?.name || "No address provided"}
                      </p>

                      {/* Time Information */}
                      <div className="space-y-1 mb-3">
                        <p className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar size={12} />
                          Started: {new Date(review.created_at).toLocaleString()}
                        </p>

                        {review.status === 'ongoing' && (
                          <p className="text-xs text-amber-600 font-medium">
                            <Clock size={12} className="inline mr-1" />
                            {getTimeElapsed(review.created_at)}
                          </p>
                        )}

                        {review.status === 'completed' && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-600">
                              Finished: {new Date(review.updated_at).toLocaleString()}
                            </p>
                            <p className="text-xs text-emerald-600 font-medium">
                              <CheckCircle size={12} className="inline mr-1" />
                              {getCompletionTime(review.created_at, review.updated_at)}
                            </p>
                          </div>
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
                    <h3 className="text-xl font-semibold text-slate-700">
                      No Reviews Found
                    </h3>
                    <p className="text-slate-500 mt-2">
                      There are no tasks matching the current filter.
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>
    </>
  );
}
