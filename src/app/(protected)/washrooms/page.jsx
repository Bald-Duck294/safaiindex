"use client";

import React, { useEffect, useState, useRef } from "react";
import { MapPin, Navigation, Search, X, Plus, AlertTriangle, Power, PowerOff, Users, EllipsisVertical, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import LocationsApi from "@/lib/api/LocationApi";
import { useCompanyId } from '@/lib/providers/CompanyProvider';
import { useRouter } from "next/navigation";
import Loader from "@/components/ui/Loader";
import toast, { Toaster } from "react-hot-toast";
import FacilityCompanyApi from "@/lib/api/facilityCompanyApi";
import LocationActionsMenu from './components/LocationActionsMenu';
import { useSelector } from "react-redux";
import locationTypesApi from "@/lib/api/locationTypesApi";
import { usePermissions } from "@/lib/hooks/usePermissions";
import { MODULES } from "@/lib/constants/permissions";
import { useRequirePermission } from "@/lib/hooks/useRequirePermission";
function WashroomsPage() {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [nameSortOrder, setNameSortOrder] = useState(null); // null, 'asc', 'desc'
  const [currentScoreSortOrder, setCurrentScoreSortOrder] = useState(null);
  const [avgScoreSortOrder, setAvgScoreSortOrder] = useState(null);
  const [statusSortOrder, setStatusSortOrder] = useState(null);

  const [deleteModal, setDeleteModal] = useState({ open: false, location: null });
  const [actionsMenuOpen, setActionsMenuOpen] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(null);
  const { companyId } = useCompanyId();
  const actionsMenuRef = useRef(null);
  const [statusModal, setStatusModal] = useState({ open: false, location: null });
  const [locationTypes, setLocationTypes] = useState([]);
  const [selectedLocationTypeId, setSelectedLocationTypeId] = useState("");
  const [facilityCompanyId, setFacilityCompanyId] = useState("");
  const [facilityCompanyName, setFacilityCompanyName] = useState("");
  const [facilityCompanies, setFacilityCompanies] = useState([]);
  const [assignmentFilter, setAssignmentFilter] = useState("");
  const [cleanerModal, setCleanerModal] = useState({ open: false, location: null });

  const router = useRouter();

  const user = useSelector((state) => state.auth.user);
  const userRoleId = user?.role_id;
  const isPermitted = userRoleId === 1 || userRoleId === 2;


  useRequirePermission(MODULES.LOCATIONS);
  const { canView, canAdd, canUpdate, canDelete, hasPermission } = usePermissions();


  // Permission checks for different actions
  const canAddLocation = canAdd(MODULES.LOCATIONS);
  const canEditLocation = canUpdate(MODULES.LOCATIONS);
  const canDeleteLocation = canDelete(MODULES.LOCATIONS);
  const canToggleStatus = hasPermission(MODULES.LOCATIONS, 'toggle_status');
  const canAssignCleaner = canAdd(MODULES.ASSIGNMENTS);

  const getRatingColor = (rating) => {
    const actualRating = rating || 0;
    if (actualRating >= 7.5) return { color: "text-emerald-600", bg: "bg-emerald-50", label: "Amazing" };
    if (actualRating >= 5) return { color: "text-orange-600", bg: "bg-orange-50", label: "Great" };
    if (actualRating >= 3) return { color: "text-yellow-600", bg: "bg-yellow-50", label: "Okay" };
    if (actualRating >= 2) return { color: "text-red-600", bg: "bg-orange-50", label: "Poor" };
    if (actualRating > 0) return { color: "text-red-600", bg: "bg-red-50", label: "Terrible" };
    return { color: "text-slate-500", bg: "bg-slate-100", label: "No rating" };
  };

  const renderRating = (rating, reviewCount = 0) => {
    if (!rating) {
      return <span className="text-sm text-slate-400">—</span>;
    }

    const smartRound = (rating) => {
      const rounded = Math.round(rating * 10) / 10;
      return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    };

    const { color, bg, label } = getRatingColor(rating);

    return (
      <div className={`inline-flex flex-col items-center gap-0.5 px-3 py-1.5 ${bg} rounded-lg`}>
        <div className="flex items-center gap-1.5">
          <span className={`font-bold text-base ${color}`}>
            {smartRound(rating)}
          </span>
          <span className={`text-xs font-medium ${color}`}>{label}</span>
        </div>
        {reviewCount > 0 && (
          <span className="text-xs text-slate-500">
            {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
          </span>
        )}
      </div>
    );
  };

  // ✅ NEW: Handle column-specific sorting
  const handleSort = (column) => {
    // Reset all other sorts
    setNameSortOrder(null);
    setCurrentScoreSortOrder(null);
    setAvgScoreSortOrder(null);
    setStatusSortOrder(null);

    console.log('Sorting by column:', column);
    switch (column) {
      case 'name':
        const newNameOrder = nameSortOrder === 'asc' ? 'desc' : 'asc';
        setNameSortOrder(newNameOrder);
        setSortBy(newNameOrder === 'asc' ? 'nameAsc' : 'nameDesc');
        break;

      case 'currentScore':
        const newCurrentScoreOrder = currentScoreSortOrder === 'desc' ? 'asc' : 'desc';
        setCurrentScoreSortOrder(newCurrentScoreOrder);
        setSortBy(newCurrentScoreOrder === 'desc' ? 'currentScoreDesc' : 'currentScoreAsc');
        break;

      case 'avgScore':
        const newAvgScoreOrder = avgScoreSortOrder === 'desc' ? 'asc' : 'desc';
        setAvgScoreSortOrder(newAvgScoreOrder);
        setSortBy(newAvgScoreOrder === 'desc' ? 'avgScoreDesc' : 'avgScoreAsc');
        break;

      case 'status':
        const newStatusOrder = statusSortOrder === 'active' ? 'inactive' : 'active';
        setStatusSortOrder(newStatusOrder);
        setSortBy(newStatusOrder === 'active' ? 'statusActive' : 'statusInactive');
        break;
    }
  };


  useEffect(() => {
    handleSort('name');
  }, [])


  // ✅ NEW: Render sort icon
  const renderSortIcon = (currentOrder) => {
    if (!currentOrder) {
      return (
        <ArrowUpDown className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
      );
    }
    if (currentOrder === 'asc' || currentOrder === 'active') {
      return <ArrowUp className="w-4 h-4 text-blue-600" />;
    }
    return <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sortByParam = searchParams.get('sortBy');
    const facilityCompanyIdParam = searchParams.get('facilityCompanyId');
    const facilityCompanyNameParam = searchParams.get('facilityCompanyName');

    if (sortByParam === 'currentScore') {
      setSortBy('currentScoreDesc');
      setCurrentScoreSortOrder('desc');
    }

    if (facilityCompanyIdParam) {
      setFacilityCompanyId(facilityCompanyIdParam);
      if (facilityCompanyNameParam) {
        setFacilityCompanyName(decodeURIComponent(facilityCompanyNameParam));
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionsMenuRef.current && !actionsMenuRef.current.contains(event.target)) {
        setActionsMenuOpen(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchLocationTypes = async () => {
      try {
        const response = await locationTypesApi.getAll(companyId);
        setLocationTypes(response);
      } catch (error) {
        console.error("Error fetching location types:", error);
      }
    };

    if (companyId && companyId !== 'null' && companyId !== null) {
      fetchLocationTypes();
    }
  }, [companyId]);

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
      setLoading(false);
      return;
    }
    fetchList();
  }, [companyId]);

  // ✅ UPDATED: Enhanced sorting logic
  useEffect(() => {
    let filtered = [...list];

    if (selectedLocationTypeId) {
      filtered = filtered.filter((item) => String(item.type_id) === String(selectedLocationTypeId));
    }

    if (facilityCompanyId) {
      filtered = filtered.filter((item) => String(item.facility_companiesId) === String(facilityCompanyId));
    }

    if (assignmentFilter === "assigned") {
      filtered = filtered.filter((item) => item.cleaner_assignments && item.cleaner_assignments.length > 0);
    } else if (assignmentFilter === "unassigned") {
      filtered = filtered.filter((item) => !item.cleaner_assignments || item.cleaner_assignments.length === 0);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(query));
    }

    if (minRating) {
      filtered = filtered.filter((item) => item.averageRating !== null && parseFloat(item.averageRating) >= parseFloat(minRating));
    }

    // ✅ UPDATED: Enhanced sorting with new options
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'currentScoreDesc':
          return (b.currentScore || 0) - (a.currentScore || 0);
        case 'currentScoreAsc':
          return (a.currentScore || 0) - (b.currentScore || 0);

        case 'avgScoreDesc':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'avgScoreAsc':
          return (a.averageRating || 0) - (b.averageRating || 0);

        case 'nameAsc':
          return a.name.localeCompare(b.name);
        case 'nameDesc':
          return b.name.localeCompare(a.name);

        case 'statusActive':
          // Active first (true/null), then inactive (false)
          const aStatus = a.status === true || a.status === null ? 1 : 0;
          const bStatus = b.status === true || b.status === null ? 1 : 0;
          return bStatus - aStatus;
        case 'statusInactive':
          // Inactive first (false), then active (true/null)
          const aStatusInactive = a.status === true || a.status === null ? 0 : 1;
          const bStatusInactive = b.status === true || b.status === null ? 0 : 1;
          return bStatusInactive - aStatusInactive;

        case 'asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'desc':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    setFilteredList(filtered);
  }, [searchQuery, minRating, sortBy, list, facilityCompanyId, selectedLocationTypeId, assignmentFilter]);

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

  const handleAssignWashroom = () => {
    router.push(`/cleaner-assignments/add?companyId=${companyId}`);
  };

  const confirmStatusToggle = async () => {
    if (!statusModal.location) return;
    const location = statusModal.location;
    setTogglingStatus(location.id);

    try {
      const response = await LocationsApi.toggleStautsLocations(location.id);

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
        setList(prevList => prevList.map(item => item.id === location.id ? { ...item, status: newStatus } : item));
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
    setFacilityCompanyId("");
    setFacilityCompanyName("");
    setSelectedLocationTypeId("");
    setAssignmentFilter("");
    setSortBy("desc");
    setNameSortOrder(null);
    setCurrentScoreSortOrder(null);
    setAvgScoreSortOrder(null);
    setStatusSortOrder(null);
  };

  const renderCleanerBadge = (locationName, cleaners) => {
    if (!cleaners || cleaners.length === 0) {
      return <span className="text-sm text-slate-400">No cleaners</span>;
    }

    const firstName = cleaners[0].cleaner_user?.name || "Cleaner";

    if (cleaners.length === 1) {
      return <span className="text-sm text-slate-700 font-medium">{firstName}</span>;
    }

    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-700 font-medium">{firstName}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCleanerModal({ open: true, location: { name: locationName, cleaners } });
          }}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          +{cleaners.length - 1} more
        </button>
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

      <div className="min-h-screen bg-slate-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-4 sm:mb-6">
            <div className="bg-slate-800 px-4 py-4 sm:px-6 sm:py-5">
              <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                  <div className="p-1.5 sm:p-2 bg-white/10 rounded-lg flex-shrink-0">
                    <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
                      Washroom Locations
                    </h1>
                    <p className="text-slate-300 text-xs sm:text-sm">
                      Overview of location details, cleaner assignments, and facility ratings
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {canAddLocation && (
                    <button
                      onClick={handleAddToilet}
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-2 sm:px-4 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Add Location</span>
                    </button>
                  )}

                  {canAssignCleaner && (
                    <button
                      onClick={handleAssignWashroom}
                      className="cursor-pointer flex items-center gap-1.5 px-3 py-2 sm:px-4 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-all shadow-sm"
                    >
                      <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Assign</span>
                    </button>
                  )}
                </div>

              </div>
            </div>

            {/* Filters Section */}
            <div className="p-3 sm:p-4 md:p-5 bg-slate-50/50 border-b border-slate-200">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search washrooms..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex gap-1 bg-white border border-slate-300 rounded-lg p-1">
                    <button
                      onClick={() => setAssignmentFilter("")}
                      className={`cursor-pointer px-3 py-2 rounded text-sm font-medium transition-all ${assignmentFilter === "" ? 'bg-slate-700 text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setAssignmentFilter("assigned")}
                      className={`cursor-pointer px-3 py-2 rounded text-sm font-medium transition-all ${assignmentFilter === "assigned" ? 'bg-emerald-600 text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      Assigned
                    </button>
                    <button
                      onClick={() => setAssignmentFilter("unassigned")}
                      className={`cursor-pointer px-3 py-2 rounded text-sm font-medium transition-all ${assignmentFilter === "unassigned" ? 'bg-orange-600 text-white' : 'bg-transparent text-slate-600 hover:bg-slate-100'
                        }`}
                    >
                      Unassigned
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <select
                    className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={selectedLocationTypeId}
                    onChange={(e) => setSelectedLocationTypeId(e.target.value)}
                  >
                    <option value="">All Types</option>
                    {locationTypes.map((type) => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>

                  <select
                    className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={facilityCompanyId}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      setFacilityCompanyId(selectedId);
                      if (selectedId) {
                        const selected = facilityCompanies.find(fc => fc.id === selectedId);
                        setFacilityCompanyName(selected?.name || "");
                      } else {
                        setFacilityCompanyName("");
                      }
                    }}
                  >
                    <option value="">All Facility Companies</option>
                    {facilityCompanies.map((fc) => (
                      <option key={fc.id} value={fc.id}>{fc.name}</option>
                    ))}
                  </select>

                  <select
                    className="cursor-pointer px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    value={minRating}
                    onChange={(e) => setMinRating(e.target.value)}
                  >
                    <option value="">All Ratings</option>
                    <option value="2">2+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="6">6+ Stars</option>
                    <option value="8">8+ Stars</option>
                  </select>

                  <button
                    onClick={clearAllFilters}
                    className="cursor-pointer flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-all"
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {/* ✅ UPDATED: Table Header with sortable columns */}
            <div className="grid grid-cols-[60px_2fr_1.3fr_1.2fr_1.2fr_1.3fr_1.2fr_auto] gap-3 bg-slate-100 text-slate-700 px-4 py-3 text-sm font-semibold border-b border-slate-200">
              <div className="text-center">Sr No</div>

              {/* ✅ Sortable Name Column */}
              <button
                onClick={() => handleSort('name')}
                className="text-left hover:text-blue-600 transition-colors flex items-center gap-1.5 group"
              >
                <span>Washroom Name</span>
                {renderSortIcon(nameSortOrder)}
              </button>

              <div>Zone Name</div>

              {/* ✅ Sortable Current Score Column */}
              <button
                onClick={() => handleSort('currentScore')}
                className="text-center hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 group"
              >
                <span>Current Score</span>
                {renderSortIcon(currentScoreSortOrder)}
              </button>

              {/* ✅ Sortable Average Rating Column */}
              <button
                onClick={() => handleSort('avgScore')}
                className="text-center hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 group"
              >
                <span>Average Rating</span>
                {renderSortIcon(avgScoreSortOrder)}
              </button>

              <div>Cleaner Name</div>
              <div>Facility Company</div>

              {/* ✅ Sortable Status Column */}
              <button
                onClick={() => handleSort('status')}
                className="text-center hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 group"
              >
                <span>Status & Action</span>
                {renderSortIcon(statusSortOrder)}
              </button>
            </div>

            {/* Table Body - remains the same */}
            <div className="divide-y divide-slate-200">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MapPin className="h-8 w-8 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-600 mb-2">No washrooms found</h3>
                  <p className="text-sm text-slate-500">Try adjusting your search filters</p>
                </div>
              ) : (
                filteredList.map((item, index) => (
                  <div
                    key={item.id}
                    onClick={() => handleView(item.id)}
                    className="grid grid-cols-[60px_2fr_1.3fr_1.2fr_1.2fr_1.3fr_1.2fr_auto] gap-3 px-4 py-4 hover:bg-slate-50 transition-colors items-center cursor-pointer"
                  >
                    <div className="flex justify-center">
                      <span className="w-8 h-8 flex items-center justify-center bg-slate-700 text-white text-sm font-semibold rounded">
                        {index + 1}
                      </span>
                    </div>

                    <div>
                      <span className="font-semibold text-slate-800 text-sm">
                        {item.name}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <div>
                      {item?.location_types?.name ? (
                        <span className="inline-flex items-center text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md font-medium">
                          {item.location_types.name}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </div>

                    <div className="text-center">
                      {renderRating(item.currentScore, 0)}
                    </div>

                    <div className="text-center">
                      {renderRating(item.averageRating, item.ratingCount)}
                    </div>

                    <div>
                      {renderCleanerBadge(item.name, item.cleaner_assignments)}
                    </div>

                    <div>
                      {item.facility_companies?.name ? (
                        <span className="text-sm text-slate-700">{item.facility_companies.name}</span>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {canToggleStatus && (
                        <button
                          onClick={() => setStatusModal({ open: true, location: item })}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${(item.status === true || item.status === null) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {(item.status === true || item.status === null) ? <Power className="w-3 h-3" /> : <PowerOff className="w-3 h-3" />}
                          {(item.status === true || item.status === null) ? 'Active' : 'Inactive'}
                        </button>
                      )}


                      <button
                        onClick={() => handleViewLocation(item.latitude, item.longitude)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Navigation className="h-4 w-4" />
                      </button>

                      <div className="relative" ref={actionsMenuOpen === item.id ? actionsMenuRef : null}>
                        <button
                          onClick={() => setActionsMenuOpen(actionsMenuOpen === item.id ? null : item.id)}
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                        >
                          <EllipsisVertical className="h-4 w-4" />
                        </button>
                        {actionsMenuOpen === item.id && (
                          <LocationActionsMenu
                            item={item}
                            onClose={() => setActionsMenuOpen(null)}
                            onDelete={(location) => setDeleteModal({ open: true, location })}
                            onEdit={(locationId) => router.push(`/locations/${locationId}/edit`)}
                            location_id={item.id}
                            canDeleteLocation={canDeleteLocation}
                            canEditLocation={canEditLocation}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Mobile/Tablet Card View - remains the same */}
          <div className="lg:hidden">
            {filteredList.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No washrooms found</h3>
                <p className="text-sm text-slate-500">Try adjusting your search filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredList.map((item, index) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleView(item.id)}
                  >
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 bg-slate-700 text-white rounded flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-800 text-sm truncate">{item.name}</h3>
                          <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setStatusModal({ open: true, location: item })}
                          className={`p-1.5 rounded transition-all ${(item.status === true || item.status === null) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                            }`}
                        >
                          {(item.status === true || item.status === null) ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleViewLocation(item.latitude, item.longitude)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Navigation className="h-4 w-4" />
                        </button>
                        <div className="relative" ref={actionsMenuOpen === item.id ? actionsMenuRef : null}>
                          <button
                            onClick={() => setActionsMenuOpen(actionsMenuOpen === item.id ? null : item.id)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded transition-colors"
                          >
                            <EllipsisVertical className="h-4 w-4" />
                          </button>
                          {actionsMenuOpen === item.id && (
                            <LocationActionsMenu
                              item={item}
                              onClose={() => setActionsMenuOpen(null)}
                              onDelete={(location) => setDeleteModal({ open: true, location })}
                              onEdit={(locationId) => router.push(`/locations/${locationId}/edit`)}
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Zone</label>
                        {item?.location_types?.name ? (
                          <span className="inline-flex items-center text-sm text-slate-700 bg-slate-100 px-3 py-1.5 rounded-md font-medium">
                            {item.location_types.name}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Current Score</label>
                          {renderRating(item.currentScore, 0)}
                        </div>
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-1 block">Average Rating</label>
                          {renderRating(item.averageRating, item.ratingCount)}
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Cleaner</label>
                        {renderCleanerBadge(item.name, item.cleaner_assignments)}
                      </div>

                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-1 block">Facility Company</label>
                        {item.facility_companies?.name ? (
                          <span className="text-sm text-slate-700 font-medium">{item.facility_companies.name}</span>
                        ) : (
                          <span className="text-sm text-slate-400">N/A</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modals - remain the same */}
          {cleanerModal.open && (
            // console.log("cleaner modal", cleanerModal),
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setCleanerModal({ open: false, location: null })}>
              <div className="bg-white rounded-xl max-w-md w-full max-h-[85vh] overflow-y-scroll p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">{cleanerModal.location?.name} - Assigned Cleaners</h3>
                  <button onClick={() => setCleanerModal({ open: false, location: null })} className="text-slate-400 hover:text-slate-600">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {cleanerModal.location?.cleaners?.map((assignment) => (
                    <div key={assignment.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm truncate">{assignment.cleaner_user?.name || "Unknown"}</p>
                        {assignment.cleaner_user?.phone && <p className="text-xs text-slate-500">{assignment.cleaner_user.phone}</p>}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${assignment.status === 'assigned' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {assignment.status || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {statusModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`p-3 rounded-full ${(statusModal.location?.status === true || statusModal.location?.status === null) ? 'bg-red-100' : 'bg-green-100'}`}>
                    {(statusModal.location?.status === true || statusModal.location?.status === null) ? <PowerOff className="h-6 w-6 text-red-600" /> : <Power className="h-6 w-6 text-green-600" />}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      {(statusModal.location?.status === true || statusModal.location?.status === null) ? 'Disable' : 'Enable'} Washroom
                    </h3>
                    <p className="text-slate-600 text-sm">Confirm status change</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-700">
                    Are you sure you want to {(statusModal.location?.status === true || statusModal.location?.status === null)
                      ? 'disable'
                      : 'enable'
                    }
                    <strong> "{statusModal.location?.name}"</strong>?
                  </p>

                  {(statusModal.location?.status === true || statusModal.location?.status === null) && (
                    <p className="text-sm text-red-600 mt-2 bg-red-50 p-3 rounded-md border border-red-200">
                      ⚠️ Disabling this washroom will automatically <strong>unassign all cleaners</strong> currently assigned to it.
                      <br />
                      They will need to be <strong>manually re-assigned</strong> when the washroom is enabled again.
                    </p>
                  )}

                  {statusModal.location?.status === false && (
                    <p className="text-sm text-blue-700 mt-2 bg-blue-50 p-3 rounded-md border border-blue-200">
                      ℹ️ Enabling this washroom will <strong>not automatically assign cleaners</strong>.
                      <br />
                      Please assign cleaners manually after activation.
                    </p>
                  )}
                </div>

                <div className="flex gap-3 justify-end">
                  <button onClick={() => setStatusModal({ open: false, location: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                  <button
                    onClick={confirmStatusToggle}
                    disabled={togglingStatus === statusModal.location?.id}
                    className={`px-4 py-2 text-white rounded-lg transition-colors flex items-center gap-2 ${(statusModal.location?.status === true || statusModal.location?.status === null) ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
                  >
                    {togglingStatus === statusModal.location?.id && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {togglingStatus === statusModal.location?.id ? 'Processing...' : (statusModal.location?.status === true || statusModal.location?.status === null) ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {deleteModal.open && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Delete Washroom</h3>
                    <p className="text-slate-600 text-sm">This action cannot be undone</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-sm text-slate-700">
                    Are you sure you want to delete "<strong>{deleteModal.location?.name}</strong>"?
                  </p>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setDeleteModal({ open: false, location: null })} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" disabled={deleting}>Cancel</button>
                  <button onClick={confirmDelete} disabled={deleting} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2">
                    {deleting && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
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
