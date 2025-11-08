"use client";

import { useEffect, useState } from "react";
import { CompanyApi } from "../../lib/api/companyApi"; // Corrected relative path
import { UsersApi } from "../../lib/api/usersApi"; // Corrected relative path
import { Building, UserCog, UserCheck, Users, ArrowRight } from "lucide-react";
// import Link from "next/link"; // Replaced with <a> tag for compatibility

// Skeleton Loader for Stats Cards
const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
        <div className="h-8 w-1/2 bg-slate-200 rounded mb-2"></div>
        <div className="h-12 w-1/4 bg-slate-200 rounded"></div>
    </div>
);

// Stat Card Component
const StatCard = ({ icon, title, value, href, color }) => {
    const IconComponent = icon;
    return (
        <a href={href} className="no-underline">
            <div className="group bg-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4" style={{ borderColor: color }}>
                <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                        <h3 className="text-lg font-semibold text-slate-500 mb-1">{title}</h3>
                        <p className="text-5xl font-bold text-slate-800">{value}</p>
                    </div>
                    <div className="p-3 rounded-full bg-slate-100 group-hover:bg-indigo-100 transition-colors duration-300">
                        <IconComponent size={28} className="text-slate-600 group-hover:text-indigo-600 transition-colors duration-300" style={{ color: color }} />
                    </div>
                </div>
                <div className="mt-4 flex items-center text-sm font-medium text-indigo-600 group-hover:underline">
                    View All <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </a>
    );
};


export default function DashboardPage() {
    const [stats, setStats] = useState({
        organizations: 0,
        superadmins: 0,
        admins: 0,
        users: 0,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                const [companyRes, userRes] = await Promise.all([
                    CompanyApi.getAllCompanies(),
                    UsersApi.getAllUsers()
                ]);

                let superadminCount = 0;
                let adminCount = 0;
                let userCount = 0;

                if (userRes.success) {
                    userRes.data.forEach(user => {
                        if (user.role?.name.toLowerCase() === 'superadmin') {
                            superadminCount++;
                        } else if (user.role?.name.toLowerCase() === 'admin') {
                            adminCount++;
                        } else {
                            userCount++;
                        }
                    });
                }

                setStats({
                    organizations: companyRes.success ? companyRes.data.length : 0,
                    superadmins: superadminCount,
                    admins: adminCount,
                    users: userCount,
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div className="p-4 sm:p-6 md:p-8 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-slate-800 mb-8">Dashboard Overview</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {isLoading ? (
                        Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
                    ) : (
                        <>
                            <StatCard icon={Building} title="Organizations" value={stats.organizations} href="/companies" color="#4f46e5" />
                            <StatCard icon={UserCog} title="Superadmins" value={stats.superadmins} href="/users" color="#0ea5e9" />
                            <StatCard icon={UserCheck} title="Admins" value={stats.admins} href="/users" color="#10b981" />
                            <StatCard icon={Users} title="Users" value={stats.users} href="/users" color="#f97316" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

