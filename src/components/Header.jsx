// "use client";

// import React, { useState, useEffect } from "react";
// import { useSelector, useDispatch } from "react-redux";
// import { useRouter, useSearchParams, useParams } from "next/navigation";
// import { LogOut, Building } from "lucide-react";
// import { logout } from "../store/slices/authSlice.js";
// import { CompanyApi } from "../lib/api/companyApi";

// const Header = ({ pageTitle }) => {
//   const dispatch = useDispatch();
//   const router = useRouter();
//   const params = useParams();
//   const searchParams = useSearchParams();

//   const { user } = useSelector((state) => state.auth);

//   const [company, setCompany] = useState(null);
//   const [loadingCompany, setLoadingCompany] = useState(false);

//   // Get company_id from BOTH sources (params OR searchParams)
//   const getCompanyId = () => {
//     const queryCompanyId = searchParams.get('companyId');

//     if (params && queryCompanyId) {
//       return queryCompanyId;
//     }

//     if (params.id) {
//       return params.id;
//     }

//     if (queryCompanyId) {
//       return queryCompanyId;
//     }

//     return null;
//   };

//   const companyId = getCompanyId();

//   // Fetch company information when companyId changes
//   useEffect(() => {
//     if (!companyId || companyId === 'null' || companyId === null) {
//       setCompany(null);
//       return;
//     }

//     const fetchCompany = async () => {
//       try {
//         setLoadingCompany(true);
//         const response = await CompanyApi.getCompanyById(companyId);

//         if (response.success) {
//           setCompany(response.data);
//         } else {
//           console.error('❌ Failed to fetch company:', response.error);
//           setCompany(null);
//         }
//       } catch (error) {
//         console.error('❌ Error fetching company:', error);
//         setCompany(null);
//       } finally {
//         setLoadingCompany(false);
//       }
//     };

//     fetchCompany();
//   }, [companyId]);

//   const handleLogout = () => {
//     dispatch(logout());
//     router.push("/login");
//   };

//   // Determine the role text based on user's role_id
//   const getRoleText = () => {
//     if (!user || !user.role_id) {
//       return "User";
//     }
//     switch (user.role_id) {
//       case 1:
//         return "Super Admin";
//       case 2:
//         return "Admin";
//       case 3:
//         return "Supervisor";
//       case 4:
//         return "User";
//       case 5:
//         return "Cleaner";
//       default:
//         return "User";
//     }
//   };

//   const userRole = getRoleText();

//   // ✅ Smart truncation: Show first and last characters for very long names
//   const truncateCompanyName = (name, maxLength = 40) => {
//     if (!name || name.length <= maxLength) return name;

//     const firstPart = name.substring(0, Math.floor(maxLength / 2) - 2);
//     const lastPart = name.substring(name.length - Math.floor(maxLength / 2) + 2);

//     return `${firstPart}...${lastPart}`;
//   };

//   // ✅ Function to get header title - EITHER company name OR dashboard
//   const getHeaderTitle = () => {
//     if (companyId) {
//       if (loadingCompany) {
//         return (
//           <>
//             <Building className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 animate-pulse flex-shrink-0" />
//             <span className="truncate">Loading...</span>
//           </>
//         );
//       }

//       if (company) {
//         return (
//           <>
//             <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
//             <span
//               className="truncate"
//               title={company.name}
//             >
//               {truncateCompanyName(company.name)}
//             </span>
//           </>
//         );
//       }

//       return (
//         <>
//           <Building className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
//           <span className="truncate">Loading...</span>
//         </>
//       );
//     }

//     return <span className="truncate">Dashboard</span>;
//   };

//   return (
//     <header className="h-16 bg-white shrink-0 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8">
//       {/* Header Title - Centered on mobile, Left-aligned on desktop */}
//       <div className="flex-1 flex items-center justify-center md:justify-start min-w-0 md:pr-4">
//         <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-slate-800 flex items-center gap-2 max-w-full">
//           {getHeaderTitle()}
//         </h2>
//       </div>

//       {/* User Info and Logout Section - Right aligned */}
//       <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0 absolute right-4 md:right-6 lg:right-8 md:relative md:right-0">
//         {/* User Name and Role */}
//         <div className="text-right hidden md:block">
//           <span className="font-semibold text-xs md:text-sm text-slate-700 block truncate max-w-[120px] lg:max-w-[180px]">
//             {user?.name || "Guest"}
//           </span>
//           <span className="block text-[10px] md:text-xs text-red-600 font-bold uppercase tracking-wider">
//             {userRole}
//           </span>
//         </div>

//         {/* Logout Button */}
//         <button
//           onClick={handleLogout}
//           className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 text-xs sm:text-sm font-medium text-white bg-slate-800 
//           rounded-lg hover:bg-slate-900 
//           transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
//         >
//           <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
//           <span className="hidden sm:inline">Logout</span>
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;




