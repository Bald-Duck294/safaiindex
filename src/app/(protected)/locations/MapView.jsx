// "use client";

// import React, { useEffect, useState, useCallback } from "react";
// import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
// import { Loader2 } from "lucide-react";
// import locationsApi from "@/lib/api/LocationApi"; // adjust path as needed

// const mapContainerStyle = {
//   width: "100%",
//   height: "80vh",
// };

// const center = {
//   lat: 21.1458, // Centered around Nagpur
//   lng: 79.0882,
// };

// const MapView = () => {
//   const { isLoaded, loadError } = useLoadScript({
//     googleMapsApiKey: "AIzaSyBfBFN6L_HROTd-mS8QqUDRIqskkvHvFYk",
//   });

//   const [locations, setLocations] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [loading, setLoading] = useState(true);

//   const fetchLocations = useCallback(async () => {
//     setLoading(true);
//     const res = await locationsApi.getAllLocations();
//     if (res.success) {
//         console.log('response' , 'response')
//       setLocations(res.data);
//     } else {
//       console.error(res.error);
//     }
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     fetchLocations();
//   }, [fetchLocations]);

//   if (loadError) return <div>Error loading maps</div>;
//   if (!isLoaded) return <div className="flex justify-center items-center h-96"><Loader2 className="animate-spin" /></div>;

//   return (
//     <div className="p-4">
//       <h2 className="text-xl font-bold mb-4">Toilets Map</h2>

//       {loading ? (
//         <div className="flex justify-center items-center h-96">
//           <Loader2 className="animate-spin" />
//         </div>
//       ) : (
//         <GoogleMap
//           mapContainerStyle={mapContainerStyle}
//           zoom={13}
//           center={center}
//         >
//           {locations.map((loc) => (
//             <Marker
//               key={loc.id}
//               position={{
//                 lat: parseFloat(loc.latitude),
//                 lng: parseFloat(loc.longitude),
//               }}
//               onClick={() => setSelected(loc)}
//               title={loc.name}
//             />
//           ))}

//           {selected && (
//             <InfoWindow
//               position={{
//                 lat: parseFloat(selected.latitude),
//                 lng: parseFloat(selected.longitude),
//               }}
//               onCloseClick={() => setSelected(null)}
//             >
//               <div className="text-sm">
//                 <p className="font-semibold">{selected.name}</p>
//                 {selected.averageRating !== null ? (
//                   <p>Avg. Rating: {selected.averageRating.toFixed(1)} ⭐</p>
//                 ) : (
//                   <p>No ratings yet</p>
//                 )}
//               </div>
//             </InfoWindow>
//           )}
//         </GoogleMap>
//       )}
//     </div>
//   );
// };

// export default MapView;

"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
  Autocomplete,
} from "@react-google-maps/api";
import { Loader2, LocateIcon } from "lucide-react";
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
    libraries: ["places"],
  });

  const router = useRouter();
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtered, setFiltered] = useState([]);
  const [center, setCenter] = useState(defaultCenter);
  const mapRef = useRef(null);
  const autocompleteRef = useRef(null);

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
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);

    const matches = locations.filter((loc) =>
      loc.name.toLowerCase().includes(value.toLowerCase())
    );

    // console.log(matches, "matches");
    // console.log(locations, "input change locations");
    setFiltered(matches);
  };

  const handlePlaceSelected = () => {
    const place = autocompleteRef.current.getPlace();
    // console.log(place, "place");
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const locData = {
        id: "34567",
        latitude: place.geometry.location.lat(),
        longitude: place.geometry.location.lng(),
        averageRating: null,
      };

      setFiltered([locData]);
      setCenter({ lat, lng });
      setSelected(locData); // Deselect current toilet
      mapRef.current?.panTo({ lat, lng });
    }
  };

  // const handlePlaceSelected = () => {
  //   const place = autocompleteRef.current.getPlace();

  //   if (place && place.geometry) {
  //     const lat = place.geometry.location.lat();
  //     const lng = place.geometry.location.lng();

  //     const map = mapRef.current;

  //     if (!map || !place.place_id) return;

  //     const service = new window.google.maps.places.PlacesService(map);

  //     service.getDetails({ placeId: place.place_id }, (result, status) => {
  //       if (status === window.google.maps.places.PlacesServiceStatus.OK) {
  //         const externalPlace = {
  //           id: result.place_id,
  //           latitude: lat,
  //           longitude: lng,
  //           name: result.name || "Unnamed Place",
  //           address: result.formatted_address || "",
  //           rating: result.rating || null,
  //           isExternal: true, // for rendering logic
  //         };

  //         setFiltered([externalPlace]);
  //         setCenter({ lat, lng });
  //         setSelected(externalPlace);
  //         map.panTo({ lat, lng });
  //       } else {
  //         console.error("PlacesService failed", status);
  //       }
  //     });
  //   }
  // };

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded)
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );

  // console.log("filtered data ", filtered);
  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Toilets Map</h2>

      {/* Google Places Autocomplete Search */}
      <div className="mb-4">
        <Autocomplete
          onLoad={(autocomplete) => {
            autocompleteRef.current = autocomplete;
          }}
          onPlaceChanged={handlePlaceSelected}
        >
          <input
            type="text"
            placeholder="Search any place or toilet..."
            value={search}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm"
          />
        </Autocomplete>
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
                        // Navigate to detailed view
                        router.push(`/washrooms/item/${selected.id}?companyId=${companyId}`, '_blank');
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
