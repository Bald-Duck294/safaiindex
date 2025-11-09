// 'use client';

// import React, { useEffect, useState } from 'react';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';
// import {
//   MapPin,
//   Star,
//   Edit,
//   Calendar,
//   Navigation,
//   TrendingUp,
//   Clock,
//   ArrowLeft,
//   ExternalLink,
//   MessageSquare,
//   Camera,
//   ChevronLeft,
//   ChevronRight,
//   User,
//   ThumbsUp,
//   Share2,
//   Car,
//   Coins,
//   Users,
//   Baby,
//   Accessibility,
//   Package,
//   UserCheck,
//   Phone,
//   Mail,
//   Image as ImageIcon,
//   ChevronDown,
//   ChevronUp,
//   Zap,  // for hand dryer
//   Shield, // for attendant
//   Wind, // alternative for hand dryer
// } from 'lucide-react';
// import LocationsApi from '@/lib/api/LocationApi';
// import { useCompanyId } from '@/lib/providers/CompanyProvider';
// import Loader from "@/components/ui/Loader";

// const SingleLocation = () => {
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [imageLoading, setImageLoading] = useState({});
//   const [allLocations, setAllLocations] = useState([]);
//   const [navigationLoading, setNavigationLoading] = useState(false);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(null);
//   const [showAllImages, setShowAllImages] = useState(false);

//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   const urlCompanyId = searchParams.get('companyId');
//   const finalCompanyId = companyId || urlCompanyId;

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!params.id || !finalCompanyId) return;

//       try {
//         setLoading(true);

//         const [locationResult, locationsResult] = await Promise.all([
//           LocationsApi.getLocationById(params.id, finalCompanyId),
//           LocationsApi.getAllLocations(finalCompanyId)
//         ]);

//         if (locationResult.success) {
//           setLocation(locationResult.data);
//         } else {
//           setError(locationResult.error);
//         }

//         if (locationsResult.success) {
//           setAllLocations(locationsResult.data);
//         }
//       } catch (err) {
//         setError('Failed to fetch location data');
//         console.error('Error:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [params.id, finalCompanyId]);

//   const handleEdit = () => {
//     router.push(`/washrooms/item/${params.id}/edit?companyId=${finalCompanyId}`);
//   };

//   const handleViewLocation = (lat, lng) => {
//     window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank');
//   };

//   const getCurrentLocationIndex = () => {
//     return allLocations.findIndex(loc => loc.id === params.id);
//   };

//   const handlePrevious = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex > 0) {
//       setNavigationLoading(true);
//       const prevLocation = allLocations[currentIndex - 1];
//       router.push(`/washrooms/item/${prevLocation.id}?companyId=${finalCompanyId}`);
//     }
//   };

//   const handleNext = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex < allLocations.length - 1) {
//       setNavigationLoading(true);
//       const nextLocation = allLocations[currentIndex + 1];
//       router.push(`/washrooms/item/${nextLocation.id}?companyId=${finalCompanyId}`);
//     }
//   };

//   const getNavigationInfo = () => {
//     const currentIndex = getCurrentLocationIndex();
//     return {
//       currentIndex,
//       hasPrevious: currentIndex > 0,
//       hasNext: currentIndex < allLocations.length - 1,
//       previousName: currentIndex > 0 ? allLocations[currentIndex - 1]?.name : null,
//       nextName: currentIndex < allLocations.length - 1 ? allLocations[currentIndex + 1]?.name : null
//     };
//   };

//   const handleImageLoad = (reviewId) => {
//     setImageLoading(prev => ({ ...prev, [reviewId]: false }));
//   };

//   const handleImageError = (reviewId) => {
//     setImageLoading(prev => ({ ...prev, [reviewId]: false }));
//   };

//   // const renderStars = (rating) => {
//   //   return [...Array(5)].map((_, i) => (
//   //     <Star
//   //       key={i}
//   //       className={`w-4 h-4 ${i < rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
//   //     />
//   //   ));
//   // };

//   // ✅ Updated renderStars function for 1-10 scale (10 stars)
//   const renderStars = (rating) => {
//     const stars = [];
//     const fullStars = Math.floor(rating); // Full stars (e.g., 7.3 → 7 full stars)
//     const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75; // Half star for decimals between 0.25-0.75
//     const totalStars = 10; // Total stars to display
//     const emptyStars = totalStars - Math.ceil(rating); // Remaining empty stars

//     // Full stars
//     for (let i = 0; i < fullStars; i++) {
//       stars.push(
//         <Star
//           key={`full-${i}`}
//           className="w-4 h-4 text-amber-400 fill-amber-400"
//         />
//       );
//     }

//     // Half star
//     if (hasHalfStar) {
//       stars.push(
//         <div key="half" className="relative w-4 h-4">
//           <Star className="w-4 h-4 text-gray-300 absolute" />
//           <div className="overflow-hidden absolute" style={{ width: '50%' }}>
//             <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
//           </div>
//         </div>
//       );
//     }

