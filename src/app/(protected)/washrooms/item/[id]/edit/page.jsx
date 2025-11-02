// 'use client';

// import React, { useEffect, useState, useRef } from 'react';
// import { useParams, useRouter, useSearchParams } from 'next/navigation';
// import {
//   MapPin,
//   Save,
//   ArrowLeft,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   X,
//   Navigation,
//   Settings,
//   Plus,
//   Minus,
//   Eye,
//   AlertCircle,
//   Upload,
//   Image as ImageIcon,
//   Trash2
// } from 'lucide-react';
// import LocationsApi from '@/lib/api/LocationApi';
// import { fetchToiletFeaturesByName } from '@/lib/api/configurationsApi';
// import { useCompanyId } from '@/lib/providers/CompanyProvider';
// import Loader from "@/components/ui/Loader";
// import toast from 'react-hot-toast';

// const EditLocationPage = () => {
//   const [location, setLocation] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState(null);
//   const [allLocations, setAllLocations] = useState([]);
//   const [navigationLoading, setNavigationLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchResults, setSearchResults] = useState([]);
//   const [showSearch, setShowSearch] = useState(false);
//   const [toiletFeatures, setToiletFeatures] = useState({});

//   // ✅ Image states
//   const [newImages, setNewImages] = useState([]);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [existingImages, setExistingImages] = useState([]);
//   const [imagesToDelete, setImagesToDelete] = useState([]);
//   const [selectedImageIndex, setSelectedImageIndex] = useState(null);
//   const fileInputRef = useRef(null);

//   const [formData, setFormData] = useState({
//     name: '',
//     latitude: '',
//     longitude: '',
//     options: {}
//   });

//   const params = useParams();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const { companyId } = useCompanyId();

//   // Get companyId from URL params if not from context
//   const urlCompanyId = searchParams.get('companyId');
//   const finalCompanyId = companyId || urlCompanyId;

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!params.id || !finalCompanyId) return;

//       try {
//         setLoading(true);

//         // Fetch current location, all locations, and toilet features in parallel
//         const [locationResult, locationsResult, featuresResult] = await Promise.all([
//           LocationsApi.getLocationById(params.id, finalCompanyId),
//           LocationsApi.getAllLocations(finalCompanyId),
//           fetchToiletFeaturesByName('Toilet_Features')
//         ]);

//         if (locationResult.success) {
//           setLocation(locationResult.data);
//           setFormData({
//             name: locationResult.data.name,
//             latitude: locationResult.data.latitude?.toString() || '',
//             longitude: locationResult.data.longitude?.toString() || '',
//             options: locationResult.data.options || {}
//           });

//           // ✅ Set existing images
//           setExistingImages(locationResult.data.images || []);
//         } else {
//           setError(locationResult.error);
//         }

//         if (locationsResult.success) {
//           setAllLocations(locationsResult.data);
//         }

//         if (featuresResult) {
//           console.log(featuresResult?.data[0]?.description, "toilet features")
//           const features = {};
//           featuresResult?.data[0]?.description.forEach(feature => {
//             features[feature.key] = feature;
//           });
//           setToiletFeatures(features);
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

//   // ✅ Image handling functions
//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);

//     if (files.length === 0) return;

//     // Validate file types and sizes
//     const validFiles = [];
//     const invalidFiles = [];

//     files.forEach(file => {
//       if (file.type.startsWith('image/')) {
//         if (file.size <= 10 * 1024 * 1024) { // 10MB limit
//           validFiles.push(file);
//         } else {
//           invalidFiles.push(file.name + ' (too large)');
//         }
//       } else {
//         invalidFiles.push(file.name + ' (not an image)');
//       }
//     });

//     if (invalidFiles.length > 0) {
//       toast.error(`Invalid files: ${invalidFiles.join(', ')}`);
//     }

//     if (validFiles.length > 0) {
//       // Add to new images array
//       setNewImages(prev => [...prev, ...validFiles]);

//       // Create preview URLs
//       const newPreviews = validFiles.map(file => ({
//         file,
//         url: URL.createObjectURL(file),
//         name: file.name,
//         isNew: true
//       }));

//       setPreviewImages(prev => [...prev, ...newPreviews]);
//     }

//     // Reset input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = '';
//     }
//   };

//   const removeNewImage = (index) => {
//     // Revoke preview URL to free memory
//     URL.revokeObjectURL(previewImages[index].url);

//     setNewImages(prev => prev.filter((_, i) => i !== index));
//     setPreviewImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const removeExistingImage = (imageUrl) => {
//     setImagesToDelete(prev => [...prev, imageUrl]);
//     setExistingImages(prev => prev.filter(img => img !== imageUrl));
//   };

//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   // ✅ Handle multiselect changes
//   const handleMultiselectChange = (key, value, checked) => {
//     const currentValues = formData.options[key] || [];
//     let newValues;

//     if (checked) {
//       // Add value if not already present
//       newValues = currentValues.includes(value)
//         ? currentValues
//         : [...currentValues, value];
//     } else {
//       // Remove value
//       newValues = currentValues.filter(v => v !== value);
//     }

//     handleOptionChange(key, newValues);
//   };


