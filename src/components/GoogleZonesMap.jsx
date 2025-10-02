"use client";

import {
  GoogleMap,
  Marker,
  InfoWindow,
  Polygon,
  Circle,
  useJsApiLoader,
} from "@react-google-maps/api";
import { useState } from "react";

const mapContainerStyle = {
  width: "100%",
  height: "600px",
};

const defaultCenter = {
  lat: 21.146,
  lng: 79.088,
};

const zoneColors = [
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F39C12",
  "#8E44AD",
  "#1ABC9C",
];

// Helper function to create convex hull (simple approach)
const getConvexHull = (points) => {
  if (points.length < 3) return points;

  // Find the leftmost point
  let leftmost = 0;
  for (let i = 1; i < points.length; i++) {
    if (points[i].lng < points[leftmost].lng) {
      leftmost = i;
    }
  }

  const hull = [];
  let current = leftmost;

  do {
    hull.push(points[current]);
    let next = (current + 1) % points.length;

    for (let i = 0; i < points.length; i++) {
      const cross =
        (points[next].lng - points[current].lng) *
          (points[i].lat - points[current].lat) -
        (points[next].lat - points[current].lat) *
          (points[i].lng - points[current].lng);
      if (cross > 0) {
        next = i;
      }
    }

    current = next;
  } while (current !== leftmost);

  return hull;
};

// Helper function to create circle around points
const getCircleFromPoints = (points) => {
  if (points.length === 0) return null;

  // Calculate center
  const center = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  // Calculate radius (distance to farthest point + buffer)
  let maxDistance = 0;
  points.forEach((point) => {
    const distance = Math.sqrt(
      Math.pow(point.lat - center.lat, 2) + Math.pow(point.lng - center.lng, 2)
    );
    maxDistance = Math.max(maxDistance, distance);
  });

  // Convert to meters (rough approximation: 1 degree ≈ 111km)
  const radiusInMeters = maxDistance * 111000 + 100; // Add 100m buffer

  return { center, radius: radiusInMeters };
};

// Helper function to create buffer around points
const createBufferedPolygon = (points, bufferDistance = 0.001) => {
  if (points.length === 0) return [];

  const center = {
    lat: points.reduce((sum, p) => sum + p.lat, 0) / points.length,
    lng: points.reduce((sum, p) => sum + p.lng, 0) / points.length,
  };

  // Create a rough rectangular buffer around all points
  const bounds = points.reduce(
    (acc, point) => ({
      north: Math.max(acc.north, point.lat),
      south: Math.min(acc.south, point.lat),
      east: Math.max(acc.east, point.lng),
      west: Math.min(acc.west, point.lng),
    }),
    {
      north: points[0].lat,
      south: points[0].lat,
      east: points[0].lng,
      west: points[0].lng,
    }
  );

  // Add buffer
  return [
    { lat: bounds.north + bufferDistance, lng: bounds.west - bufferDistance },
    { lat: bounds.north + bufferDistance, lng: bounds.east + bufferDistance },
    { lat: bounds.south - bufferDistance, lng: bounds.east + bufferDistance },
    { lat: bounds.south - bufferDistance, lng: bounds.west - bufferDistance },
  ];
};

export default function GoogleZonesMap({
  zonesData,
  zoneDisplayType = "buffered",
}) {
  const [selectedToilet, setSelectedToilet] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBfBFN6L_HROTd-mS8QqUDRIqskkvHvFYk",
  });

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={defaultCenter}
      zoom={15}
    >
      {zonesData.map((zone, index) => {
        const toiletPoints = (zone.children || [])
          .filter((child) => child.latitude && child.longitude)
          .map((child) => ({
            lat: parseFloat(child.latitude),
            lng: parseFloat(child.longitude),
          }));

        const fillColor = zoneColors[index % zoneColors.length];

        if (toiletPoints.length === 0) return null;

        return (
          <div key={zone.id}>
            {/* Render different zone types based on display preference */}
            {zoneDisplayType === "circle" &&
              toiletPoints.length > 0 &&
              (() => {
                const circleData = getCircleFromPoints(toiletPoints);
                return circleData ? (
                  <Circle
                    center={circleData.center}
                    radius={circleData.radius}
                    options={{
                      fillColor,
                      fillOpacity: 0.2,
                      strokeColor: fillColor,
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                    }}
                  />
                ) : null;
              })()}

            {zoneDisplayType === "convex" && toiletPoints.length >= 3 && (
              <Polygon
                paths={getConvexHull(toiletPoints)}
                options={{
                  fillColor,
                  fillOpacity: 0.2,
                  strokeColor: fillColor,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            )}

            {zoneDisplayType === "buffered" && toiletPoints.length > 0 && (
              <Polygon
                paths={createBufferedPolygon(toiletPoints)}
                options={{
                  fillColor,
                  fillOpacity: 0.2,
                  strokeColor: fillColor,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Original approach - direct connection of points */}
            {zoneDisplayType === "direct" && toiletPoints.length >= 3 && (
              <Polygon
                paths={toiletPoints}
                options={{
                  fillColor,
                  fillOpacity: 0.2,
                  strokeColor: fillColor,
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />
            )}

            {/* Toilet markers */}
            {zone.children.map((toilet) => (
              <Marker
                key={toilet.id}
                position={{
                  lat: parseFloat(toilet.latitude),
                  lng: parseFloat(toilet.longitude),
                }}
                title={toilet.name}
                onClick={() =>
                  setSelectedToilet({
                    ...toilet,
                    lat: parseFloat(toilet.latitude),
                    lng: parseFloat(toilet.longitude),
                  })
                }
                icon={{
                  url:
                    "data:image/svg+xml;base64," +
                    btoa(`
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  `),
                  scaledSize: new window.google.maps.Size(30, 30),
                }}
              />
            ))}

            {/* Zone label */}
            {toiletPoints.length > 0 &&
              (() => {
                const center = {
                  lat:
                    toiletPoints.reduce((sum, p) => sum + p.lat, 0) /
                    toiletPoints.length,
                  lng:
                    toiletPoints.reduce((sum, p) => sum + p.lng, 0) /
                    toiletPoints.length,
                };

                return (
                  <Marker
                    position={center}
                    icon={{
                      url:
                        "data:image/svg+xml;base64," +
                        btoa(`
                      <svg width="60" height="20" xmlns="http://www.w3.org/2000/svg">
                        <rect width="60" height="20" rx="10" fill="white" stroke="${fillColor}" stroke-width="2"/>
                        <text x="30" y="14" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="${fillColor}">
                          ${zone.name}
                        </text>
                      </svg>
                    `),
                      scaledSize: new window.google.maps.Size(60, 20),
                    }}
                  />
                );
              })()}
          </div>
        );
      })}

      {selectedToilet && (
        <InfoWindow
          position={{ lat: selectedToilet.lat, lng: selectedToilet.lng }}
          onCloseClick={() => setSelectedToilet(null)}
        >
          <div style={{ maxWidth: "200px" }}>
            <strong>{selectedToilet.name}</strong>
            {selectedToilet.image_url && (
              <img
                src={selectedToilet.image_url}
                alt={selectedToilet.name}
                style={{ width: "100%", marginTop: "8px" }}
              />
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
}
