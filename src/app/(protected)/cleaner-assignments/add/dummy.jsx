"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
// import  LocationsApi  from '../../lib/api/LocationApi'
import LocationsApi from "@/lib/api/LocationApi";
import { AssignmentsApi } from "@/lib/api/assignmentsApi";
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
        window.location.href = "/cleaner-assignments/assignments";
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
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isUserDropdownOpen ? "rotate-180" : ""
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
                    className={`w-5 h-5 text-slate-400 transition-transform ${
                      isLocationDropdownOpen ? "rotate-180" : ""
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
