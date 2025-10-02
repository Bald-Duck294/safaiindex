"use client";


  // const fetchList = async () => {
  //   console.log("in fetch list");
  //   try {
  //     console.log("on fetch list");
  //     const response = await LocationsApi.getAllLocations();
  //     console.log(response.data, "response 333");
  //     setList(response.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //   }
  //   console.log("ended fetch list");
  // };


  //   useEffect(() => {
  //   fetchList();
  // }, []);


  //   const handleViewLocation = (lat, lng) => {
  //   window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  // };

  // const handleView = (id) => {
  //   window.location.href = `/item/${id}`;
  // };

  // const handleEdit = (id) => {
  //   window.location.href = `/washroom/edit/${id}`;
  // };



  "use client";

import React, { useEffect, useState } from "react";
import { MapPin, Eye, Edit, Navigation } from "lucide-react";
import { Star, StarHalf } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
// Import your API (adjust path as needed)
// import LocationsApi from "@/lib/api/LocationApi";

function WashroomsPage() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchList = async () => {
    console.log("in fetch list");
    try {
      console.log("on fetch list");
      const response = await LocationsApi.getAllLocations();
      console.log(response.data, "response 333");
      setList(response.data);
      setLoading(false)
      // Mock data for demo - replace with your API call
      // setTimeout(() => {
      //   setList([
      //     {
      //       id: "27",
      //       name: "Toilet - Cotton Market",
      //       parent_id: "2",
      //       company_id: "1",
      //       latitude: "21.1498",
      //       longitude: "79.0821",
      //       metadata: null,
      //       created_at: "2025-07-21T11:43:35.603Z",
      //       updated_at: "2025-07-21T11:43:35.603Z",
      //       type_id: "4",
      //       options: {},
      //       hygiene_scores: [],
      //       averageRating: 4.2,
      //       ratingCount: 15
      //     },
      //     {
      //       id: "28",
      //       name: "Toilet - Medical Square",
      //       parent_id: "2",
      //       company_id: "1",
      //       latitude: "21.1517",
      //       longitude: "79.0885",
      //       metadata: null,
      //       created_at: "2025-07-21T11:43:35.603Z",
      //       updated_at: "2025-07-21T11:43:35.603Z",
      //       type_id: "4",
      //       options: {},
      //       hygiene_scores: [],
      //       averageRating: null,
      //       ratingCount: 0
      //     }
      //   ]);
      //   setLoading(false);
      // }, 1000);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching list:", error);
    }
    console.log("ended fetch list");
  };

  useEffect(() => {
    fetchList();
  }, []);



  //   const fetchList = async () => {
  //   console.log("in fetch list");
  //   try {
  //     console.log("on fetch list");
  //     const response = await LocationsApi.getAllLocations();
  //     console.log(response.data, "response 333");
  //     setList(response.data);
  //     setLoading(false);
  //   } catch (error) {
  //     setLoading(false);
  //   }
  //   console.log("ended fetch list");
  // };


  //   useEffect(() => {
  //   fetchList();
  // }, []);


  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleView = (id) => {
    window.location.href = `/item/${id}`;
  };

  const handleEdit = (id) => {
    window.location.href = `/washroom/edit/${id}`;
  };

  // 1. Emoji-based Rating System
  const renderEmojiRating = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    
    // const getEmojiAndColor = (rating) => {
    //   if (rating >= 6.5) return { emoji: '🤩', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Amazing' };
    //   if (rating >= 4) return { emoji: '😊', color: 'text-green-600', bg: 'bg-green-50', label: 'Great' };
    //   if (rating >= 3) return { emoji: '😐', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Okay' };
    //   if (rating >= 2) return { emoji: '😕', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Poor' };
    //   if (rating > 0) return { emoji: '😰', color: 'text-red-600', bg: 'bg-red-50', label: 'Terrible' };
    //   return { emoji: '❓', color: 'text-slate-500', bg: 'bg-slate-50', label: 'Unrated' };
    // };


        const getEmojiAndColor = (rating) => {
      if (rating >= 7.5) return { emoji: '🤩', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Amazing' };
      if (rating >= 4) return { emoji: '😊', color: 'text-orange-600', bg: 'bg-orange-50', label: 'Great' };
      if (rating >= 3) return { emoji: '😐', color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Okay' };
      if (rating >= 2) return { emoji: '😕', color: 'text-red-600', bg: 'bg-orange-50', label: 'Poor' };
      if (rating > 0) return { emoji: '😰', color: 'text-red-600', bg: 'bg-red-50', label: 'Terrible' };
      return { emoji: '❓', color: 'text-slate-500', bg: 'bg-slate-50', label: 'Unrated' };
    };

    const { emoji, color, bg, label } = getEmojiAndColor(actualRating);

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
        {/* <span className="text-xl">{emoji}</span> */}
        <div className="flex flex-col">
          <div className={`font-semibold text-sm ${color}`}>
            {actualRating > 0 ? actualRating.toFixed(1) : '-'} · {label}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500">
              {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
            </div>
          )}
        </div>
      </div>
    );
  };

  // 2. Hygiene Meter (Toilet-themed)
  const renderHygieneMeter = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    const percentage = (actualRating / 5) * 100;
    
    const getMeterColor = (rating) => {
      if (rating >= 4) return 'from-emerald-400 to-emerald-600';
      if (rating >= 3) return 'from-yellow-400 to-yellow-600';
      if (rating >= 2) return 'from-orange-400 to-orange-600';
      if (rating > 0) return 'from-red-400 to-red-600';
      return 'from-slate-300 to-slate-400';
    };

    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-center">
          <div className="text-xs text-slate-600 mb-1 font-medium">Hygiene</div>
          <div className="relative w-16 h-4 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full bg-gradient-to-r ${getMeterColor(actualRating)} transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {actualRating > 0 ? actualRating.toFixed(1) : '-'}
              </span>
            </div>
          </div>
        </div>
        {reviewCount > 0 && (
          <div className="text-xs text-slate-500">
            {reviewCount} reviews
          </div>
        )}
      </div>
    );
  };

  // 3. Traffic Light System
  const renderTrafficLight = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    
    const getActiveLight = (rating) => {
      if (rating >= 4) return 'green';
      if (rating >= 2.5) return 'yellow';
      if (rating > 0) return 'red';
      return 'none';
    };

    const activeLight = getActiveLight(actualRating);

    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col gap-1 p-2 bg-slate-800 rounded-lg">
          <div className={`w-3 h-3 rounded-full ${activeLight === 'green' ? 'bg-green-400 shadow-green-400/50 shadow-lg' : 'bg-slate-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${activeLight === 'yellow' ? 'bg-yellow-400 shadow-yellow-400/50 shadow-lg' : 'bg-slate-600'}`}></div>
          <div className={`w-3 h-3 rounded-full ${activeLight === 'red' ? 'bg-red-400 shadow-red-400/50 shadow-lg' : 'bg-slate-600'}`}></div>
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-medium text-slate-700">
            {actualRating > 0 ? actualRating.toFixed(1) : '-'}/5
          </div>
          <div className="text-xs text-slate-500">
            {activeLight === 'green' ? 'Excellent' : 
             activeLight === 'yellow' ? 'Acceptable' : 
             activeLight === 'red' ? 'Poor' : 'No rating'}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-400">
              {reviewCount} reviews
            </div>
          )}
        </div>
      </div>
    );
  };

  // 4. Modern Gradient Bar
  const renderGradientBar = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    const percentage = (actualRating / 5) * 100;
    
    return (
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-slate-700">
              {actualRating > 0 ? actualRating.toFixed(1) : '-'}
            </span>
            <span className="text-xs text-slate-500">/5</span>
          </div>
          <div className="w-20 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 transition-all duration-700"
              style={{ 
                width: `${percentage}%`,
                filter: actualRating === 0 ? 'grayscale(100%)' : 'none'
              }}
            />
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500 mt-1">
              {reviewCount} reviews
            </div>
          )}
        </div>
      </div>
    );
  };

  // 5. Animated Pulse Rating
  const renderPulseRating = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    
    const getPulseColor = (rating) => {
      if (rating >= 4) return 'animate-pulse bg-emerald-500';
      if (rating >= 3) return 'animate-pulse bg-yellow-500';
      if (rating >= 2) return 'animate-pulse bg-orange-500';
      if (rating > 0) return 'animate-pulse bg-red-500';
      return 'bg-slate-300';
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full ${getPulseColor(actualRating)} flex items-center justify-center`}>
          <span className="text-white text-sm font-bold">
            {actualRating > 0 ? actualRating.toFixed(1) : '-'}
          </span>
        </div>
        <div className="flex flex-col">
          <div className="text-sm font-medium text-slate-700">
            {actualRating >= 4 ? 'Excellent' : 
             actualRating >= 3 ? 'Good' : 
             actualRating >= 2 ? 'Fair' : 
             actualRating > 0 ? 'Poor' : 'Unrated'}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500">
              {reviewCount} reviews
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-200 rounded w-64 mb-6"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-white" />
              <h2 className="text-2xl font-bold text-white">
                Public Washrooms Directory
              </h2>
            </div>
            <p className="text-blue-100 mt-1">
              Find and rate washrooms near you
            </p>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            {list.length === 0 ? (
              <div className="p-12 text-center">
                <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 text-lg">
                  No washrooms found in your area
                </p>
                <p className="text-slate-400 text-sm mt-2">
                  Try refreshing or check back later
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      ID
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Rating
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Coordinates
                    </th>
                    <th className="text-left py-4 px-6 font-semibold text-slate-700">
                      Added
                    </th>
                    <th className="text-center py-4 px-6 font-semibold text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                        index % 2 === 0 ? "bg-white" : "bg-slate-25"
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 font-medium rounded-full text-sm">
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800">
                          {item.name}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {/* Choose one of these rating systems: */}
                        
                        {/* Option 1: Emoji Rating */}
                        {renderEmojiRating(item.averageRating, item.ratingCount)}
                        
                        {/* Option 2: Hygiene Meter - Uncomment to use
                        {renderHygieneMeter(item.averageRating, item.ratingCount)}
                        */}
                        
                        {/* Option 3: Traffic Light - Uncomment to use
                        {renderTrafficLight(item.averageRating, item.ratingCount)}
                        */}
                        
                        {/* Option 4: Gradient Bar - Uncomment to use
                        {renderGradientBar(item.averageRating, item.ratingCount)}
                        */}
                        
                        {/* Option 5: Pulse Rating - Uncomment to use
                        {renderPulseRating(item.averageRating, item.ratingCount)}
                        */}
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600">
                          <div>Lat: {parseFloat(item.latitude).toFixed(4)}</div>
                          <div>
                            Lng: {parseFloat(item.longitude).toFixed(4)}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-slate-600">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              handleViewLocation(item.latitude, item.longitude)
                            }
                            className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            title="View Location"
                          >
                            <Navigation className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleView(item.id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Total: {list.length} washrooms found</span>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WashroomsPage;
