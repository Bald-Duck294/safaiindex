// "use client";

// import { useEffect, useState, useRef } from "react";
// import { fetchToiletFeaturesByName } from "@/lib/api/configurationsApi.js";
// import DynamicOptions from "./components/DynamicOptions";
// import LocationTypeSelect from "./components/LocationTypeSelect";
// import GoogleMapPicker from "./components/GoogleMapPicker";
// import LatLongInput from "./components/LatLongInput";
// import SearchableSelect from "./components/SearchableSelect";
// import locationTypesApi from "@/lib/api/locationTypesApi.js";
// import LocationsApi from "@/lib/api/LocationApi.js";
// import { useCompanyId } from "@/lib/providers/CompanyProvider";
// import { useRouter } from "next/navigation";
// import { Upload, X, Image as ImageIcon, Plus, MapPin } from "lucide-react";
// import toast from "react-hot-toast";
// import { Country, State, City } from 'country-state-city';

// // Indian States List
// const INDIAN_STATES = [
//   "Andhra Pradesh",
//   "Arunachal Pradesh",
//   "Assam",
//   "Bihar",
//   "Chhattisgarh",
//   "Goa",
//   "Gujarat",
//   "Haryana",
//   "Himachal Pradesh",
//   "Jharkhand",
//   "Karnataka",
//   "Kerala",
//   "Madhya Pradesh",
//   "Maharashtra",
//   "Manipur",
//   "Meghalaya",
//   "Mizoram",
//   "Nagaland",
//   "Odisha",
//   "Punjab",
//   "Rajasthan",
//   "Sikkim",
//   "Tamil Nadu",
//   "Telangana",
//   "Tripura",
//   "Uttar Pradesh",
//   "Uttarakhand",
//   "West Bengal",
//   "Andaman and Nicobar Islands",
//   "Chandigarh",
//   "Dadra and Nagar Haveli and Daman and Diu",
//   "Delhi",
//   "Jammu and Kashmir",
//   "Ladakh",
//   "Lakshadweep",
//   "Puducherry"
// ];


// // Add this near the top of your component with INDIAN_STATES
// const MAJOR_INDIAN_CITIES = [
//   // Maharashtra
//   "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad",
//   // Delhi
//   "New Delhi", "Delhi",
//   // Karnataka
//   "Bangalore", "Mysore", "Mangalore", "Hubli",
//   // Tamil Nadu
//   "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
//   // West Bengal
//   "Kolkata", "Howrah", "Durgapur",
//   // Gujarat
//   "Ahmedabad", "Surat", "Vadodara", "Rajkot",
//   // Rajasthan
//   "Jaipur", "Jodhpur", "Udaipur", "Kota",
//   // Uttar Pradesh
//   "Lucknow", "Kanpur", "Agra", "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Noida",
//   // Telangana
//   "Hyderabad", "Warangal",
//   // Andhra Pradesh
//   "Visakhapatnam", "Vijayawada", "Guntur",
//   // Kerala
//   "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur",
//   // Madhya Pradesh
//   "Bhopal", "Indore", "Jabalpur", "Gwalior",
//   // Punjab
//   "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar",
//   // Haryana
//   "Faridabad", "Gurgaon", "Panipat",
//   // Bihar
//   "Patna", "Gaya", "Bhagalpur",
//   // Odisha
//   "Bhubaneswar", "Cuttack",
//   // Assam
//   "Guwahati", "Silchar",
//   // Jharkhand
//   "Ranchi", "Jamshedpur", "Dhanbad",
//   // Chhattisgarh
//   "Raipur", "Bhilai",
//   // Uttarakhand
//   "Dehradun", "Haridwar",
//   // Goa
//   "Panaji", "Margao",
// ].sort();


// // Pincode validation for India
// const validatePincode = (pincode) => {
//   if (!pincode) return true; // Optional field
//   const regex = /^[1-9][0-9]{5}$/;
//   return regex.test(pincode);
// };

// export default function AddLocationPage() {
//   const [features, setFeatures] = useState([]);
//   const [locationTypes, setLocationTypes] = useState([]);
//   const [images, setImages] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [previewImages, setPreviewImages] = useState([]);
//   const [pincodeError, setPincodeError] = useState("");
//   const fileInputRef = useRef(null);
//   const router = useRouter();


//   const [availableStates, setAvailableStates] = useState([]);
//   const [availableCities, setAvailableCities] = useState([]);
//   const [availableDistricts, setAvailableDistricts] = useState([]);

//   console.log("add location mounted");
//   const { companyId } = useCompanyId();