//   // ✅ Add this function after your existing helper functions
//   const confirmClearAllImages = () => {
//     if (window.confirm('Are you sure you want to remove all images? This action cannot be undone.')) {
//       // Add all existing images to delete list
//       setImagesToDelete(prev => [...prev, ...existingImages]);
//       setExistingImages([]);

//       // Clear all new images
//       previewImages.forEach(preview => {
//         URL.revokeObjectURL(preview.url);
//       });
//       setNewImages([]);
//       setPreviewImages([]);

//       toast.success('All images marked for removal');
//     }
//   };

//   // Search functionality
//   const handleSearch = async (query) => {
//     if (query.length < 2) {
//       setSearchResults([]);
//       return;
//     }

//     try {
//       const result = await LocationsApi.searchLocations(query, finalCompanyId);
//       if (result.success) {
//         setSearchResults(result.data);
//       }
//     } catch (error) {
//       console.error('Search error:', error);
//     }
//   };

//   const selectSearchResult = (selectedLocation) => {
//     setNavigationLoading(true);
//     router.push(`/washrooms/item/${selectedLocation.id}/edit?companyId=${finalCompanyId}`);
//     setShowSearch(false);
//     setSearchQuery('');
//     setSearchResults([]);
//   };

//   const getCurrentLocationIndex = () => {
//     return allLocations.findIndex(loc => loc.id === params.id);
//   };

//   const handlePrevious = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex > 0) {
//       setNavigationLoading(true);
//       const prevLocation = allLocations[currentIndex - 1];
//       router.push(`/washrooms/item/${prevLocation.id}/edit?companyId=${finalCompanyId}`);
//     }
//   };

//   const handleNext = async () => {
//     const currentIndex = getCurrentLocationIndex();
//     if (currentIndex < allLocations.length - 1) {
//       setNavigationLoading(true);
//       const nextLocation = allLocations[currentIndex + 1];
//       router.push(`/washrooms/item/${nextLocation.id}/edit?companyId=${finalCompanyId}`);
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

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

//   const handleOptionChange = (optionKey, value) => {
//     setFormData(prev => ({
//       ...prev,
//       options: {
//         ...prev.options,
//         [optionKey]: value
//       }
//     }));
//   };

//   // ✅ Updated save handler with image support
//   const handleSave = async () => {
//     try {
//       setSaving(true);

//       // Validate required fields
//       if (!formData.name.trim()) {
//         toast.error('Location name is required');
//         return;
//       }

//       const updateData = {
//         name: formData.name.trim(),
//         latitude: formData.latitude ? parseFloat(formData.latitude) : null,
//         longitude: formData.longitude ? parseFloat(formData.longitude) : null,
//         options: formData.options
//       };

//       // Handle image deletion first
//       for (const imageUrl of imagesToDelete) {
//         try {
//           await LocationsApi.deleteLocationImage(params.id, imageUrl, finalCompanyId);
//         } catch (error) {
//           console.error('Error deleting image:', error);
//           // Continue with other operations even if one image deletion fails
//         }
//       }

//       // Update location with new images
//       const result = await LocationsApi.updateLocation(
//         params.id,
//         updateData,
//         finalCompanyId,
//         newImages,
//         false // Don't replace all images, just add new ones
//       );

//       if (result.success) {
//         toast.success('Location updated successfully! Redirecting...');

//         // Clean up preview URLs
//         previewImages.forEach(preview => {
//           if (preview.url.startsWith('blob:')) {
//             URL.revokeObjectURL(preview.url);
//           }
//         });

//         router.push(`/washrooms?companyId=${finalCompanyId}`);
//       } else {
//         toast.error(result.error || 'Failed to update location');
//         setSaving(false);
//       }
//     } catch (error) {
//       console.error('Save error:', error);
//       toast.error('Failed to update location');
//       setSaving(false);
//     }
//   };

//   // ✅ Updated render option control with multiselect support
//   const renderOptionControl = (optionKey, feature) => {
//     const currentValue = formData.options[optionKey];

//     switch (feature.type) {
//       case 'boolean':
//         return (
//           <div key={optionKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
//             <div>
//               <label className="font-medium text-gray-700 dark:text-gray-200">
//                 {feature.label}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <label className="relative inline-flex items-center cursor-pointer">
//               <input
//                 type="checkbox"
//                 checked={currentValue ?? feature.defaultValue ?? false}
//                 onChange={(e) => handleOptionChange(optionKey, e.target.checked)}
//                 className="sr-only peer"
//               />
//               <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
//             </label>
//           </div>
//         );

//       // ✅ New multiselect case
//       case 'multiselect':
//         const selectedValues = currentValue || feature.defaultValue || [];
//         return (
//           <div key={optionKey} className="space-y-3">
//             <label className="block font-medium text-gray-700 dark:text-gray-200">
//               {feature.label}
//               {feature.required && <span className="text-red-500 ml-1">*</span>}
//             </label>
//             {feature.category && (
//               <p className="text-sm text-gray-500 dark:text-gray-400">{feature.category}</p>
//             )}

