
// // ============================================
// // ALL WASHROOMS REPORT TABLE
// // ============================================
// export const AllWashrooomsReportTable = ({ data, metadata }) => {
//     const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

//     const formatDateTime = (date) => {
//         if (!date) return "N/A";
//         return new Date(date).toLocaleString('en-IN', {
//             day: '2-digit',
//             month: 'short',
//             year: 'numeric',
//             hour: '2-digit',
//             minute: '2-digit',
//             hour12: true
//         });
//     };

//     const getStatusBadge = (status) => {
//         const styles = {
//             completed: "bg-green-100 text-green-700",
//             ongoing: "bg-yellow-100 text-yellow-700",
//             pending: "bg-gray-100 text-gray-700"
//         };
//         return (
//             <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
//                 {status === 'completed' && <CheckCircle className="w-3 h-3" />}
//                 {status === 'ongoing' && <Clock className="w-3 h-3" />}
//                 {status.charAt(0).toUpperCase() + status.slice(1)}
//             </span>
//         );
//     };

//     const handleSort = (key) => {
//         setSortConfig({
//             key,
//             direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
//         });
//     };

//     const getSortedData = () => {
//         if (!data) return [];
//         return [...data].sort((a, b) => {
//             const aValue = a[sortConfig.key];
//             const bValue = b[sortConfig.key];
//             if (typeof aValue === 'string') {
//                 return sortConfig.direction === 'asc'
//                     ? aValue.localeCompare(bValue)
//                     : bValue.localeCompare(aValue);
//             }
//             return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
//         });
//     };

//     return (
//         <div className="space-y-6">
//             {/* ✅ Header */}
//             <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
//                 <h2 className="text-2xl font-bold text-slate-900 mb-2">
//                     All Washrooms Report
//                 </h2>
//                 <div className="flex flex-wrap gap-3 text-sm text-slate-600">
//                     <span className="inline-flex items-center gap-1">
//                         <Building className="w-4 h-4" />
//                         {metadata.organization}
//                     </span>
//                     <span className="inline-flex items-center gap-1">
//                         <Calendar className="w-4 h-4" />
//                         Generated: {formatDateTime(metadata.generated_on)}
//                     </span>
//                 </div>
//             </div>

//             {/* ✅ Performance Cards */}
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                 <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-blue-600 font-medium">Total Washrooms</p>
//                             <p className="text-2xl font-bold text-blue-900 mt-1">
//                                 {metadata.total_washrooms}
//                             </p>
//                         </div>
//                         <Building className="w-8 h-8 text-blue-400" />
//                     </div>
//                 </div>

//                 <div className="bg-green-50 rounded-lg p-4 border border-green-200">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-green-600 font-medium">Avg Rating</p>
//                             <p className="text-2xl font-bold text-green-900 mt-1">
//                                 {metadata.avg_rating.toFixed(1)}
//                             </p>
//                             <p className="text-xs text-green-600 mt-1">out of 10</p>
//                         </div>
//                         <Star className="w-8 h-8 text-green-400" />
//                     </div>
//                 </div>

//                 <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
//                     <div className="flex items-center justify-between mb-2">
//                         <p className="text-sm text-slate-600 font-medium">Status</p>
//                         <CheckCircle className="w-6 h-6 text-slate-400" />
//                     </div>
//                     <div className="space-y-2">
//                         <div className="flex items-center justify-between">
//                             <span className="text-sm text-green-700">✓ Completed</span>
//                             <span className="font-bold text-green-700">{metadata.completed}</span>
//                         </div>
//                         <div className="flex items-center justify-between">
//                             <span className="text-sm text-yellow-700">⏳ Ongoing</span>
//                             <span className="font-bold text-yellow-700">{metadata.ongoing}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className="text-sm text-purple-600 font-medium">Avg Duration</p>
//                             <p className="text-2xl font-bold text-purple-900 mt-1">
//                                 {metadata.avg_cleaning_duration}
//                             </p>
//                             <p className="text-xs text-purple-600 mt-1">minutes</p>
//                         </div>
//                         <Clock className="w-8 h-8 text-purple-400" />
//                     </div>
//                 </div>
//             </div>

//             {/* ✅ Washrooms Table */}
//             <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
//                 <div className="p-4 bg-slate-50 border-b border-slate-200">
//                     <h3 className="text-lg font-bold text-slate-900">Washroom Details</h3>
//                 </div>