//   const [form, setForm] = useState({
//     name: "",
//     parent_id: null,
//     type_id: null,
//     latitude: null,
//     longitude: null,
//     address: "",
//     pincode: "",
//     state: "",
//     city: "",
//     dist: "",
//     status: true, // ✅ Default to available
//     options: {},
//   });

//   // ✅ Load Indian states on mount
//   useEffect(() => {
//     const indiaStates = State.getStatesOfCountry('IN'); // 'IN' is India's ISO code
//     const stateNames = indiaStates.map(state => state.name);
//     setAvailableStates(stateNames);
//   }, []);

//   useEffect(() => {
//     async function loadInitialData() {
//       console.log(companyId, "companyId from add location");

//       if (!companyId || companyId === "null" || companyId === null) {
//         console.log("Skipping - companyId not ready");
//         return;
//       }

//       try {
//         let config = null;
//         let types = null;

//         try {
//           config = await fetchToiletFeaturesByName("Toilet_Features", companyId);
//           console.log("Config loaded successfully:", config);
//         } catch (configError) {
//           console.error("Failed to load config (continuing anyway):", configError);
//         }

//         try {
//           types = await locationTypesApi.getAll(companyId);
//           console.log("Types loaded successfully:", types);
//         } catch (typesError) {
//           console.error("Failed to load location types:", typesError);
//           types = [];
//         }

//         console.log(config, "config");
//         setFeatures(config?.data[0]?.description || []);
//         setLocationTypes(Array.isArray(types) ? types : []);

//         console.log("Final state:", {
//           features: config?.description || [],
//           types: types || [],
//         });
//       } catch (err) {
//         console.error("Unexpected error in loadInitialData", err);
//         setFeatures([]);
//         setLocationTypes([]);
//       }
//     }

//     loadInitialData();
//   }, [companyId]);

//   // ✅ Handle image file selection
//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);

//     if (files.length === 0) return;

//     // Validate file types and sizes
//     const validFiles = [];
//     const invalidFiles = [];

//     files.forEach((file) => {
//       if (file.type.startsWith("image/")) {
//         if (file.size <= 10 * 1024 * 1024) {
//           // 10MB limit
//           validFiles.push(file);
//         } else {
//           invalidFiles.push(file.name + " (too large)");
//         }
//       } else {
//         invalidFiles.push(file.name + " (not an image)");
//       }
//     });

//     if (invalidFiles.length > 0) {
//       toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
//     }

//     if (validFiles.length > 0) {
//       // Add to images array
//       setImages((prev) => [...prev, ...validFiles]);

//       // Create preview URLs
//       const newPreviews = validFiles.map((file) => ({
//         file,
//         url: URL.createObjectURL(file),
//         name: file.name,
//       }));

//       setPreviewImages((prev) => [...prev, ...newPreviews]);
//     }

//     // Reset input
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   };

//   // ✅ Remove image from selection
//   const removeImage = (index) => {
//     // Revoke preview URL to free memory
//     URL.revokeObjectURL(previewImages[index].url);

//     setImages((prev) => prev.filter((_, i) => i !== index));
//     setPreviewImages((prev) => prev.filter((_, i) => i !== index));
//   };

//   // ✅ Trigger file input
//   const triggerFileInput = () => {
//     fileInputRef.current?.click();
//   };

//   const handleChange = (key, value) => {
//     setForm((prev) => ({ ...prev, [key]: value }));

//     if (key === "state") {
//       const indiaStates = State.getStatesOfCountry('IN');
//       const selectedState = indiaStates.find(s => s.name === value);

//       if (selectedState) {
//         const cities = City.getCitiesOfState('IN', selectedState.isoCode);
//         const cityNames = cities.map(city => city.name);
//         setAvailableCities(cityNames);
//       } else {  
//         setAvailableCities([]);
//       }

//       // Clear city when state changes
//       setForm((prev) => ({ ...prev, city: "" }));
//     }
//     // ✅ Validate pincode on change
//     if (key === "pincode") {
//       if (value && !validatePincode(value)) {
//         setPincodeError("Invalid pincode. Must be 6 digits and not start with 0");
//       } else {
//         setPincodeError("");
//       }
//     }
//   };

