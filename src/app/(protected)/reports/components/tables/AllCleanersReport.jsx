import React, { useState } from 'react';
import { ChevronsUpDown, ChevronUp, ChevronDown } from 'lucide-react';

function AllCleanersReport({ data, metadata }) {
  console.log("📊 AllCleanersReport received:", metadata);

  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'asc',
  });

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === 'asc' ? 'desc' : 'asc',
        };
      }
      return { key, direction: 'asc' };
    });
  };

  const getSortedData = () => {
    if (!sortConfig.key || !data) return data;

    const sorted = [...data];

    sorted.sort((a, b) => {
      const dir = sortConfig.direction === 'asc' ? 1 : -1;

      switch (sortConfig.key) {
        case 'cleaner_name': {
          const nameA = (a.cleaner_name || '').toLowerCase();
          const nameB = (b.cleaner_name || '').toLowerCase();
          if (nameA < nameB) return -1 * dir;
          if (nameA > nameB) return 1 * dir;
          return 0;
        }
        case 'phone': {
          const phoneA = (a.cleaner_phone || '').toLowerCase();
          const phoneB = (b.cleaner_phone || '').toLowerCase();
          if (phoneA < phoneB) return -1 * dir;
          if (phoneA > phoneB) return 1 * dir;
          return 0;
        }
        case 'total_cleanings': {
          return (Number(a.total_cleanings) - Number(b.total_cleanings)) * dir;
        }
        case 'completed': {
          return (Number(a.completed) - Number(b.completed)) * dir;
        }
        case 'ongoing': {
          return (Number(a.ongoing) - Number(b.ongoing)) * dir;
        }
        case 'incomplete': {
          return (Number(a.incomplete || 0) - Number(b.incomplete || 0)) * dir;
        }
        case 'avg_ai_score': {
          const scoreA = typeof a.avg_ai_score === 'number' ? a.avg_ai_score : parseFloat(a.avg_ai_score) || 0;
          const scoreB = typeof b.avg_ai_score === 'number' ? b.avg_ai_score : parseFloat(b.avg_ai_score) || 0;
          return (scoreA - scoreB) * dir;
        }
        case 'avg_duration': {
          return (Number(a.avg_duration) - Number(b.avg_duration)) * dir;
        }
        case 'last_activity': {
          const dateA = new Date(a.last_activity || 0).getTime();
          const dateB = new Date(b.last_activity || 0).getTime();
          return (dateA - dateB) * dir;
        }
        default:
          return 0;
      }
    });

    return sorted;
  };

  const sortedData = getSortedData();

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronsUpDown className="w-3 h-3 text-slate-400 ml-1" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-slate-600 ml-1" />
    ) : (
      <ChevronDown className="w-3 h-3 text-slate-600 ml-1" />
    );
  };

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

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 w-[50%] justify-center">
        <StatCard title="Total Cleaners" value={metadata.total_cleaners || data.length} />
        <StatCard title="Completed" value={metadata.total_cleanings_completed || 0} />
        {/* <StatCard
          title="Avg Score"
          value={metadata.avg_ai_score ? parseFloat(metadata.avg_ai_score).toFixed(2) : "N/A"}
        />
        <StatCard
          title="Avg Duration (mins)"
          value={metadata.avg_cleaning_duration || 0}
        /> */}
      </div>

      {/* Top Performers */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h3 className="font-semibold text-lg text-slate-900 mb-4">
          Top Performers (Avg Score)
        </h3>
        <ol className="space-y-2">
          {metadata.top_avg_score?.slice(0, 5).map((cleaner, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <span className="text-slate-700">
                {index + 1}. {cleaner.cleaner_name}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Cleaners Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">#</th>

                {/* Sortable: Cleaner Name */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('cleaner_name')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Cleaner</span>
                    <SortIcon columnKey="cleaner_name" />
                  </button>
                </th>

                {/* Sortable: Phone */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('phone')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Phone</span>
                    <SortIcon columnKey="phone" />
                  </button>
                </th>

                {/* Sortable: Total */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('total_cleanings')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Total</span>
                    <SortIcon columnKey="total_cleanings" />
                  </button>
                </th>

                {/* Sortable: Completed */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('completed')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Completed</span>
                    <SortIcon columnKey="completed" />
                  </button>
                </th>

                {/* Sortable: Ongoing */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('ongoing')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Ongoing</span>
                    <SortIcon columnKey="ongoing" />
                  </button>
                </th>

                {/* Sortable: Incomplete */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('incomplete')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Incomplete</span>
                    <SortIcon columnKey="incomplete" />
                  </button>
                </th>

                {/* Sortable: Avg Score */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('avg_ai_score')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Avg Score</span>
                    <SortIcon columnKey="avg_ai_score" />
                  </button>
                </th>

                {/* Sortable: Avg Duration */}
                <th className="px-4 py-3 text-center font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('avg_duration')}
                    className="flex items-center justify-center gap-1 hover:text-slate-900 w-full"
                  >
                    <span>Avg Duration (mins)</span>
                    <SortIcon columnKey="avg_duration" />
                  </button>
                </th>

                {/* Sortable: Last Activity */}
                <th className="px-4 py-3 text-left font-semibold text-slate-700">
                  <button
                    type="button"
                    onClick={() => handleSort('last_activity')}
                    className="flex items-center gap-1 hover:text-slate-900"
                  >
                    <span>Last Activity</span>
                    <SortIcon columnKey="last_activity" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedData && sortedData.length > 0 ? (
                sortedData.map((cleaner, index) => (
                  <tr key={cleaner.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{index + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{cleaner.cleaner_name}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{cleaner.cleaner_phone}</td>
                    <td className="px-4 py-3 text-center font-medium text-slate-900">
                      {cleaner.total_cleanings}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.completed}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.ongoing}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.incomplete || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded font-semibold ${getScoreBadge(cleaner.avg_ai_score)}`}>
                        {typeof cleaner.avg_ai_score === 'number'
                          ? cleaner.avg_ai_score.toFixed(2)
                          : cleaner.avg_ai_score}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">
                      {cleaner.avg_duration}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDateTime(cleaner.last_activity)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-8 text-center text-slate-500">
                    No cleaner data found
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

function StatCard({ title, value }) {
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="text-sm text-slate-600 mb-1">{title}</div>
      <div className="text-2xl font-bold text-slate-900">
        {value !== undefined && value !== null ? value : "-"}
      </div>
    </div>
  );
}

export default AllCleanersReport;
