"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import GoogleZonesMap from "../components/GoogleZonesMap";
import LocationsApi from "@/lib/api/LocationApi";

export default function DashboardPage() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneDisplayType, setZoneDisplayType] = useState("buffered");

  useEffect(() => {
    async function fetchWashrooms() {
      try {
        const data = await LocationsApi.fetchZonesWithToilets();
        console.log(data, "data");
        setLoading(false);
        setZones(data);
      } catch (error) {
        console.log(error, "error");
      }
    }

    fetchWashrooms();
  }, []);

  const displayOptions = [
    { value: "circle", label: "Circular Zones", description: "Show zones as circles around toilets" },
    { value: "buffered", label: "Buffered Areas", description: "Show rectangular zones around toilet clusters" },
    { value: "convex", label: "Convex Hull", description: "Show minimal polygon connecting all toilets" },
    { value: "direct", label: "Direct Connection", description: "Connect toilet points directly" }
  ];

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Zone Toilet Overview</h2>
        
        {/* Zone Display Controls */}
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Zone Display Options</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {displayOptions.map((option) => (
              <label key={option.value} className="flex items-start space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name="zoneDisplay"
                  value={option.value}
                  checked={zoneDisplayType === option.value}
                  onChange={(e) => setZoneDisplayType(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-600">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Zone Statistics */}
        {/* {!loading && zones.length > 0 && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800">Total Zones</h4>
              <p className="text-2xl font-bold text-blue-600">{zones.length}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800">Total Toilets</h4>
              <p className="text-2xl font-bold text-green-600">
                {zones.reduce((total, zone) => total + zone.children?.length, 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800">Avg Toilets per Zone</h4>
              <p className="text-2xl font-bold text-purple-600">
                {zones.length > 0 ? Math.round(zones.reduce((total, zone) => total + zone.children?.length, 0) / zones.length * 10) / 10 : 0}
              </p>
            </div>
          </div>
        )} */}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading map...</div>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden shadow-lg">
          <GoogleZonesMap zonesData={zones} zoneDisplayType={zoneDisplayType} />
        </div>
      )}

      {/* Zone List */}
      {!loading && zones.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Zone Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {zones.map((zone, index) => (
              <div key={zone.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-2">
                  <div 
                    className="w-4 h-4 rounded mr-2" 
                    style={{ backgroundColor: ["#FF5733", "#33FF57", "#3357FF", "#F39C12", "#8E44AD", "#1ABC9C"][index % 6] }}
                  ></div>
                  <h4 className="font-semibold">{zone.name}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-2">Type ID: {zone.type_id}</p>
                <p className="text-sm">
                  <span className="font-medium">{zone.children?.length}</span> toilet{zone.children?.length !== 1 ? 's' : ''}
                </p>
                {zone.children?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-500 mb-1">Toilets:</p>
                    <ul className="text-xs text-gray-700 max-h-20 overflow-y-auto">
                      {zone.children.map((toilet) => (
                        <li key={toilet.id} className="truncate">• {toilet.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}