//   // ✅ Updated submit handler with all new fields
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!form.name || !form.type_id) {
//       toast.error("Please fill in the required fields (Name and Location Type)");
//       return;
//     }

//     if (form.pincode && !validatePincode(form.pincode)) {
//       toast.error("Please enter a valid pincode");
//       return;
//     }

//     console.log("Form Data:", form);
//     console.log("Images:", images);

//     setUploading(true);

//     try {
//       const res = await LocationsApi.postLocation(form, companyId, images);
//       console.log(res, "form submitted successfully");

//       if (res?.success) {
//         toast.success("Location added successfully!");

//         // Clean up preview URLs
//         previewImages.forEach((preview) => {
//           URL.revokeObjectURL(preview.url);
//         });

//         router.push(`/washrooms?companyId=${companyId}`);
//       } else {
//         toast.error(res?.error || "Failed to add location");
//       }
//     } catch (error) {
//       console.error("Submission error:", error);
//       toast.error("Failed to add location. Please try again.");
//     } finally {
//       setUploading(false);
//     }
//   };

//   // ✅ Clean up preview URLs on unmount
//   useEffect(() => {
//     return () => {
//       previewImages.forEach((preview) => {
//         URL.revokeObjectURL(preview.url);
//       });
//     };
//   }, []);

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-6">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
//             <h1 className="text-2xl font-bold text-white mb-2">Add New Location</h1>
//           </div>

//           <form onSubmit={handleSubmit} className="p-6 space-y-6">
//             {/* Basic Information */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Location Name <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="Enter location name"
//                   value={form.name}
//                   onChange={(e) => handleChange("name", e.target.value)}
//                   className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
//                   required
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Location Type <span className="text-red-500">*</span>
//                 </label>
//                 <LocationTypeSelect
//                   types={locationTypes}
//                   selectedType={form.type_id}
//                   setSelectedType={(id) => handleChange("type_id", id)}
//                 />
//               </div>
//             </div>

//             {/* ✅ Address Details Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                 <MapPin className="h-5 w-5" />
//                 Address Details
//               </h3>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* State */}
//                 <SearchableSelect
//                   options={availableStates}
//                   value={form.state}
//                   onChange={(value) => handleChange("state", value)}
//                   placeholder="Select or type state"
//                   label="State"
//                   allowCustom={true}
//                 />

//                 {/* City */}
//                 <SearchableSelect
//                   options={availableCities}
//                   value={form.city}
//                   onChange={(value) => handleChange("city", value)}
//                   placeholder="Select or type city"
//                   label="City"
//                   allowCustom={true}
//                 />

//                 {/* District */}
//                 <SearchableSelect
//                   options={availableDistricts}
//                   value={form.dist}
//                   onChange={(value) => handleChange("dist", value)}
//                   placeholder="Select or type district"
//                   label="District"
//                   allowCustom={true}
//                 />

//                 {/* Pincode */}
//                 <div>
//                   <label className="block text-sm font-medium text-slate-700 mb-2">
//                     Pincode
//                   </label>
//                   <input
//                     type="text"
//                     placeholder="Enter 6-digit pincode"
//                     value={form.pincode}
//                     onChange={(e) => handleChange("pincode", e.target.value)}
//                     maxLength={6}
//                     className={`w-full p-3 border ${pincodeError ? "border-red-500" : "border-slate-300"
//                       } rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
//                   />
//                   {pincodeError && (
//                     <p className="text-red-500 text-sm mt-1">{pincodeError}</p>
//                   )}
//                 </div>
//               </div>

//               {/* Full Address */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-700 mb-2">
//                   Full Address
//                 </label>
//                 <textarea
//                   placeholder="Enter complete address"
//                   value={form.address}
//                   onChange={(e) => handleChange("address", e.target.value)}
//                   rows={3}
//                   className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
//                 />
//               </div>
//             </div>

//             {/* Location Coordinates */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-slate-800">
//                 Location Coordinates
//               </h3>

//               <GoogleMapPicker
//                 lat={form.latitude}
//                 lng={form.longitude}
//                 onSelect={(lat, lng) => {
//                   handleChange("latitude", lat);
//                   handleChange("longitude", lng);
//                 }}
//               />

//               <LatLongInput
//                 lat={form.latitude}
//                 lng={form.longitude}
//                 onChange={(lat, lng) => {
//                   handleChange("latitude", lat);
//                   handleChange("longitude", lng);
//                 }}
//               />
//             </div>

//             {/* ✅ Image Upload Section */}
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
//                 <ImageIcon className="h-5 w-5" />
//                 Location Images
//               </h3>

//               {/* Upload Area */}
//               <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
//                 <input
//                   ref={fileInputRef}
//                   type="file"
//                   accept="image/*"
//                   multiple
//                   onChange={handleFileSelect}
//                   className="hidden"
//                 />

//                 <div className="space-y-4">
//                   <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
//                     <Upload className="h-8 w-8 text-blue-600" />
//                   </div>

//                   <div>
//                     <button
//                       type="button"
//                       onClick={triggerFileInput}
//                       className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
//                     >
//                       <Plus className="h-4 w-4" />
//                       Choose Images
//                     </button>
//                     <p className="text-sm text-slate-500 mt-2">
//                       Select multiple images (max 10MB each)
//                     </p>
//                   </div>
//                 </div>
//               </div>

//               {/* Image Previews */}
//               {previewImages.length > 0 && (
//                 <div className="space-y-3">
//                   <h4 className="font-medium text-slate-700">
//                     Selected Images ({previewImages.length})
//                   </h4>
//                   <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
//                     {previewImages.map((preview, index) => (
//                       <div key={index} className="relative group">
//                         <img
//                           src={preview.url}
//                           alt={`Preview ${index + 1}`}
//                           className="w-full h-24 object-cover rounded-lg border border-slate-200"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => removeImage(index)}
//                           className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
//                         >
//                           <X className="h-4 w-4" />
//                         </button>
//                         <div className="absolute bottom-1 left-1 right-1">
//                           <p className="text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 truncate">
//                             {preview.name}
//                           </p>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Dynamic Options */}
//             {features.length > 0 && (
//               <div className="space-y-4">
//                 <h3 className="text-lg font-semibold text-slate-800">
//                   Additional Features
//                 </h3>
//                 <DynamicOptions
//                   config={features}
//                   options={form.options}
//                   setOptions={(opts) => handleChange("options", opts)}
//                 />
//               </div>
//             )}

//             {/* Submit Button */}
//             <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
//               <button
//                 type="button"
//                 onClick={() => router.back()}
//                 className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors duration-200"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={
//                   uploading ||
//                   !form.name ||
//                   !form.type_id ||
//                   !form.latitude ||
//                   !form.longitude ||
//                   pincodeError
//                 }
//                 className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-32"
//               >
//                 {uploading ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Plus className="h-4 w-4" />
//                     Create Location
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useEffect, useState, useRef } from "react";
import { fetchToiletFeaturesByName } from "@/lib/api/configurationsApi.js";
import DynamicOptions from "./components/DynamicOptions";
import LocationTypeSelect from "./components/LocationTypeSelect";
import GoogleMapPicker from "./components/GoogleMapPicker";
import LatLongInput from "./components/LatLongInput";
import SearchableSelect from "./components/SearchableSelect";
import locationTypesApi from "@/lib/api/locationTypesApi.js";
import LocationsApi from "@/lib/api/LocationApi.js";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { UsersApi } from "@/lib/api/usersApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import { useRouter } from "next/navigation";
import {
  Upload, X, Image as ImageIcon, Plus, MapPin,
  Users, UserCheck, Search, ChevronDown, CheckCircle, Mail, Phone
} from "lucide-react";
import toast from "react-hot-toast";
import { Country, State, City } from 'country-state-city';
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi"

