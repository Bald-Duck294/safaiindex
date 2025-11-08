// src/app/(protected)/dashboard/page.jsx
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CompanyApi } from '../../../lib/api/companyApi.js'
import { UsersApi } from '../../../lib/api/usersApi.js'

const StatCard = ({ label, count, href, isLoading, onClick, borderColor }) => {
  return (
    <button
      onClick={() => !isLoading && onClick(href)}
      disabled={isLoading}
      className={`bg-white cursor-pointer shadow-lg rounded-lg border-t-4 ${borderColor} flex flex-col items-center justify-center text-center p-3 transition-all duration-200 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-[243px] h-[83px]`}
    >
      {isLoading ? (
        <div className="animate-pulse w-full h-full flex flex-col items-center justify-center">
          <div className="h-6 bg-gray-300 rounded w-8 mb-2"></div>
          <div className="h-4 bg-gray-300 rounded w-16"></div>
        </div>
      ) : (
        <>
          <span className="text-2xl font-bold text-gray-800">{count}</span>
          <span className="text-xs text-gray-600 font-medium">{label}</span>
        </>
      )}
    </button>
  );
};

export default function DashboardPage() {
  const router = useRouter();
  const [counts, setCounts] = useState({
    companies: 0,
    superadmin: 0,
    admin: 0,
    supervisor: 0,
    users: 0,
    cleaner: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [companiesResponse, usersResponse] = await Promise.all([
          CompanyApi.getAllCompanies(),
          UsersApi.getAllUsers()
        ]);

        console.log(companiesResponse, "companies");
        console.log(usersResponse, "users");

        let newCounts = {
          companies: 0,
          superadmin: 0,
          admin: 0,
          supervisor: 0,
          users: 0,
          cleaner: 0
        };

        // Process companies data
        if (companiesResponse.success && companiesResponse.data) {
          newCounts.companies = companiesResponse.data.length;
        }

        // Process users data
        if (usersResponse.success && usersResponse.data) {
          const users = usersResponse.data;

          // Count users by role_id
          // role_id: 1 = superadmin, 2 = admin, 3 = supervisor, 4 = user
          newCounts.superadmin = users.filter(user => user.role_id === 1).length;
          newCounts.admin = users.filter(user => user.role_id === 2).length;
          newCounts.supervisor = users.filter(user => user.role_id === 3).length;
          newCounts.users = users.filter(user => user.role_id === 4).length;
          newCounts.users = users.filter(user => user.role_id === 5).length;
        }

        setCounts(newCounts);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // You can add toast.error here if you have toast imported
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const cardData = [
    {
      label: "Orgnizations",
      count: counts.companies,
      href: "/companies",
      borderColor: "border-blue-500"
    },
    {
      label: "Superadmin",
      count: counts.superadmin,
      href: "/role/superadmin",
      borderColor: "border-purple-500"
    },
    {
      label: "Admin",
      count: counts.admin,
      href: "/role/admin",
      borderColor: "border-green-500"
    },
    // {
    //   label: "Supervisor",
    //   count: counts.supervisor,
    //   href: "/role/supervisor",
    //   borderColor: "border-yellow-500"
    // },
    {
      label: "Cleaner",
      count: counts.users,
      href: "/role/cleaner",
      borderColor: "border-pink-400"
    },

    {
      label: "supervisor",
      count: counts.supervisor,
      href: "/role/supervisor",
      borderColor: "border-purple-500"
    }
    // {
    //   label: "Users",
    //   count: counts.users,
    //   href: "/role/user",
    //   borderColor: "border-red-500"
    // },
  ];

  const handleCardClick = (href) => {
    if (href) {
      router.push(href);
    }
  };

  return (
    <div className="p-4 sm:p-6 w-full">
      {/* Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 w-full justify-items-center cursor-pointer">
        {cardData.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            count={card.count}
            href={card.href}
            isLoading={isLoading}
            onClick={handleCardClick}
            borderColor={card.borderColor}
          />
        ))}
      </div>

      {/* Company Statistics Section */}
      <div className="mt-6 sm:mt-8">
        <div className="bg-white shadow-lg rounded-lg p-4 sm:p-6 border-t-4 border-indigo-500 max-w-sm">
          <p className="text-gray-800 font-semibold text-sm sm:text-base">Company Statistics</p>
          {/* You can add more content here */}
        </div>
      </div>
    </div>
  );
}
