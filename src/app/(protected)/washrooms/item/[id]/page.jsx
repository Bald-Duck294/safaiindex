'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  MapPin,
  Star,
  Edit,
  Calendar,
  Navigation,
  TrendingUp,
  Clock,
  ArrowLeft,
  ExternalLink,
  MessageSquare,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
  ThumbsUp,
  Share2,
  Car,
  Coins,
  Users,
  Baby,
  Accessibility,
  Package,
  UserCheck,
  Phone,
  Mail,
  Image as ImageIcon,
  ChevronDown,
  ChevronUp,
  Zap,  // for hand dryer
  Shield, // for attendant
  Wind, // alternative for hand dryer
} from 'lucide-react';
import LocationsApi from '@/lib/api/LocationApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from "@/components/ui/Loader";

const SingleLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);

  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const urlCompanyId = searchParams.get('companyId');
  const finalCompanyId = companyId || urlCompanyId;

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !finalCompanyId) return;

      try {
        setLoading(true);

        const [locationResult, locationsResult] = await Promise.all([
          LocationsApi.getLocationById(params.id, finalCompanyId),
          LocationsApi.getAllLocations(finalCompanyId)
        ]);

        if (locationResult.success) {
          setLocation(locationResult.data);
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
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

  const handleEdit = () => {
    router.push(`/washrooms/item/${params.id}/edit?companyId=${finalCompanyId}`);
  };

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const getCurrentLocationIndex = () => {
    return allLocations.findIndex(loc => loc.id === params.id);
  };

  const handlePrevious = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex > 0) {
      setNavigationLoading(true);
      const prevLocation = allLocations[currentIndex - 1];
      router.push(`/washrooms/item/${prevLocation.id}?companyId=${finalCompanyId}`);
    }
  };

  const handleNext = async () => {
    const currentIndex = getCurrentLocationIndex();
    if (currentIndex < allLocations.length - 1) {
      setNavigationLoading(true);
      const nextLocation = allLocations[currentIndex + 1];
      router.push(`/washrooms/item/${nextLocation.id}?companyId=${finalCompanyId}`);
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

  const handleImageLoad = (reviewId) => {
    setImageLoading(prev => ({ ...prev, [reviewId]: false }));
  };

  const handleImageError = (reviewId) => {
    setImageLoading(prev => ({ ...prev, [reviewId]: false }));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
      />
    ));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getHygieneStatus = (score) => {
    if (!score) return { text: 'Not rated', color: 'text-gray-500' };
    if (score >= 80) return { text: 'Excellent', color: 'text-emerald-600' };
    if (score >= 60) return { text: 'Good', color: 'text-blue-600' };
    return { text: 'Needs Improvement', color: 'text-orange-600' };
  };

  // ✅ Updated renderLocationOptions with proper multiselect support
  // ✅ Updated renderLocationOptions with complete option mappings
  const renderLocationOptions = (options) => {
    if (!options || Object.keys(options).length === 0) return null;

    const optionIcons = {
      isPaid: { icon: Coins, label: 'Paid Entry', color: 'text-yellow-600 bg-yellow-50' },
      isHandicapAccessible: { icon: Accessibility, label: 'Wheelchair Accessible', color: 'text-blue-600 bg-blue-50' },
      isStrictlyForHandicap: { icon: Accessibility, label: 'Disabled Only', color: 'text-purple-600 bg-purple-50' },
      hasBabyChangingStation: { icon: Baby, label: 'Baby Changing', color: 'text-pink-600 bg-pink-50' },
      hasSanitaryProducts: { icon: Package, label: 'Sanitary Products', color: 'text-purple-600 bg-purple-50' },
      // ✅ Added missing option mappings
      is24Hours: { icon: Clock, label: '24/7 Open', color: 'text-green-600 bg-green-50' },
      hasAttendant: { icon: Shield, label: 'Has Attendant', color: 'text-indigo-600 bg-indigo-50' },
      hasHandDryer: { icon: Wind, label: 'Hand Dryer', color: 'text-teal-600 bg-teal-50' }, // Using Car as placeholder, you might want a better icon
    };

    const genderColors = {
      'male': 'text-blue-600 bg-blue-50',
      'female': 'text-pink-600 bg-pink-50',
      'unisex': 'text-green-600 bg-green-50',
      'family': 'text-orange-600 bg-orange-50',
      'disabled': 'text-purple-600 bg-purple-50'
    };

    console.log('Rendering options:', options); // ✅ Debug log

    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Amenities & Features
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* Gender Access (Multiselect) */}
          {options.genderAccess && Array.isArray(options.genderAccess) && options.genderAccess.length > 0 && (
            <>
              {options.genderAccess.map((gender) => (
                <div key={gender} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${genderColors[gender] || 'text-gray-600 bg-gray-100'}`}>
                  <Users className="w-3 h-3 mr-1" />
                  {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </div>
              ))}
            </>
          )}

          {/* Boolean Options */}
          {Object.entries(options).map(([key, value]) => {
            console.log(`Processing option: ${key} = ${value} (type: ${typeof value})`); // ✅ Debug log

            // Skip genderAccess (handled above)
            if (key === 'genderAccess') return null;

            // Check if this option has an icon mapping
            if (!optionIcons[key]) {
              console.log(`No icon found for option: ${key}`); // ✅ Debug log
              return null;
            }

            // ✅ Only show boolean options that are true
            if (typeof value === 'boolean' && value !== true) {
              console.log(`Skipping ${key} because value is ${value}`); // ✅ Debug log
              return null;
            }

            // Skip null, undefined, empty strings, etc.
            if (value === null || value === undefined || value === '') return null;

            const { icon: Icon, label, color } = optionIcons[key];
            console.log(`Rendering option: ${key} with label: ${label}`); // ✅ Debug log

            return (
              <div key={key} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {label}
              </div>
            );
          })}
        </div>
      </div>
    );
  };




  // ✅ Render assigned cleaners
  const renderAssignedCleaners = (assignedCleaners) => {
    if (!assignedCleaners || assignedCleaners.length === 0) {
      return (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assigned Cleaners
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">No cleaners currently assigned to this location.</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <UserCheck className="w-4 h-4" />
          Assigned Cleaners ({assignedCleaners.length})
        </h3>
        <div className="space-y-3">
          {assignedCleaners.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{assignment.cleaner?.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-3">
                    {assignment.cleaner?.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {assignment.cleaner.phone}
                      </span>
                    )}
                    {assignment.cleaner?.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {assignment.cleaner.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'assigned' ? 'text-green-600 bg-green-50' :
                  assignment.status === 'active' ? 'text-blue-600 bg-blue-50' :
                    'text-gray-600 bg-gray-50'
                  }`}>
                  {assignment.status}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Since {formatDate(assignment.assignedOn)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ✅ Render image gallery
  const renderImageGallery = (images) => {
    if (!images || images.length === 0) return null;

    const displayImages = showAllImages ? images : images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Location Images ({images.length})
          </h3>
          {images.length > 4 && (
            <button
              onClick={() => setShowAllImages(!showAllImages)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              {showAllImages ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show All <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {displayImages.map((image, index) => (
            <div
              key={index}
              className="relative aspect-square bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => setSelectedImageIndex(index)}
            >
              <img
                src={image}
                alt={`Location image ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                }}
              />
              {!showAllImages && index === 3 && remainingCount > 0 && (
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                  <span className="text-white font-semibold">+{remainingCount} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading || navigationLoading) {
    return <div className="flex justify-center items-center h-94">
      <Loader size="large" color="#3b82f6" message="Loading location..." />
    </div>
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <MapPin className="w-12 h-12 mx-auto" />
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
          <p className="text-gray-600 dark:text-gray-300">This washroom doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const hygieneStatus = getHygieneStatus(location.hygiene_scores?.[0]?.score);
  const navigationInfo = getNavigationInfo();
  const fallbackImage = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Keep existing */}
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
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={!navigationInfo.hasPrevious}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
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
        {/* ✅ Main Info Card with Header and Amenities moved up */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{location.name}</h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 space-x-4 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {parseFloat(location.latitude).toFixed(4)}, {parseFloat(location.longitude).toFixed(4)}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Added on {formatDate(location.created_at)}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleViewLocation(location.latitude, location.longitude)}
                  className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  View on Map
                </button>
                <button
                  onClick={handleEdit}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </button>
              </div>
            </div>

            {/* ✅ Amenities moved up here */}
            <div className="space-y-4">
              {renderLocationOptions(location.options)}
              {renderAssignedCleaners(location.assignedCleaners)}
            </div>
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(location.averageRating))}
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {location.averageRating?.toFixed(1) || 'N/A'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {location.ratingCount} {location.ratingCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {location.hygiene_scores?.[0]?.score || 'N/A'}
                  {location.hygiene_scores?.[0]?.score && '/100'}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Cleaner Reviews
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {location.ReviewData?.length || 0}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total User reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Image Gallery */}
        {location.images && location.images.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8 p-6">
            {renderImageGallery(location.images)}
          </div>
        )}

        {/* Reviews Section - Keep existing */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reviews</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">What people are saying about this washroom</p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {location.ReviewData && location.ReviewData.length > 0 ? (
              location.ReviewData.map((review) => (
                <div key={review.id} className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{review.name}</span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatDate(review.created_at)}</span>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 mb-4">{review.description}</p>

                      {review.images && review.images.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <Camera className="w-4 h-4 mr-1" />
                            {review.images.length} {review.images.length === 1 ? 'photo' : 'photos'}
                          </div>
                          <div className="flex space-x-2 overflow-x-auto">
                            {review.images.map((url, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(url, '_blank')}
                              >
                                <img
                                  src={url}
                                  alt={`Review photo ${imgIndex + 1}`}
                                  className="w-full h-full object-cover"
                                  onLoad={() => handleImageLoad(`${review.id}-${imgIndex}`)}
                                  onError={() => handleImageError(`${review.id}-${imgIndex}`)}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reviews yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Be the first to share your experience with this washroom.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Image Modal */}
      {selectedImageIndex !== null && location.images && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={location.images[selectedImageIndex]}
              alt={`Location image ${selectedImageIndex + 1}`}
              className="max-w-full max-h-full object-contain rounded-lg"
              style={{ maxHeight: '90vh' }}
            />
            <button
              onClick={() => setSelectedImageIndex(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
              <p className="text-sm">
                {selectedImageIndex + 1} of {location.images.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleLocation;