//             {/* Selected count indicator */}
//             {selectedValues.length > 0 && (
//               <div className="text-sm text-blue-600 dark:text-blue-400 font-medium">
//                 {selectedValues.length} selected
//               </div>
//             )}

//             {/* Options grid */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//               {feature.options?.map((option, index) => {
//                 const value = typeof option === 'string' ? option : option.value;
//                 const label = typeof option === 'string' ? option : option.label;
//                 const isSelected = selectedValues.includes(value);

//                 return (
//                   <label
//                     key={index}
//                     className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isSelected
//                       ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-600'
//                       : 'bg-white border-gray-200 hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:hover:bg-gray-600'
//                       }`}
//                   >
//                     <input
//                       type="checkbox"
//                       checked={isSelected}
//                       onChange={(e) => handleMultiselectChange(optionKey, value, e.target.checked)}
//                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:bg-gray-600 dark:border-gray-500"
//                     />
//                     <span className={`text-sm font-medium ${isSelected
//                       ? 'text-blue-700 dark:text-blue-300'
//                       : 'text-gray-700 dark:text-gray-300'
//                       }`}>
//                       {label}
//                     </span>
//                   </label>
//                 );
//               })}
//             </div>

//             {/* Selected values display */}
//             {selectedValues.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-2">
//                 {selectedValues.map((value) => {
//                   const option = feature.options?.find(opt =>
//                     (typeof opt === 'string' ? opt : opt.value) === value
//                   );
//                   const label = option ?
//                     (typeof option === 'string' ? option : option.label) :
//                     value;

//                   return (
//                     <span
//                       key={value}
//                       className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full dark:bg-blue-900/30 dark:text-blue-300"
//                     >
//                       {label}
//                       <button
//                         type="button"
//                         onClick={() => handleMultiselectChange(optionKey, value, false)}
//                         className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
//                       >
//                         ×
//                       </button>
//                     </span>
//                   );
//                 })}
//               </div>
//             )}
//           </div>
//         );

//       case 'select':
//       case 'dropdown':
//         return (
//           <div key={optionKey} className="space-y-2">
//             <div>
//               <label className="block font-medium text-gray-700 dark:text-gray-200">
//                 {feature.label}
//                 {feature.required && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <select
//               value={currentValue ?? feature.defaultValue ?? ''}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required={feature.required}
//             >
//               <option value="">Select {feature.label}</option>
//               {feature.options?.map((option, index) => {
//                 const value = typeof option === 'string' ? option : option.value;
//                 const label = typeof option === 'string' ? option : option.label;
//                 return (
//                   <option key={index} value={value}>
//                     {label}
//                   </option>
//                 );
//               })}
//             </select>
//           </div>
//         );

//       case 'text':
//         return (
//           <div key={optionKey} className="space-y-2">
//             <div>
//               <label className="block font-medium text-gray-700 dark:text-gray-200">
//                 {feature.label}
//                 {feature.required && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <input
//               type="text"
//               value={currentValue ?? feature.defaultValue ?? ''}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder={feature.placeholder || `Enter ${feature.label}`}
//               maxLength={feature.maxLength}
//               required={feature.required}
//             />
//           </div>
//         );

//       case 'number':
//         return (
//           <div key={optionKey} className="space-y-2">
//             <div>
//               <label className="block font-medium text-gray-700 dark:text-gray-200">
//                 {feature.label}
//                 {feature.required && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <input
//               type="number"
//               value={currentValue ?? feature.defaultValue ?? ''}
//               onChange={(e) => handleOptionChange(optionKey, parseFloat(e.target.value) || '')}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               min={feature.min}
//               max={feature.max}
//               step={feature.step || 'any'}
//               required={feature.required}
//             />
//           </div>
//         );

//       case 'textarea':
//         return (
//           <div key={optionKey} className="space-y-2">
//             <div>
//               <label className="block font-medium text-gray-700 dark:text-gray-200">
//                 {feature.label}
//                 {feature.required && <span className="text-red-500 ml-1">*</span>}
//               </label>
//               {feature.category && (
//                 <p className="text-sm text-gray-500 dark:text-gray-400">
//                   {feature.category}
//                 </p>
//               )}
//             </div>
//             <textarea
//               value={currentValue ?? feature.defaultValue ?? ''}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder={feature.placeholder || `Enter ${feature.label}`}
//               rows={feature.rows || 3}
//               maxLength={feature.maxLength}
//               required={feature.required}
//             />
//           </div>
//         );

//       default:
//         // Fallback for backward compatibility
//         return (
//           <div key={optionKey} className="space-y-2">
//             <label className="block font-medium text-gray-700 dark:text-gray-200">
//               {feature.label}
//             </label>
//             <input
//               type="text"
//               value={currentValue ?? ''}
//               onChange={(e) => handleOptionChange(optionKey, e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder={`Enter ${feature.label}`}
//             />
//           </div>
//         );
//     }
//   };

//   // Clean up preview URLs on unmount
//   useEffect(() => {
//     return () => {
//       previewImages.forEach(preview => {
//         if (preview.url.startsWith('blob:')) {
//           URL.revokeObjectURL(preview.url);
//         }
//       });
//     };
//   }, []);