//                 {/* Desktop Table */}
//                 <div className="overflow-x-auto hidden lg:block">
//                     <table className="w-full">
//                         <thead className="bg-slate-100">
//                             <tr>
//                                 <th onClick={() => handleSort('name')}
//                                     className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-200">
//                                     Washroom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                                 </th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
//                                     Address
//                                 </th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
//                                     Type
//                                 </th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
//                                     Cleaner
//                                 </th>
//                                 <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
//                                     Status
//                                 </th>
//                                 <th onClick={() => handleSort('avg_rating')}
//                                     className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-200">
//                                     Avg Rating {sortConfig.key === 'avg_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
//                                 </th>
//                                 <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
//                                     Images
//                                 </th>
//                                 <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
//                                     Last Cleaned
//                                 </th>
//                             </tr>
//                         </thead>
//                         <tbody className="divide-y divide-slate-200">
//                             {getSortedData().length > 0 ? (
//                                 getSortedData().map((washroom) => (
//                                     <tr key={washroom.id} className="hover:bg-slate-50">
//                                         <td className="px-4 py-3">
//                                             <p className="font-medium text-slate-800">{washroom.name}</p>
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
//                                             {washroom.address}
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-slate-700">
//                                             {washroom.type}
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-slate-700">
//                                             {washroom.cleaner_name}
//                                         </td>
//                                         <td className="px-4 py-3 text-center">
//                                             {getStatusBadge(washroom.status)}
//                                         </td>
//                                         <td className="px-4 py-3 text-center">
//                                             <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
//                                                 <Star className="w-3 h-3" />
//                                                 {washroom.avg_rating.toFixed(1)}
//                                             </span>
//                                         </td>
//                                         <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">
//                                             {washroom.image_count}
//                                         </td>
//                                         <td className="px-4 py-3 text-sm text-slate-600">
//                                             {formatDateTime(washroom.last_cleaned_on)}
//                                         </td>
//                                     </tr>
//                                 ))
//                             ) : (
//                                 <tr>
//                                     <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
//                                         No washrooms found
//                                     </td>
//                                 </tr>
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {/* Mobile View */}
//                 <div className="lg:hidden divide-y divide-slate-200">
//                     {getSortedData().length > 0 ? (
//                         getSortedData().map((washroom) => (
//                             <div key={washroom.id} className="p-4 space-y-3">
//                                 <div className="flex items-start justify-between">
//                                     <div>
//                                         <p className="font-semibold text-slate-900">{washroom.name}</p>
//                                         <p className="text-sm text-slate-600">{washroom.type}</p>
//                                     </div>
//                                     {getStatusBadge(washroom.status)}
//                                 </div>
//                                 <div className="grid grid-cols-2 gap-2 text-sm">
//                                     <div>
//                                         <p className="text-slate-500">Cleaner:</p>
//                                         <p className="font-medium">{washroom.cleaner_name}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-slate-500">Rating:</p>
//                                         <p className="font-medium">{washroom.avg_rating.toFixed(1)} ⭐</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-slate-500">Images:</p>
//                                         <p className="font-medium">{washroom.image_count}</p>
//                                     </div>
//                                     <div>
//                                         <p className="text-slate-500">Last Cleaned:</p>
//                                         <p className="font-medium text-xs">
//                                             {formatDateTime(washroom.last_cleaned_on)}
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     ) : (
//                         <div className="p-8 text-center text-slate-500">
//                             No washrooms found
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };


