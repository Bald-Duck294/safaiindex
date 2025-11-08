"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
// import  LocationsApi  from '../../lib/api/LocationApi'
import LocationsApi from "@/lib/api/LocationApi";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
import { useCompanyId } from "@/lib/providers/CompanyProvider";
import {
  ClipboardPlus,
  User,
  MapPin,
  Search,
  ChevronDown,
  X,
} from "lucide-react";
// import { useRouter } from "next/navigation";

const AddAssignmentPage = () => {
  // --- STATE MANAGEMENT ---
  const [cleanerUserId, setCleanerUserId] = useState("");
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [status, setStatus] = useState("assigned");

  // const router = useRouter();

  const [allUsers, setAllUsers] = useState([]);
  const [allLocations, setAllLocations] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user: loggedInUser } = useSelector((state) => state.auth);

  const { companyId } = useCompanyId();
  //   const companyId = loggedInUser?.company_id;
  // const companyId = 2;

  const userDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // --- DATA FETCHING ---

  useEffect(() => {
    console.log("entered use effect");
    if (!companyId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        console.log("in try block ");
        const userRes = await UsersApi.getAllUsers(companyId);
        console.log("✅ userRes", userRes);

        const locationRes = await LocationsApi.getAllLocations(companyId);
        console.log("✅ locationRes", locationRes);

        if (userRes.success) setAllUsers(userRes.data || []);
        if (locationRes.success) setAllLocations(locationRes.data || []);
      } catch (err) {
        console.error("❌ Error while fetching:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // --- EVENT HANDLERS for closing dropdowns on outside click ---
  useEffect(() => {
    console.log("in the normal use effect");
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setIsUserDropdownOpen(false);
      }
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(event.target)
      ) {
        setIsLocationDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLocationSelect = (location) => {
    setSelectedLocations((prev) =>
      prev.some((loc) => loc.id === location.id)
        ? prev.filter((loc) => loc.id !== location.id)
        : [...prev, location]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cleanerUserId || selectedLocations.length === 0) {
      return toast.error("Please select a cleaner and at least one location.");
    }
    setIsLoading(true);

    const assignmentData = {
      cleaner_user_id: cleanerUserId,
      location_ids: selectedLocations.map((loc) => loc.id), // Send only IDs
      status: status,
      company_id: companyId,
    };

    const response = await AssignmentsApi.createAssignment(assignmentData);

    if (response.success) {
      toast.success(
        response.data.message || "Assignments created successfully!"
      );
      setCleanerUserId("");
      setSelectedLocations([]);
      setUserSearchTerm("");
      setTimeout(() => {
        window.location.href = `/cleaner-assignments?companyId=${companyId}`;
      }, 800);
    } else {
      toast.error(response.error || "Failed to create assignments.");
    }
    setIsLoading(false);
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = allUsers.filter((user) =>
    user.name.toLowerCase().includes(userSearchTerm.toLowerCase())
  );
  const filteredLocations = allLocations.filter((loc) =>
    loc.name.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  const selectedUserName =
    allUsers.find((u) => u.id === cleanerUserId)?.name || "Select a cleaner...";

  // --- RENDER ---
  return (
    <>
      <Toaster position="top-center" />
      <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
          <div className="flex items-center gap-4 mb-8">
            <ClipboardPlus className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-slate-800">
              Assign Locations
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 1. Select Cleaner with Search */}
            <div ref={userDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Cleaner
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="w-full flex justify-between items-center text-left px-4 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <span className="truncate">{selectedUserName}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isUserDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isUserDropdownOpen && (
                  <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search for a cleaner..."
                          value={userSearchTerm}
                          onChange={(e) => setUserSearchTerm(e.target.value)}
                          className="w-full pl-9 pr-4 py-1.5 text-sm border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => {
                            setCleanerUserId(user.id);
                            setUserSearchTerm(user.name);
                            setIsUserDropdownOpen(false);
                          }}
                          className="p-2 rounded-md hover:bg-slate-100 cursor-pointer text-sm text-slate-700"
                        >
                          {user.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Select Locations (Multi-select with Search) */}
            <div ref={locationDropdownRef}>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Locations ({selectedLocations.length} selected)
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsLocationDropdownOpen(!isLocationDropdownOpen)
                  }
                  className="w-full flex justify-between items-center text-left px-4 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <span>
                    {selectedLocations.length > 0
                      ? `${selectedLocations.length} locations selected`
                      : "Click to select..."}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform ${isLocationDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>
                {isLocationDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 flex flex-col">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search locations..."
                          value={locationSearchTerm}
                          onChange={(e) =>
                            setLocationSearchTerm(e.target.value)
                          }
                          className="w-full pl-9 pr-4 py-1.5 text-sm border-slate-300 rounded-md"
                        />
                      </div>
                    </div>
                    <div className="overflow-y-auto p-2">
                      {filteredLocations.map((location) => (
                        <label
                          key={location.id}
                          className="flex items-center p-2 rounded-md hover:bg-slate-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.some(
                              (loc) => loc.id === location.id
                            )}
                            onChange={() => handleLocationSelect(location)}
                            className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                          />
                          <span className="ml-3 text-sm text-slate-700">
                            {location.name}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Select Status */}
            <div>
              <label
                htmlFor="status"
                className="block text-sm font-semibold text-slate-700 mb-2"
              >
                Set Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="assigned">Assigned</option>
                <option value="unassigned">Unassigned</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Processing..."
                  : `Create ${selectedLocations.length} Assignments`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddAssignmentPage;



// "use client";

// import { useState, useEffect, useRef } from "react";
// import { useSelector } from "react-redux";
// import toast, { Toaster } from "react-hot-toast";
// import { UsersApi } from "@/lib/api/usersApi";
// import LocationsApi from "@/lib/api/LocationApi";
// import { AssignmentsApi } from "@/lib/api/assignmentsApi";
// import { useCompanyId } from "@/lib/providers/CompanyProvider";
// import Loader from '@/components/ui/Loader'; // ✅ Import Loader
// import {
//   ClipboardPlus,
//   User,
//   MapPin,
//   Search,
//   ChevronDown,
//   X,
//   UserCheck,
// } from "lucide-react";

// const AddAssignmentPage = () => {
//   // --- STATE MANAGEMENT ---
//   const [cleanerUserId, setCleanerUserId] = useState("");
//   const [selectedLocations, setSelectedLocations] = useState([]);
//   const [status, setStatus] = useState("assigned");

//   const [allUsers, setAllUsers] = useState([]);
//   const [allLocations, setAllLocations] = useState([]);

//   const [userSearchTerm, setUserSearchTerm] = useState("");
//   const [locationSearchTerm, setLocationSearchTerm] = useState("");

//   const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
//   const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
//   const [isLoading, setIsLoading] = useState(true); // ✅ Start with true
//   const [hasInitialized, setHasInitialized] = useState(false);

//   const { user: loggedInUser } = useSelector((state) => state.auth);
//   const { companyId } = useCompanyId();

//   const userDropdownRef = useRef(null);
//   const locationDropdownRef = useRef(null);

//   // --- DATA FETCHING WITH CLEANER RESTRICTION ---
//   useEffect(() => {
//     console.log("Fetching data for company:", companyId);
    
//     // ✅ Guard clause for companyId
//     if (!companyId || companyId === 'null') {
//       console.log('Skipping data fetch - companyId not ready');
//       setIsLoading(false);
//       setHasInitialized(true);
//       return;
//     }

//     const fetchData = async () => {
//       try {
//         console.log("Fetching cleaners and locations for company:", companyId);
        
//         // ✅ RESTRICTION: Only fetch users with role_id = 5 (cleaners)
//         const [userRes, locationRes] = await Promise.all([
//           UsersApi.getAllUsers(companyId, 5), // ✅ roleId = 5 for cleaners only
//           LocationsApi.getAllLocations(companyId)
//         ]);

//         console.log("✅ Cleaners response:", userRes);
//         console.log("✅ Locations response:", locationRes);

//         if (userRes.success) {
//           // ✅ Double-check filter on frontend as backup
//           const cleanersOnly = (userRes.data || []).filter(user => {
//             const userRoleId = parseInt(user.role_id || user.role?.id || 0);
//             return userRoleId === 5; // Only cleaners
//           });
          
//           console.log(`Found ${cleanersOnly.length} cleaners out of ${userRes.data?.length || 0} users`);
//           setAllUsers(cleanersOnly);
//         } else {
//           console.error('Failed to fetch cleaners:', userRes.error);
//           toast.error(userRes.error || "Failed to fetch cleaners");
//           setAllUsers([]);
//         }

//         if (locationRes.success) {
//           setAllLocations(locationRes.data || []);
//         } else {
//           console.error('Failed to fetch locations:', locationRes.error);
//           toast.error(locationRes.error || "Failed to fetch locations");
//           setAllLocations([]);
//         }

//       } catch (err) {
//         console.error("❌ Error while fetching:", err);
//         toast.error("Failed to load data");
//         setAllUsers([]);
//         setAllLocations([]);
//       } finally {
//         setIsLoading(false);
//         setHasInitialized(true);
//       }
//     };

//     fetchData();
//   }, [companyId]);

//   // --- EVENT HANDLERS for closing dropdowns on outside click ---
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (
//         userDropdownRef.current &&
//         !userDropdownRef.current.contains(event.target)
//       ) {
//         setIsUserDropdownOpen(false);
//       }
//       if (
//         locationDropdownRef.current &&
//         !locationDropdownRef.current.contains(event.target)
//       ) {
//         setIsLocationDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLocationSelect = (location) => {
//     setSelectedLocations((prev) =>
//       prev.some((loc) => loc.id === location.id)
//         ? prev.filter((loc) => loc.id !== location.id)
//         : [...prev, location]
//     );
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!cleanerUserId || selectedLocations.length === 0) {
//       return toast.error("Please select a cleaner and at least one location.");
//     }

//     setIsLoading(true);

//     const assignmentData = {
//       cleaner_user_id: cleanerUserId,
//       location_ids: selectedLocations.map((loc) => loc.id),
//       status: status,
//       company_id: companyId,
//     };

//     try {
//       const response = await AssignmentsApi.createAssignment(assignmentData);

//       if (response.success) {
//         toast.success(
//           response.data?.message || "Mapping created successfully!"
//         );
        
//         // Reset form
//         setCleanerUserId("");
//         setSelectedLocations([]);
//         setUserSearchTerm("");
//         setLocationSearchTerm("");
        
//         setTimeout(() => {
//            window.location.href = `/cleaner-assignments?companyId=${companyId}`;
//         }, 800);
//       } else {
//         toast.error(response.error || "Failed to create assignments.");
//       }
//     } catch (error) {
//       console.error('Mapping creation error:', error);
//       toast.error("Failed to create mapping.");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- FILTERING LOGIC ---
//   const filteredUsers = allUsers.filter((user) =>
//     user.name?.toLowerCase().includes(userSearchTerm.toLowerCase())
//   );
  
//   const filteredLocations = allLocations.filter((loc) =>
//     loc.name?.toLowerCase().includes(locationSearchTerm.toLowerCase())
//   );

//   const selectedUser = allUsers.find((u) => u.id === cleanerUserId);
//   const selectedUserName = selectedUser?.name || "Select a cleaner...";

//   // ✅ Loading state with Loader component
//   if (isLoading || !hasInitialized) {
//     return (
//       <>
//         <Toaster position="top-center" />
//         <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//           <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
//             <div className="flex items-center gap-4 mb-8">
//               <ClipboardPlus className="w-8 h-8 text-indigo-600" />
//               <h1 className="text-3xl font-bold text-slate-800">
//                 Map Locations
//               </h1>
//             </div>
//             <div className="flex justify-center items-center h-64">
//               <Loader 
//                 size="large" 
//                 color="#6366f1" 
//                 message="Loading cleaners and locations..." 
//               />
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // ✅ No company ID state
//   if (!companyId) {
//     return (
//       <>
//         <Toaster position="top-center" />
//         <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//           <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
//             <div className="text-center py-12">
//               <ClipboardPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">No Company Selected</h2>
//               <p className="text-gray-600">Please select a company to create assignments.</p>
//             </div>
//           </div>
//         </div>
//       </>
//     );
//   }

//   // --- RENDER ---
//   return (
//     <>
//       <Toaster position="top-center" />
//       <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
//         <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200/60">
//           <div className="flex items-center gap-4 mb-8">
//             <ClipboardPlus className="w-8 h-8 text-indigo-600" />
//             <div>
//               <h1 className="text-3xl font-bold text-slate-800">
//                 Map Locations to Cleaners
//               </h1>
//               <p className="text-sm text-slate-600 mt-2">
//                 Select a cleaner and locations to create Mappings
//               </p>
//             </div>
//           </div>

//           {/* ✅ Info Card showing available cleaners */}
//           <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
//             <div className="flex items-center gap-2 text-sm text-blue-700">
//               <UserCheck className="w-4 h-4" />
//               <span>
//                 <strong>{allUsers.length} cleaners available</strong> for mappings
//                 {allLocations.length > 0 && ` across ${allLocations.length} locations`}
//               </span>
//             </div>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* 1. Select Cleaner with Search */}
//             <div ref={userDropdownRef}>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">
//                 Select Cleaner
//               </label>
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
//                   className="w-full flex justify-between items-center text-left px-4 py-3 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
//                 >
//                   <span className="truncate flex items-center gap-2">
//                     <User className="w-4 h-4 text-slate-400" />
//                     {selectedUserName}
//                   </span>
//                   <ChevronDown
//                     className={`w-5 h-5 text-slate-400 transition-transform ${
//                       isUserDropdownOpen ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>
//                 {isUserDropdownOpen && (
//                   <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 flex flex-col">
//                     <div className="p-3 border-b">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                         <input
//                           type="text"
//                           placeholder="Search for a cleaner..."
//                           value={userSearchTerm}
//                           onChange={(e) => setUserSearchTerm(e.target.value)}
//                           className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                     </div>
//                     <div className="overflow-y-auto p-2">
//                       {filteredUsers.length === 0 ? (
//                         <div className="p-4 text-center text-slate-500">
//                           <UserCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
//                           <p className="font-medium">No cleaners found</p>
//                           <p className="text-xs">
//                             {userSearchTerm ? 'Try a different search term' : 'No cleaners available'}
//                           </p>
//                         </div>
//                       ) : (
//                         filteredUsers.map((user) => (
//                           <div
//                             key={user.id}
//                             onClick={() => {
//                               setCleanerUserId(user.id);
//                               setUserSearchTerm(user.name);
//                               setIsUserDropdownOpen(false);
//                             }}
//                             className="p-3 rounded-md hover:bg-slate-100 cursor-pointer text-sm text-slate-700 flex items-center gap-2"
//                           >
//                             <User className="w-4 h-4 text-slate-400" />
//                             <div>
//                               <div className="font-medium">{user.name}</div>
//                               {/* {user.email && (
//                                 <div className="text-xs text-slate-500">{user.email}</div>
//                               )} */}
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* 2. Select Locations (Multi-select with Search) */}
//             <div ref={locationDropdownRef}>
//               <label className="block text-sm font-semibold text-slate-700 mb-2">
//                 Select Locations ({selectedLocations.length} selected)
//               </label>
//               <div className="relative">
//                 <button
//                   type="button"
//                   onClick={() =>
//                     setIsLocationDropdownOpen(!isLocationDropdownOpen)
//                   }
//                   className="w-full flex justify-between items-center text-left px-4 py-3 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
//                 >
//                   <span className="flex items-center gap-2">
//                     <MapPin className="w-4 h-4 text-slate-400" />
//                     {selectedLocations.length > 0
//                       ? `${selectedLocations.length} locations selected`
//                       : "Click to select locations..."}
//                   </span>
//                   <ChevronDown
//                     className={`w-5 h-5 text-slate-400 transition-transform ${
//                       isLocationDropdownOpen ? "rotate-180" : ""
//                     }`}
//                   />
//                 </button>
//                 {isLocationDropdownOpen && (
//                   <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 flex flex-col">
//                     <div className="p-3 border-b">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
//                         <input
//                           type="text"
//                           placeholder="Search locations..."
//                           value={locationSearchTerm}
//                           onChange={(e) =>
//                             setLocationSearchTerm(e.target.value)
//                           }
//                           className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
//                         />
//                       </div>
//                     </div>
//                     <div className="overflow-y-auto p-2">
//                       {filteredLocations.length === 0 ? (
//                         <div className="p-4 text-center text-slate-500">
//                           <MapPin className="w-8 h-8 mx-auto mb-2 text-slate-300" />
//                           <p className="font-medium">No locations found</p>
//                           <p className="text-xs">
//                             {locationSearchTerm ? 'Try a different search term' : 'No locations available'}
//                           </p>
//                         </div>
//                       ) : (
//                         filteredLocations.map((location) => (
//                           <label
//                             key={location.id}
//                             className="flex items-center p-3 rounded-md hover:bg-slate-100 cursor-pointer"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={selectedLocations.some(
//                                 (loc) => loc.id === location.id
//                               )}
//                               onChange={() => handleLocationSelect(location)}
//                               className="h-4 w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
//                             />
//                             <span className="ml-3 text-sm text-slate-700 flex items-center gap-2">
//                               <MapPin className="w-4 h-4 text-slate-400" />
//                               {location.name}
//                             </span>
//                           </label>
//                         ))
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* ✅ Selected Locations Preview */}
//             {selectedLocations.length > 0 && (
//               <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
//                 <h4 className="font-medium text-green-800 mb-2">Selected Locations:</h4>
//                 <div className="flex flex-wrap gap-2">
//                   {selectedLocations.map((location) => (
//                     <span
//                       key={location.id}
//                       className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
//                     >
//                       {location.name}
//                       <button
//                         type="button"
//                         onClick={() => handleLocationSelect(location)}
//                         className="hover:text-green-900"
//                       >
//                         <X className="w-3 h-3" />
//                       </button>
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* 3. Select Status */}
//             <div>
//               <label
//                 htmlFor="status"
//                 className="block text-sm font-semibold text-slate-700 mb-2"
//               >
//                 Mappings Status
//               </label>
//               <select
//                 id="status"
//                 value={status}
//                 onChange={(e) => setStatus(e.target.value)}
//                 className="w-full px-4 py-3 text-slate-800 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="assigned">Assigned</option>
//                 <option value="unassigned">Unassigned</option>
//               </select>
//             </div>

//             {/* Submit Button */}
//             <div className="pt-6 border-t border-slate-200">
//               <button
//                 type="submit"
//                 disabled={isLoading || !cleanerUserId || selectedLocations.length === 0}
//                 className="w-full px-4 py-3 font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 disabled:bg-indigo-400 disabled:cursor-not-allowed disabled:transform-none"
//               >
//                 {isLoading
//                   ? "Creating Mappings..."
//                   : `Create ${selectedLocations.length} Mapping${selectedLocations.length !== 1 ? 's' : ''}`}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </>
//   );
// };

// export default AddAssignmentPage;
