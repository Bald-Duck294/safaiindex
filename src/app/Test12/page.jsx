"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";
import { MapPin, Users, Star, ClipboardList, CheckCircle, Activity } from "lucide-react";
import { useSelector } from "react-redux";
// A reusable component for the star rating display
const Rating = ({ value }) => {
  const [rating, emoji] = value.split(" ");
  return (
    <div className="flex items-center gap-2 text-sm">
      <Star className="w-4 h-4 text-amber-400" fill="currentColor" />
      <span className="font-semibold text-slate-600">{rating}</span>
    </div>
  );
};

export default function Dashboard() {

  const data = useSelector((state)=>state.auth);

  console.log(data, "data");
  // --- DATA ---
  // Using a more muted and cohesive color palette
  const stats = [
    {
      label: "Total Locations",
      value: 42,
      color: "text-sky-600 bg-sky-50",
      icon: <MapPin className="w-6 h-6 text-sky-500" />,
    },
    {
      label: "Total Users",
      value: 128,
      color: "text-emerald-600 bg-emerald-50",
      icon: <Users className="w-6 h-6 text-emerald-500" />,
    },
    {
      label: "Avg. Rating",
      value: "4.5",
      color: "text-amber-600 bg-amber-50",
      icon: <Star className="w-6 h-6 text-amber-500" />,
    },
    {
      label: "Ongoing Tasks",
      value: 8,
      color: "text-violet-600 bg-violet-50",
      icon: <ClipboardList className="w-6 h-6 text-violet-500" />,
    },
    {
      label: "Completed Tasks",
      value: 56,
      color: "text-rose-600 bg-rose-50",
      icon: <CheckCircle className="w-6 h-6 text-rose-500" />,
    },
  ];

  const topLocations = [
    { name: "Sitabuldi Main Toilet", rating: "4.9 ⭐" },
    { name: "Dharampeth Market", rating: "4.8 ⭐" },
    { name: "Mankapur Station", rating: "4.7 ⭐" },
    { name: "Civil Lines Garden", rating: "4.6 ⭐" },
    { name: "Gandhibagh Chowk", rating: "4.5 ⭐" },
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

  // --- RENDER ---
  return (
    <div className="bg-slate-50 min-h-screen p-4 sm:p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4 border border-slate-200/60"
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
            >
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                <div className="text-sm text-slate-500">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left: Improved Top Rated Locations */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60 lg:col-span-1">
            <h2 className="font-semibold text-lg text-slate-800 mb-4">
              Top Rated Locations
            </h2>
            <ul className="space-y-4">
              {topLocations.map((loc, idx) => (
                <li key={idx} className="flex items-center space-x-4">
                  <span className="flex-none w-8 h-8 flex items-center justify-center text-sm font-bold bg-slate-100 text-slate-500 rounded-full">
                    {idx + 1}
                  </span>
                  <span className="flex-grow text-slate-700 truncate">{loc.name}</span>
                  <Rating value={loc.rating} />
                </li>
              ))}
            </ul>
          </div>
          
          {/* Right: Bar Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200/60 lg:col-span-2">
            <h2 className="font-semibold text-lg text-slate-800 mb-4">
              Locations by Organization
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="org" tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '0.75rem',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Bar dataKey="locations" fill="#38bdf8" radius={[4, 4, 0, 0]} barSize={30} />
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
                <span className={`w-2 h-2 rounded-full ${activityColors[activity.type]}`} />
                <span className="text-slate-600 text-sm">{activity.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}