"use client";

import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { LogOut, Building } from "lucide-react";
import { logout } from "../store/slices/authSlice.js";
import { CompanyApi } from "../lib/api/companyApi";
import NotificationBell from "./NotificationBell";
// import useNotifications from "../hooks/useNotifications"
import useNotifications from "@/lib/hooks/useNotifications.js";
import { useDeleteFCMTokenMutation, useSaveFCMTokenMutation } from "@/store/slices/notificationApi.js";
import { deleteFCMToken } from "@/lib/firebase/fcm.js";
import { resetNotifications } from "@/store/slices/notificationSlice.js";
const Header = ({ pageTitle }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [deleteFcmTokenFromBackend] = useDeleteFCMTokenMutation();

  const { user } = useSelector((state) => state.auth);

  // ✅ Initialize notifications (FCM listener)
  useNotifications(); // ← ADD THIS

  const [company, setCompany] = useState(null);
  const [loadingCompany, setLoadingCompany] = useState(false);

  // Get company_id from BOTH sources (params OR searchParams)
  const getCompanyId = () => {
    const queryCompanyId = searchParams.get('companyId');

    if (params && queryCompanyId) {
      return queryCompanyId;
    }

    if (params.id) {
      return params.id;
    }

    if (queryCompanyId) {
      return queryCompanyId;
    }

    return null;
  };

  const companyId = getCompanyId();

  // Fetch company information when companyId changes
  useEffect(() => {
    if (!companyId || companyId === 'null' || companyId === null) {
      setCompany(null);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoadingCompany(true);
        const response = await CompanyApi.getCompanyById(companyId);

        if (response.success) {
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

  const handleLogout = async () => {

    try {
      await deleteFCMToken();

      if (user?.id) {

        try {
          await deleteFcmTokenFromBackend({ userId: user?.id }).unwrap();
          console.log('deleted token form backend')
        } catch (error) {
          console.log(error, "error")
        }

        dispatch(resetNotifications());
        dispatch(logout());

        localStorage.removeItem("authToken");
        localStorage.removeItem("user");


        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.scope.includes('firebase-cloud-messaging')) {
              await registration.unregister();
              console.log("✅ Service worker unregistered");
            }
          }
        }
      }

      router.push("/login");
    } catch (error) {
      console.error("❌ Error during logout:", error);
      toast.error("Error logging out. Please try again.");
    }
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

  // ✅ Smart truncation: Show first and last characters for very long names
  const truncateCompanyName = (name, maxLength = 30) => {
    if (!name || name.length <= maxLength) return name;

    const firstPart = name.substring(0, Math.floor(maxLength / 2) - 2);
    const lastPart = name.substring(name.length - Math.floor(maxLength / 2) + 2);

    return `${firstPart}...${lastPart}`;
  };

  // ✅ Function to get header title - EITHER company name OR dashboard
  const getHeaderTitle = () => {
    if (companyId) {
      if (loadingCompany) {
        return (
          <>
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 animate-pulse flex-shrink-0" />
            <span className="truncate">Loading...</span>
          </>
        );
      }

      if (company) {
        return (
          <>
            <Building className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
            <span
              className="truncate mr-[1rem]"
              title={company.name}
            >
              {truncateCompanyName(company.name)}
            </span>
          </>
        );
      }

      return (
        <>
          <Building className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600 flex-shrink-0" />
          <span className="truncate">Loading...</span>
        </>
      );
    }

    return <span className="truncate">Dashboard</span>;
  };

  return (
    <header className="h-16 bg-white shrink-0 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Header Title - Centered on mobile, Left-aligned on desktop */}
      <div className="flex-1 flex items-center justify-center md:justify-start min-w-0 md:pr-4">
        <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-slate-800 flex items-center gap-2 max-w-full">
          {getHeaderTitle()}
        </h2>
      </div>

      {/* User Info, Notification Bell, and Logout Section - Right aligned */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0 absolute right-4 md:right-6 lg:right-8 md:relative md:right-0">
        {/* User Name and Role */}
        <div className="text-right hidden md:block">
          <span className="font-semibold text-xs md:text-sm text-slate-700 block  truncate max-w-[120px] lg:max-w-[180px]">
            {user?.name || "Guest"}
          </span>
          <span className="block text-[10px] md:text-xs text-red-600 font-bold uppercase tracking-wider">
            {userRole}
          </span>
        </div>

        {
          (user?.role_id === 1) ?
            <NotificationBell className="ml-8" /> : ''
        }
        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 text-xs sm:text-sm font-medium text-white bg-slate-800 
          rounded-lg hover:bg-slate-900 
          transition-colors flex items-center justify-center gap-1 sm:gap-2 whitespace-nowrap"
        >
          <LogOut className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
