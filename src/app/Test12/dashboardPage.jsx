"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Demo data
  const stats = [
    { label: "Total Locations", value: 42 },
    { label: "Total Users", value: 128 },
    { label: "Avg. Rating", value: "4.5 ⭐" },
    { label: "Ongoing Tasks", value: 8 },
    { label: "Completed Tasks", value: 56 },
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
    "Cleaner A completed cleaning at Sitabuldi.",
    "Manager approved report for Dharampeth.",
    "New location added: Railway Station.",
    "User feedback submitted for Mankapur.",
  ];

  // Auto-scrolling top rated list
  const [scrollIndex, setScrollIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setScrollIndex((prev) => (prev + 1) % topLocations.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg p-4 text-center"
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm opacity-90">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Top Rated Locations */}
        <div className="bg-white rounded-xl shadow-lg p-4 col-span-1">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">Top Rated Locations</h2>
          <div className="overflow-hidden h-40">
            <motion.div
              key={scrollIndex}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-gray-800 font-medium"
            >
              {topLocations[scrollIndex].name} - {topLocations[scrollIndex].rating}
            </motion.div>
          </div>
        </div>

        {/* Right: Bar Chart */}
        <div className="bg-white rounded-xl shadow-lg p-4 col-span-2">
          <h2 className="font-semibold text-lg mb-4 text-gray-700">Locations by Organization</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="org" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="locations" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom: Recent Activities */}
      <div className="bg-white rounded-xl shadow-lg p-4 mt-6">
        <h2 className="font-semibold text-lg mb-4 text-gray-700">Recent Activities</h2>
        <ul className="space-y-2 text-gray-600">
          {recentActivities.map((activity, idx) => (
            <li key={idx} className="border-b pb-2 last:border-none">{activity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
