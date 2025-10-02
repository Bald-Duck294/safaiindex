'use client';

import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';
import { useState, useEffect, useRef, useCallback } from 'react';

const containerStyle = {
  width: '100%',
  height: '300px',
};

const defaultCenter = {
  lat: 21.1458, // Nagpur
  lng: 79.0882,
};

export default function GoogleMapPicker({ lat, lng, onSelect }) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyBfBFN6L_HROTd-mS8QqUDRIqskkvHvFYk',
    libraries: ['places'],
  });

  const [position, setPosition] = useState(lat && lng ? { lat, lng } : null);
  const [mapCenter, setMapCenter] = useState(lat && lng ? { lat, lng } : defaultCenter);
  const inputRef = useRef(null);
  const autocompleteRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (lat && lng) {
      const newPosition = { lat, lng };
      setPosition(newPosition);
      setMapCenter(newPosition);
    }
  }, [lat, lng]);

  const handleMapClick = useCallback(
    (event) => {
      const newPos = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      setPosition(newPos);
      setMapCenter(newPos);
      onSelect(newPos.lat, newPos.lng);
    },
    [onSelect]
  );

  useEffect(() => {
    if (isLoaded && window.google && inputRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(inputRef.current);
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace();
        if (place.geometry) {
          const location = place.geometry.location;
          const newLat = location.lat();
          const newLng = location.lng();
          const newPos = { lat: newLat, lng: newLng };
          setPosition(newPos);
          setMapCenter(newPos);
          onSelect(newLat, newLng);
        }
      });
    }
  }, [isLoaded, onSelect]);

  if (loadError) return <div>Error loading maps</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="mb-4">
      <label className="block mb-2 font-semibold">Search Location</label>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search for a place"
        className="w-full p-2 border rounded mb-2"
      />
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={13}
        onClick={handleMapClick}
        onLoad={(map) => (mapRef.current = map)}
      >
        {position && <Marker position={position} />}
      </GoogleMap>
    </div>
  );
}