//     // Empty stars
//     for (let i = 0; i < emptyStars; i++) {
//       stars.push(
//         <Star
//           key={`empty-${i}`}
//           className="w-4 h-4 text-gray-300"
//         />
//       );
//     }

//     return <div className="flex items-center gap-0.5">{stars}</div>;
//   };



//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   const getHygieneStatus = (score) => {
//     if (!score) return { text: 'Not rated', color: 'text-gray-500' };
//     if (score >= 80) return { text: 'Excellent', color: 'text-emerald-600' };
//     if (score >= 60) return { text: 'Good', color: 'text-blue-600' };
//     return { text: 'Needs Improvement', color: 'text-orange-600' };
//   };

//   // ✅ Updated renderLocationOptions with proper multiselect support
//   // ✅ Updated renderLocationOptions with complete option mappings
//   const renderLocationOptions = (options) => {
//     if (!options || Object.keys(options).length === 0) return null;

//     const optionIcons = {
//       isPaid: { icon: Coins, label: 'Paid Entry', color: 'text-yellow-600 bg-yellow-50' },
//       isHandicapAccessible: { icon: Accessibility, label: 'Wheelchair Accessible', color: 'text-blue-600 bg-blue-50' },
//       isStrictlyForHandicap: { icon: Accessibility, label: 'Disabled Only', color: 'text-purple-600 bg-purple-50' },
//       hasBabyChangingStation: { icon: Baby, label: 'Baby Changing', color: 'text-pink-600 bg-pink-50' },
//       hasSanitaryProducts: { icon: Package, label: 'Sanitary Products', color: 'text-purple-600 bg-purple-50' },
//       // ✅ Added missing option mappings
//       is24Hours: { icon: Clock, label: '24/7 Open', color: 'text-green-600 bg-green-50' },
//       hasAttendant: { icon: Shield, label: 'Has Attendant', color: 'text-indigo-600 bg-indigo-50' },
//       hasHandDryer: { icon: Wind, label: 'Hand Dryer', color: 'text-teal-600 bg-teal-50' }, // Using Car as placeholder, you might want a better icon
//     };

//     const genderColors = {
//       'male': 'text-blue-600 bg-blue-50',
//       'female': 'text-pink-600 bg-pink-50',
//       'unisex': 'text-green-600 bg-green-50',
//       'family': 'text-orange-600 bg-orange-50',
//       'disabled': 'text-purple-600 bg-purple-50'
//     };

//     console.log('Rendering options:', options); // ✅ Debug log

//     return (
//       <div className="bg-gray-50 /50 rounded-lg p-4">
//         <h3 className="text-sm font-semibold text-gray-900  mb-3 flex items-center gap-2">
//           <Package className="w-4 h-4" />
//           Amenities & Features
//         </h3>
//         <div className="flex flex-wrap gap-2">
//           {/* Gender Access (Multiselect) */}
//           {options.genderAccess && Array.isArray(options.genderAccess) && options.genderAccess.length > 0 && (
//             <>
//               {options.genderAccess.map((gender) => (
//                 <div key={gender} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${genderColors[gender] || 'text-gray-600 bg-gray-100'}`}>
//                   <Users className="w-3 h-3 mr-1" />
//                   {gender.charAt(0).toUpperCase() + gender.slice(1)}
//                 </div>
//               ))}
//             </>
//           )}

//           {/* Boolean Options */}
//           {Object.entries(options).map(([key, value]) => {
//             console.log(`Processing option: ${key} = ${value} (type: ${typeof value})`); // ✅ Debug log

//             // Skip genderAccess (handled above)
//             if (key === 'genderAccess') return null;

//             // Check if this option has an icon mapping
//             if (!optionIcons[key]) {
//               console.log(`No icon found for option: ${key}`); // ✅ Debug log
//               return null;
//             }

//             // ✅ Only show boolean options that are true
//             if (typeof value === 'boolean' && value !== true) {
//               console.log(`Skipping ${key} because value is ${value}`); // ✅ Debug log
//               return null;
//             }

//             // Skip null, undefined, empty strings, etc.
//             if (value === null || value === undefined || value === '') return null;

//             const { icon: Icon, label, color } = optionIcons[key];
//             console.log(`Rendering option: ${key} with label: ${label}`); // ✅ Debug log

//             return (
//               <div key={key} className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${color}`}>
//                 <Icon className="w-3 h-3 mr-1" />
//                 {label}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     );
//   };




//   // ✅ Render assigned cleaners
//   const renderAssignedCleaners = (assignedCleaners) => {
//     if (!assignedCleaners || assignedCleaners.length === 0) {
//       return (
//         <div className="bg-gray-50 /50 rounded-lg p-4">
//           <h3 className="text-sm font-semibold text-gray-900  mb-3 flex items-center gap-2">
//             <UserCheck className="w-4 h-4" />
//             Assigned Cleaners
//           </h3>
//           <p className="text-sm text-gray-500 ">No cleaners currently assigned to this location.</p>
//         </div>
//       );
//     }

