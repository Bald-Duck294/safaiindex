"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { Loader2, Search, X } from "lucide-react";
import locationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useRouter } from "next/navigation";

const mapContainerStyle = {
  width: "100%",
  height: "80vh",
};

const defaultCenter = {
  lat: 21.1458,
  lng: 79.0882,
};

const MapView = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: "AIzaSyBfBFN6L_HROTd-mS8QqUDRIqskkvHvFYk",
  });

  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const [showDropdown, setShowDropdown] = useState(false);
  const mapRef = useRef(null);
  const searchRef = useRef(null);

  const { companyId, hasCompanyContext } = useCompanyId();

  const fetchLocations = useCallback(async () => {
    setLoading(true);

    const res = await locationsApi.getAllLocations(companyId);
    if (res.success) {
      setLocations(res.data);
      setFiltered(res.data);
    } else {
      console.error(res.error);
    }
    setLoading(false);
  }, [companyId]);

  useEffect(() => {

    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping fetch - companyId not ready:', companyId);
      setLoading(false);
      return;
    }

    fetchLocations();
  }, [fetchLocations , companyId]);

  // Handle search input changes
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (value.trim() === "") {
      setFiltered(locations);
      setShowDropdown(false);
    } else {
      const matches = locations.filter((loc) =>
        loc.name.toLowerCase().includes(value.toLowerCase())
      );
      setFiltered(matches);
      setShowDropdown(matches.length > 0);
    }
  };

  // Handle location selection from dropdown
  const handleLocationSelect = (loc) => {
    const lat = parseFloat(loc.latitude);
    const lng = parseFloat(loc.longitude);

    setCenter({ lat, lng });
    setSelected(loc);
    setSearch(loc.name);
    setShowDropdown(false);

    // Pan and zoom to selected location
    if (mapRef.current) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }
  };

  // Clear search
  const handleClearSearch = () => {
    setSearch("");
    setFiltered(locations);
    setShowDropdown(false);
    setSelected(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Washroom Map</h2>

      {/* Local Search Input with Dropdown */}
      <div className="mb-4 relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search toilets by name..."
            value={search}
            onChange={handleInputChange}
            onFocus={() => {
              if (search && filtered.length > 0) {
                setShowDropdown(true);
              }
            }}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filtered.map((loc) => (
              <div
                key={loc.id}
                onClick={() => handleLocationSelect(loc)}
                className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{loc.name}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {parseFloat(loc.latitude).toFixed(4)}, {parseFloat(loc.longitude).toFixed(4)}
                    </p>
                  </div>
                  {loc.averageRating !== null && loc.averageRating > 0 && (
                    <div className="flex items-center gap-1 ml-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-medium">{loc.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results Message */}
        {showDropdown && filtered.length === 0 && search && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No toilets found matching "{search}"
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-2 text-sm text-gray-600">
        Showing {filtered.length} of {locations.length} locations
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="animate-spin" />
        </div>
      ) : (
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={13}
          center={center}
          onLoad={(map) => {
            mapRef.current = map;
          }}
        >
          {filtered.map((loc) => (
            <Marker
              key={loc.id}
              position={{
                lat: parseFloat(loc.latitude),
                lng: parseFloat(loc.longitude),
              }}
              onClick={() => {
                setSelected(loc);
                setCenter({
                  lat: parseFloat(loc.latitude),
                  lng: parseFloat(loc.longitude),
                });
              }}
              title={loc.name}
            />
          ))}

          {selected && (
            <InfoWindow
              position={{
                lat: parseFloat(selected.latitude),
                lng: parseFloat(selected.longitude),
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="w-72 bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Image Section */}
                <div className="relative">
                  <img
                    src={
                      selected.images && selected.images.length > 0
                        ? selected.images[0]
                        : "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"
                    }
                    alt={selected.name || "Washroom"}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                    }}
                  />

                  {/* Image count indicator */}
                  {selected.images && selected.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {selected.images.length} photos
                    </div>
                  )}

                  {/* Rating overlay */}
                  {selected.averageRating !== null && (
                    <div className="absolute bottom-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded-full flex items-center gap-1">
                      <span className="text-yellow-500">⭐</span>
                      <span className="text-sm font-semibold">{selected.averageRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-4">
                  {/* Name */}
                  <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight">
                    {selected.name || "Unnamed Location"}
                  </h3>

                  {/* Coordinates as Address fallback */}
                  <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                    <span>📍</span>
                    {parseFloat(selected.latitude).toFixed(4)}, {parseFloat(selected.longitude).toFixed(4)}
                  </p>

                  {/* Rating Section */}
                  <div className="mb-3">
                    {selected.averageRating !== null && selected.averageRating > 0 ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-semibold text-gray-900">{selected.averageRating.toFixed(1)}</span>
                        </div>
                        <span className="text-gray-500 text-sm">
                          ({selected.ratingCount || 0} {selected.ratingCount === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <span className="text-gray-400">⭐</span>
                        <span className="text-gray-500 text-sm">No ratings yet</span>
                      </div>
                    )}
                  </div>

                  {/* Amenities Section */}
                  {selected.options && Object.keys(selected.options).length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Amenities</h4>
                      <div className="flex flex-wrap gap-1">
                        {/* Gender Access */}
                        {selected.options.genderAccess && Array.isArray(selected.options.genderAccess) ? (
                          selected.options.genderAccess.map((gender) => (
                            <span key={gender} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              {gender.charAt(0).toUpperCase() + gender.slice(1)}
                            </span>
                          ))
                        ) : selected.options.accessType && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {selected.options.accessType}
                          </span>
                        )}

                        {/* Paid/Free */}
                        {selected.options.isPaid !== undefined && (
                          <span className={`px-2 py-1 text-xs rounded-full ${selected.options.isPaid
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                            }`}>
                            {selected.options.isPaid ? '💰 Paid' : '🆓 Free'}
                          </span>
                        )}

                        {/* 24/7 */}
                        {selected.options.is24Hours && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            🕐 24/7
                          </span>
                        )}

                        {/* Wheelchair Accessible */}
                        {selected.options.isHandicapAccessible && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            ♿ Accessible
                          </span>
                        )}

                        {/* Attendant */}
                        {selected.options.hasAttendant && (
                          <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                            👤 Attendant
                          </span>
                        )}

                        {/* Baby Changing */}
                        {selected.options.hasBabyChangingStation && (
                          <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                            👶 Baby Change
                          </span>
                        )}

                        {/* Sanitary Products */}
                        {selected.options.hasSanitaryProducts && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            🧴 Sanitary
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Added {new Date(selected.created_at).toLocaleDateString()}
                    </div>
                    <button
                      onClick={() => {
                        router.push(`/washrooms/item/${selected.id}?companyId=${companyId}`);
                      }}
                      className="cursor-pointer text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>
      )}
    </div>
  );
};

export default MapView;
