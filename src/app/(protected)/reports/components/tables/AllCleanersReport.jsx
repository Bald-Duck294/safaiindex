import React from 'react';

function AllCleanersReport({ data, metadata }) {

  console.log("📊 AllCleanersReport received:", metadata);

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
      {/* Header */}


      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Cleaners" value={metadata.total_cleaners || data.length} />
        <StatCard title="Completed" value={metadata.total_cleanings_completed || 0} />
        <StatCard
          title="Avg Score"
          value={metadata.avg_ai_score ? parseFloat(metadata.avg_ai_score).toFixed(2) : "N/A"}
        />
        <StatCard
          title="Avg Duration (mins)"
          value={metadata.avg_cleaning_duration || 0}
        />
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
              {/* <span className={`px-3 py-1 rounded-full font-semibold ${getScoreBadge(cleaner.avg_ai_score)}`}>
                {typeof cleaner.avg_ai_score === 'number'
                  ? cleaner.avg_ai_score.toFixed(2)
                  : cleaner.avg_ai_score}
              </span> */}
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
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Cleaner</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Phone</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Total</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Completed</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Ongoing</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Incomplete</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Avg Score</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-700">Avg Duration (mins)</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-700">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {data && data.length > 0 ? (
                data.map((cleaner, index) => (
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