//     return (
//       <div className="bg-gray-50 /50 rounded-lg p-4">
//         <h3 className="text-sm font-semibold text-gray-900  mb-3 flex items-center gap-2">
//           <UserCheck className="w-4 h-4" />
//           Assigned Cleaners ({assignedCleaners.length})
//         </h3>
//         <div className="space-y-3">
//           {assignedCleaners.map((assignment) => (
//             <div key={assignment.id} className="flex items-center justify-between bg-white  rounded-lg p-3 border border-gray-200 ">
//               <div className="flex items-center gap-3">
//                 <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                   <User className="w-4 h-4 text-white" />
//                 </div>
//                 <div>
//                   <div className="font-medium text-gray-900 ">{assignment.cleaner?.name || 'Unknown'}</div>
//                   <div className="text-xs text-gray-500  flex items-center gap-3">
//                     {assignment.cleaner?.phone && (
//                       <span className="flex items-center gap-1">
//                         <Phone className="w-3 h-3" />
//                         {assignment.cleaner.phone}
//                       </span>
//                     )}
//                     {assignment.cleaner?.email && (
//                       <span className="flex items-center gap-1">
//                         <Mail className="w-3 h-3" />
//                         {assignment.cleaner.email}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className={`px-2 py-1 rounded-full text-xs font-medium ${assignment.status === 'assigned' ? 'text-green-600 bg-green-50' :
//                   assignment.status === 'active' ? 'text-blue-600 bg-blue-50' :
//                     'text-gray-600 bg-gray-50'
//                   }`}>
//                   {assignment.status}
//                 </div>
//                 <div className="text-xs text-gray-400 mt-1">
//                   Since {formatDate(assignment.assignedOn)}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   // ✅ Render image gallery
//   const renderImageGallery = (images) => {
//     if (!images || images.length === 0) return null;

//     const displayImages = showAllImages ? images : images.slice(0, 4);
//     const remainingCount = images.length - 4;

//     return (
//       <div className="space-y-4">
//         <div className="flex items-center justify-between">
//           <h3 className="text-lg font-semibold text-gray-900  flex items-center gap-2">
//             <ImageIcon className="w-5 h-5" />
//             Location Images ({images.length})
//           </h3>
//           {images.length > 4 && (
//             <button
//               onClick={() => setShowAllImages(!showAllImages)}
//               className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 "
//             >
//               {showAllImages ? (
//                 <>Show Less <ChevronUp className="w-4 h-4" /></>
//               ) : (
//                 <>Show All <ChevronDown className="w-4 h-4" /></>
//               )}
//             </button>
//           )}
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//           {displayImages.map((image, index) => (
//             <div
//               key={index}
//               className="relative aspect-square bg-gray-100  rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
//               onClick={() => setSelectedImageIndex(index)}
//             >
//               <img
//                 src={image}
//                 alt={`Location image ${index + 1}`}
//                 className="w-full h-full object-cover"
//                 onError={(e) => {
//                   e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
//                 }}
//               />
//               {!showAllImages && index === 3 && remainingCount > 0 && (
//                 <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
//                   <span className="text-white font-semibold">+{remainingCount} more</span>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     );
//   };

//   if (loading || navigationLoading) {
//     return <div className="flex justify-center items-center h-94">
//       <Loader size="large" color="#3b82f6" message="Loading location..." />
//     </div>
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50  flex items-center justify-center px-4">
//         <div className="bg-white  rounded-lg shadow-lg p-8 text-center max-w-md w-full">
//           <div className="text-red-500 mb-4">
//             <MapPin className="w-12 h-12 mx-auto" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900  mb-2">Something went wrong</h2>
//           <p className="text-gray-600  mb-6">{error}</p>
//           <button
//             onClick={() => router.back()}
//             className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!location) {
//     return (
//       <div className="min-h-screen bg-gray-50  flex items-center justify-center px-4">
//         <div className="bg-white  rounded-lg shadow-lg p-8 text-center max-w-md w-full">
//           <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900  mb-2">Location not found</h2>
//           <p className="text-gray-600 ">This washroom doesn't exist or has been removed.</p>
//         </div>
//       </div>
//     );
//   }

//   const hygieneStatus = getHygieneStatus(location.hygiene_scores?.[0]?.score);
//   const navigationInfo = getNavigationInfo();
//   const fallbackImage = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

