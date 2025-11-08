'use client'

import { useState, useEffect } from 'react'
import { MapPin, Loader2, AlertCircle } from 'lucide-react'

export default function LocationDetector({ onLocationChange, location }) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      const { latitude, longitude } = position.coords

      let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      try {
        const apiKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY
        const response = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&limit=1`
        )

        if (response.ok) {
          const data = await response.json()
          if (data.results && data.results.length > 0) {
            address = data.results[0].formatted
          }
        }
      } catch (geocodeError) {
        console.error('Reverse geocoding failed:', geocodeError)
      }

      const locationData = {
        latitude,
        longitude,
        address
      }

      onLocationChange(locationData)

      // Save to backend
    //   try {
    //     const res = await fetch('http://localhost:5000/locations', {
    //       method: 'POST',
    //       headers: { 'Content-Type': 'application/json' },
    //       body: JSON.stringify({
    //         name: address.split(',')[0],
    //         address
    //       })
    //     })

    //     if (!res.ok) {
    //       console.error('Failed to save location to DB')
    //     }
    //   } catch (submitError) {
    //     console.error('Location submission error:', submitError)
    //   }
    } catch (err) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setError('Location access denied. Please enable location permissions.')
          break
        case err.POSITION_UNAVAILABLE:
          setError('Location information is unavailable.')
          break
        case err.TIMEOUT:
          setError('Location request timed out.')
          break
        default:
          setError('An unknown error occurred while retrieving location.')
          break
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  return (
    <div className="space-y-3">
      <label className="flex items-center text-sm font-medium text-gray-700">
        <MapPin className="h-4 w-4 mr-1" />
        Washroom Location *
      </label>

      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Detecting...' : 'Get Current Location'}
        </button>
      </div>

      {location && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-green-800">Location Detected:</p>
              <p className="text-green-700">{location.address}</p>
              <p className="text-green-600 text-xs mt-1">
                Coordinates: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-red-800">Location Error:</p>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
