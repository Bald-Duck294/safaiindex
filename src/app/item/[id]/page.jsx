'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  Shield,
  MessageSquare,
  Camera,
  ChevronLeft,
  ChevronRight,
  User,
  ThumbsUp,
  Share2
} from 'lucide-react';
import LocationsApi from '@/lib/api/LocationApi';
const SingleLocation = () => {
  console.log('in single locations')
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const fetchLocation = async () => {
      if (!params.id) return;
      
      try {
        setLoading(true);
        const result = await LocationsApi.getLocationById(params.id);
        
        if (result.success) {
          setLocation(result.data);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch location data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLocation();
  }, [params.id]);

  const handleEdit = () => {
    router.push(`/washroom/edit/${params.id}`);
  };

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
  };

  const handlePrevious = () => {
    const currentId = parseInt(params.id);
    if (currentId > 1) {
      router.push(`/washroom/${currentId - 1}`);
    }
  };

  const handleNext = () => {
    const currentId = parseInt(params.id);
    router.push(`/washroom/${currentId + 1}`);
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
        className={`w-4 h-4 ${
          i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
        }`}
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <MapPin className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center max-w-md w-full">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Location not found</h2>
          <p className="text-gray-600">This washroom doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const hygieneStatus = getHygieneStatus(location.hygiene_scores?.[0]?.score);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to listings
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={parseInt(params.id) <= 1}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                #{params.id}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Content */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{location.name}</h1>
                <div className="flex items-center text-gray-600 space-x-4 text-sm">
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
                  className="flex items-center px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
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
          </div>

          {/* Stats */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {renderStars(Math.round(location.averageRating))}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {location.averageRating?.toFixed(1) || 'N/A'}
                </div>
                <p className="text-sm text-gray-600">
                  {location.ratingCount} {location.ratingCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {location.hygiene_scores?.[0]?.score || 'N/A'}
                  {location.hygiene_scores?.[0]?.score && '/100'}
                </div>
                <p className={`text-sm ${hygieneStatus.color}`}>
                  {hygieneStatus.text}
                </p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {location.ReviewData?.length || 0}
                </div>
                <p className="text-sm text-gray-600">
                  Total reviews
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Reviews</h2>
            <p className="text-gray-600 mt-1">What people are saying about this washroom</p>
          </div>

          <div className="divide-y divide-gray-200">
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
                          <span className="text-sm font-medium text-gray-900">User #{review.user_id}</span>
                          <div className="flex items-center">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.comment}</p>

                      {review.image_urls && review.image_urls.length > 0 && (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-gray-600">
                            <Camera className="w-4 h-4 mr-1" />
                            {review.image_urls.length} {review.image_urls.length === 1 ? 'photo' : 'photos'}
                          </div>
                          <div className="flex space-x-2 overflow-x-auto">
                            {review.image_urls.map((url, imgIndex) => (
                              <div
                                key={imgIndex}
                                className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => window.open(url, '_blank')}
                              >
                                {imageLoading[`${review.id}-${imgIndex}`] !== false && (
                                  <div className="absolute inset-0 bg-gray-200 animate-pulse" />
                                )}
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
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to share your experience with this washroom.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SingleLocation;