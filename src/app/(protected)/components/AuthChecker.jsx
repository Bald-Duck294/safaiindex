"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";

export default function AuthChecker({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Public routes that don't require authentication
  const publicRoutes = ["/", "/login", "/register"];
  const isPublicRoute = publicRoutes.includes(pathname);

  useEffect(() => {
    // Wait for component to mount (client-side only)
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // If user is not authenticated and trying to access a protected route
    if (!isAuthenticated && !isPublicRoute) {
      console.log("User not authenticated, redirecting to login");
      router.push("/login");
      return;
    }

    // If user is authenticated and on login/register page, redirect to appropriate dashboard
    if (isAuthenticated && (pathname === "/login" || pathname === "/register")) {
      console.log("User already authenticated, redirecting to dashboard");
      
      // Check user role and redirect accordingly
      if (user?.role_id === 1) {
        router.push('/dashboard');
      } else if (user?.role_id === 2 && user?.company_id) {
        router.push(`/clientDashboard/${user.company_id}`);
      } else if (user?.role_id === 3 && user?.company_id) {
        router.push(`/clientDashboard/${user.company_id}`);
      } else {
        router.push('/dashboard');
      }
      return;
    }
  }, [isAuthenticated, pathname, router, isPublicRoute, isReady, user]);

  // Show loading while initializing
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Show loading while redirecting unauthenticated users
  if (!isAuthenticated && !isPublicRoute) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return <>{children}</>;
}
