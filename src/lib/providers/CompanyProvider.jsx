"use client";

import { createContext, useContext, useEffect, useState, Suspense } from 'react';
import { useSelector } from 'react-redux';
import { usePathname } from 'next/navigation';



const STORAGE_KEY = "saaf_selected_company_id";

const CompanyContext = createContext({
    companyId: null,
    hasCompanyContext: false,
    setCompanyId: () => { }
});

function CompanyProviderImpl({ children }) {

    const { user } = useSelector((state) => state.auth);
    const pathname = usePathname();
    const [selectedCompanyId, setSelectedCompanyId] = useState(() => {
        if (typeof window === "undefined") return null;
        try {
            const stored = window.localStorage.getItem(STORAGE_KEY);
            return stored || null;
        } catch {
            return null;
        }
    });


    const safeSetSelectedCompanyId = (id) => {
        setSelectedCompanyId(id);
        if (typeof window === "undefined") return;
        if (id) {
            window.localStorage.setItem(STORAGE_KEY, String(id));
        } else {
            window.localStorage.removeItem(STORAGE_KEY);
        }
    };


    const globalRoutes = [
        '/dashboard',
        '/companies',
        '/role/superadmin',
        '/role/admin',
        '/role/supervisor',
        '/score-management',
        '/registered-users'
    ];

    useEffect(() => {
        if (user?.role_id === 1) {
            const isGlobalRoute = globalRoutes.some((route) => pathname.startsWith(route));
            if (isGlobalRoute) {
                safeSetSelectedCompanyId(null);
            }
        }
    }, [pathname, user?.role_id]);



    const companyId = (() => {
        // non-superadmin: always their assigned company
        if (user?.role_id !== 1 && user?.company_id) {
            return String(user.company_id);
        }

        // superadmin: use selected company (can be null)
        if (user?.role_id === 1) {
            return selectedCompanyId || null;
        }

        return null;
    })();


    const value = {
        companyId,
        hasCompanyContext: !!companyId,
        setCompanyId: safeSetSelectedCompanyId // Only superadmin should call this
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
}


// Export the wrapper component with Suspense
export function CompanyProvider({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompanyProviderImpl>
                {children}
            </CompanyProviderImpl>
        </Suspense>
    );
}

// Export the hook to use the context
export function useCompanyId() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompanyId must be used within CompanyProvider');
    }
    return context;
}