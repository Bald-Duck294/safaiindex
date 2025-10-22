"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { LogOut, Building } from "lucide-react";
import { logout } from "../store/slices/authSlice.js";
import { CompanyApi } from "../lib/api/companyApi";

const Header = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams(); // For dynamic routes like /clientDashboard/[id]
  const searchParams = useSearchParams(); // For query params like ?companyId=87

  // Get the user object from the Redux store
  const { user } = useSelector((state) => state.auth);

  // State for company information
  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // ✅ Get company_id from BOTH sources (params OR searchParams)
  const getCompanyId = () => {
    // Priority 1: Check dynamic route parameter (e.g., /clientDashboard/17)
    if (params.id) {
      return params.id;
    }
    
    // Priority 2: Check query parameter (e.g., ?companyId=87)
    const queryCompanyId = searchParams.get('companyId');
    if (queryCompanyId) {
      return queryCompanyId;
    }
    
    // No company ID found
    return null;
  };

  const companyId = getCompanyId();

  console.log("Company ID from URL:", companyId);
  console.log("Params (dynamic):", params);
  console.log("Search Params (query):", searchParams.get('companyId'));

  // Fetch company information when companyId changes
  useEffect(() => {
    console.log("useEffect triggered - companyId:", companyId);

    if (!companyId || companyId === 'null' || companyId === null) {
      console.log('Skipping fetch - companyId not ready:', companyId);
      setCompany(null);
      return;
    }

    const fetchCompany = async () => {
      console.log('Fetching company with ID:', companyId);

      try {
        setLoadingCompany(true);
        const response = await CompanyApi.getCompanyById(companyId);

        if (response.success) {
          console.log('✅ Company fetched successfully:', response.data.name);
          setCompany(response.data);
        } else {
          console.error('❌ Failed to fetch company:', response.error);
          setCompany(null);
        }
      } catch (error) {
        console.error('❌ Error fetching company:', error);
        setCompany(null);
      } finally {
        setLoadingCompany(false);
      }
    };

    fetchCompany();
  }, [companyId]);

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  // Determine the role text based on user's role_id
  const getRoleText = () => {
    if (!user || !user.role_id) {
      return "User";
    }
    switch (user.role_id) {
      case 1:
        return "Super Admin";
      case 2:
        return "Admin";
      case 3:
        return "Supervisor";
      case 4:
        return "User";
      case 5:
        return "Cleaner";
      default:
        return "User";
    }
  };

  const userRole = getRoleText();

  // Function to get header title - EITHER company name OR dashboard
  const getHeaderTitle = () => {
    // If companyId exists, show company name or loading
    if (companyId) {
      if (loadingCompany) {
        return (
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-slate-600 animate-pulse" />
            <span>Loading...</span>
          </div>
        );
      }

      if (company) {
        return (
          <div className="flex items-center space-x-2">
            <Building className="w-5 h-5 text-blue-600" />
            <span>{company.name}</span>
          </div>
        );
      }

      // Fallback if company fetch failed
      return (
        <div className="flex items-center space-x-2">
          <Building className="w-5 h-5 text-slate-600" />
          <span>Company #{companyId}</span>
        </div>
      );
    }

    // No companyId - show Dashboard
    return "Dashboard";
  };

  return (
    <header className="h-[6.7rem] bg-white border-b border-slate-200 flex items-center justify-between px-6">
      {/* Header Title - EITHER Company Name OR Dashboard */}
      <h2 className="text-xl font-semibold text-slate-800 pl-[2.3rem]">
        {getHeaderTitle()}
      </h2>

      {/* User Info and Logout Section */}
      <div className="flex items-center space-x-4">
        {/* User Name and Role - Hidden on screens smaller than 650px */}
        <div className="text-right hidden sm:block">
          <span className="font-semibold text-sm text-slate-700">
            {user?.name || "Guest"}
          </span>
          <span className="block text-xs text-red-600 font-bold uppercase tracking-wider">
            {userRole}
          </span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-white bg-slate-800 
          rounded-lg hover:bg-slate-900 
          transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
