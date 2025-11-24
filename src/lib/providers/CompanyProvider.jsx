"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const CompanyContext = createContext({
    companyId: null,
    hasCompanyContext: false,
    setCompanyId: () => { }
});

function CompanyProviderImpl({ children }) {
    const [companyId, setCompanyId] = useState(null);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const getCompanyId = () => {
            // Method 1: From clientDashboard route
            if (pathname.startsWith('/clientDashboard/')) {
                const segments = pathname.split('/');
                return segments[2] || null;
            }

            // Method 2: From search parameters
            const paramCompanyId = searchParams.get('companyId');
            if (paramCompanyId && paramCompanyId !== 'null' && paramCompanyId !== 'undefined') {
                return paramCompanyId;
            }

            return null;
        };

        const newCompanyId = getCompanyId();
        // console.log("company_id from context", newCompanyId);
        setCompanyId(newCompanyId);
    }, [pathname, searchParams]);

    const value = {
        companyId,
        hasCompanyContext: !!companyId,
        setCompanyId
    };

    return (
        <CompanyContext.Provider value={value}>
            {children}
        </CompanyContext.Provider>
    );
}

export function CompanyProvider({ children }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CompanyProviderImpl>
                {children}
            </CompanyProviderImpl>
        </Suspense>
    );
}

export function useCompanyId() {
    const context = useContext(CompanyContext);
    if (!context) {
        throw new Error('useCompanyId must be used within CompanyProvider');
    }
    return context;
}
