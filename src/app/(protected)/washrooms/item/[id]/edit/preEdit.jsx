
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Navigation,
  Settings,
  Plus,
  Minus,
  Eye,
  AlertCircle
} from 'lucide-react';
import LocationsApi from '@/lib/api/LocationApi';
import { fetchToiletFeaturesByName } from '@/lib/api/configurationsApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from "@/components/ui/Loader";
import toast from 'react-hot-toast';

const EditLocationPage = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [toiletFeatures, setToiletFeatures] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    options: {}
  });

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  // Get companyId from URL params if not from context
  const urlCompanyId = searchParams.get('companyId');
  const finalCompanyId = companyId || urlCompanyId;

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !finalCompanyId) return;

      try {
        setLoading(true);

        // Fetch current location, all locations, and toilet features in parallel
        const [locationResult, locationsResult, featuresResult] = await Promise.all([
          LocationsApi.getLocationById(params.id, finalCompanyId),
          LocationsApi.getAllLocations(finalCompanyId),
          fetchToiletFeaturesByName('Toilet_Features')
        ]);


        if (locationResult.success) {
          setLocation(locationResult.data);
          setFormData({
            name: locationResult.data.name,
            latitude: locationResult.data.latitude?.toString() || '',
            longitude: locationResult.data.longitude?.toString() || '',
            options: locationResult.data.options || {}
          });
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
        }

        if (featuresResult) {
          console.log(featuresResult?.data[0]?.description , "toilet features")
          const features = {};
          featuresResult?.data[0]?.description.forEach(feature => {
            features[feature.key] = feature;
          });
          setToiletFeatures(features);
        }
      } catch (err) {
        setError('Failed to fetch location data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, finalCompanyId]);

  // Search functionality
  const handleSearch = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const result = await LocationsApi.searchLocations(query, finalCompanyId);
      if (result.success) {
        setSearchResults(result.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const selectSearchResult = (selectedLocation) => {
    setNavigationLoading(true);
    router.push(`/washrooms/item/${selectedLocation.id}/edit?companyId=${finalCompanyId}`);
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const getCurrentLocationIndex = () => {
    return allLocations.findIndex(loc => loc.id === params.id);
  };

  const handlePrevious = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex > 0) {
      setNavigationLoading(true);
      const prevLocation = allLocations[currentIndex - 1];
      router.push(`/washrooms/item/${prevLocation.id}/edit?companyId=${finalCompanyId}`);
    }
  };

  const handleNext = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex < allLocations.length - 1) {
      setNavigationLoading(true);
      const nextLocation = allLocations[currentIndex + 1];
      router.push(`/washrooms/item/${nextLocation.id}/edit?companyId=${finalCompanyId}`);
    }
  };

  const getNavigationInfo = () => {
    const currentIndex = getCurrentLocationIndex();
    return {
      currentIndex,
      hasPrevious: currentIndex > 0,
      hasNext: currentIndex < allLocations.length - 1,
      previousName: currentIndex > 0 ? allLocations[currentIndex - 1]?.name : null,
      nextName: currentIndex < allLocations.length - 1 ? allLocations[currentIndex + 1]?.name : null
    };
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleOptionChange = (optionKey, value) => {
    setFormData(prev => ({
      ...prev,
      options: {
        ...prev.options,
        [optionKey]: value
      }
    }));
  };

const handleSave = async () => {
  try {
    setSaving(true);

    // Validate required fields
    if (!formData.name.trim()) {
      toast.error('Location name is required');
      return;
    }

    const updateData = {
      name: formData.name.trim(),
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      options: formData.options
    };

    const result = await LocationsApi.updateLocation(params.id, updateData, finalCompanyId);

    if (result.success) {
      toast.success('Location updated successfully! Redirecting...');
      // Keep saving state true during redirect to show loading
      router.push(`/washrooms?companyId=${finalCompanyId}`);
      // Don't set setSaving(false) here since we're navigating away
    } else {
      toast.error(result.error || 'Failed to update location');
      setSaving(false); // Only reset saving state on error
    }
  } catch (error) {
    console.error('Save error:', error);
    toast.error('Failed to update location');
    setSaving(false); // Only reset saving state on error
  }
};



const renderOptionControl = (optionKey, feature) => {
  const currentValue = formData.options[optionKey];

  switch (feature.type) {
    case 'boolean':
      return (
        <div key={optionKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div>
            <label className="font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.category}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentValue ?? feature.defaultValue ?? false}
              onChange={(e) => handleOptionChange(optionKey, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      );

    case 'select':
    case 'dropdown':
      return (
        <div key={optionKey} className="space-y-2">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.category}
              </p>
            )}
          </div>
          <select
            value={currentValue ?? feature.defaultValue ?? ''}
            onChange={(e) => handleOptionChange(optionKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={feature.required}
          >
            <option value="">Select {feature.label}</option>
            {feature.options?.map((option, index) => {
              // Handle both old format (string) and new format (object)
              const value = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
        </div>
      );

    case 'text':
      return (
        <div key={optionKey} className="space-y-2">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.category}
              </p>
            )}
          </div>
          <input
            type="text"
            value={currentValue ?? feature.defaultValue ?? ''}
            onChange={(e) => handleOptionChange(optionKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={feature.placeholder || `Enter ${feature.label}`}
            maxLength={feature.maxLength}
            required={feature.required}
          />
        </div>
      );

    case 'number':
      return (
        <div key={optionKey} className="space-y-2">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.category}
              </p>
            )}
          </div>
          <input
            type="number"
            value={currentValue ?? feature.defaultValue ?? ''}
            onChange={(e) => handleOptionChange(optionKey, parseFloat(e.target.value) || '')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={feature.min}
            max={feature.max}
            step={feature.step || 'any'}
            required={feature.required}
          />
        </div>
      );

    case 'textarea':
      return (
        <div key={optionKey} className="space-y-2">
          <div>
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {feature.category}
              </p>
            )}
          </div>
          <textarea
            value={currentValue ?? feature.defaultValue ?? ''}
            onChange={(e) => handleOptionChange(optionKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={feature.placeholder || `Enter ${feature.label}`}
            rows={feature.rows || 3}
            maxLength={feature.maxLength}
            required={feature.required}
          />
        </div>
      );

    default:
      // Fallback for backward compatibility
      return (
        <div key={optionKey} className="space-y-2">
          <label className="block font-medium text-gray-700 dark:text-gray-200">
            {feature.label}
          </label>
          <input
            type="text"
            value={currentValue ?? ''}
            onChange={(e) => handleOptionChange(optionKey, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`Enter ${feature.label}`}
          />
        </div>
      );
  }
};




    if (loading || navigationLoading) {
      return <div className="flex justify-center items-center h-94">
        <Loader
          size="large"
          color="#3b82f6"
          message="Loading organizations..."
        />
      </div>
    }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Location not found</h2>
          <p className="text-gray-600 dark:text-gray-300">This location doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const navigationInfo = getNavigationInfo();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to listings
              </button>
            </div>

            {/* Search Bar */}
            {/* <div className="flex-1 max-w-md mx-4 relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search locations to edit..."
                  className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearch(e.target.value);
                  }}
                  onFocus={() => setShowSearch(true)}
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchResults([]);
                      setShowSearch(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                  </button>
                )}
              </div>

              
              {showSearch && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => selectSearchResult(result)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors"
                    >
                      <div className="font-medium text-gray-900 dark:text-white">{result.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">ID: {result.id}</div>
                    </button>
                  ))}
                </div>
              )}
            </div> */}

            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={!navigationInfo.hasPrevious}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title={navigationInfo.previousName ? `Previous: ${navigationInfo.previousName}` : 'No previous location'}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {navigationInfo.previousName && (
                  <span className="hidden sm:inline max-w-24 truncate text-gray-600 dark:text-gray-300">
                    {navigationInfo.previousName}
                  </span>
                )}
              </button>

              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                {navigationInfo.currentIndex + 1} of {allLocations.length}
              </span>

              <button
                onClick={handleNext}
                disabled={!navigationInfo.hasNext}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                title={navigationInfo.nextName ? `Next: ${navigationInfo.nextName}` : 'No next location'}
              >
                {navigationInfo.nextName && (
                  <span className="hidden sm:inline max-w-24 truncate text-gray-600 dark:text-gray-300">
                    {navigationInfo.nextName}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Edit Location
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Update location information and amenities
                </p>
              </div>
              <button
                onClick={() => router.push(`/washrooms/item/${params.id}?companyId=${finalCompanyId}`)}
                className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Location
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-200">
                  Location Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-200">
                  View on Map
                </label>
                <button
                  onClick={() => window.open(`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`, '_blank')}
                  disabled={!formData.latitude || !formData.longitude}
                  className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Open in Maps
                </button>
              </div>
            </div>

            {/* Coordinates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-200">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.latitude}
                  onChange={(e) => handleInputChange('latitude', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 21.1458"
                />
              </div>

              <div className="space-y-2">
                <label className="block font-medium text-gray-700 dark:text-gray-200">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  value={formData.longitude}
                  onChange={(e) => handleInputChange('longitude', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 79.0882"
                />
              </div>
            </div>

            {/* Amenities/Options */}
            {Object.keys(toiletFeatures).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(toiletFeatures).map(([key, feature]) =>
                    renderOptionControl(key, feature)
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.name.trim()}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Click outside to close search */}
      {showSearch && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSearch(false)}
        />
      )}
    </div>
  );
};

export default EditLocationPage;
