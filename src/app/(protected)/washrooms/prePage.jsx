"use client";

import React, { useEffect, useState } from "react";
import { MapPin, Eye, Edit, Navigation } from "lucide-react";
import { Star, StarHalf, StarOff } from "lucide-react";

import axios from "axios";
import LocationsApi from "@/lib/api/LocationApi";

function WashroomsList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  // const fetchList = async () => {
  //   try {
  //     // Replace this with your actual API call
  //     // const response = await axios('http://localhost:8000/api/getLocations?cb=' + Date.now());
  //     // setList(response.data);

  //     // Using mock data for demo
  //     setTimeout(() => {
  //       setList(mockData);
  //       setLoading(false);
  //     }, 1000);
  //   } catch (error) {
  //     console.log(error, 'error');
  //     setLoading(false);
  //   }
  // };

  // useEffect(() => {
  //   fetchList();
  // }, []);

  const fetchList = async () => {
    // try {
    //   const response = await axios('http://localhost:8000/api/locations?cb=' + Date.now());
    //   console.log(response.data, 'response');
    //   setList(response.data);
    //   setLoading(false)
    // } catch (error) {
    //         setLoading(false)

    //   console.log(error, 'error');
    // }
    console.log("in fetch list");
    try {
      console.log("on fetch list");
      const response = await LocationsApi.getAllLocations();
      console.log(response.data, "response 333");
      setList(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
    console.log("ended fetch list");
  };

  useEffect(() => {
    fetchList();
  }, []);

  const handleViewLocation = (lat, lng) => {
    // Redirect to maps or location page
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleView = (id) => {
    // Navigate to washroom detail page
    window.location.href = `/item/${id}`;
  };

  const handleEdit = (id) => {
    // Navigate to edit page
    window.location.href = `/washroom/edit/${id}`;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;
    const totalStars = 5;

    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star
          key={`full-${i}`}
          className="h-4 w-4 text-yellow-500 fill-yellow-500"
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalf
          key="half"
          className="h-4 w-4 text-yellow-500 fill-yellow-500"
        />
      );
    }

    while (stars.length < totalStars) {
      stars.push(
        <Star
          key={`empty-${stars.length}`}
          className="h-4 w-4 text-slate-300"
        />
      );
    }

    return stars;
  };

  // console.log(list, "list data");
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
                        <div className="font-medium text-slate-800">
                          {renderStars(item.averageRating || 0)}
                        </div>
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

export default WashroomsList;
