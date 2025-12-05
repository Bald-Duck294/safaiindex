"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { UsersApi } from "@/lib/api/usersApi";
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
  CheckSquare,
  Square,
  Users,
  AlertCircle,
  Loader,
  Filter,
} from "lucide-react";

const AddAssignmentPage = () => {
  // --- STATE MANAGEMENT ---
  const [assignmentMode, setAssignmentMode] = useState("multi");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedLocations, setSelectedLocations] = useState([]);
  const [singleUser, setSingleUser] = useState("");

  const [allUsers, setAllUsers] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [userAssignedLocations, setUserAssignedLocations] = useState([]);

  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [locationSearchTerm, setLocationSearchTerm] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all"); // ✅ Role filter state

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingAssignments, setIsFetchingAssignments] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  const { user: loggedInUser } = useSelector((state) => state.auth);
  const { companyId } = useCompanyId();

  const userDropdownRef = useRef(null);
  const locationDropdownRef = useRef(null);

  // ✅ UPDATED: Filter out role_id 1 and 2, then get unique roles
  const assignableUsers = allUsers.filter(u => u.role_id !== 1 && u.role_id !== 2);
  const uniqueRoles = [...new Set(assignableUsers.map(u => u.role?.name).filter(Boolean))];

  // ✅ UPDATED: Remove emojis, only show background colors
  const getRoleColor = (roleName) => {
    if (!roleName) return "bg-gray-100 text-gray-700";

    const role = roleName.toLowerCase();
    switch (role) {
      case 'supervisor':
        return "bg-blue-100 text-blue-700";
      case 'cleaner':
        return "bg-purple-100 text-purple-700";
      case 'zonal admin':
      case 'zonaladmin':
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // --- DATA FETCHING ---
  useEffect(() => {
    if (!companyId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userRes = await UsersApi.getAllUsers(companyId);
        const locationRes = await LocationsApi.getAllLocations(companyId);

        if (userRes.success) setAllUsers(userRes.data || []);
        if (locationRes.success) setAllLocations(locationRes.data || []);
      } catch (err) {
        console.error("❌ Error while fetching:", err);
        toast.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  // --- FETCH ASSIGNED LOCATIONS FOR SINGLE USER MODE ---
  useEffect(() => {
    if (assignmentMode === "single" && singleUser) {
      fetchUserAssignments(singleUser);
    } else {
      setAvailableLocations(allLocations);
    }
  }, [singleUser, assignmentMode, allLocations]);

  const fetchUserAssignments = async (userId) => {
    setIsFetchingAssignments(true);
    try {
      const response = await AssignmentsApi.getAssignmentsByCleanerId(
        userId,
        companyId
      );

      if (response.success) {
        const assignedLocationIds = response.data.map((a) => a.location_id);
        setUserAssignedLocations(assignedLocationIds);

        const unassignedLocations = allLocations.filter(
          (loc) => !assignedLocationIds.includes(loc.id)
        );
        setAvailableLocations(unassignedLocations);
      }
    } catch (error) {
      console.error("Error fetching user assignments:", error);
      toast.error("Failed to load user assignments");
      setAvailableLocations(allLocations);
    } finally {
      setIsFetchingAssignments(false);
    }
  };

  // --- VALIDATE ASSIGNMENTS BEFORE SUBMIT ---
  const validateAssignments = async () => {
    setIsValidating(true);
    const conflicts = [];

    try {
      const usersToCheck = assignmentMode === "multi"
        ? selectedUsers
        : [assignableUsers.find(u => u.id === singleUser)];

      for (const user of usersToCheck) {
        const response = await AssignmentsApi.getAssignmentsByCleanerId(
          user.id,
          companyId
        );

        if (response.success) {
          const assignedLocationIds = response.data.map((a) => a.location_id);
          const userConflicts = selectedLocations.filter((loc) =>
            assignedLocationIds.includes(loc.id)
          );

          if (userConflicts.length > 0) {
            conflicts.push({
              userName: user.name,
              locations: userConflicts.map((loc) => loc.name),
            });
          }
        }
      }
    } catch (error) {
      console.error("Error validating assignments:", error);
    } finally {
      setIsValidating(false);
    }

    return conflicts;
  };

  // --- CLOSE DROPDOWNS ON OUTSIDE CLICK ---
  useEffect(() => {
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

  // --- HANDLERS ---
  const handleModeToggle = () => {
    const newMode = assignmentMode === "multi" ? "single" : "multi";
    setAssignmentMode(newMode);

    setSelectedUsers([]);
    setSingleUser("");
    setSelectedLocations([]);
    setUserSearchTerm("");
    setLocationSearchTerm("");
    setSelectedRoleFilter("all");
  };

  const handleUserSelect = (user) => {
    if (assignmentMode === "multi") {
      setSelectedUsers((prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user]
      );
    } else {
      setSingleUser(user.id);
      setUserSearchTerm(user.name);
      setIsUserDropdownOpen(false);
      setSelectedLocations([]);
    }
  };

  const handleLocationSelect = (location) => {
    setSelectedLocations((prev) =>
      prev.some((loc) => loc.id === location.id)
        ? prev.filter((loc) => loc.id !== location.id)
        : [...prev, location]
    );
  };

  const handleSelectAllLocations = () => {
    const locationsToUse =
      assignmentMode === "single" ? availableLocations : allLocations;

    if (selectedLocations.length === locationsToUse.length) {
      setSelectedLocations([]);
    } else {
      setSelectedLocations(locationsToUse);
    }
  };

  const handleSelectAllUsers = () => {
    const usersToSelect = filteredUsers;

    if (selectedUsers.length === usersToSelect.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(usersToSelect);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (assignmentMode === "multi") {
      if (selectedUsers.length === 0 || selectedLocations.length === 0) {
        return toast.error("Please select at least one user and one location.");
      }
    } else {
      if (!singleUser || selectedLocations.length === 0) {
        return toast.error("Please select a user and at least one location.");
      }
    }

    // Check for conflicts
    const conflicts = await validateAssignments();

    if (conflicts.length > 0) {
      const errorMessages = conflicts.map((conflict) => {
        const locationList = conflict.locations.join(", ");
        return `• ${conflict.userName} is already assigned to: ${locationList}`;
      });

      toast.error(
        (t) => (
          <div className="max-w-md">
            <div className="flex items-start gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 mb-1">
                  Assignment Conflicts Found
                </p>
                <div className="text-sm text-red-700 space-y-1">
                  {errorMessages.map((msg, idx) => (
                    <p key={idx}>{msg}</p>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        ),
        { duration: Infinity, style: { maxWidth: "500px" } }
      );

      return;
    }

    setIsLoading(true);

    try {
      let successCount = 0;
      let failureCount = 0;
      const errors = [];

      if (assignmentMode === "multi") {
        const promises = selectedUsers.map(async (user) => {
          try {
            const response = await AssignmentsApi.createAssignment({
              cleaner_user_id: user.id,
              location_ids: selectedLocations.map((loc) => loc.id),
              status: "assigned",
              company_id: companyId,
              role_id: user.role_id,
            });

            if (response.success) {
              successCount += response.data?.data?.created || 0;
              return { success: true, user: user.name };
            } else {
              failureCount++;
              errors.push(`${user.name}: ${response.error}`);
              return { success: false, user: user.name, error: response.error };
            }
          } catch (error) {
            failureCount++;
            errors.push(`${user.name}: ${error.message}`);
            return { success: false, user: user.name, error: error.message };
          }
        });

        await Promise.all(promises);
      } else {
        const selectedUserData = assignableUsers.find(u => u.id === singleUser);
        const response = await AssignmentsApi.createAssignment({
          cleaner_user_id: singleUser,
          location_ids: selectedLocations.map((loc) => loc.id),
          status: "assigned",
          company_id: companyId,
          role_id: selectedUserData?.role_id
        });

        if (response.success) {
          successCount = response.data?.data?.created || 0;
        } else {
          failureCount++;
          errors.push(response.error);
        }
      }

      // Show results
      if (successCount > 0 && failureCount === 0) {
        toast.success(
          `Successfully created ${successCount} assignment${successCount !== 1 ? "s" : ""
          }!`
        );

        setSelectedUsers([]);
        setSingleUser("");
        setSelectedLocations([]);
        setUserSearchTerm("");
        setLocationSearchTerm("");

        setTimeout(() => {
          window.location.href = `/cleaner-assignments?companyId=${companyId}`;
        }, 1000);
      } else if (successCount > 0 && failureCount > 0) {
        toast(
          (t) => (
            <div className="max-w-md">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800 mb-1">
                    Partial Success
                  </p>
                  <p className="text-sm text-yellow-700 mb-2">
                    Created {successCount} assignment{successCount !== 1 ? "s" : ""}, but {failureCount} failed:
                  </p>
                  <div className="text-sm text-yellow-700 space-y-1">
                    {errors.slice(0, 3).map((error, idx) => (
                      <p key={idx}>• {error}</p>
                    ))}
                    {errors.length > 3 && (
                      <p>• ...and {errors.length - 3} more</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-2 w-full px-3 py-1.5 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          ),
          { duration: Infinity, style: { maxWidth: "500px" } }
        );
      } else {
        toast.error(
          (t) => (
            <div className="max-w-md">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800 mb-1">
                    Assignment Failed
                  </p>
                  <div className="text-sm text-red-700 space-y-1">
                    {errors.slice(0, 3).map((error, idx) => (
                      <p key={idx}>• {error}</p>
                    ))}
                    {errors.length > 3 && (
                      <p>• ...and {errors.length - 3} more errors</p>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Dismiss
              </button>
            </div>
          ),
          { duration: Infinity, style: { maxWidth: "500px" } }
        );
      }
    } catch (error) {
      console.error("Error creating assignments:", error);
      toast.error(
        (t) => (
          <div>
            <p className="font-semibold mb-1">Failed to create assignments</p>
            <p className="text-sm">{error.message}</p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="mt-2 w-full px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
            >
              Dismiss
            </button>
          </div>
        ),
        { duration: Infinity }
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ UPDATED: Filter logic - exclude role_id 1 & 2, then filter by search and role
  const filteredUsers = assignableUsers.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(userSearchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === "all" ||
      user.role?.name?.toLowerCase() === selectedRoleFilter.toLowerCase();
    return matchesSearch && matchesRole;
  });

  const filteredLocations = (
    assignmentMode === "single" ? availableLocations : allLocations
  ).filter((loc) =>
    loc.name.toLowerCase().includes(locationSearchTerm.toLowerCase())
  );

  const locationsToShow =
    assignmentMode === "single" ? availableLocations : allLocations;
  const allLocationsSelected =
    selectedLocations.length === locationsToShow.length &&
    locationsToShow.length > 0;
  const allUsersSelected =
    selectedUsers.length === filteredUsers.length && filteredUsers.length > 0;

  // --- RENDER ---
  return (
    <>
      <Toaster position="top-right" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
        <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <ClipboardPlus className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-800">
                  Create Assignments
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5 sm:mt-1">
                  Assign locations to users
                </p>
              </div>
            </div>
          </div>

          {/* Mode Toggle */}
          <div className="mb-6 md:mb-8 p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border-2 border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {assignmentMode === "multi" ? (
                    <Users className="w-5 h-5 text-indigo-600" />
                  ) : (
                    <User className="w-5 h-5 text-green-600" />
                  )}
                  <h3 className="text-base sm:text-lg font-bold text-slate-800">
                    {assignmentMode === "multi"
                      ? "Multiple Assignment Mode"
                      : "Single Assignment Mode"}
                  </h3>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 ml-8">
                  {assignmentMode === "multi"
                    ? "Assign multiple users to multiple locations at once"
                    : "Assign one user to only their unassigned locations"}
                </p>
              </div>
              <button
                type="button"
                onClick={handleModeToggle}
                className={`relative inline-flex h-10 w-20 sm:h-11 sm:w-24 items-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 flex-shrink-0 shadow-md ${assignmentMode === "multi"
                  ? "bg-indigo-600 focus:ring-indigo-500"
                  : "bg-green-600 focus:ring-green-500"
                  }`}
              >
                <span
                  className={`inline-block h-8 w-8 sm:h-9 sm:w-9 transform rounded-full bg-white transition-transform shadow-lg ${assignmentMode === "multi"
                    ? "translate-x-1"
                    : "translate-x-11 sm:translate-x-14"
                    }`}
                >
                  {assignmentMode === "multi" ? (
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 m-1.5 text-indigo-600" />
                  ) : (
                    <User className="w-5 h-5 sm:w-6 sm:h-6 m-1.5 text-green-600" />
                  )}
                </span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* ✅ NEW: Role Filter at Top (Outside Dropdown) */}
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 sm:p-4">
              <label className="block text-xs sm:text-sm font-semibold text-indigo-900 mb-2">
                Filter by Role
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoleFilter("all")}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedRoleFilter === "all"
                    ? "bg-indigo-600 text-white shadow-md"
                    : "bg-white text-slate-700 hover:bg-indigo-100 border border-indigo-300"
                    }`}
                >
                  All Roles ({assignableUsers.length})
                </button>
                {uniqueRoles.map((role) => {
                  const roleCount = assignableUsers.filter(
                    u => u.role?.name === role
                  ).length;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRoleFilter(role)}
                      className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedRoleFilter === role
                        ? "bg-indigo-600 text-white shadow-md"
                        : "bg-white text-slate-700 hover:bg-indigo-100 border border-indigo-300"
                        }`}
                    >
                      <span className={`inline-block px-2 py-0.5 rounded-full mr-1.5 ${getRoleColor(role)}`}>
                        {role}
                      </span>
                      ({roleCount})
                    </button>
                  );
                })}
              </div>
              {selectedRoleFilter !== "all" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-indigo-700">
                    Showing {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} with role: {selectedRoleFilter}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedRoleFilter("all")}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline"
                  >
                    Clear filter
                  </button>
                </div>
              )}
            </div>

            {/* User Selection - Multi or Single based on mode */}
            {assignmentMode === "multi" ? (
              // Multi-select Users
              <div ref={userDropdownRef}>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Select Users ({selectedUsers.length} selected)
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full flex justify-between items-center text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:border-indigo-400 transition-colors"
                  >
                    <span className="truncate">
                      {selectedUsers.length > 0
                        ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? "s" : ""
                        } selected`
                        : "Click to select users..."}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-96 flex flex-col">
                      {/* Search */}
                      <div className="p-2 sm:p-3 border-b border-slate-200">
                        <div className="relative">
                          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                      </div>

                      {/* Select All Button */}
                      <div className="p-2 border-b border-slate-200">
                        <button
                          type="button"
                          onClick={handleSelectAllUsers}
                          className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        >
                          {allUsersSelected ? (
                            <>
                              <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>Deselect All</span>
                            </>
                          ) : (
                            <>
                              <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                              <span>Select All ({filteredUsers.length})</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* User List */}
                      <div className="overflow-y-auto p-2">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <label
                              key={user.id}
                              className="flex items-center p-1.5 sm:p-2 rounded-md hover:bg-slate-100 cursor-pointer group"
                            >
                              <input
                                type="checkbox"
                                checked={selectedUsers.some(
                                  (u) => u.id === user.id
                                )}
                                onChange={() => handleUserSelect(user)}
                                className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                              />
                              {/* ✅ UPDATED: Show user name with role badge (no emoji) */}
                              <div className="ml-2 sm:ml-3 flex items-center gap-2 flex-1">
                                <span className="text-xs sm:text-sm text-slate-700 group-hover:text-slate-900">
                                  {user.name}
                                </span>
                                <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-medium ${getRoleColor(user.role?.name)
                                  }`}>
                                  {user.role?.name || "No Role"}
                                </span>
                              </div>
                            </label>
                          ))
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-500 text-center py-4">
                            {selectedRoleFilter !== "all"
                              ? `No users found with role "${selectedRoleFilter}"`
                              : "No users found"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Selected Users Display */}
                {selectedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                    {selectedUsers.map((user) => (
                      <span
                        key={user.id}
                        className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                      >
                        <span className="truncate max-w-[150px]">{user.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getRoleColor(user.role?.name)}`}>
                          {user.role?.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUserSelect(user)}
                          className="hover:text-indigo-900 flex-shrink-0"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Single User Select
              <div ref={userDropdownRef}>
                <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                  Select User
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="w-full flex justify-between items-center text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:border-green-400 transition-colors"
                  >
                    <span className="truncate">
                      {singleUser
                        ? (() => {
                          const user = assignableUsers.find((u) => u.id === singleUser);
                          return user ? (
                            <span className="flex items-center gap-2">
                              {user.name}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full ${getRoleColor(user.role?.name)}`}>
                                {user.role?.name}
                              </span>
                            </span>
                          ) : "Select a user...";
                        })()
                        : "Select a user..."}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${isUserDropdownOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {isUserDropdownOpen && (
                    <div className="absolute z-20 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-96 flex flex-col">
                      <div className="p-2 sm:p-3 border-b border-slate-200">
                        <div className="relative">
                          <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                          <input
                            type="text"
                            placeholder="Search users..."
                            value={userSearchTerm}
                            onChange={(e) => setUserSearchTerm(e.target.value)}
                            className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                          />
                        </div>
                      </div>

                      <div className="overflow-y-auto p-2">
                        {filteredUsers.length > 0 ? (
                          filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              onClick={() => handleUserSelect(user)}
                              className={`p-1.5 sm:p-2 rounded-md hover:bg-slate-100 cursor-pointer transition-colors ${singleUser === user.id
                                ? "bg-green-50 text-green-700 font-medium"
                                : "text-slate-700"
                                }`}
                            >
                              {/* ✅ UPDATED: Show user with role (no emoji) */}
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs sm:text-sm">{user.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${getRoleColor(user.role?.name)
                                  }`}>
                                  {user.role?.name || "No Role"}
                                </span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs sm:text-sm text-slate-500 text-center py-4">
                            {selectedRoleFilter !== "all"
                              ? `No users found with role "${selectedRoleFilter}"`
                              : "No users found"}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Location Selection */}
            <div ref={locationDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-2">
                Select Locations ({selectedLocations.length} selected)
                {assignmentMode === "single" && singleUser && (
                  <span className="ml-2 text-xs text-slate-500">
                    ({availableLocations.length} unassigned)
                  </span>
                )}
              </label>

              {assignmentMode === "single" && !singleUser && (
                <p className="text-xs sm:text-sm text-amber-600 mb-2">
                  Please select a user first to see available locations
                </p>
              )}

              {isFetchingAssignments && (
                <div className="flex items-center gap-2 text-xs sm:text-sm text-indigo-600 mb-2">
                  <Loader className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                  <span>Loading available locations...</span>
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() =>
                    setIsLocationDropdownOpen(!isLocationDropdownOpen)
                  }
                  disabled={assignmentMode === "single" && !singleUser}
                  className="w-full flex justify-between items-center text-left px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-800 bg-slate-50 border border-slate-300 rounded-lg hover:border-indigo-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">
                    {selectedLocations.length > 0
                      ? `${selectedLocations.length} location${selectedLocations.length !== 1 ? "s" : ""
                      } selected`
                      : "Click to select locations..."}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-400 transition-transform flex-shrink-0 ${isLocationDropdownOpen ? "rotate-180" : ""
                      }`}
                  />
                </button>

                {isLocationDropdownOpen && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-slate-300 rounded-lg shadow-lg max-h-64 sm:max-h-80 flex flex-col">
                    {/* Search */}
                    <div className="p-2 sm:p-3 border-b border-slate-200">
                      <div className="relative">
                        <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search locations..."
                          value={locationSearchTerm}
                          onChange={(e) =>
                            setLocationSearchTerm(e.target.value)
                          }
                          className="w-full pl-8 sm:pl-9 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Select All Button */}
                    <div className="p-2 border-b border-slate-200">
                      <button
                        type="button"
                        onClick={handleSelectAllLocations}
                        className="w-full flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                      >
                        {allLocationsSelected ? (
                          <>
                            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Deselect All</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            <span>Select All ({locationsToShow.length})</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Location List */}
                    <div className="overflow-y-auto p-2">
                      {filteredLocations.length > 0 ? (
                        filteredLocations.map((location) => (
                          <label
                            key={location.id}
                            className="flex items-center p-1.5 sm:p-2 rounded-md hover:bg-slate-100 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={selectedLocations.some(
                                (loc) => loc.id === location.id
                              )}
                              onChange={() => handleLocationSelect(location)}
                              className="h-3.5 w-3.5 sm:h-4 sm:w-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                            />
                            <span className="ml-2 sm:ml-3 text-xs sm:text-sm text-slate-700 group-hover:text-slate-900">
                              {location.name}
                            </span>
                          </label>
                        ))
                      ) : (
                        <p className="text-xs sm:text-sm text-slate-500 text-center py-4">
                          {assignmentMode === "single" && singleUser
                            ? "All locations are already assigned to this user"
                            : "No locations found"}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Selected Locations Display */}
              {selectedLocations.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5 sm:gap-2">
                  {selectedLocations.map((location) => (
                    <span
                      key={location.id}
                      className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium"
                    >
                      <span className="truncate max-w-[150px]">
                        {location.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleLocationSelect(location)}
                        className="hover:text-indigo-900 flex-shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 sm:pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={isLoading || isValidating}
                className={`w-full px-4 py-2.5 sm:py-3 font-semibold text-white text-sm sm:text-base rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2 ${assignmentMode === "multi"
                  ? "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
                  : "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                  }`}
              >
                {isValidating ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Validating...</span>
                  </>
                ) : isLoading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Creating Assignments...</span>
                  </>
                ) : assignmentMode === "multi" ? (
                  `Create ${selectedUsers.length * selectedLocations.length
                  } Assignment${selectedUsers.length * selectedLocations.length !== 1
                    ? "s"
                    : ""
                  }`
                ) : (
                  `Assign ${selectedLocations.length} Location${selectedLocations.length !== 1 ? "s" : ""
                  }`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddAssignmentPage;
