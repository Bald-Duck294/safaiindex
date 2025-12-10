import React from 'react';
import { User, Star, MapPin, Calendar, TrendingUp } from 'lucide-react';

function SingleCleanerReport({ data, metadata }) {
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

  const getScoreBadge = (score) => {
    const numScore = typeof score === 'number' ? score : parseFloat(score);
    if (isNaN(numScore)) return "bg-gray-100 text-gray-600";
    if (numScore >= 9) return "bg-green-100 text-green-800";
    if (numScore >= 7) return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'ongoing':
      case 'in progress':
        return 'bg-yellow-100 text-yellow-700';
      case 'incomplete':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Avatar */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <div className="flex items-center gap-4">
          {/* Circular Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
            {metadata.cleaner_name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900">
              {metadata.cleaner_name || "Unknown Cleaner"}
            </h2>
            <div className="text-sm text-slate-600 mt-1">
              {metadata.cleaner_phone || "N/A"}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {metadata.date_range?.start} to {metadata.date_range?.end}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cleanings" value={metadata.total_cleanings} icon={<Calendar className="w-5 h-5" />} />
        <StatCard
          title="Avg AI Score"
          value={typeof metadata.avg_ai_score === 'number' ? metadata.avg_ai_score.toFixed(2) : metadata.avg_ai_score}
          icon={<Star className="w-5 h-5" />}
          badge={getScoreBadge(metadata.avg_ai_score)}
        />
        <StatCard title="Avg Duration (mins)" value={metadata.avg_duration} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard title="Completed" value={metadata.completed} icon={<MapPin className="w-5 h-5" />} />
      </div>

      {/* Top Washrooms & Improvement Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Washrooms */}
        {metadata.top_washrooms && metadata.top_washrooms.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Top Performing Washrooms
            </h3>
            <ul className="space-y-2">
              {metadata.top_washrooms.map((washroom, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{washroom.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBadge(washroom.avg_score)}`}>
                    {washroom.avg_score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Improvement Areas */}
        {metadata.improvement_areas && metadata.improvement_areas.length > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4">
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Areas for Improvement
            </h3>
            <ul className="space-y-2">
              {metadata.improvement_areas.map((washroom, idx) => (
                <li key={idx} className="flex justify-between items-center text-sm">
                  <span className="text-slate-700">{washroom.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getScoreBadge(washroom.avg_score)}`}>
                    {washroom.avg_score}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Cleaning Records Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900">Cleaning Records</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Washroom</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Zone</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Time</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Score</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Duration (mins)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data && data.length > 0 ? (
                data.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{record.date}</td>
                    <td className="px-4 py-3 text-slate-900 font-medium">{record.washroom_name}</td>
                    <td className="px-4 py-3 text-slate-600">{record.zone_type}</td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-slate-900">{record.time}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded font-semibold ${getScoreBadge(record.rating)}`}>
                        {typeof record.rating === 'number' ? record.rating.toFixed(1) : record.rating}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{(record.status === 'Incomplete') ? 'N/A' : record.duration}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-8 text-center text-slate-500">
                    No cleaning records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, badge }) {
  return (
    <div className={`rounded-lg p-4 border ${badge || 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-600">{title}</div>
        {icon && <div className="text-slate-400">{icon}</div>}
      </div>
      <div className="text-2xl font-bold text-slate-900">
        {value !== undefined && value !== null ? value : "-"}
      </div>
    </div>
  );
}

export default SingleCleanerReport;
