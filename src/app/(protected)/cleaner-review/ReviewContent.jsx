"use client";

import { useState, useEffect } from "react";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import toast, { Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";
import {
  ListChecks,
  Clock,
  CheckCircle,
  Calendar,
  MapPin,
  RotateCcw,
} from "lucide-react";

import { useCompanyId } from '@/lib/providers/CompanyProvider';

// Skeleton component for loading state
const ReviewCardSkeleton = () => (
  <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 animate-pulse">
    <div className="flex justify-between items-start">
      <div className="w-3/4 h-6 bg-slate-200 rounded"></div>
      <div className="w-20 h-6 bg-slate-200 rounded-full"></div>
    </div>
    <div className="w-1/2 h-4 bg-slate-200 rounded mt-4"></div>
    <div className="w-1/3 h-4 bg-slate-200 rounded mt-2"></div>
  </div>
);

// This is your original component, just renamed.
export default function ReviewContent({ companyId }) {
  const searchParams = useSearchParams();
  console.log('review page mounted');

  // Initialize filter state directly from URL params.
  const [filter, setFilter] = useState(() => {
    const statusFromUrl = searchParams.get("status");
    return statusFromUrl || "all";
  });

  // const { companyId } = useCompanyId();

  const [date, setDate] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // A single, clean useEffect for all data fetching.
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true);
      const params = {
        status: filter === "all" ? null : filter,
        date: date || null,
      };

      console.log('sedning company_id', companyId);
      const response = await CleanerReviewApi.getAllCleanerReviews(params, companyId);
      console.log(response, "response")
      if (response.success) {
        setReviews(response.data);
      } else {
        toast.error("Failed to load reviews.");
      }
      setIsLoading(false);
    };

    fetchReviews();
  }, [filter, date]); // Dependencies are the single source of truth

  const handleReset = () => {
    setFilter("all");
    setDate("");
    toast.success("Filters reset");
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
                ? reviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-5 rounded-lg shadow-sm border border-slate-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-slate-800 pr-2">
                          {review.name}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${review.status === "completed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                            }`}
                        >
                          {review.status === "completed" ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {review.status}
                        </span>
                      </div>
                      <p className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        {review.address || "No address provided"}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
                      <p className="flex items-center gap-2 text-xs text-slate-500">
                        <Calendar size={14} />
                        {new Date(review.created_at).toLocaleDateString()}
                      </p>
                      <button className="text-xs font-semibold text-indigo-600 hover:underline">
                        View Details
                      </button>
                    </div>
                  </div>
                ))
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