//   if (loading || navigationLoading) {
//     return <div className="flex justify-center items-center h-94">
//       <Loader
//         size="large"
//         color="#3b82f6"
//         message="Loading location..."
//       />
//     </div>
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
//           <div className="text-red-500 mb-4">
//             <AlertCircle className="w-12 h-12 mx-auto" />
//           </div>
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Something went wrong</h2>
//           <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
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
//       <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-md w-full">
//           <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Location not found</h2>
//           <p className="text-gray-600 dark:text-gray-300">This location doesn't exist or has been removed.</p>
//         </div>
//       </div>
//     );
//   }

//   const navigationInfo = getNavigationInfo();
//   const allImages = [...existingImages, ...previewImages];

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Header - keeping your existing header code */}
//       <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//         <div className="max-w-4xl mx-auto px-4 py-6">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center space-x-4">
//               <button
//                 onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
//                 className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
//               >
//                 <ArrowLeft className="w-5 h-5 mr-2" />
//                 Back to listings
//               </button>
//             </div>

//             {/* Navigation Controls - keeping your existing navigation */}
//             <div className="flex items-center space-x-2">
//               <button
//                 onClick={handlePrevious}
//                 disabled={!navigationInfo.hasPrevious}
//                 className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
//                 title={navigationInfo.previousName ? `Previous: ${navigationInfo.previousName}` : 'No previous location'}
//               >
//                 <ChevronLeft className="w-4 h-4 mr-1" />
//                 {navigationInfo.previousName && (
//                   <span className="hidden sm:inline max-w-24 truncate text-gray-600 dark:text-gray-300">
//                     {navigationInfo.previousName}
//                   </span>
//                 )}
//               </button>

//               <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
//                 {navigationInfo.currentIndex + 1} of {allLocations.length}
//               </span>

//               <button
//                 onClick={handleNext}
//                 disabled={!navigationInfo.hasNext}
//                 className="flex items-center px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
//                 title={navigationInfo.nextName ? `Next: ${navigationInfo.nextName}` : 'No next location'}
//               >
//                 {navigationInfo.nextName && (
//                   <span className="hidden sm:inline max-w-24 truncate text-gray-600 dark:text-gray-300">
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
//         {/* Main Form */}
//         <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-8">
//           <div className="p-6 border-b border-gray-200 dark:border-gray-700">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
//                   Edit Location
//                 </h1>
//                 <p className="text-gray-600 dark:text-gray-400">
//                   Update location information, images, and amenities
//                 </p>
//               </div>
//               <button
//                 onClick={() => router.push(`/washrooms/item/${params.id}?companyId=${finalCompanyId}`)}
//                 className="flex items-center px-4 py-2 text-blue-600 dark:text-blue-400 border border-blue-300 dark:border-blue-600 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
//               >
//                 <Eye className="w-4 h-4 mr-2" />
//                 View Location
//               </button>
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="block font-medium text-gray-700 dark:text-gray-200">
//                   Location Name *
//                 </label>
//                 <input
//                   type="text"
//                   value={formData.name}
//                   onChange={(e) => handleInputChange('name', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="Enter location name"
//                   required
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="block font-medium text-gray-700 dark:text-gray-200">
//                   View on Map
//                 </label>
//                 <button
//                   onClick={() => window.open(`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`, '_blank')}
//                   disabled={!formData.latitude || !formData.longitude}
//                   className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                 >
//                   <Navigation className="w-4 h-4 mr-2" />
//                   Open in Maps
//                 </button>
//               </div>
//             </div>

//             {/* Coordinates */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="space-y-2">
//                 <label className="block font-medium text-gray-700 dark:text-gray-200">
//                   Latitude
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={formData.latitude}
//                   onChange={(e) => handleInputChange('latitude', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g., 21.1458"
//                 />
//               </div>

//               <div className="space-y-2">
//                 <label className="block font-medium text-gray-700 dark:text-gray-200">
//                   Longitude
//                 </label>
//                 <input
//                   type="number"
//                   step="any"
//                   value={formData.longitude}
//                   onChange={(e) => handleInputChange('longitude', e.target.value)}
//                   className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   placeholder="e.g., 79.0882"
//                 />
//               </div>
//             </div>


//             {/* ✅ Enhanced Images Section with Better Delete UI */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
//                 <ImageIcon className="h-5 w-5" />
//                 Location Images
//                 {(existingImages.length > 0 || previewImages.length > 0) && (
//                   <span className="text-sm text-gray-500 dark:text-gray-400">
//                     ({existingImages.length + previewImages.length} total)
//                   </span>
//                 )}
//               </h3>

//               {/* Upload Area */}
//               <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />

//                 <div className="space-y-4">
//                   <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
//                     <Upload className="h-8 w-8 text-blue-600 dark:text-blue-400" />
//                   </div>

//                   <div>
//                     <button
//                       type="button"
//                       onClick={triggerFileInput}
//                       className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
//                     >
//                       <Plus className="h-4 w-4" />
//                       {existingImages.length === 0 && previewImages.length === 0 ? 'Add Images' : 'Add More Images'}
//                     </button>
//                     <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
//                       Select multiple images (max 10MB each)
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Current Images with Enhanced Delete Options */}
//               {(existingImages.length > 0 || previewImages.length > 0) && (
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <h4 className="font-medium text-gray-700 dark:text-gray-300">
//                       Current Images ({existingImages.length + previewImages.length})
//                     </h4>

