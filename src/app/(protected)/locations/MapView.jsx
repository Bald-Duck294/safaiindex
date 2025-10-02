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
            // <InfoWindow
            //   position={{
            //     lat: parseFloat(selected.latitude),
            //     lng: parseFloat(selected.longitude),
            //   }}
            //   onCloseClick={() => setSelected(null)}
            // >
            //   <div className="text-sm">
            //     <p className="font-semibold">{selected.name}</p>
            //     {selected.averageRating !== null ? (
            //       <p>Avg. Rating: {selected.averageRating.toFixed(1)} ⭐</p>
            //     ) : (
            //       <p>No ratings yet</p>
            //     )}
            //   </div>
            // </InfoWindow>

            <InfoWindow
              position={{
                lat: parseFloat(selected.latitude),
                lng: parseFloat(selected.longitude),
              }}
              onCloseClick={() => setSelected(null)}
            >
              <div className="w-64 text-sm">
                {/* Demo Image */}
                <img
                  src="https://indianexpress.com/wp-content/uploads/2015/02/toilets_759.jpg" // Replace this with selected.imageURL if available
                  alt="Toilet"
                  className="w-full h-32 object-cover rounded-t-md"
                />

                <div className="p-2">
                  {/* Name */}
                  <h3 className="text-lg font-bold mb-1">
                    {selected.name || "Unnamed Toilet"}
                  </h3>

                  {/* Address - placeholder for now */}
                  <p className="text-gray-600 text-xs mb-2">
                    Near Gali No 4, Chota Tajbagh, Nagpur 440024
                  </p>

                  {/* Hygiene Rating */}
                  {selected.averageRating !== null ? (
                    <p className="text-sm mb-1">
                      <span className="font-semibold">Hygiene Rating:</span>{" "}
                      {selected.averageRating.toFixed(1)} ⭐ (
                      {selected.ratingCount || 0} ratings)
                    </p>
                  ) : (
                    <p className="text-sm mb-1 text-gray-500">No ratings yet</p>
                  )}

                  {/* Washroom Type */}
                  <p className="text-sm mb-1">
                    <span className="font-semibold">Type:</span>{" "}
                    {selected.type || "Unisex"}
                  </p>

                  {/* Accessibility & Other Notes */}
                  <p className="text-xs text-gray-500 italic">
                    🚻 Wheelchair accessible, 🆓 Free to use
                  </p>
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