import { useState } from "react";
import {
    User, Star, Clock, CheckCircle, AlertTriangle,
    MapPin, Calendar, TrendingUp, Building
} from "lucide-react";
import PhotoModal from "./PhotoModal";
function AllWashroomsTable({ data, metadata }) {
    const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

    const formatDateTime = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getStatusBadge = (status) => {
        const styles = {
            completed: "bg-green-100 text-green-700",
            ongoing: "bg-yellow-100 text-yellow-700",
            pending: "bg-gray-100 text-gray-700"
        };
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
                {status === 'completed' && <CheckCircle className="w-3 h-3" />}
                {status === 'ongoing' && <Clock className="w-3 h-3" />}
                {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending"}
            </span>
        );
    };

    const handleSort = (key) => {
        setSortConfig({
            key,
            direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc'
        });
    };

    const getSortedData = () => {
        if (!data || !Array.isArray(data)) return [];
        return [...data].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === undefined || bValue === undefined) return 0;
            if (typeof aValue === 'string') {
                return sortConfig.direction === 'asc'
                    ? aValue.localeCompare(bValue)
                    : bValue.localeCompare(aValue);
            }
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
        });
    };

    return (
        <div className="space-y-6">
            {/* ✅ Header */}
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                    All Washrooms Report
                </h2>
                <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                    <span className="inline-flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {metadata?.organization || "N/A"}
                    </span>
                    <span className="inline-flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Generated: {formatDateTime(metadata?.generated_on)}
                    </span>
                </div>
            </div>

            {/* ✅ Performance Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-blue-600 font-medium">Total Washrooms</p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                                {metadata?.total_washrooms || 0}
                            </p>
                        </div>
                        <Building className="w-8 h-8 text-blue-400" />
                    </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-green-600 font-medium">Avg Rating</p>
                            <p className="text-2xl font-bold text-green-900 mt-1">
                                {metadata?.avg_rating ? metadata.avg_rating.toFixed(1) : "N/A"}
                            </p>
                            <p className="text-xs text-green-600 mt-1">out of 10</p>
                        </div>
                        <Star className="w-8 h-8 text-green-400" />
                    </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-slate-600 font-medium">Status</p>
                        <CheckCircle className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-green-700">✓ Completed</span>
                            <span className="font-bold text-green-700">{metadata?.completed || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-yellow-700">⏳ Ongoing</span>
                            <span className="font-bold text-yellow-700">{metadata?.ongoing || 0}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-purple-600 font-medium">Avg Duration</p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                                {metadata?.avg_cleaning_duration || 0}
                            </p>
                            <p className="text-xs text-purple-600 mt-1">minutes</p>
                        </div>
                        <Clock className="w-8 h-8 text-purple-400" />
                    </div>
                </div>
            </div>

            {/* ✅ Washrooms Table */}
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900">Washroom Details</h3>
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto hidden lg:block">
                    <table className="w-full">
                        <thead className="bg-slate-100">
                            <tr>
                                <th onClick={() => handleSort('name')}
                                    className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-200">
                                    Washroom {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Address
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Type
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Cleaner
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Status
                                </th>
                                <th onClick={() => handleSort('avg_rating')}
                                    className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase cursor-pointer hover:bg-slate-200">
                                    Avg Rating {sortConfig.key === 'avg_rating' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-slate-600 uppercase">
                                    Images
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase">
                                    Last Cleaned
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {getSortedData().length > 0 ? (
                                getSortedData().map((washroom) => (
                                    <tr key={washroom.id} className="hover:bg-slate-50">
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-800">{washroom.name || "N/A"}</p>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 max-w-xs truncate">
                                            {washroom.address || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {washroom.type || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-700">
                                            {washroom.cleaner_name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {getStatusBadge(washroom.status)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-50 text-yellow-700 rounded">
                                                <Star className="w-3 h-3" />
                                                {washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">
                                            {washroom.image_count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600">
                                            {formatDateTime(washroom.last_cleaned_on)}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                                        No washrooms found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="lg:hidden divide-y divide-slate-200">
                    {getSortedData().length > 0 ? (
                        getSortedData().map((washroom) => (
                            <div key={washroom.id} className="p-4 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold text-slate-900">{washroom.name || "N/A"}</p>
                                        <p className="text-sm text-slate-600">{washroom.type || "N/A"}</p>
                                    </div>
                                    {getStatusBadge(washroom.status)}
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <p className="text-slate-500">Cleaner:</p>
                                        <p className="font-medium">{washroom.cleaner_name || "N/A"}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Rating:</p>
                                        <p className="font-medium">
                                            {washroom.avg_rating ? washroom.avg_rating.toFixed(1) : "N/A"} ⭐
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Images:</p>
                                        <p className="font-medium">{washroom.image_count || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">Last Cleaned:</p>
                                        <p className="font-medium text-xs">
                                            {formatDateTime(washroom.last_cleaned_on)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-slate-500">
                            No washrooms found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AllWashroomsTable