"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Star,
  ClipboardList,
  CheckCircle,
  Activity,
  Wrench,
  UserCheck,
  MessageSquare,
  Sparkles
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import useNotifications from "@/lib/hooks/useNotifications";
// Import your API utilities
import LocationsApi from "@/lib/api/LocationApi";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";
import { UsersApi } from "@/lib/api/usersApi"; // Add this import
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useGetUserReviewsQuery } from "@/store/slices/reviewSlice";

// A reusable component for the star rating display
const Rating = ({ value }) => {
  const ratingValue = parseFloat(value).toFixed(1);
  return (
    <div className="flex items-center gap-2 text-sm">
      <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
      <span className="font-semibold text-slate-600">{ratingValue}</span>
    </div>
  );
};


const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};


export default function ClientDashboard() {

  // useNotifications();
  // State to hold all the dynamic dashboard data
  const [statsData, setStatsData] = useState({
    totalLocations: 0,
    avgRating: "0.0",
    ongoingTasks: 0,
    completedTasks: 0,
    totalRepairs: 0, // Keep as 0 for now
    totalCleaners: 0, // Will be fetched from users API
  });
  const [topLocations, setTopLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);


  const router = useRouter();

  const { companyId } = useCompanyId();

  // console.log('in main dashboard page', companyId);


  // Helper function to format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return diffInMinutes <= 1 ? "Just now" : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  // Get today's date range
  const getTodayDateRange = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { startOfDay };
  };

  // Fetch user reviews using RTK Query
  const { data: userReviewsData } = useGetUserReviewsQuery(
    { limit: 50 }, // Fetch more to filter by date
    { skip: !companyId || companyId === 'null' || companyId === null }
  );


  // Add this to your ClientDashboard component for testing
  useEffect(() => {
    // Test if messaging is initialized
    console.log("🧪 Testing FCM setup...");

    // Check if service worker is active
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        console.log("📋 Active service workers:", registrations.length);
        registrations.forEach(reg => {
          console.log("  - Scope:", reg.scope);
          console.log("  - State:", reg.active?.state);
        });
      });
    }
  }, []);



  useEffect(() => {
    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping - companyId not ready');
      return;
    }

    
    const fetchDashboardData = async () => {
      const todayDate = getTodayDate();
      const { startOfDay } = getTodayDateRange();
      try {
        const [locationsRes, ongoingRes, completedRes, usersRes, cleanerReviewsRes] = await Promise.all([
          LocationsApi.getAllLocations(companyId),
          CleanerReviewApi.getAllCleanerReviews({ status: "ongoing", date: todayDate }, companyId),
          CleanerReviewApi.getAllCleanerReviews({ status: "completed", date: todayDate }, companyId),
          UsersApi.getAllUsers(companyId),
          CleanerReviewApi.getAllCleanerReviews({ date: todayDate }, companyId),
        ]);

        console.log('Dashboard API results:', cleanerReviewsRes)
        if (locationsRes.success) {
          setStatsData((prev) => ({
            ...prev,
            totalLocations: locationsRes.data.length,
          }));

          const sortedLocations = [...locationsRes.data]
            .sort((a, b) => (b.currentScore || 0) - (a.currentScore || 0))
            .slice(0, 5);
          setTopLocations(sortedLocations);
        } else {
          toast.error("Could not fetch locations.");
        }

        if (ongoingRes.success) {
          setStatsData((prev) => ({
            ...prev,
            ongoingTasks: ongoingRes.data.length,
          }));
        }

        if (completedRes.success) {
          setStatsData((prev) => ({
            ...prev,
            completedTasks: completedRes.data.length,
          }));
        }

        // Count cleaners with role_id: 5
        if (usersRes.success) {
          const allUsers = usersRes.data || [];
          const cleaners = allUsers.filter(user => user.role_id === 5); // Filter cleaners

          // console.log(allUsers, "all users")
          // console.log(cleaners, "cleaners");
          setStatsData((prev) => ({
            ...prev,
            totalCleaners: cleaners.length,
          }));
        }

        let allActivities = [];

        if (cleanerReviewsRes.success) {
          cleanerReviewsRes.data
            .filter(review => new Date(review.created_at) >= startOfDay)
            .forEach(review => {
              // Task started
              allActivities.push({
                type: 'cleaner',
                id: `${review.id}-started`,
                reviewId: review.id,
                text: `${review.cleaner_user?.name || 'Cleaner'} started cleaning at ${review.location?.name || 'location'}`,
                timestamp: review.created_at,
                status: 'ongoing',
                activityType: 'info',
              });

              // Task completed
              if (review.status === 'completed' && review.updated_at) {
                const updatedDate = new Date(review.updated_at);
                const createdDate = new Date(review.created_at);

                if (updatedDate > createdDate && updatedDate >= startOfDay) {
                  allActivities.push({
                    type: 'cleaner',
                    id: `${review.id}-completed`,
                    reviewId: review.id,
                    text: `${review.cleaner_user?.name || 'Cleaner'} completed cleaning at ${review.location?.name || 'location'}`,
                    timestamp: review.updated_at,
                    status: 'completed',
                    score: review.score,
                    activityType: 'success',
                  });
                }
              }
            });
        }

        // Add user reviews
        if (userReviewsData?.data) {
          const userActivities = userReviewsData.data
            .filter(review => new Date(review.created_at) >= startOfDay)
            .map(review => ({
              type: 'user',
              id: `user-${review.id}`,
              text: `${review.name} submitted feedback for ${review.location?.name || 'location'}`,
              timestamp: review.created_at,
              rating: review.rating,
              activityType: review.rating >= 7 ? 'success' : review.rating >= 5 ? 'warning' : 'update',
            }));

          allActivities.push(...userActivities);
        }

        // const sortedActivities = allActivities
        //   .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        //   .slice(-10);

        const sortedActivities = allActivities
          .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))  // Descending
          .slice(0, 10);  // Take first 10 (newest)
        setRecentActivities(sortedActivities);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
        setIsActivitiesLoading(false);
      }
    };

    fetchDashboardData();
  }, [companyId, userReviewsData]);



  // useEffect(() => {
  //   if (!companyId || companyId === 'null' || companyId === null || companyId === 'undefined') {
  //     console.log('Skipping recent activities - invalid companyId:', companyId);
  //     setIsActivitiesLoading(false);
  //     return;
  //   }

  //   const fetchRecentActivities = async () => {
  //     setIsActivitiesLoading(true);
  //     try {
  //       const { startOfDay } = getTodayDateRange();

  //       let allActivities = [];

  //       // Fetch cleaner reviews
  //       const cleanerReviewsRes = await CleanerReviewApi.getAllCleanerReviews({}, companyId);

  //       // Process cleaner reviews - create TWO entries per review
  //       if (cleanerReviewsRes.success) {
  //         cleanerReviewsRes.data
  //           .filter(review => new Date(review.created_at) >= startOfDay)
  //           .forEach(review => {
  //             // dev - Task Started ( by ->  created_at)
  //             allActivities.push({
  //               type: 'cleaner',
  //               id: `${review.id}-started`,
  //               reviewId: review.id,
  //               text: `${review.cleaner_user?.name || 'Cleaner'} started cleaning at ${review.location?.name || 'location'}`,
  //               timestamp: review.created_at,
  //               status: 'ongoing',
  //               activityType: 'info',
  //             });

  //             // ✅ dev -  Task Completed (using updated_at, only if status is completed)
  //             if (review.status === 'completed' && review.updated_at) {
  //               const updatedDate = new Date(review.updated_at);
  //               const createdDate = new Date(review.created_at);

  //               if (updatedDate > createdDate && updatedDate >= startOfDay) {
  //                 allActivities.push({
  //                   type: 'cleaner',
  //                   id: `${review.id}-completed`,
  //                   reviewId: review.id,
  //                   text: `${review.cleaner_user?.name || 'Cleaner'} completed cleaning at ${review.location?.name || 'location'}`,
  //                   timestamp: review.updated_at,
  //                   status: 'completed',
  //                   score: review.score,
  //                   activityType: 'success',
  //                 });
  //               }
  //             }
  //           });
  //       }

  //       // Filter and format user reviews for today
  //       if (userReviewsData?.data) {
  //         const userActivities = userReviewsData.data
  //           .filter(review => new Date(review.created_at) >= startOfDay)
  //           .map(review => ({
  //             type: 'user',
  //             id: `user-${review.id}`,
  //             text: `${review.name} submitted feedback for ${review.location?.name || 'location'}`,
  //             timestamp: review.created_at,
  //             rating: review.rating,
  //             activityType: review.rating >= 7 ? 'success' : review.rating >= 5 ? 'warning' : 'update',
  //           }));

  //         allActivities.push(...userActivities);
  //       }

  //       // Sort by timestamp (oldest first for bottom-up display)
  //       const sortedActivities = allActivities
  //         .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
  //         .slice(-10); // Limit to last 10 activities

  //       setRecentActivities(sortedActivities);

  //     } catch (error) {
  //       console.error("Failed to fetch recent activities:", error);
  //     } finally {
  //       setIsActivitiesLoading(false);
  //     }
  //   };

  //   fetchRecentActivities();
  // }, [companyId, userReviewsData]);

  const stats = [
    {
      label: "Total Toilets",
      value: statsData.totalLocations,
      color: "text-sky-600 bg-sky-50",
      icon: <MapPin className="w-6 h-6 text-sky-500" />,
      redirectUrl: `/washrooms?companyId=${companyId}`,
    },
    {
      label: "Ongoing Tasks",
      value: statsData.ongoingTasks,
      color: "text-violet-600 bg-violet-50",
      icon: <ClipboardList className="w-6 h-6 text-violet-500" />,
      filterKey: "ongoing",
    },
    {
      label: "Completed Tasks",
      value: statsData.completedTasks,
      color: "text-green-600 bg-green-50",
      icon: <CheckCircle className="w-6 h-6 text-green-500" />,
      filterKey: "completed",
    },
    {
      label: "Total Repairs",
      value: statsData.totalRepairs,
      color: "text-orange-600 bg-orange-50",
      icon: <Wrench className="w-6 h-6 text-orange-500" />,
      redirectUrl: `/repairs?companyId=${companyId}`,
    },
    {
      label: "Number of Cleaners",
      value: statsData.totalCleaners,
      color: "text-indigo-600 bg-indigo-50",
      icon: <UserCheck className="w-6 h-6 text-indigo-500" />,
      redirectUrl: `/users/cleaner?companyId=${companyId}`, // Updated to use your role system
    },
  ];



  const activityColors = {
    success: "bg-emerald-500",
    info: "bg-sky-500",
    update: "bg-violet-500",
    warning: "bg-amber-500",
    cleaner: <Sparkles className="w-4 h-4" />,
    user: <MessageSquare className="w-4 h-4" />,
  };
  const activityIcons = {
    cleaner: <Sparkles className="w-4 h-4" />,
    user: <MessageSquare className="w-4 h-4" />,
  }

  const handleStatClick = (stat) => {
    // console.log("in handle click");
    if (stat.filterKey) {
      // For ongoing/completed tasks
      router.push(`/cleaner-review?companyId=${companyId}&status=${stat.filterKey}`);
    } else if (stat.redirectUrl) {
      // For other redirects
      router.push(stat.redirectUrl);
    }
  };

  // Show main loader when initially loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-94">
        <Loader
          size="large"
          color="#3b82f6"
          message="Loading dashboard..."
        />
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards - Updated to show 5 cards in a responsive grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              onClick={() => handleStatClick(stat)}
              className={`bg-white rounded-xl shadow-sm p-5 flex flex-col items-center gap-3 border border-slate-200/60 cursor-pointer hover:shadow-md transition-all duration-200`}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className={`p-3 rounded-lg ${stat.color}`}>
                {stat.icon}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Top Rated Locations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg text-slate-800">
                Today's Top Rated Locations
              </h2>
              <button
                onClick={() => router.push(`/washrooms?companyId=${companyId}&sortBy=currentScore`)}
                className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline transition-colors flex items-center gap-1"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {topLocations.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">No locations found</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {topLocations.map((loc, idx) => (
                  <li key={loc.id} className="flex items-center space-x-4">
                    <span className="flex-none w-8 h-8 flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-500 rounded-full">
                      {idx + 1}
                    </span>
                    <span className="flex-grow text-slate-700 truncate">
                      {loc.name}
                    </span>
                    <Rating value={loc.currentScore || 0} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: Recent Activities - REPLACE ENTIRE SECTION */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60">
            <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-slate-500" />
              Today's Activities
            </h2>

            {isActivitiesLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader size="medium" color="#3b82f6" />
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No activities today</p>
              </div>
            ) : (
              <div className="h-64 overflow-y-auto flex flex-col-reverse custom-scrollbar">
                <ul className="space-y-3">
                  {recentActivities.map((activity) => (
                    <motion.li
                      key={`${activity.type}-${activity.id}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-8 h-8 rounded-full ${activityColors[activity.activityType]} flex items-center justify-center text-white`}>
                          {activityIcons[activity.type]}
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">

                        <p className="cursor-pointer text-slate-700 hover:underline hover:text-blue-700  text-sm leading-relaxed" onClick={(e) => router.push(`/cleaner-review/${activity.reviewId || activity.id}?companyId=${companyId}`)}>
                          {activity.text}
                        </p>


                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-slate-400">
                            {formatTime(activity.timestamp)}
                          </span>

                          {activity.score && (
                            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" fill="currentColor" />
                              {activity.score.toFixed(1)}
                            </span>
                          )}

                          {activity.rating && (
                            <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                              <Star className="w-3 h-3" fill="currentColor" />
                              {activity.rating}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Add custom scrollbar styling */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
}
