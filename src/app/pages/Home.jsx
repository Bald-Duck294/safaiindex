"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const userStr = localStorage.getItem("cleaner_user");

    try {
      const user = userStr ? JSON.parse(userStr) : null;

      console.log(user, "Parsed user from localStorage");

      if (!user) {
        router.replace("/login");
      } else if (user.role_id === 1) {
        router.replace("/locations"); // Admin or supervisor
      } else if (user.role_id === 2) {
        router.replace("/completed-tasks"); // Cleaner
      } else {
        router.replace("/login"); // Unknown role fallback
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
      router.replace("/login");
    }
  }, []);

  return null; // Or loading spinner
}