//   return (
//     <div className="min-h-screen bg-gray-50 ">
//       {/* Header - Keep existing */}
//       <div className="bg-white  border-b border-gray-200 ">
//         <div className="max-w-4xl mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
//                 className="flex items-center text-gray-600  hover:text-gray-900  transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 Back to listings
//               </button>
//             </div>
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handlePrevious}
//                 disabled={!navigationInfo.hasPrevious}
//                 className="flex items-center px-3 py-2 rounded-lg border border-gray-300  hover:bg-gray-50  disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 {navigationInfo.previousName && (
//                   <span className="hidden sm:inline max-w-24 truncate text-gray-600 ">
//                     {navigationInfo.previousName}
//                   </span>
//                 )}
//               </button>
//               <span className="px-3 py-1 bg-gray-100  text-gray-700  rounded-full text-sm font-medium">
//                 {navigationInfo.currentIndex + 1} of {allLocations.length}
//               </span>
//               <button
//                 onClick={handleNext}
//                 disabled={!navigationInfo.hasNext}
//                 className="flex items-center px-3 py-2 rounded-lg border border-gray-300  hover:bg-gray-50  disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
//               >
//                 {navigationInfo.nextName && (
//                   <span className="hidden sm:inline max-w-24 truncate text-gray-600 ">
//                     {navigationInfo.nextName}
//                   </span>
//                 )}
//                 <ChevronRight className="w-4 h-4 ml-1" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-4xl mx-auto px-4 py-8">
//         {/* ✅ Main Info Card with Header and Amenities moved up */}
//         <div className="bg-white  rounded-lg shadow mb-8">
//           <div className="p-6 border-b border-gray-200 ">
//             <div className="flex items-start justify-between mb-6">
//               <div className="flex-1">
//                 <h1 className="text-2xl font-bold text-gray-900  mb-2">{location.name}</h1>
//                 <div className="flex items-center text-gray-600  space-x-4 text-sm">
//                   <div className="flex items-center">
//                     <MapPin className="w-4 h-4 mr-1" />
//                     {parseFloat(location.latitude).toFixed(4)}, {parseFloat(location.longitude).toFixed(4)}
//                   </div>
//                   <div className="flex items-center">
//                     <Calendar className="w-4 h-4 mr-1" />
//                     Added on {formatDate(location.created_at)}
//                   </div>
//                 </div>
//               </div>
//               <div className="flex items-center space-x-3">
//                 <button
//                   onClick={() => handleViewLocation(location.latitude, location.longitude)}
//                   className="flex items-center px-4 py-2 text-blue-600  border border-blue-300  rounded-lg hover:bg-blue-50  transition-colors"
//                 >
//                   <Navigation className="w-4 h-4 mr-2" />
//                   View on Map
//                 </button>
//                 <button
//                   onClick={handleEdit}
//                   className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//                 >
//                   <Edit className="w-4 h-4 mr-2" />
//                   Edit
//                 </button>
//               </div>
//             </div>

//             {/* ✅ Amenities moved up here */}
//             <div className="space-y-4">
//               {renderLocationOptions(location.options)}
//               {renderAssignedCleaners(location.assignedCleaners)}
//             </div>
//           </div>

//           {/* Stats */}
//           <div className="p-6">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div className="text-center">
//                 <div className="flex items-center justify-center mb-2">
//                   {/* {renderStars(Math.round(location.averageRating))} */}
//                   {renderStars(location.averageRating || 0)}

//                 </div>
//                 <div className="text-2xl font-bold text-gray-900  mb-1">
//                   {location.averageRating?.toFixed(1) || 'N/A'}
//                 </div>
//                 <p className="text-sm text-gray-600 ">
//                   {location.ratingCount} {location.ratingCount === 1 ? 'review' : 'reviews'}
//                 </p>
//               </div>

//               {/* <div className="text-center">
//                 <div className="w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
//                   <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900  mb-1">
//                   {location.hygiene_scores?.[0]?.score || 'N/A'}
//                   {location.hygiene_scores?.[0]?.score && '/10'}
//                 </div>
//                 <p className="text-sm text-gray-600 ">
//                   Cleaner Reviews
//                 </p>
//               </div> */}

//               <div className="text-center">
//                 <div className="w-12 h-12 mx-auto mb-2 bg-blue-100  rounded-full flex items-center justify-center">
//                   <TrendingUp className="w-6 h-6 text-blue-600 " />
//                 </div>
//                 <div className="text-2xl font-bold text-gray-900  mb-1">
//                   {location.ReviewData?.length || 0}
//                 </div>
//                 <p className="text-sm text-gray-600 ">
//                   Total User reviews
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ✅ Image Gallery */}
//         {location.images && location.images.length > 0 && (
//           <div className="bg-white  rounded-lg shadow mb-8 p-6">
//             {renderImageGallery(location.images)}
//           </div>
//         )}

//         {/* Reviews Section - Keep existing */}
//         <div className="bg-white  rounded-lg shadow">
//           <div className="p-6 border-b border-gray-200 ">
//             <h2 className="text-xl font-semibold text-gray-900 ">Reviews</h2>
//             <p className="text-gray-600  mt-1">What people are saying about this washroom</p>
//           </div>

//           <div className="divide-y divide-gray-200 ">
//             {location.ReviewData && location.ReviewData.length > 0 ? (
//               location.ReviewData.map((review) => (
//                 <div key={review.id} className="p-6">
//                   <div className="flex items-start space-x-4">
//                     <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
//                       <User className="w-5 h-5 text-white" />
//                     </div>
//                     <div className="flex-1">
//                       <div className="flex items-center justify-between mb-2">
//                         <div className="flex items-center space-x-2">
//                           <span className="text-sm font-medium text-gray-900 ">{review.name}</span>
//                           <div className="flex items-center">
//                             {renderStars(review.rating)}
//                           </div>
//                         </div>
//                         <span className="text-sm text-gray-500 ">{formatDate(review.created_at)}</span>
//                       </div>

