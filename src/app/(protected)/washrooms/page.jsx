"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Search, X, Plus, AlertTriangle, CheckCircle, Power, PowerOff, Users, EllipsisVertical } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi";
import LocationActionsMenu from './components/LocationActionsMenu'
import { useSelector } from "react-redux";
function WashroomsPage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");
  const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
  const [amenitiesModal, setAmenitiesModal] = useState({ open: false, location: null });
  const [actionsMenuOpen, setActionsMenuOpen] = useState(null); // Changed to track which row
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const { companyId } = useCompanyId();
  const actionsMenuRef = useRef(null);
  const [statusModal, setStatusModal] = useState({ open: false, location: null });


  // Add these new states for facility company filtering
  const [facilityCompanyId, setFacilityCompanyId] = useState("");
  const [facilityCompanyName, setFacilityCompanyName] = useState("");
  const [facilityCompanies, setFacilityCompanies] = useState([]);


  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const isPermitted = userRoleId === 1 || userRoleId === 2;


  // ✅ Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setActionsMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchList = async () => {
    setLoading(true);
    try {
      const response = await LocationsApi.getAllLocations(companyId, true);
      setList(response.data);
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Failed to fetch washrooms");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping fetch - companyId not ready:', companyId);
      setLoading(false);
      return;
    }

    fetchList();
  }, [companyId]);

  // Enhanced search
  useEffect(() => {
    let filtered = [...list];

    if (facilityCompanyId) {
      filtered = filtered.filter((item) => {
        // Compare as strings since IDs might be strings or numbers
        return String(item.facility_companiesId) === String(facilityCompanyId);
      });
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        if (item.name.toLowerCase().includes(query)) return true;

        if (item.options) {
          if (item.options.genderAccess && Array.isArray(item.options.genderAccess)) {
            if (item.options.genderAccess.some(gender => gender.toLowerCase().includes(query))) {
              return true;
            }
          }

          const amenityKeywords = {
            'paid': 'isPaid',
            '24': 'is24Hours',
            '24/7': 'is24Hours',
            'attendant': 'hasAttendant',
            'hand dryer': 'hasHandDryer',
            'dryer': 'hasHandDryer',
            'sanitary': 'hasSanitaryProducts',
            'handicap': 'isHandicapAccessible',
            'wheelchair': 'isHandicapAccessible',
            'accessible': 'isHandicapAccessible',
            'male': 'genderAccess',
            'female': 'genderAccess',
            'unisex': 'genderAccess',
          };

          for (const [keyword, optionKey] of Object.entries(amenityKeywords)) {
            if (query.includes(keyword)) {
              if (optionKey === 'genderAccess') {
                if (item.options.genderAccess && item.options.genderAccess.some(g => g.toLowerCase().includes(keyword))) {
                  return true;
                }
              } else if (item.options[optionKey] === true) {
                return true;
              }
            }
          }
        }

        return false;
      });
    }

    if (minRating) {
      filtered = filtered.filter(
        (item) =>
          item.averageRating !== null &&
          parseFloat(item.averageRating) >= parseFloat(minRating)
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredList(filtered);
  }, [searchQuery, minRating, sortOrder, list, facilityCompanyId]);


  // Read facility company from sessionStorage on mount
  useEffect(() => {
    const storedFacilityCompanyId = sessionStorage.getItem('selectedFacilityCompanyId');
    const storedFacilityCompanyName = sessionStorage.getItem('selectedFacilityCompanyName');

    if (storedFacilityCompanyId) {
      setFacilityCompanyId(storedFacilityCompanyId);
      setFacilityCompanyName(storedFacilityCompanyName);
    }
  }, []);


  // Fetch facility companies for dropdown
  useEffect(() => {
    const fetchFacilityCompanies = async () => {
      try {
        const response = await FacilityCompanyApi.getAll(companyId);
        if (response.success) {
          setFacilityCompanies(response.data);
        }
      } catch (error) {
        console.error("Error fetching facility companies:", error);
      }
    };

    if (companyId && companyId !== 'null' && companyId !== null) {
      fetchFacilityCompanies();
    }
  }, [companyId]);

  const handleViewLocation = (lat, lng) => {
    window.open(`https://maps.google.com/?q=${lat},${lng}`, "_blank");
  };

  const handleView = (id) => {
    router.push(`/washrooms/item/${id}?companyId=${companyId}`);
  };

  const handleAddToilet = () => {
    router.push(`/washrooms/add-location?companyId=${companyId}`);
  };

  // ✅ FIXED: Toggle status handler with proper null handling
  // const handleToggleStatus = async (location) => {
  //   setTogglingStatus(location.id);

  //   try {
  //     const response = await LocationsApi.toggleStautsLocations(location.id);

  //     if (response.success) {
  //       // ✅ Get the new status from the API response
  //       const newStatus = response.data?.data?.status;

  //       console.log('Toggle response:', response);
  //       console.log('New status from API:', newStatus);

  //       toast.success(`Washroom ${newStatus ? 'enabled' : 'disabled'} successfully`);

  //       // ✅ Update the list with the actual returned status
  //       setList(prevList =>
  //         prevList.map(item =>
  //           item.id === location.id ? { ...item, status: newStatus } : item
  //         )
  //       );
  //     } else {
  //       toast.error(response.error || "Failed to toggle status");
  //     }
  //   } catch (error) {
  //     console.error('Toggle status error:', error);
  //     toast.error("Failed to toggle status");
  //   } finally {
  //     setTogglingStatus(null);
  //   }
  // };

  // ✅ UPDATED: Toggle status handler with detailed logging
  const handleToggleStatus = async (location) => {
    setTogglingStatus(location.id);

    try {
      console.log('Toggle status for location:', location.id);
      console.log('Current status before toggle:', location.status);

      const response = await LocationsApi.toggleStautsLocations(location.id);

      console.log('Full API response:', response);
      console.log('Response data:', response.data);

      if (response.success) {
        // ✅ Try multiple paths to get the new status
        let newStatus = null;

        // Path 1: response.data.data.status
        if (response.data?.data?.status !== undefined) {
          newStatus = response.data.data.status;
          console.log('Got status from response.data.data.status:', newStatus);
        }
        // Path 2: response.data.status
        else if (response.data?.status !== undefined) {
          newStatus = response.data.status;
          console.log('Got status from response.data.status:', newStatus);
        }
        // Path 3: Calculate opposite of current status
        else {
          newStatus = !(location.status === true || location.status === null);
          console.log('Calculated status as opposite of current:', newStatus);
        }

        console.log('Final new status to set:', newStatus);

        toast.success(`Washroom ${newStatus ? 'enabled' : 'disabled'} successfully`);

        // ✅ Update the list with the new status
        setList(prevList => {
          const updated = prevList.map(item => {
            if (item.id === location.id) {
              console.log('Updating item:', item.id, 'from', item.status, 'to', newStatus);
              return { ...item, status: newStatus };
            }
            return item;
          });
          return updated;
        });
      } else {
        console.error('API returned success: false');
        toast.error(response.error || "Failed to toggle status");
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      console.error('Error details:', error.response?.data);
      toast.error("Failed to toggle status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const confirmStatusToggle = async () => {
    if (!statusModal.location) return;

    const location = statusModal.location;
    setTogglingStatus(location.id);

    try {
      console.log('Toggle status for location:', location.id);
      console.log('Current status before toggle:', location.status);

      const response = await LocationsApi.toggleStautsLocations(location.id);

      console.log('Full API response:', response);

      if (response.success) {
        let newStatus = null;

        if (response.data?.data?.status !== undefined) {
          newStatus = response.data.data.status;
        } else if (response.data?.status !== undefined) {
          newStatus = response.data.status;
        } else {
          newStatus = !(location.status === true || location.status === null);
        }

        toast.success(`Washroom ${newStatus ? 'enabled' : 'disabled'} successfully`);

        setList(prevList =>
          prevList.map(item =>
            item.id === location.id ? { ...item, status: newStatus } : item
          )
        );

        setStatusModal({ open: false, location: null });
      } else {
        toast.error(response.error || "Failed to toggle status");
      }
    } catch (error) {
      console.error('Toggle status error:', error);
      toast.error("Failed to toggle status");
    } finally {
      setTogglingStatus(null);
    }
  };

  const handleDelete = (location) => {
    setDeleteModal({ open: true, location });
  };

  const confirmDelete = async () => {
    if (!deleteModal.location) return;

    const locationId = deleteModal.location.id;
    const locationName = deleteModal.location.name;

    setDeleting(true);

    try {
      const response = await LocationsApi.deleteLocation(locationId, companyId, true);

      if (response && response.success) {
        toast.success(`"${locationName}" deleted successfully`);
        setList(prevList => prevList.filter(item => item.id !== locationId));
        setDeleteModal({ open: false, location: null });
      } else {
        toast.error(response.error || "Failed to delete washroom");
      }
    } catch (error) {
      console.error("Exception during delete:", error);
      toast.error("Failed to delete washroom");
    } finally {
      setDeleting(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setMinRating("");
    setSortOrder("desc");
    setFacilityCompanyId("");
    setFacilityCompanyName("");

    // Clear from sessionStorage
    sessionStorage.removeItem('selectedFacilityCompanyId');
    sessionStorage.removeItem('selectedFacilityCompanyName');
  };

  const renderEmojiRating = (rating, reviewCount = 0) => {
    const actualRating = rating || 0;
    const getEmojiAndColor = (rating) => {
      if (rating >= 7.5) return { emoji: "", color: "text-emerald-600", bg: "bg-emerald-50", label: "Amazing" };
      if (rating >= 4) return { emoji: "", color: "text-orange-600", bg: "bg-orange-50", label: "Great" };
      if (rating >= 3) return { emoji: "", color: "text-yellow-600", bg: "bg-yellow-50", label: "Okay" };
      if (rating >= 2) return { emoji: "", color: "text-red-600", bg: "bg-orange-50", label: "Poor" };
      if (rating > 0) return { emoji: "", color: "text-red-600", bg: "bg-red-50", label: "Terrible" };
      return { emoji: "", color: "text-slate-500", bg: "bg-slate-100", label: "0" };
    };

    const { emoji, color, bg, label } = getEmojiAndColor(actualRating);
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${bg}`}>
        <span className="text-lg">{emoji}</span>
        <div className="flex flex-col">
          <div className={`font-semibold text-sm ${color}`}>
            {actualRating > 0 ? actualRating.toFixed(1) : ""} {label}
          </div>
          {reviewCount > 0 && (
            <div className="text-xs text-slate-500">
              {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
            </div>
          )}
        </div>
      </div>
    );
  };

  // ✅ UPDATED: Show first 2 amenities with badge
  const renderAmenitiesBadge = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return <span className="text-xs text-slate-400">No amenities</span>;
    }

    const amenities = [];

    // Collect gender access
    if (options.genderAccess && Array.isArray(options.genderAccess)) {
      options.genderAccess.forEach(gender => {
        amenities.push({ type: 'gender', value: gender });
      });
    }

    // Collect other amenities
    const amenityLabels = {
      isPaid: '💰 Paid',
      is24Hours: '🕒 24/7',
      hasAttendant: '👨‍💼 Attendant',
      hasHandDryer: '💨 Dryer',
      hasSanitaryProducts: '🧼 Sanitary',
      isHandicapAccessible: '♿ Accessible',
    };

    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'genderAccess' && typeof value === 'boolean' && value === true && amenityLabels[key]) {
        amenities.push({ type: 'facility', value: amenityLabels[key] });
      }
    });

    const displayAmenities = amenities.slice(0, 2);
    const remainingCount = amenities.length - 2;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {displayAmenities.map((amenity, idx) => (
          <span
            key={idx}
            className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
          >
            {amenity.type === 'gender' ? `👤 ${amenity.value}` : amenity.value}
          </span>
        ))}
        {remainingCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAmenitiesModal({ open: true, location: { options } });
            }}
            className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium hover:bg-slate-200 transition-colors"
          >
            +{remainingCount} more
          </button>
        )}
        {amenities.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setAmenitiesModal({ open: true, location: { options } });
            }}
            className="text-blue-600 hover:text-blue-700 text-xs"
          >
            View all
          </button>
        )}
      </div>
    );
  };

  // Render full amenities list in modal
  const renderAmenitiesList = (options) => {
    if (!options || Object.keys(options).length === 0) {
      return <p className="text-slate-500 text-sm">No amenities available</p>;
    }

    const amenityLabels = {
      isPaid: { icon: '💰', label: 'Paid Entry' },
      is24Hours: { icon: '🕒', label: '24/7 Open' },
      hasAttendant: { icon: '👨‍💼', label: 'Has Attendant' },
      hasHandDryer: { icon: '💨', label: 'Hand Dryer' },
      hasSanitaryProducts: { icon: '🧼', label: 'Sanitary Products' },
      isHandicapAccessible: { icon: '♿', label: 'Wheelchair Accessible' },
    };

    const genderColors = {
      'male': 'bg-blue-100 text-blue-700',
      'female': 'bg-pink-100 text-pink-700',
      'unisex': 'bg-green-100 text-green-700',
    };

    return (
      <div className="space-y-3">
        {options.genderAccess && Array.isArray(options.genderAccess) && options.genderAccess.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Gender Access</h4>
            <div className="flex flex-wrap gap-2">
              {options.genderAccess.map((gender, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${genderColors[gender] || 'bg-gray-100 text-gray-700'}`}
                >
                  👤 {gender.charAt(0).toUpperCase() + gender.slice(1)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-sm font-semibold text-slate-700 mb-2">Facilities</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(options).map(([key, value]) => {
              if (key === 'genderAccess') return null;
              if (typeof value !== 'boolean' || value !== true) return null;

              const amenity = amenityLabels[key];
              if (!amenity) return null;

              return (
                <div
                  key={key}
                  className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg"
                >
                  <span className="text-lg">{amenity.icon}</span>
                  <span className="text-sm text-slate-700">{amenity.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen px-4">
        <Loader size="large" color="#3b82f6" message="Loading washrooms..." />
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-slate-200 overflow-hidden mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-4 sm:px-6 sm:py-6">
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                      {facilityCompanyName ? `${facilityCompanyName} - Locations` : 'Washroom Locations'}
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm hidden sm:block">
                      {facilityCompanyName
                        ? `Showing locations managed by ${facilityCompanyName}`
                        : 'Manage and view all washroom locations'}
                    </p>
                  </div>

                </div>


                {isPermitted && (
                  <button
                    onClick={handleAddToilet}
                    className="cursor-pointer flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg sm:rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 whitespace-nowrap"
                  >
                    <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden xs:inline">Add Washroom</span>
                    <span className="xs:hidden">Add</span>
                  </button>
                )
                }
              </div>
            </div>

            {/* Filters Section */}
            <div className="p-3 sm:p-4 md:p-6 bg-slate-50 border-b border-slate-200">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by name, gender, amenities (e.g., 'male', 'attendant', 'handicap')..."
                    className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-slate-400"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>


                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3">

                  <select
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
                    value={facilityCompanyId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setFacilityCompanyId(selectedId);

                      // Update facility company name
                      if (selectedId) {
                        const selected = facilityCompanies.find(fc => fc.id === selectedId);
                        setFacilityCompanyName(selected?.name || "");

                        // Update sessionStorage
                        sessionStorage.setItem('selectedFacilityCompanyId', selectedId);
                        sessionStorage.setItem('selectedFacilityCompanyName', selected?.name || "");
                      } else {
                        setFacilityCompanyName("");
                        sessionStorage.removeItem('selectedFacilityCompanyId');
                        sessionStorage.removeItem('selectedFacilityCompanyName');
                      }
                    }}
                  >
                    <option value="">All Facility Companies</option>
                    {facilityCompanies.map((fc) => (
                      <option key={fc.id} value={fc.id}>
                        {fc.name}
                      </option>
                    ))}
                  </select>


                  <select
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    <option value="2">2+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="6">6+ Stars</option>
                    <option value="8">8+ Stars</option>
                  </select>
                  <select
                    className="px-3 py-2 sm:px-4 sm:py-2.5 border border-slate-300 rounded-lg sm:rounded-xl text-xs sm:text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 w-full sm:w-auto"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </select>
                  <button
                    onClick={clearAllFilters}
                    className="col-span-2 sm:col-span-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-slate-600 hover:bg-slate-700 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 shadow-sm hover:shadow-md"
                  >
                    <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>Clear Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              {filteredList.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-600 mb-2">No washrooms found</h3>
                  <p className="text-slate-500">Try adjusting your filters or add a new washroom</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Sr. No.</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Washroom Name</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Rating</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Amenities</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Zone</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-700 text-sm">Created At</th>
                      <th className="text-center py-4 px-6 font-semibold text-slate-700 text-sm">Status & Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredList.map((item, index) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-150"
                      >
                        <td className="py-4 px-6 text-sm text-slate-600 font-medium">
                          {index + 1}
                        </td>
                        <td
                          className="py-4 px-6 cursor-pointer hover:text-blue-600 transition-colors"
                          onClick={() => handleView(item.id)}
                        >
                          <div className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer">
                            {item?.name}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {renderEmojiRating(item.averageRating, item.ratingCount)}
                        </td>
                        <td className="py-4 px-6">
                          {renderAmenitiesBadge(item.options)}
                        </td>
                        <td className="py-4 px-6">
                          {item?.location_types?.name}
                        </td>
                        <td className="py-4 px-6 text-sm text-slate-600">
                          {new Date(item.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2">
                            {/* Status Button */}
                            <button
                              // onClick={() => handleToggleStatus(item)}
                              onClick={() => setStatusModal({ open: true, location: item })}
                              disabled={togglingStatus === item.id}
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(item.status === true || item.status === null)
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {togglingStatus === item.id ? (
                                <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : (item.status === true || item.status === null) ? (
                                <Power className="w-3 h-3" />
                              ) : (
                                <PowerOff className="w-3 h-3" />
                              )}
                              {(item.status === true || item.status === null) ? 'Active' : 'Disabled'}
                            </button>

                            {/* Navigate Icon */}
                            <button
                              onClick={() => handleViewLocation(item.latitude, item.longitude)}
                              className="cursor-pointer p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-150"
                              title="Locate"
                            >
                              <Navigation className="h-4 w-4" />
                            </button>

                            {/* Actions Menu - Dropdown */}

                            <div className="relative" ref={actionsMenuOpen === item.id ? actionsMenuRef : null}>
                              <button
                                onClick={() => setActionsMenuOpen(actionsMenuOpen === item.id ? null : item.id)}
                                className="cursor-pointer p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-150"
                                title="More Actions"
                              >
                                {/* <Users className="h-4 w-4" /> */}
                                <EllipsisVertical className="h-4 w-4" />
                              </button>

                              {/* ✅ Dropdown Menu */}
                              {actionsMenuOpen === item.id && (
                                // <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                                //   <button
                                //     onClick={() => {
                                //       router.push(`/assignments/cleaner?companyId=${companyId}&locationId=${item.id}&locationName=${encodeURIComponent(item.name)}`);
                                //       setActionsMenuOpen(null);
                                //     }}
                                //     className="w-full flex items-center gap-2 px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                                //   >
                                //     <Users className="h-4 w-4 text-blue-600" />
                                //     View Cleaners
                                //   </button>
                                // </div>

                                <LocationActionsMenu
                                  item={item}
                                  onClose={() => setActionsMenuOpen(null)}
                                  onDelete={(location) => {
                                    // Handle delete
                                    setDeleteModal({ open: true, location });
                                  }}
                                  onEdit={(locationId) => {
                                    // Handle edit
                                    router.push(`/locations/${locationId}/edit`);
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-200">
              <div className="flex justify-between items-center text-sm text-slate-600">
                <span className="font-medium">
                  Showing {filteredList.length} of {list.length} washrooms
                </span>
                <span>
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* ✅ UPDATED: Amenities Modal with Blur Background */}
          {amenitiesModal.open && (
            <div
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setAmenitiesModal({ open: false, location: null })}
            >
              <div
                className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">Amenities & Features</h3>
                  <button
                    onClick={() => setAmenitiesModal({ open: false, location: null })}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                {renderAmenitiesList(amenitiesModal.location?.options)}
              </div>
            </div>
          )}

          {/* Status Confirmation Modal */}
          {statusModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${(statusModal.location?.status === true || statusModal.location?.status === null)
                    ? 'bg-red-100'
                    : 'bg-green-100'
                    }`}>
                    {(statusModal.location?.status === true || statusModal.location?.status === null) ? (
                      <PowerOff className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                    ) : (
                      <Power className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                      {(statusModal.location?.status === true || statusModal.location?.status === null)
                        ? 'Disable Washroom'
                        : 'Enable Washroom'}
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      Confirm status change
                    </p>
                  </div>
                </div>

                <div className="mb-5 sm:mb-6">
                  <p className="text-sm sm:text-base text-slate-700">
                    Are you sure you want to {(statusModal.location?.status === true || statusModal.location?.status === null) ? 'disable' : 'enable'} "<strong>{statusModal.location?.name}</strong>"?
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                  <button
                    onClick={() => setStatusModal({ open: false, location: null })}
                    className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    disabled={togglingStatus === statusModal.location?.id}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmStatusToggle}
                    disabled={togglingStatus === statusModal.location?.id}
                    className={`w-full sm:w-auto px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium ${(statusModal.location?.status === true || statusModal.location?.status === null)
                      ? 'bg-red-600 hover:bg-red-700 disabled:bg-red-400'
                      : 'bg-green-600 hover:bg-green-700 disabled:bg-green-400'
                      }`}
                  >
                    {togglingStatus === statusModal.location?.id && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {togglingStatus === statusModal.location?.id
                      ? 'Processing...'
                      : (statusModal.location?.status === true || statusModal.location?.status === null)
                        ? 'Disable'
                        : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Modal */}
          {deleteModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl sm:rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl">
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                  <div className="p-2 sm:p-3 bg-red-100 rounded-full flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-slate-800 mb-1">
                      Delete Washroom
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm">
                      This action cannot be undone
                    </p>
                  </div>
                </div>

                <div className="mb-5 sm:mb-6">
                  <p className="text-sm sm:text-base text-slate-700">
                    Are you sure you want to delete "<strong>{deleteModal.location?.name}</strong>"?
                  </p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end">
                  <button
                    onClick={() => setDeleteModal({ open: false, location: null })}
                    className="w-full sm:w-auto px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                    disabled={deleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={deleting}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-red-400 font-medium"
                  >
                    {deleting && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    {deleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default WashroomsPage;