// Indian States List
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi",
  "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const MAJOR_INDIAN_CITIES = [
  "Mumbai", "Pune", "Nagpur", "Nashik", "Thane", "Aurangabad",
  "New Delhi", "Delhi", "Bangalore", "Mysore", "Mangalore", "Hubli",
  "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem",
  "Kolkata", "Howrah", "Durgapur", "Ahmedabad", "Surat", "Vadodara", "Rajkot",
  "Jaipur", "Jodhpur", "Udaipur", "Kota", "Lucknow", "Kanpur", "Agra",
  "Varanasi", "Allahabad", "Meerut", "Ghaziabad", "Noida", "Hyderabad",
  "Warangal", "Visakhapatnam", "Vijayawada", "Guntur", "Thiruvananthapuram",
  "Kochi", "Kozhikode", "Thrissur", "Bhopal", "Indore", "Jabalpur", "Gwalior",
  "Chandigarh", "Ludhiana", "Amritsar", "Jalandhar", "Faridabad", "Gurgaon",
  "Panipat", "Patna", "Gaya", "Bhagalpur", "Bhubaneswar", "Cuttack",
  "Guwahati", "Silchar", "Ranchi", "Jamshedpur", "Dhanbad", "Raipur",
  "Bhilai", "Dehradun", "Haridwar", "Panaji", "Margao"
].sort();

// Pincode validation for India
const validatePincode = (pincode) => {
  if (!pincode) return true;
  const regex = /^[1-9][0-9]{5}$/;
  return regex.test(pincode);
};

