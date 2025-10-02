
// // import { usePathname, useSearchParams } from 'next/navigation'

// // const useCompanyId = () => {
// //     const pathname = usePathname();
// //     const search = useSearchParams();

// //     const getCompanyId = () => {

// //         if (pathname.startsWith('/clientDashboard/')) {
// //             const segment = pathname.split('/');
// //             return segment[2];
// //         }

// //         const companyID = search.get('companyId');
// //         if (companyID) {
// //             return companyID;
// //         }

// //         //just in case for future for nested routes
// //         // if (pathname.startsWith('/company/')) {
// //         //     const segments = pathname.split('/');
// //         //     return segments[2] || null;
// //         // }

// //         return null;
// //     }

// //     return {
// //         companyId: getCompanyId(),
// //         hasCompanyContext: !!getCompanyId()
// //     };
// // };

// // export default useCompanyId;



// "use client";

// import { usePathname, useSearchParams } from 'next/navigation';

// const useCompanyId = () => {
//     const pathname = usePathname();
//     const searchParams = useSearchParams();

//     const getCompanyId = () => {
//         // Method 1: From clientDashboard route
//         if (pathname.startsWith('/clientDashboard/')) {
//             const segments = pathname.split('/');
//             return segments[2] || null;
//         }

//         // Method 2: From search parameters 
//         // ✅ Fixed: Use .get() instead of .entries()
//         const companyId = searchParams.get('companyId');
//         if (companyId) {
//             return companyId;
//         }

//         // Future: nested routes
//         if (pathname.startsWith('/company/')) {
//             const segments = pathname.split('/');
//             return segments[2] || null;
//         }

//         return null;
//     };

//     return {
//         companyId: getCompanyId(),
//         hasCompanyContext: !!getCompanyId()
//     };
// };

// export default useCompanyId;