//                       <p className="text-gray-700  mb-4">{review.description}</p>

//                       {review.images && review.images.length > 0 && (
//                         <div className="space-y-3">
//                           <div className="flex items-center text-sm text-gray-600 ">
//                             <Camera className="w-4 h-4 mr-1" />
//                             {review.images.length} {review.images.length === 1 ? 'photo' : 'photos'}
//                           </div>
//                           <div className="flex space-x-2 overflow-x-auto">
//                             {review.images.map((url, imgIndex) => (
//                               <div
//                                 key={imgIndex}
//                                 className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100  flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
//                                 onClick={() => window.open(url, '_blank')}
//                               >
//                                 <img
//                                   src={url}
//                                   alt={`Review photo ${imgIndex + 1}`}
//                                   className="w-full h-full object-cover"
//                                   onLoad={() => handleImageLoad(`${review.id}-${imgIndex}`)}
//                                   onError={() => handleImageError(`${review.id}-${imgIndex}`)}
//                                 />
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <div className="p-12 text-center">
//                 <MessageSquare className="w-12 h-12 text-gray-300  mx-auto mb-4" />
//                 <h3 className="text-lg font-medium text-gray-900  mb-2">No reviews yet</h3>
//                 <p className="text-gray-500 ">Be the first to share your experience with this washroom.</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* ✅ Image Modal */}
//       {selectedImageIndex !== null && location.images && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
//           onClick={() => setSelectedImageIndex(null)}
//         >
//           <div className="relative max-w-4xl max-h-full">
//             <img
//               src={location.images[selectedImageIndex]}
//               alt={`Location image ${selectedImageIndex + 1}`}
//               className="max-w-full max-h-full object-contain rounded-lg"
//               style={{ maxHeight: '90vh' }}
//             />
//             <button
//               onClick={() => setSelectedImageIndex(null)}
//               className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
//             >
//               ×
//             </button>
//             <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
//               <p className="text-sm">
//                 {selectedImageIndex + 1} of {location.images.length}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SingleLocation;





'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
  Layers,
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
  Zap,
  Shield,
  Wind,
  Trash2,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import LocationsApi from '@/lib/api/LocationApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from "@/components/ui/Loader";
import toast from 'react-hot-toast';
import { CleanerReviewApi } from '@/lib/api/cleanerReviewApi';