export default function AddLocationPage() {
  const [features, setFeatures] = useState([]);
  const [locationTypes, setLocationTypes] = useState([]);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [pincodeError, setPincodeError] = useState("");
  // Add these state variables near the top with other states
  const [facilityCompanies, setFacilityCompanies] = useState([]);
  const [selectedFacilityCompany, setSelectedFacilityCompany] = useState(null);

  const fileInputRef = useRef(null);
  const router = useRouter();

  // ✅ Assignment Form State
  const [allCleaners, setAllCleaners] = useState([]);
  const [selectedCleaners, setSelectedCleaners] = useState([]);
  const [cleanerSearchTerm, setCleanerSearchTerm] = useState("");
  const [isCleanerDropdownOpen, setIsCleanerDropdownOpen] = useState(false);
  const cleanerDropdownRef = useRef(null);

  const [availableStates, setAvailableStates] = useState([]);
  const [availableCities, setAvailableCities] = useState([]);
  const [availableDistricts, setAvailableDistricts] = useState([]);

  console.log("add location mounted");
  const { companyId } = useCompanyId();

  const [form, setForm] = useState({
    name: "",
    parent_id: null,
    type_id: null,
    latitude: null,
    longitude: null,
    address: "",
    pincode: "",
    state: "",
    city: "",
    dist: "",
    status: true,
    options: {},
    no_of_photos: null
  });

  // ✅ Load Indian states on mount
  useEffect(() => {
    const indiaStates = State.getStatesOfCountry('IN');
    const stateNames = indiaStates.map(state => state.name);
    setAvailableStates(stateNames);
  }, []);

  // ✅ Fetch initial data (features, types, cleaners)
  useEffect(() => {
    async function loadInitialData() {
      console.log(companyId, "companyId from add location");

      if (!companyId || companyId === "null" || companyId === null) {
        console.log("Skipping - companyId not ready");
        return;
      }

      try {
        let config = null;
        let types = null;
        let cleaners = null;
        let facilities = null; // ✅ ADD THIS

        try {
          facilities = await FacilityCompanyApi.getAll(companyId, false); // Only active
          console.log("Facility companies loaded:", facilities);

          if (facilities.success) {
            setFacilityCompanies(facilities.data || []);
          } else {
            setFacilityCompanies([]);
          }
        } catch (facilitiesError) {
          console.error("Failed to load facility companies:", facilitiesError);
          setFacilityCompanies([]);
        }

        try {
          config = await fetchToiletFeaturesByName("Toilet_Features", companyId);
          console.log("Config loaded successfully:", config);
        } catch (configError) {
          console.error("Failed to load config (continuing anyway):", configError);
        }

        try {
          types = await locationTypesApi.getAll(companyId);
          console.log("Types loaded successfully:", types);
        } catch (typesError) {
          console.error("Failed to load location types:", typesError);
          types = [];
        }

        // ✅ Fetch cleaners (role_id = 5)
        try {
          cleaners = await UsersApi.getAllUsers(companyId, 5);
          console.log("Cleaners loaded successfully:", cleaners);

          if (cleaners.success) {
            const cleanersOnly = (cleaners.data || []).filter(user => {
              const userRoleId = parseInt(user.role_id || user.role?.id || 0);
              return userRoleId === 5;
            });
            setAllCleaners(cleanersOnly);
          } else {
            setAllCleaners([]);
          }
        } catch (cleanersError) {
          console.error("Failed to load cleaners:", cleanersError);
          setAllCleaners([]);
        }

        console.log(config, "config");
        setFeatures(config?.data[0]?.description || []);
        setLocationTypes(Array.isArray(types) ? types : []);

        console.log("Final state:", {
          features: config?.description || [],
          types: types || [],
          cleaners: allCleaners.length,
        });
      } catch (err) {
        console.error("Unexpected error in loadInitialData", err);
        setFeatures([]);
        setLocationTypes([]);
        setAllCleaners([]);
        setFacilityCompanies([]); // ✅ ADD THIS

      }
    }

    loadInitialData();
  }, [companyId]);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cleanerDropdownRef.current &&
        !cleanerDropdownRef.current.contains(event.target)
      ) {
        setIsCleanerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Handle image file selection
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 0) return;

    const validFiles = [];
    const invalidFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith("image/")) {
        if (file.size <= 10 * 1024 * 1024) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name + " (too large)");
        }
      } else {
        invalidFiles.push(file.name + " (not an image)");
      }
    });

    if (invalidFiles.length > 0) {
      toast.error(`Invalid files: ${invalidFiles.join(", ")}`);
    }

    if (validFiles.length > 0) {
      setImages((prev) => [...prev, ...validFiles]);

      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      }));

      setPreviewImages((prev) => [...prev, ...newPreviews]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ✅ Remove image from selection
  const removeImage = (index) => {
    URL.revokeObjectURL(previewImages[index].url);
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));

    if (key === "state") {
      const indiaStates = State.getStatesOfCountry('IN');
      const selectedState = indiaStates.find(s => s.name === value);

      if (selectedState) {
        const cities = City.getCitiesOfState('IN', selectedState.isoCode);
        const cityNames = cities.map(city => city.name);
        setAvailableCities(cityNames);
      } else {
        setAvailableCities([]);
      }

      setForm((prev) => ({ ...prev, city: "" }));
    }

    if (key === "pincode") {
      if (value && !validatePincode(value)) {
        setPincodeError("Invalid pincode. Must be 6 digits and not start with 0");
      } else {
        setPincodeError("");
      }
    }
  };

  // ✅ Handle cleaner selection (multi-select)
  const handleCleanerSelect = (cleaner) => {
    setSelectedCleaners((prev) =>
      prev.some((c) => c.id === cleaner.id)
        ? prev.filter((c) => c.id !== cleaner.id)
        : [...prev, cleaner]
    );
  };

  // ✅ FIXED: Combined submit handler with proper await
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.type_id) {
      toast.error("Please fill in the required fields (Name and Location Type)");
      return;
    }

    if (form.pincode && !validatePincode(form.pincode)) {
      toast.error("Please enter a valid pincode");
      return;
    }

    console.log("Form Data:", form);
    console.log("Images:", images);
    console.log("Selected Cleaners:", selectedCleaners);
    console.log("Facility Company ID:", form.facility_company_id); // ✅ ADD THIS LOG


    setSubmitting(true);

    try {
      // ✅ Step 1: Create Location
      console.log("📍 Creating location...");
      const locationRes = await LocationsApi.postLocation(form, companyId, images);
      console.log("✅ Location response:", locationRes);

      if (!locationRes?.success) {
        toast.error(locationRes?.error || "Failed to create location");
        setSubmitting(false);
        return;
      }

      console.log('locatoinid getting', locationRes?.data?.data?.id)
      const createdLocationId = locationRes?.data?.data?.id || '183';
      console.log("✅ Location created with ID:", createdLocationId);

      // ✅ Step 2: Create Assignments (if cleaners selected)
      if (selectedCleaners.length > 0 && createdLocationId) {
        console.log("👥 Creating assignments for", selectedCleaners.length, "cleaners...");

        const assignmentData = {
          location_id: createdLocationId,
          cleaner_user_ids: selectedCleaners.map((cleaner) => cleaner.id),
          status: "assigned", // ✅ Always "assigned" by default
          company_id: companyId,
          role_id: 5
        };

        console.log("📤 Assignment data:", assignmentData);

        // ✅ IMPORTANT: Wait for assignment creation to complete
        const assignmentRes = await AssignmentsApi.createAssignmentsForLocation(assignmentData);
        console.log("✅ Assignment response:", assignmentRes);

        if (assignmentRes?.success) {
          toast.success(
            `Location created and ${selectedCleaners.length} cleaner${selectedCleaners.length !== 1 ? 's' : ''} assigned successfully!`
          );
        } else {
          console.error("❌ Assignment failed:", assignmentRes?.error);
          toast.error(assignmentRes?.error || "Location created but failed to assign cleaners");
        }
      } else {
        console.log("ℹ️ No cleaners selected, skipping assignments");
        toast.success("Location created successfully!");
      }

      // ✅ Clean up preview URLs
      previewImages.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });

      // ✅ Step 3: Navigate ONLY after both operations complete
      console.log("✅ All operations complete, redirecting...");

    } catch (error) {
      console.error("❌ Submission error:", error);
      toast.error("Failed to create location. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ Filter cleaners for search
  const filteredCleaners = allCleaners.filter((cleaner) =>
    cleaner.name?.toLowerCase().includes(cleanerSearchTerm.toLowerCase())
  );

  // ✅ Clean up preview URLs on unmount
  useEffect(() => {
    return () => {
      previewImages.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6">
            <h1 className="text-2xl font-bold text-white mb-2">Add New Washroom</h1>
            <p className="text-blue-100 text-sm">Create a washroom and optionally assign cleaners</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">

            {/* ========== SECTION 1: LOCATION DETAILS ========== */}
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-200 pb-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                Washroom Information
              </h2>

              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Washroom Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter location name"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <LocationTypeSelect
                    types={locationTypes}
                    selectedType={form.type_id}
                    setSelectedType={(id) => handleChange("type_id", id)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Facility Company (Optional)
                  </label>
                  <select
                    value={form.facility_company_id || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange("facility_company_id", value ? parseInt(value) : null);
                      setSelectedFacilityCompany(
                        facilityCompanies.find((f) => f.id === parseInt(value)) || null
                      );
                    }}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">-- No Facility Company --</option>
                    {facilityCompanies.map((facility) => (
                      <option key={facility.id} value={facility.id}>
                        {facility.name}
                      </option>
                    ))}
                  </select>
                  {selectedFacilityCompany && (
                    <p className="mt-2 text-sm text-slate-600 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Selected: {selectedFacilityCompany.name}
                    </p>
                  )}
                  {facilityCompanies.length === 0 && (
                    <p className="mt-2 text-sm text-amber-600">
                      No facility companies available. Add one from the Facility Companies section.
                    </p>
                  )}
                </div>

                {/* Number of Photos Field - ADD THIS */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Number of Photos
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Enter number of photos"
                    value={form.no_of_photos || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleChange("no_of_photos", value ? parseInt(value) : null);
                    }}
                    className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                  {/* <p className="text-xs text-slate-500 mt-1">
                    Optional: Specify how many photos should be taken at this location
                  </p> */}
                </div>

              </div>

              {/* Address Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* State */}
                <SearchableSelect
                  options={availableStates}
                  value={form.state}
                  onChange={(value) => handleChange("state", value)}
                  placeholder="Select or type state"
                  label="State"
                  allowCustom={true}
                />

                {/* City */}
                <SearchableSelect
                  options={availableCities}
                  value={form.city}
                  onChange={(value) => handleChange("city", value)}
                  placeholder="Select or type city"
                  label="City"
                  allowCustom={true}
                />

                {/* District */}
                <SearchableSelect
                  options={[]}
                  value={form.dist}
                  onChange={(value) => handleChange("dist", value)}
                  placeholder="enter district name"
                  label="District"
                  allowCustom={true}
                />

                {/* Pincode */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Pincode
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={form.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    maxLength={6}
                    className={`w-full p-3 border ${pincodeError ? "border-red-500" : "border-slate-300"
                      } rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
                  />
                  {pincodeError && (
                    <p className="text-red-500 text-sm mt-1">{pincodeError}</p>
                  )}
                </div>
              </div>

              {/* Full Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Full Address
                </label>
                <textarea
                  placeholder="Enter complete address"
                  value={form.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-slate-300 rounded-xl bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>

              {/* Location Coordinates */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-slate-800">
                  Location Coordinates
                </h3>

                <GoogleMapPicker
                  lat={form.latitude}
                  lng={form.longitude}
                  onSelect={(lat, lng) => {
                    handleChange("latitude", lat);
                    handleChange("longitude", lng);
                  }}
                />

                <LatLongInput
                  lat={form.latitude}
                  lng={form.longitude}
                  onChange={(lat, lng) => {
                    handleChange("latitude", lat);
                    handleChange("longitude", lng);
                  }}
                />
              </div>

              {/* Image Upload Section */}
              <div className="space-y-4">
                <h3 className="text-md font-semibold text-slate-800 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Location Images
                </h3>

                {/* Upload Area */}
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors duration-200">
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
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors duration-200"
                      >
                        <Plus className="h-4 w-4" />
                        Choose Images
                      </button>
                      <p className="text-sm text-slate-500 mt-2">
                        Select multiple images (max 2MB each)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-slate-700">
                      Selected Images ({previewImages.length})
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {previewImages.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview.url}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-slate-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          >
                            <X className="h-4 w-4" />
                          </button>
                          <div className="absolute bottom-1 left-1 right-1">
                            <p className="text-xs text-white bg-black bg-opacity-50 rounded px-1 py-0.5 truncate">
                              {preview.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Dynamic Options */}
              {features.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-slate-800">
                    Additional Features
                  </h3>
                  <DynamicOptions
                    config={features}
                    options={form.options}
                    setOptions={(opts) => handleChange("options", opts)}
                  />
                </div>
              )}
            </div>

            {/* ========== SECTION 2: ASSIGN CLEANERS ========== */}
            <div className="space-y-6 border-t border-slate-200 pt-8 min-h-[500px]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-800 flex items-center gap-3">
                  <Users className="h-6 w-6 text-green-600" />
                  Assign Cleaners (Optional)
                </h2>
                <div className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-700">
                    {allCleaners.length} cleaner{allCleaners.length !== 1 ? 's' : ''} available
                  </p>
                </div>
              </div>

              {/* ✅ Info badge */}
              {selectedCleaners.length > 0 && (
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-800 mb-1">Auto-Assignment Enabled</p>
                      <p className="text-sm text-blue-700">
                        Selected cleaners will be automatically assigned to this location upon creation
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {allCleaners.length > 0 ? (
                <>
                  {/* Multi-Select Cleaners Dropdown */}
                  <div ref={cleanerDropdownRef} className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-3">
                      Select Cleaners ({selectedCleaners.length} selected)
                    </label>

                    {/* Dropdown Button */}
                    <button
                      type="button"
                      onClick={() => setIsCleanerDropdownOpen(!isCleanerDropdownOpen)}
                      className="w-full flex justify-between items-center text-left px-5 py-4 text-slate-800 bg-slate-50 border-2 border-slate-300 rounded-xl hover:bg-slate-100 hover:border-blue-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-slate-400" />
                        <span className="font-medium">
                          {selectedCleaners.length > 0
                            ? `${selectedCleaners.length} cleaner${selectedCleaners.length !== 1 ? 's' : ''} selected`
                            : "Click to select cleaners..."}
                        </span>
                      </span>
                      <ChevronDown
                        className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${isCleanerDropdownOpen ? "rotate-180" : ""
                          }`}
                      />
                    </button>

                    {/* ✅ IMPROVED: Larger, more spacious dropdown */}
                    {isCleanerDropdownOpen && (
                      <div className="absolute z-50 w-full mt-3 bg-white border-2 border-slate-300 rounded-xl shadow-2xl overflow-hidden max-h-[480px] flex flex-col">
                        {/* Search Header */}
                        <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-gray-50">
                          <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="text"
                              placeholder="Search for a cleaner..."
                              value={cleanerSearchTerm}
                              onChange={(e) => setCleanerSearchTerm(e.target.value)}
                              className="w-full pl-12 pr-4 py-3 text-sm border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                              autoFocus
                            />
                          </div>
                        </div>

                        {/* Cleaners List */}
                        <div className="overflow-y-auto flex-1 p-3">
                          {filteredCleaners.length === 0 ? (
                            <div className="p-12 text-center">
                              <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                              <p className="font-semibold text-slate-600 text-base mb-1">No cleaners found</p>
                              <p className="text-sm text-slate-500">
                                {cleanerSearchTerm ? 'Try a different search term' : 'No cleaners available'}
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {filteredCleaners.map((cleaner) => (
                                <label
                                  key={cleaner.id}
                                  className="flex items-start p-4 rounded-lg hover:bg-blue-50 cursor-pointer transition-all duration-150 border-2 border-transparent hover:border-blue-200 group"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedCleaners.some((c) => c.id === cleaner.id)}
                                    onChange={() => handleCleanerSelect(cleaner)}
                                    className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                  />
                                  <div className="ml-4 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <UserCheck className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                                      <span className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                                        {cleaner.name}
                                      </span>
                                    </div>
                                    {cleaner.email && (
                                      <div className="text-sm text-slate-600 mb-0.5 flex items-center gap-1">
                                        <Mail className="w-3 h-3 text-slate-400" />
                                        {cleaner.email}
                                      </div>
                                    )}
                                    {cleaner.phone && (
                                      <div className="text-xs text-slate-500 flex items-center gap-1">
                                        <Phone className="w-3 h-3 text-slate-400" />
                                        {cleaner.phone}
                                      </div>
                                    )}
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Footer with selection count */}
                        {filteredCleaners.length > 0 && (
                          <div className="p-3 border-t border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">
                                {selectedCleaners.length} of {filteredCleaners.length} selected
                              </span>
                              {selectedCleaners.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedCleaners([])}
                                  className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                                >
                                  <X className="w-3 h-3" />
                                  Clear all
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selected Cleaners Preview */}
                  {selectedCleaners.length > 0 && (
                    <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-800 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Selected Cleaners
                        </h4>
                        <span className="text-sm text-green-700 font-medium">
                          {selectedCleaners.length} cleaner{selectedCleaners.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCleaners.map((cleaner) => (
                          <span
                            key={cleaner.id}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-green-300 text-green-800 text-sm font-medium rounded-lg hover:bg-green-50 transition-all shadow-sm"
                          >
                            <UserCheck className="w-4 h-4" />
                            {cleaner.name}
                            <button
                              type="button"
                              onClick={() => handleCleanerSelect(cleaner)}
                              className="hover:text-green-900 hover:bg-green-100 rounded-full p-0.5 transition-all"
                              title="Remove"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 bg-slate-50 rounded-xl text-center border-2 border-dashed border-slate-300">
                  <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="font-semibold text-slate-700 mb-2 text-lg">No Cleaners Available</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Add cleaners to your company to assign them to locations. You can add cleaners from the Users section.
                  </p>
                </div>
              )}
            </div>


            {/* ========== SUBMIT BUTTON ========== */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-slate-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-3 text-slate-600 hover:bg-slate-100 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  submitting ||
                  !form.name ||
                  !form.type_id ||
                  !form.latitude ||
                  !form.longitude ||
                  pincodeError
                }
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors duration-200 flex items-center gap-2 disabled:bg-blue-400 disabled:cursor-not-allowed min-w-48"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {selectedCleaners.length > 0 ? 'Creating & Assigning...' : 'Creating Location...'}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {selectedCleaners.length > 0
                      ? `Create & Assign to ${selectedCleaners.length} Cleaner${selectedCleaners.length !== 1 ? 's' : ''}`
                      : 'Create Location'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
