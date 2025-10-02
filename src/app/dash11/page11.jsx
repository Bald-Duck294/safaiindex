"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { motion } from "framer-motion";
import {
  MapPin,
  Users,
  Star,
  ClipboardList,
  CheckCircle,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

// Import your API utilities
import LocationsApi from "@/lib/api/LocationApi";
import { CleanerReviewApi } from "@/lib/api/cleanerReviewApi";

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

// A simple skeleton loader for the stat cards
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-200/60 animate-pulse">
    <div className="p-3 rounded-lg bg-slate-200 w-12 h-12"></div>
    <div className="flex-1">
      <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    </div>
  </div>
);

export default function Dashboard() {
  // State to hold all the dynamic dashboard data
  const [statsData, setStatsData] = useState({
    totalLocations: 0,
    totalUsers: 128,
    avgRating: "0.0",
    ongoingTasks: 0,
    completedTasks: 0,
  });
  const [topLocations, setTopLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Fetch all data when the component mounts
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const company_id = 2;
        const [locationsRes, ongoingRes, completedRes] = await Promise.all([
          LocationsApi.getAllLocations(company_id),
          CleanerReviewApi.getReviewsByStatus("ongoing"),
          CleanerReviewApi.getReviewsByStatus("completed"),
        ]);

        if (locationsRes.success) {
          setStatsData((prev) => ({
            ...prev,
            totalLocations: locationsRes.data.length,
          }));

          const sortedLocations = [...locationsRes.data]
            .sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
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
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast.error("Could not load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // --- DYNAMIC DATA MAPPING ---
  const stats = [
    {
      label: "Total Locations",
      value: statsData.totalLocations,
      color: "text-sky-600 bg-sky-50",
      icon: <MapPin className="w-6 h-6 text-sky-500" />,
    },
    {
      label: "Ongoing Tasks",
      value: statsData.ongoingTasks,
      color: "text-violet-600 bg-violet-50",
      icon: <ClipboardList className="w-6 h-6 text-violet-500" />,
      filterKey: "ongoing", // ✅ FIXED: Added filterKey
    },
    {
      label: "Completed Tasks",
      value: statsData.completedTasks,
      color: "text-rose-600 bg-rose-50",
      icon: <CheckCircle className="w-6 h-6 text-rose-500" />,
      filterKey: "completed", // ✅ FIXED: Added filterKey
    },
  ];

  const chartData = [
    { org: "Org A", locations: 10 },
    { org: "Org B", locations: 15 },
    { org: "Org C", locations: 7 },
    { org: "Org D", locations: 12 },
  ];

  const recentActivities = [
    { text: "Cleaner A completed cleaning at Sitabuldi.", type: "success" },
    { text: "Manager approved report for Dharampeth.", type: "info" },
    { text: "New location added: Railway Station.", type: "update" },
    { text: "User feedback submitted for Mankapur.", type: "warning" },
  ];

  const activityColors = {
    success: "bg-emerald-500",
    info: "bg-sky-500",
    update: "bg-violet-500",
    warning: "bg-amber-500",
  };

  const handleStatClick = (filterKey) => {
    console.log("in handle click");
    if (filterKey) {
      router.push(`/cleaner-review?status=${filterKey}`);
    } else {
      console.log("in the else block");
      window.location.href = "http://localhost:3000/locations";
    }
  };

  // --- RENDER ---
  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {isLoading
            ? Array.from({ length: 3 }).map((_, idx) => (
                <StatCardSkeleton key={idx} />
              ))
            : stats.map((stat, idx) => (
                <motion.div
                  key={idx}
                  onClick={() => handleStatClick(stat.filterKey)}
                  className={`bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-200/60 ${
                    stat.filterKey ? "cursor-pointer" : ""
                  }`}
                  whileHover={
                    stat.filterKey
                      ? { y: -3, transition: { duration: 0.2 } }
                      : {}
                  }
                >
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-800">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                </motion.div>
              ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Top Rated Locations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60 lg:col-span-1">
            <h2 className="font-semibold text-lg text-slate-800 mb-4">
              Top Rated Locations
            </h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-4 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  </div>
                ))}
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
                    <Rating value={loc.averageRating || 0} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Right: Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60 lg:col-span-2">
            <h2 className="font-semibold text-lg text-slate-800 mb-4">
              Locations by Organization
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="org"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(5px)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.75rem",
                  }}
                />
                <Bar
                  dataKey="locations"
                  fill="#38bdf8"
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom: Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-slate-200/60">
          <h2 className="font-semibold text-lg text-slate-800 flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-slate-500" /> Recent Activities
          </h2>
          <ul className="space-y-2">
            {recentActivities.map((activity, idx) => (
              <li
                key={idx}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    activityColors[activity.type]
                  }`}
                />
                <span className="text-slate-600 text-sm">{activity.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