//                     {/* Clear All Button */}
//                     {(existingImages.length > 0 || previewImages.length > 0) && (
//                       <button
//                         type="button"
//                         onClick={() => {
//                           // Add all existing images to delete list
//                           setImagesToDelete(prev => [...prev, ...existingImages]);
//                           setExistingImages([]);

//                           // Clear all new images
//                           previewImages.forEach(preview => {
//                             URL.revokeObjectURL(preview.url);
//                           });
//                           setNewImages([]);
//                           setPreviewImages([]);

//                           toast.success('All images marked for removal');
//                         }}
//                         className="flex items-center gap-1 px-3 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
//                       >
//                         <Trash2 className="h-3 w-3" />
//                         Clear All
//                       </button>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//                     {/* Existing Images with Enhanced Delete */}
//                     {existingImages.map((imageUrl, index) => (
//                       <div key={`existing-${index}`} className="relative group bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                         <img
//                           src={imageUrl}
//                           alt={`Existing ${index + 1}`}
//                           className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                           onClick={() => setSelectedImageIndex(index)}
//                           onError={(e) => {
//                             e.target.style.display = 'none';
//                             e.target.parentElement.innerHTML = '<div class="w-full h-24 bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 text-xs">Failed to load</div>';
//                           }}
//                         />

//                         {/* Always visible delete button for existing images */}
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeExistingImage(imageUrl);
//                             toast.success('Image marked for deletion');
//                           }}
//                           className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
//                           title="Delete this image"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>

//                         {/* Image type label */}
//                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
//                           <p className="text-xs text-white font-medium">
//                             Existing Image
//                           </p>
//                         </div>
//                       </div>
//                     ))}

//                     {/* New Images with Enhanced Delete */}
//                     {previewImages.map((preview, index) => (
//                       <div key={`new-${index}`} className="relative group bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-green-600 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
//                         <img
//                           src={preview.url}
//                           alt={`New ${index + 1}`}
//                           className="w-full h-24 object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                           onClick={() => setSelectedImageIndex(existingImages.length + index)}
//                         />

//                         {/* Always visible delete button for new images */}
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeNewImage(index);
//                             toast.success('New image removed');
//                           }}
//                           className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md"
//                           title="Remove this new image"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>

//                         {/* Image type label */}
//                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-2">
//                           <p className="text-xs text-white font-medium truncate">
//                             New: {preview.name}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Status Indicators */}
//                   <div className="space-y-2">
//                     {/* Images to be deleted indicator */}
//                     {imagesToDelete.length > 0 && (
//                       <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
//                         <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
//                         <div className="flex-1">
//                           <p className="text-sm text-red-600 dark:text-red-400 font-medium">
//                             {imagesToDelete.length} existing image(s) will be deleted when you save
//                           </p>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={() => {
//                             // Restore deleted images
//                             setExistingImages(prev => [...prev, ...imagesToDelete]);
//                             setImagesToDelete([]);
//                             toast.success('Image deletions cancelled');
//                           }}
//                           className="text-xs text-red-600 hover:text-red-700 underline"
//                         >
//                           Undo
//                         </button>
//                       </div>
//                     )}

//                     {/* New images indicator */}
//                     {newImages.length > 0 && (
//                       <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
//                         <Plus className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0" />
//                         <p className="text-sm text-green-600 dark:text-green-400 font-medium">
//                           {newImages.length} new image(s) will be added when you save
//                         </p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}
//             </div>



//             {/* Amenities/Options */}
//             {Object.keys(toiletFeatures).length > 0 && (
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                   Amenities & Features
//                 </h3>
//                 <div className="grid grid-cols-1 gap-4">
//                   {Object.entries(toiletFeatures).map(([key, feature]) =>
//                     renderOptionControl(key, feature)
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
//               <button
//                 onClick={() => router.back()}
//                 className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
//                 disabled={saving}
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 disabled={saving || !formData.name.trim()}
//                 className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               >
//                 {saving ? (
//                   <>
//                     <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Saving...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="w-4 h-4 mr-2" />
//                     Save Changes
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* ✅ Image Modal for full view */}
//       {/* ✅ Updated Image Modal for full view */}
//       {selectedImageIndex !== null && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
//           onClick={() => setSelectedImageIndex(null)}
//         >
//           <div className="relative max-w-4xl max-h-full">
//             {/* Determine which image to show */}
//             {(() => {
//               const isExistingImage = selectedImageIndex < existingImages.length;
//               const imageUrl = isExistingImage
//                 ? existingImages[selectedImageIndex]
//                 : previewImages[selectedImageIndex - existingImages.length]?.url;

//               return (
//                 <img
//                   src={imageUrl}
//                   alt={`Full view ${selectedImageIndex + 1}`}
//                   className="max-w-full max-h-full object-contain rounded-lg"
//                   style={{ maxHeight: '90vh' }}
//                 />
//               );
//             })()}