const SingleLocation = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState({});
  const [allLocations, setAllLocations] = useState([]);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'cleaner'
  const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
  const [deleting, setDeleting] = useState(false);

  const [cleanerReviews, setCleanerReviews] = useState([]);
  const [cleanerReviewStats, setCleanerReviewStats] = useState(null);
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { companyId } = useCompanyId();

  const urlCompanyId = searchParams.get('companyId');
  const finalCompanyId = companyId || urlCompanyId;

  const userReviewAverage = useMemo(() => {
    if (!location?.ReviewData || location?.ReviewData.length === 0) return null;

    const totalRating = location?.ReviewData.reduce((sum, review) => sum + (review.rating || 0), 0);
    return (totalRating / location?.ReviewData.length).toFixed(1);
  }, [location?.ReviewData]);


  const userReviewCount = location?.ReviewData?.length || 0;
  const cleanerReviewCount = cleanerReviews.length || 0;

  useEffect(() => {
    const fetchData = async () => {
      if (!params.id || !finalCompanyId) return;

      try {
        setLoading(true);

        const [locationResult, locationsResult, cleanerReviewsResult] = await Promise.all([
          LocationsApi.getLocationById(params.id, finalCompanyId),
          LocationsApi.getAllLocations(finalCompanyId),
          CleanerReviewApi.getCleanerReviewsByLocationId(params.id, finalCompanyId) // ✅ NEW

        ]);

        console.log(locationResult, "locatoin result");
        // console.log(locationsResult, "all loc")
        if (locationResult.success) {
          setLocation(locationResult.data);
        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
        }

        if (cleanerReviewsResult.success) {
          console.log('✅ Cleaner reviews loaded:', cleanerReviewsResult?.data);
          setCleanerReviews(cleanerReviewsResult.data?.reviews || []);
          setCleanerReviewStats(cleanerReviewsResult.data?.stats || null);
        } else {
          console.log('No cleaner reviews or error:', cleanerReviewsResult.error);
          setCleanerReviews([]);
          setCleanerReviewStats(null);
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

  const handleDelete = () => {
    setDeleteModal({ open: true, location });
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      const result = await LocationsApi.deleteLocation(params.id, finalCompanyId, false);

      if (result.success) {
        toast.success('Location deleted successfully');
        setTimeout(() => {
          router.push(`/washrooms?companyId=${finalCompanyId}`);
        }, 500);
      } else {
        toast.error(result.error || 'Failed to delete location');
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete location');
    } finally {
      setDeleting(false);
      setDeleteModal({ open: false, location: null });
    }
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

  // const renderStars = (rating) => {
  //   const stars = [];
  //   const fullStars = Math.floor(rating);
  //   const hasHalfStar = rating % 1 >= 0.25 && rating % 1 < 0.75;
  //   const totalStars = 10;
  //   const emptyStars = totalStars - Math.ceil(rating);

  //   for (let i = 0; i < fullStars; i++) {
  //     stars.push(
  //       <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
  //     );
  //   }

  //   if (hasHalfStar) {
  //     stars.push(
  //       <div key="half" className="relative w-4 h-4">
  //         <Star className="w-4 h-4 text-gray-300 absolute" />
  //         <div className="overflow-hidden absolute" style={{ width: '50%' }}>
  //           <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
  //         </div>
  //       </div>
  //     );
  //   }

  //   for (let i = 0; i < emptyStars; i++) {
  //     stars.push(
  //       <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
  //     );
  //   }

  //   return <div className="flex items-center gap-0.5">{stars}</div>;
  // };


  const renderStars = (rating) => {
    if (!rating || rating === 0) return null;

    const stars = [];

    // ✅ Auto-detect scale: if rating > 5, it's 10-point scale, else 5-point
    const isOutOf10 = rating > 5;
    const normalizedRating = isOutOf10 ? rating / 2 : rating; // Convert 10-point to 5-point

    const fullStars = Math.floor(normalizedRating);
    const hasHalfStar = normalizedRating % 1 >= 0.25 && normalizedRating % 1 < 0.75;
    const totalStars = 5; // Always display 5 stars
    const emptyStars = totalStars - Math.ceil(normalizedRating);

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-4 h-4 text-amber-400 fill-amber-400" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative w-4 h-4">
          <Star className="w-4 h-4 text-gray-300 absolute" />
          <div className="overflow-hidden absolute" style={{ width: '50%' }}>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          </div>
        </div>
      );
    }

    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
      );
    }

    return <div className="flex items-center gap-0.5">{stars}</div>;
  };
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderLocationOptions = (options) => {
    if (!options || Object.keys(options).length === 0) return null;

    const optionIcons = {
      isPaid: { icon: Coins, label: 'Paid Entry', color: 'text-yellow-600 bg-yellow-50' },
      isHandicapAccessible: { icon: Accessibility, label: 'Wheelchair Accessible', color: 'text-blue-600 bg-blue-50' },
      isStrictlyForHandicap: { icon: Accessibility, label: 'Disabled Only', color: 'text-purple-600 bg-purple-50' },
      hasBabyChangingStation: { icon: Baby, label: 'Baby Changing', color: 'text-pink-600 bg-pink-50' },
      hasSanitaryProducts: { icon: Package, label: 'Sanitary Products', color: 'text-purple-600 bg-purple-50' },
      is24Hours: { icon: Clock, label: '24/7 Open', color: 'text-green-600 bg-green-50' },
      hasAttendant: { icon: Shield, label: 'Has Attendant', color: 'text-indigo-600 bg-indigo-50' },
      hasHandDryer: { icon: Wind, label: 'Hand Dryer', color: 'text-teal-600 bg-teal-50' },
    };

    const genderColors = {
      'male': 'text-blue-600 bg-blue-50',
      'female': 'text-pink-600 bg-pink-50',
      'unisex': 'text-green-600 bg-green-50',
      'family': 'text-orange-600 bg-orange-50',
      'disabled': 'text-purple-600 bg-purple-50'
    };

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Package className="w-4 h-4" />
          Amenities & Features
        </h3>
        <div className="flex flex-wrap gap-2">
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

          {Object.entries(options).map(([key, value]) => {
            if (key === 'genderAccess') return null;
            if (!optionIcons[key]) return null;
            if (typeof value === 'boolean' && value !== true) return null;
            if (value === null || value === undefined || value === '') return null;

            const { icon: Icon, label, color } = optionIcons[key];

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

  const renderAssignedCleaners = (assignedCleaners) => {
    if (!assignedCleaners || assignedCleaners.length === 0) {
      return (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assigned Cleaners
          </h3>
          <p className="text-sm text-gray-500">No cleaners currently assigned to this location.</p>
        </div>
      );
    }

    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Assigned Cleaners ({assignedCleaners.length})
          </h3>
          <button
            onClick={() => {
              const params = new URLSearchParams({
                companyId: finalCompanyId,
                locationId: location.id,
                locationName: location.name
              });
              router.push(`/assignments/cleaner?${params.toString()}`);
            }}
            className="cursor-pointer text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
          >
            View All
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        <div className="space-y-3">
          {assignedCleaners.map((assignment) => (
            <div key={assignment.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{assignment.cleaner?.name || 'Unknown'}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-3">
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


  const renderImageGallery = (images) => {
    if (!images || images.length === 0) return null;

    const displayImages = showAllImages ? images : images.slice(0, 4);
    const remainingCount = images.length - 4;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Location Images ({images.length})
          </h3>
          {images.length > 4 && (
            <button
              onClick={() => setShowAllImages(!showAllImages)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
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
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading location..." />
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

  const navigationInfo = getNavigationInfo();


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to listings
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrevious}
                disabled={!navigationInfo.hasPrevious}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                {navigationInfo.previousName && (
                  <span className="hidden sm:inline max-w-24 truncate text-gray-600">
                    {navigationInfo.previousName}
                  </span>
                )}
              </button>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {navigationInfo.currentIndex + 1} of {allLocations.length}
              </span>
              <button
                onClick={handleNext}
                disabled={!navigationInfo.hasNext}
                className="flex items-center px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {navigationInfo.nextName && (
                  <span className="hidden sm:inline max-w-24 truncate text-gray-600">
                    {navigationInfo.nextName}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Main Info Card - Two Column Layout */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Image */}
              <div className="space-y-4">
                <div className="aspect-video w-full bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={location.images?.[0] || "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80"}
                    alt={location.name}
                    className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => location.images?.[0] && setSelectedImageIndex(0)}
                  />
                </div>
                {location.images && location.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {location.images.slice(1, 5).map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setSelectedImageIndex(idx + 1)}
                      >
                        <img
                          src={img}
                          alt={`Location ${idx + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column - Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">{location.name}</h1>

                  {/* Address Section */}
                  <div className="space-y-3 text-gray-600">
                    {location.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        <span>{location.address}</span>
                      </div>
                    )}
                    {/* Location Type / Zone Hierarchy */}
                    {location.location_types && (
                      <div className="flex items-center gap-3 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 px-4 py-3 rounded-lg shadow-sm">
                        <div className="flex-shrink-0">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Layers className="w-4 h-4 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Location Hierarchy / Zone
                          </span>
                          <span className="text-sm font-semibold text-gray-900 mt-0.5">
                            {location.location_types.name}
                          </span>
                        </div>
                      </div>
                    )}


                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      {location.city && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">City:</span> {location.city}
                        </div>
                      )}
                      {location.state && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">State:</span> {location.state}
                        </div>
                      )}
                      {location.pincode && (
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Pincode:</span> {location.pincode}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Created on {formatDate(location.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => handleViewLocation(location.latitude, location.longitude)}
                    className="flex items-center px-4 py-2.5 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Locate on Map
                  </button>
                  <button
                    onClick={handleEdit}
                    className="flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Amenities */}
            <div className="mt-8">
              {renderLocationOptions(location.options)}
            </div>

            {/* Photo Upload Notice */}
            {location.no_of_photos && (
              <div className="flex items-start gap-3 p-3 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                <Camera className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Photo Upload Limit</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    Minimum <span className="font-bold">{location.no_of_photos}</span> photos can be uploaded for this location
                  </p>
                </div>
              </div>
            )}

          </div>
        </div>


        {/* Assigned Cleaners */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          {renderAssignedCleaners(location.assignedCleaners)}
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* User Reviews */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  {userReviewAverage ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(parseFloat(userReviewAverage))}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {userReviewAverage}/10
                      </div>
                      <p className="text-xs text-gray-600">
                        {userReviewCount} User {userReviewCount === 1 ? 'Review' : 'Reviews'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">N/A</div>
                      <p className="text-xs text-gray-600">
                        {userReviewCount} User {userReviewCount === 1 ? 'Review' : 'Reviews'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Cleaner Reviews */}
              <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  {cleanerReviewStats?.average_score ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(parseFloat(cleanerReviewStats.average_score))}
                      </div>
                      <div className="text-2xl font-bold text-gray-900">
                        {cleanerReviewStats.average_score}/10
                      </div>
                      <p className="text-xs text-gray-600">
                        Cleaner {cleanerReviewCount === 1 ? 'Review' : 'Reviews'}
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-2xl font-bold text-gray-900">N/A</div>
                      <p className="text-xs text-gray-600">
                        {cleanerReviewCount} Cleaner {cleanerReviewCount === 1 ? 'Review' : 'Reviews'}
                      </p>
                    </>
                  )}
                </div>
              </div>

            </div>

            {/* Overall Hygiene Score - Keep as is */}
            {/* {location.averageRating && (
              <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white fill-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Overall Hygiene Score</p>
                      <div className="flex items-center gap-2">
                        {renderStars(location.averageRating)}
                        <span className="text-lg font-bold text-gray-900">
                          {location.averageRating.toFixed(1)}/10
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Based on {location.ratingCount} hygiene inspection{location.ratingCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )} */}
          </div>
        </div>

        {/* Reviews Section with Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('user')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'user'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                User Reviews ({userReviewCount})
              </button>
              <button
                onClick={() => setActiveTab('cleaner')}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors ${activeTab === 'cleaner'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                Cleaner Reviews ({cleanerReviewCount})
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {/* ========== USER REVIEWS TAB ========== */}
            {activeTab === 'user' && (
              <>
                {location.ReviewData && location.ReviewData.length > 0 ? (
                  location.ReviewData.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/user-activity/${review.id}?companyId=${finalCompanyId}`)}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">{review.name}</span>
                              <div className="flex items-center">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                          </div>

                          <p className="text-gray-700 mb-4">{review.description}</p>

                          {review.images && review.images.length > 0 && (
                            <div className="space-y-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Camera className="w-4 h-4 mr-1" />
                                {review.images.length} {review.images.length === 1 ? 'photo' : 'photos'}
                              </div>
                              <div className="flex space-x-2 overflow-x-auto">
                                {review.images.map((url, imgIndex) => (
                                  <div
                                    key={imgIndex}
                                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(url, '_blank');
                                    }}
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
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No user reviews yet</h3>
                    <p className="text-gray-500">Be the first to share your experience with this washroom.</p>
                  </div>
                )}
              </>
            )}

            {/* ========== CLEANER REVIEWS TAB ========== */}
            {activeTab === 'cleaner' && (
              <>
                {cleanerReviews && cleanerReviews.length > 0 ? (
                  cleanerReviews.map((review) => (
                    <div
                      key={review.id}
                      onClick={() => router.push(`/cleaner-review/${review.id}?companyId=${finalCompanyId}`)}
                      className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="space-y-4">
                        {/* Header Section */}
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">
                                  {review.cleaner_user?.name || 'Unknown Cleaner'}
                                </span>
                                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${review.status === 'completed'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-yellow-100 text-yellow-700'
                                  }`}>
                                  {review.status}
                                </div>
                                {review.score && (
                                  <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    Score: {review.score}/10
                                  </div>
                                )}
                              </div>

                              {/* Cleaner Contact Info */}
                              {review.cleaner_user && (
                                <div className="text-xs text-gray-500 flex items-center gap-3">
                                  {review.cleaner_user.email && (
                                    <span className="flex items-center gap-1">
                                      <Mail className="w-3 h-3" />
                                      {review.cleaner_user.email}
                                    </span>
                                  )}
                                  {review.cleaner_user.phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {review.cleaner_user.phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                        </div>

                        {/* Comments */}
                        {(review.initial_comment || review.final_comment) && (
                          <div className="space-y-2">
                            {review.initial_comment && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Initial: </span>
                                <span className="text-gray-600">{review.initial_comment}</span>
                              </div>
                            )}
                            {review.final_comment && (
                              <div className="text-sm">
                                <span className="font-medium text-gray-700">Final: </span>
                                <span className="text-gray-600">{review.final_comment}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* ✅ UPDATED: Smaller Before & After Images (thumbnail size) */}
                        {(review.before_photo?.length > 0 || review.after_photo?.length > 0) && (
                          <div className="space-y-2">
                            <div className="flex items-center text-sm text-gray-600 mb-2">
                              <Camera className="w-4 h-4 mr-1" />
                              Before & After Photos
                            </div>
                            <div className="flex space-x-3">
                              {/* Before Image - Small thumbnail */}
                              {review.before_photo && review.before_photo.length > 0 && (
                                <div className="flex flex-col items-center space-y-1">
                                  <div
                                    className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-red-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(review.before_photo[0], '_blank');
                                    }}
                                  >
                                    <img
                                      src={review.before_photo[0]}
                                      alt="Before cleaning"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">
                                      B
                                    </div>
                                    <span className="text-xs text-gray-600">Before</span>
                                  </div>
                                </div>
                              )}

                              {/* After Image - Small thumbnail */}
                              {review.after_photo && review.after_photo.length > 0 && (
                                <div className="flex flex-col items-center space-y-1">
                                  <div
                                    className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border-2 border-green-200"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      window.open(review.after_photo[0], '_blank');
                                    }}
                                  >
                                    <img
                                      src={review.after_photo[0]}
                                      alt="After cleaning"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.src = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                                      }}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold">
                                      A
                                    </div>
                                    <span className="text-xs text-gray-600">After</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Tasks Completed */}
                        {review.tasks && review.tasks.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-4 h-4 text-green-600" />
                              <span className="text-sm font-medium text-gray-700">
                                Tasks Completed ({review.tasks.length})
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {review.tasks.slice(0, 5).map((task, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-0.5 bg-white text-gray-600 text-xs rounded-full border border-gray-200"
                                >
                                  {task}
                                </span>
                              ))}
                              {review.tasks.length > 5 && (
                                <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 text-xs rounded-full font-medium">
                                  +{review.tasks.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Click to view details indicator */}
                        <div className="flex items-center justify-end text-sm text-blue-600">
                          <span className="flex items-center gap-1 hover:gap-2 transition-all">
                            View Details
                            <ChevronRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center">
                    <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No cleaner reviews yet</h3>
                    <p className="text-gray-500">Cleaner reviews will appear here once available.</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
              <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                  Delete Location
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="mb-5 sm:mb-6">
              <p className="text-sm sm:text-base text-slate-700">
                Are you sure you want to delete "<strong className="font-semibold">{deleteModal.location?.name}</strong>"?
                This will permanently remove the location and all associated data.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
              <button
                onClick={() => setDeleteModal({ open: false, location: null })}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150 font-medium"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="w-full sm:w-auto px-4 py-2 sm:py-2.5 text-sm sm:text-base bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-150 flex items-center justify-center gap-2 disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
              >
                {deleting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {deleting ? 'Deleting...' : 'Delete Location'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
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
