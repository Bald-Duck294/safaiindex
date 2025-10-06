'use client';

import React, { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2
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

  // ✅ Image states
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const fileInputRef = useRef(null);

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

          // ✅ Set existing images
          setExistingImages(locationResult.data.images || []);
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
        }

        if (featuresResult) {
          console.log(featuresResult?.data[0]?.description, "toilet features")
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

  // ✅ Image handling functions
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) { // 10MB limit
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name + ' (too large)');
        }
      } else {
        invalidFiles.push(file.name + ' (not an image)');
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
    }

    if (validFiles.length > 0) {
      // Add to new images array
      setNewImages(prev => [...prev, ...validFiles]);

      // Create preview URLs
      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isNew: true
      }));

      setPreviewImages(prev => [...prev, ...newPreviews]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index) => {
    // Revoke preview URL to free memory
    URL.revokeObjectURL(previewImages[index].url);

    setNewImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageUrl) => {
    setImagesToDelete(prev => [...prev, imageUrl]);
    setExistingImages(prev => prev.filter(img => img !== imageUrl));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // ✅ Handle multiselect changes
  const handleMultiselectChange = (key, value, checked) => {
    const currentValues = formData.options[key] || [];
    let newValues;

    if (checked) {
      // Add value if not already present
      newValues = currentValues.includes(value)
        ? currentValues
        : [...currentValues, value];
    } else {
      // Remove value
      newValues = currentValues.filter(v => v !== value);
    }

    handleOptionChange(key, newValues);
  };


  // ✅ Add this function after your existing helper functions
  const confirmClearAllImages = () => {
    if (window.confirm('Are you sure you want to remove all images? This action cannot be undone.')) {
      // Add all existing images to delete list
      setImagesToDelete(prev => [...prev, ...existingImages]);
      setExistingImages([]);

      // Clear all new images
      previewImages.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      setNewImages([]);
      setPreviewImages([]);

      toast.success('All images marked for removal');
    }
  };

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

  // ✅ Updated save handler with image support
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

      // Handle image deletion first
      for (const imageUrl of imagesToDelete) {
        try {
          await LocationsApi.deleteLocationImage(params.id, imageUrl, finalCompanyId);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with other operations even if one image deletion fails
        }
      }

      // Update location with new images
      const result = await LocationsApi.updateLocation(
        params.id,
        updateData,
        finalCompanyId,
        newImages,
        false // Don't replace all images, just add new ones
      );

      if (result.success) {
        toast.success('Location updated successfully! Redirecting...');

        // Clean up preview URLs
        previewImages.forEach(preview => {
          if (preview.url.startsWith('blob:')) {
            URL.revokeObjectURL(preview.url);
          }
        });

        router.push(`/washrooms?companyId=${finalCompanyId}`);
      } else {
        toast.error(result.error || 'Failed to update location');
        setSaving(false);
      }
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to update location');
      setSaving(false);
    }
  };

  // ✅ Updated render option control with multiselect support
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

      // ✅ New multiselect case
      case 'multiselect':
        const selectedValues = currentValue || feature.defaultValue || [];
        return (
          <div key={optionKey} className="space-y-3">
            <label className="block font-medium text-gray-700 dark:text-gray-200">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-gray-500 dark:text-gray-400">{feature.category}</p>
            )}

            {/* Selected count indicator */}
            {selectedValues.length > 0 && (
              <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                {selectedValues.length} selected
              </div>
            )}

            {/* Options grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {feature.options?.map((option, index) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const isSelected = selectedValues.includes(value);

                return (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-600'
                      : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleMultiselectChange(optionKey, value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
                    />
                    <span className={`text-sm font-medium ${isSelected
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300'
                      }`}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Selected values display */}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedValues.map((value) => {
                  const option = feature.options?.find(opt =>
                    (typeof opt === 'string' ? opt : opt.value) === value
                  );
                  const label = option ?
                    (typeof option === 'string' ? option : option.label) :
                    value;

                  return (
                    <span
                      key={value}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => handleMultiselectChange(optionKey, value, false)}
                        className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            )}
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

  // Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach(preview => {
        if (preview.url.startsWith('blob:')) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, []);

  if (loading || navigationLoading) {
    return <div className="flex justify-center items-center h-94">
      <Loader
        size="large"
        color="#3b82f6"
        message="Loading location..."
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
  const allImages = [...existingImages, ...previewImages];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - keeping your existing header code */}
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

            {/* Navigation Controls - keeping your existing navigation */}
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
                  Update location information, images, and amenities
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


            {/* ✅ Enhanced Images Section with Better Delete UI */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Location Images
                {(existingImages.length > 0 || previewImages.length > 0) && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    ({existingImages.length + previewImages.length} total)
                  </span>
                )}
              </h3>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="space-y-4">
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                    >
                      <Plus className="h-4 w-4" />
                      {existingImages.length === 0 && previewImages.length === 0 ? 'Add Images' : 'Add More Images'}
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Select multiple images (max 10MB each)
                    </p>
                  </div>
                </div>
              </div>

              {/* Current Images with Enhanced Delete Options */}
              {(existingImages.length > 0 || previewImages.length > 0) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">
                      Current Images ({existingImages.length + previewImages.length})
                    </h4>

                    {/* Clear All Button */}
                    {(existingImages.length > 0 || previewImages.length > 0) && (
                      <button
                        type="button"
                        onClick={() => {
                          // Add all existing images to delete list
                          setImagesToDelete(prev => [...prev, ...existingImages]);
                          setExistingImages([]);

                          // Clear all new images
                          previewImages.forEach(preview => {
                            URL.revokeObjectURL(preview.url);
                          });
                          setNewImages([]);
                          setPreviewImages([]);

                          toast.success('All images marked for removal');
                        }}
                        className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        Clear All
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {/* Existing Images with Enhanced Delete */}
                    {existingImages.map((imageUrl, index) => (
                      <div key={`existing-${index}`} className="relative group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={imageUrl}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImageIndex(index)}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-24 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 text-xs">Failed to load</div>';
                          }}
                        />

                        {/* Always visible delete button for existing images */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeExistingImage(imageUrl);
                            toast.success('Image marked for deletion');
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                          title="Delete this image"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Image type label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <p className="text-xs text-white font-medium">
                            Existing Image
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* New Images with Enhanced Delete */}
                    {previewImages.map((preview, index) => (
                      <div key={`new-${index}`} className="relative group bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-green-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <img
                          src={preview.url}
                          alt={`New ${index + 1}`}
                          className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedImageIndex(existingImages.length + index)}
                        />

                        {/* Always visible delete button for new images */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeNewImage(index);
                            toast.success('New image removed');
                          }}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
                          title="Remove this new image"
                        >
                          <X className="h-3 w-3" />
                        </button>

                        {/* Image type label */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-2">
                          <p className="text-xs text-white font-medium truncate">
                            New: {preview.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-2">
                    {/* Images to be deleted indicator */}
                    {imagesToDelete.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            {imagesToDelete.length} existing image(s) will be deleted when you save
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            // Restore deleted images
                            setExistingImages(prev => [...prev, ...imagesToDelete]);
                            setImagesToDelete([]);
                            toast.success('Image deletions cancelled');
                          }}
                          className="text-xs text-red-600 hover:text-red-700 underline"
                        >
                          Undo
                        </button>
                      </div>
                    )}

                    {/* New images indicator */}
                    {newImages.length > 0 && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <Plus className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                          {newImages.length} new image(s) will be added when you save
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>



            {/* Amenities/Options */}
            {Object.keys(toiletFeatures).length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Amenities & Features
                </h3>
                <div className="grid grid-cols-1 gap-4">
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

      {/* ✅ Image Modal for full view */}
      {/* ✅ Updated Image Modal for full view */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            {/* Determine which image to show */}
            {(() => {
              const isExistingImage = selectedImageIndex < existingImages.length;
              const imageUrl = isExistingImage
                ? existingImages[selectedImageIndex]
                : previewImages[selectedImageIndex - existingImages.length]?.url;

              return (
                <img
                  src={imageUrl}
                  alt={`Full view ${selectedImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  style={{ maxHeight: '90vh' }}
                />
              );
            })()}

            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>

            {/* Image info */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <p className="text-sm">
                Image {selectedImageIndex + 1} of {existingImages.length + previewImages.length}
                {selectedImageIndex < existingImages.length ? ' (Existing)' : ' (New)'}
              </p>
            </div>
          </div>
        </div>
      )}


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