//             <button
//               onClick={() => setSelectedImageIndex(null)}
//               className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold cursor-pointer bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
//             >
//               ×
//             </button>

//             {/* Image info */}
//             <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg">
//               <p className="text-sm">
//                 Image {selectedImageIndex + 1} of {existingImages.length + previewImages.length}
//                 {selectedImageIndex < existingImages.length ? ' (Existing)' : ' (New)'}
//               </p>
//             </div>
//           </div>
//         </div>
//       )}


//       {/* Click outside to close search */}
//       {showSearch && (
//         <div
//           className="fixed inset-0 z-40"
//           onClick={() => setShowSearch(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default EditLocationPage;



'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

import LocationsApi from '@/lib/api/LocationApi';
import { fetchToiletFeaturesByName } from '@/lib/api/configurationsApi';
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from 'react-hot-toast';
import { FacilityCompanyApi } from '@/lib/api/facilityCompanyApi';
import {
  MapPin,
  Save,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Navigation,
  Plus,
  Eye,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Trash2,
  Home,
  Building2
} from 'lucide-react';

// ✅ Indian States List
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

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

  // ✅ Updated formData with new fields
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    address: '',
    city: '',
    state: '',
    dist: '',
    pincode: '',
    facility_companiesId: null,
    options: {}
  });

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

        const [locationResult, locationsResult, featuresResult, facilityCompaniesResult] = await Promise.all([
          LocationsApi.getLocationById(params.id, finalCompanyId),
          LocationsApi.getAllLocations(finalCompanyId),
          fetchToiletFeaturesByName('Toilet_Features'),
          // FacilityCompanyApi.getAllFacilityCompanies(finalCompanyId)
          FacilityCompanyApi.getAll(finalCompanyId)
        ]);

        if (locationResult.success) {
          setLocation(locationResult.data);
          setFormData({
            name: locationResult.data.name,
            latitude: locationResult.data.latitude?.toString() || '',
            longitude: locationResult.data.longitude?.toString() || '',
            address: locationResult.data.address || '',
            city: locationResult.data.city || '',
            state: locationResult.data.state || '',
            dist: locationResult.data.dist || '',
            pincode: locationResult.data.pincode || '',
            options: locationResult.data.options || {}
          });

          setExistingImages(locationResult.data.images || []);
          setSelectedFacilityCompany(locationResult.data.facility_companiesId);

        } else {
          setError(locationResult.error);
        }

        if (locationsResult.success) {
          setAllLocations(locationsResult.data);
        }

        if (facilityCompaniesResult.success) {
          setFacilityCompanies(facilityCompaniesResult.data);
        }

        if (featuresResult) {
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

    const validFiles = [];
    const invalidFiles = [];

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
        if (file.size <= 10 * 1024 * 1024) {
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
      setNewImages(prev => [...prev, ...validFiles]);

      const newPreviews = validFiles.map(file => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        isNew: true
      }));

      setPreviewImages(prev => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeNewImage = (index) => {
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

  const handleMultiselectChange = (key, value, checked) => {
    const currentValues = formData.options[key] || [];
    let newValues;

    if (checked) {
      newValues = currentValues.includes(value) ? currentValues : [...currentValues, value];
    } else {
      newValues = currentValues.filter(v => v !== value);
    }

    handleOptionChange(key, newValues);
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

  // ✅ Updated save handler with new fields
  const handleSave = async () => {
    try {
      setSaving(true);

      if (!formData.name.trim()) {
        toast.error('Location name is required');
        return;
      }

      const updateData = {
        name: formData.name.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state || null,
        dist: formData.dist.trim() || null,
        pincode: formData.pincode.trim() || null,
        facility_companiesId: formData.facility_companiesId || null,
        options: formData.options
      };

      // Handle image deletion first
      for (const imageUrl of imagesToDelete) {
        try {
          await LocationsApi.deleteLocationImage(params.id, imageUrl, finalCompanyId);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      const result = await LocationsApi.updateLocation(
        params.id,
        updateData,
        finalCompanyId,
        newImages,
        false
      );

      if (result.success) {
        toast.success('Location updated successfully! Redirecting...');

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

  // Render option controls
  const renderOptionControl = (optionKey, feature) => {
    const currentValue = formData.options[optionKey];

    switch (feature.type) {
      case 'boolean':
        return (
          <div key={optionKey} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors">
            <div>
              <label className="font-medium text-slate-800">
                {feature.label}
              </label>
              {feature.category && (
                <p className="text-sm text-slate-500 mt-1">
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
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        );

      case 'multiselect':
        const selectedValues = currentValue || feature.defaultValue || [];
        return (
          <div key={optionKey} className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-800">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-slate-500">{feature.category}</p>
            )}

            {selectedValues.length > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                {selectedValues.length} selected
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {feature.options?.map((option, index) => {
                const value = typeof option === 'string' ? option : option.value;
                const label = typeof option === 'string' ? option : option.label;
                const isSelected = selectedValues.includes(value);

                return (
                  <label
                    key={index}
                    className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                      ? 'bg-blue-50 border-blue-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleMultiselectChange(optionKey, value, e.target.checked)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className={`text-sm font-medium ${isSelected ? 'text-blue-700' : 'text-slate-700'
                      }`}>
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>

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
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                    >
                      {label}
                      <button
                        type="button"
                        onClick={() => handleMultiselectChange(optionKey, value, false)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
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
            <label className="block font-semibold text-slate-800">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-slate-500">{feature.category}</p>
            )}
            <select
              value={currentValue ?? feature.defaultValue ?? ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block font-semibold text-slate-800">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-slate-500">{feature.category}</p>
            )}
            <input
              type="text"
              value={currentValue ?? feature.defaultValue ?? ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={feature.placeholder || `Enter ${feature.label}`}
              maxLength={feature.maxLength}
              required={feature.required}
            />
          </div>
        );

      case 'number':
        return (
          <div key={optionKey} className="space-y-2">
            <label className="block font-semibold text-slate-800">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-slate-500">{feature.category}</p>
            )}
            <input
              type="number"
              value={currentValue ?? feature.defaultValue ?? ''}
              onChange={(e) => handleOptionChange(optionKey, parseFloat(e.target.value) || '')}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <label className="block font-semibold text-slate-800">
              {feature.label}
              {feature.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {feature.category && (
              <p className="text-sm text-slate-500">{feature.category}</p>
            )}
            <textarea
              value={currentValue ?? feature.defaultValue ?? ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={feature.placeholder || `Enter ${feature.label}`}
              rows={feature.rows || 3}
              maxLength={feature.maxLength}
              required={feature.required}
            />
          </div>
        );

      default:
        return (
          <div key={optionKey} className="space-y-2">
            <label className="block font-semibold text-slate-800">
              {feature.label}
            </label>
            <input
              type="text"
              value={currentValue ?? ''}
              onChange={(e) => handleOptionChange(optionKey, e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="large" color="#3b82f6" message="Loading location..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Something went wrong</h2>
          <p className="text-slate-600 mb-6">{error}</p>
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md w-full">
          <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Location not found</h2>
          <p className="text-slate-600">This location doesn't exist or has been removed.</p>
        </div>
      </div>
    );
  }

  const navigationInfo = getNavigationInfo();

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <button
                onClick={() => router.push(`/washrooms?companyId=${finalCompanyId}`)}
                className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                <span className="font-medium">Back to Listings</span>
              </button>

              {/* Navigation Controls */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handlePrevious}
                  disabled={!navigationInfo.hasPrevious}
                  className="flex items-center px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1 sm:flex-none justify-center"
                  title={navigationInfo.previousName ? `Previous: ${navigationInfo.previousName}` : 'No previous location'}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  <span className="hidden sm:inline">{navigationInfo.previousName && navigationInfo.previousName.substring(0, 15)}</span>
                </button>

                <span className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium whitespace-nowrap">
                  {navigationInfo.currentIndex + 1} of {allLocations.length}
                </span>

                <button
                  onClick={handleNext}
                  disabled={!navigationInfo.hasNext}
                  className="flex items-center px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex-1 sm:flex-none justify-center"
                  title={navigationInfo.nextName ? `Next: ${navigationInfo.nextName}` : 'No next location'}
                >
                  <span className="hidden sm:inline">{navigationInfo.nextName && navigationInfo.nextName.substring(0, 15)}</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
          {/* Main Form */}
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden mb-6">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Edit Washroom
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Update location information, address, images, and amenities
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/washrooms/item/${params.id}?companyId=${finalCompanyId}`)}
                  className="flex items-center px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors shadow-md whitespace-nowrap"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Location
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 lg:p-8 space-y-8">

              {/* ========== FACILITY COMPANY SECTION ========== */}
              <div className="space-y-4 border-t border-slate-200 pt-6 mt-6">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Facility Company Assignment
                </h3>

                {/* Current Assignment Display */}
                {selectedFacilityCompany && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      Current Assignment: {' '}
                      <span className="font-bold">
                        {facilityCompanies.find(fc => fc.id === selectedFacilityCompany)?.name || 'Unknown Company'}
                      </span>
                    </p>
                  </div>
                )}

                {/* Current Status if null */}
                {!selectedFacilityCompany && (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm text-amber-800 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      No facility company assigned
                    </p>
                  </div>
                )}

                {/* Facility Company Dropdown */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">
                    Select Facility Company
                  </label>
                  <select
                    value={formData.facility_companiesId || ''}
                    onChange={(e) => {
                      const newValue = e.target.value === '' ? null : e.target.value;
                      handleInputChange('facility_companiesId', newValue);
                      setSelectedFacilityCompany(newValue);
                    }}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">-- No Facility Company --</option>
                    {facilityCompanies.map((company) => (
                      <option key={company.id} value={company.id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Change Indicator */}
                {selectedFacilityCompany !== location?.facility_companiesId && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium">
                      {selectedFacilityCompany ? (
                        <>
                          ✓ Will change from{' '}
                          <span className="font-bold">
                            {location?.facility_companiesId
                              ? facilityCompanies.find(fc => fc.id === location.facility_companiesId)?.name || 'Unknown'
                              : 'None'
                            }
                          </span>
                          {' to '}
                          <span className="font-bold">
                            {facilityCompanies.find(fc => fc.id === selectedFacilityCompany)?.name}
                          </span>
                        </>
                      ) : (
                        <>✓ Will remove facility company assignment</>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* ========== SECTION 1: BASIC INFORMATION ========== */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Basic Information
                </h2>

                {/* Location Name */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">
                    Location Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter location name"
                    required
                  />
                </div>

                {/* Coordinates Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 21.1458"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 79.0882"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">View on Map</label>
                    <button
                      type="button"
                      onClick={() => window.open(`https://maps.google.com/?q=${formData.latitude},${formData.longitude}`, '_blank')}
                      disabled={!formData.latitude || !formData.longitude}
                      className="w-full flex items-center justify-center px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Open in Maps
                    </button>
                  </div>
                </div>
              </div>

              {/* ========== SECTION 2: ADDRESS DETAILS ========== */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Home className="w-6 h-6 text-blue-600" />
                  Address Details
                </h2>

                {/* Full Address */}
                <div className="space-y-2">
                  <label className="block font-semibold text-slate-800">Full Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter complete address"
                    rows={3}
                  />
                </div>

                {/* City, State, District, Pincode */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">State</label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">District</label>
                    <input
                      type="text"
                      value={formData.dist}
                      onChange={(e) => handleInputChange('dist', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter district"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter city"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block font-semibold text-slate-800">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => handleInputChange('pincode', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-slate-300 rounded-xl bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 400001"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>

              {/* ========== SECTION 3: IMAGES ========== */}
              <div className="space-y-6 border-t border-slate-200 pt-8">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                  <ImageIcon className="w-6 h-6 text-blue-600" />
                  Location Images
                  {(existingImages.length > 0 || previewImages.length > 0) && (
                    <span className="text-sm font-normal text-slate-500">
                      ({existingImages.length + previewImages.length} total)
                    </span>
                  )}
                </h2>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                      <Upload className="h-8 w-8 text-blue-600" />
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={triggerFileInput}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-md"
                      >
                        <Plus className="h-5 w-5" />
                        {existingImages.length === 0 && previewImages.length === 0 ? 'Add Images' : 'Add More Images'}
                      </button>
                      <p className="text-sm text-slate-500 mt-2">
                        Select multiple images (max 10MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Current Images */}
                {(existingImages.length > 0 || previewImages.length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-slate-700">
                        Current Images ({existingImages.length + previewImages.length})
                      </h4>

                      {(existingImages.length > 0 || previewImages.length > 0) && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagesToDelete(prev => [...prev, ...existingImages]);
                            setExistingImages([]);
                            previewImages.forEach(preview => URL.revokeObjectURL(preview.url));
                            setNewImages([]);
                            setPreviewImages([]);
                            toast.success('All images marked for removal');
                          }}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Clear All
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {/* Existing Images */}
                      {existingImages.map((imageUrl, index) => (
                        <div key={`existing-${index}`} className="relative group bg-white rounded-lg border-2 border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={imageUrl}
                            alt={`Existing ${index + 1}`}
                            className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImageIndex(index)}
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeExistingImage(imageUrl);
                              toast.success('Image marked for deletion');
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-xs text-white font-medium">Existing</p>
                          </div>
                        </div>
                      ))}

                      {/* New Images */}
                      {previewImages.map((preview, index) => (
                        <div key={`new-${index}`} className="relative group bg-white rounded-lg border-2 border-green-500 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                          <img
                            src={preview.url}
                            alt={`New ${index + 1}`}
                            className="w-full h-32 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setSelectedImageIndex(existingImages.length + index)}
                          />

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewImage(index);
                              toast.success('New image removed');
                            }}
                            className="absolute top-2 right-2 w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-2">
                            <p className="text-xs text-white font-medium truncate">New</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Status Indicators */}
                    <div className="space-y-2">
                      {imagesToDelete.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-red-600 font-medium">
                              {imagesToDelete.length} existing image(s) will be deleted when you save
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
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

                      {newImages.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <Plus className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <p className="text-sm text-green-600 font-medium">
                            {newImages.length} new image(s) will be added when you save
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* ========== SECTION 4: AMENITIES & FEATURES ========== */}
              {Object.keys(toiletFeatures).length > 0 && (
                <div className="space-y-6 border-t border-slate-200 pt-8">
                  <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-3">
                    <MapPin className="w-6 h-6 text-blue-600" />
                    Amenities & Features
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    {Object.entries(toiletFeatures).map(([key, feature]) =>
                      renderOptionControl(key, feature)
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full sm:w-auto px-6 py-3 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || !formData.name.trim()}
                  className="w-full sm:w-auto flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-md"
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImageIndex !== null && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImageIndex(null)}
        >
          <div className="relative max-w-4xl max-h-full">
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
              className="absolute top-4 right-4 text-white hover:text-gray-300 text-2xl font-bold bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center"
            >
              ×
            </button>

            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
              <p className="text-sm">
                Image {selectedImageIndex + 1} of {existingImages.length + previewImages.length}
                {selectedImageIndex < existingImages.length ? ' (Existing)' : ' (New)'}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditLocationPage;

