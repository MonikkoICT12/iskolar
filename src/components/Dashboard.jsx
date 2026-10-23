import { Users, DollarSign, School, TrendingUp, Edit2, ArrowRight } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { YEAR_LEVEL_COLORS, formatCurrency } from '../utils/helpers'

const Dashboard = ({ onEditScholar, onTabChange }) => {
  const {
    getTotalScholars,
    getTotalAmount,
    getSchoolsList,
    getScholarsBySchoolYear,
    getYearLevelStats,
    getSchoolStats,
  } = useScholarStore()

  const totalScholars = getTotalScholars()
  const totalAmount = getTotalAmount()
  const schools = getSchoolsList()
  const scholars = getScholarsBySchoolYear()
  const yearLevelStats = getYearLevelStats()
  const schoolStats = getSchoolStats()

  // Get most recently added scholars (auto-updating)
  const recentScholars = [...scholars]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Scholarship Dashboard</h1>
            <p className="text-indigo-100 text-sm">Overview of scholarship programs and beneficiaries</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
            <TrendingUp className="w-5 h-5" />
            <div className="text-right">
              <p className="text-xs text-indigo-100">Active Records</p>
              <p className="text-lg font-bold">{totalScholars}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Scholars */}
        <div className="group bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-md border-2 border-indigo-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg">
                <Users className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">ACTIVE</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-2">
              {totalScholars}
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Total Scholars
            </p>
            <div className="mt-3 pt-3 border-t border-indigo-200">
              <p className="text-xs text-indigo-700 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                All encoded records
              </p>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="group bg-gradient-to-br from-white to-emerald-50 rounded-2xl shadow-md border-2 border-emerald-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">BUDGET</span>
            </div>
            <h3 className="text-3xl font-black text-emerald-700 mb-2">
              {formatCurrency(totalAmount)}
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Total Allocated
            </p>
            <div className="mt-3 pt-3 border-t border-emerald-200">
              <p className="text-xs text-emerald-700 font-medium">
                Scholarship funds released
              </p>
            </div>
          </div>
        </div>

        {/* Partner Schools */}
        <div className="group bg-gradient-to-br from-white to-amber-50 rounded-2xl shadow-md border-2 border-amber-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-lg">
                <School className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">PARTNERS</span>
            </div>
            <h3 className="text-4xl font-black text-slate-900 mb-2">
              {schools.length}
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              Partner Schools
            </p>
            <div className="mt-3 pt-3 border-t border-amber-200">
              <p className="text-xs text-amber-700 font-medium">
                Universities & colleges
              </p>
            </div>
          </div>
        </div>

        {/* Year Level Spread */}
        <div className="group bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-md border-2 border-purple-100 p-6 relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full -mr-12 -mt-12"></div>
          <div className="relative">
            <div className="flex items-start justify-between mb-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-3 py-1 rounded-full">LEVELS</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">
              1st - 4th Year
            </h3>
            <p className="text-sm font-semibold text-slate-600">
              College Levels
            </p>
            <div className="mt-3 pt-3 border-t border-purple-200">
              <p className="text-xs text-purple-700 font-medium">
                Distribution spread
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scholars Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
                Recent Scholars
              </h2>
              <p className="text-xs text-slate-500 ml-3 mt-1">
                Latest 5 scholars added to the system
              </p>
            </div>
            <button
              onClick={() => onTabChange('scholars')}
              className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-md hover:shadow-lg"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-gradient-to-r from-slate-50 to-indigo-50 text-slate-700 font-bold uppercase text-[11px] border-b-2 border-indigo-200">
                <tr>
                  <th className="py-3 px-4 rounded-tl-lg">Scholar Name</th>
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4">School</th>
                  <th className="py-3 px-4">Year Level</th>
                  <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentScholars.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-slate-500 text-sm">
                      No scholars yet. Click "Add Scholar" to get started.
                    </td>
                  </tr>
                ) : (
                  recentScholars.map((scholar) => (
                    <tr key={scholar.id} className="hover:bg-indigo-50/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {scholar.lastName}, {scholar.firstName}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{scholar.barangay}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{scholar.school}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md">
                          {scholar.yearLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600">
                        {formatCurrency(scholar.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Year Level Summary */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                Year Level Stats
              </h2>
              <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-full">
                Distribution
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-5 ml-3">
              Breakdown by college year level
            </p>

            <div className="space-y-5">
              {Object.entries(yearLevelStats).map(([level, stats]) => {
                const percentage = totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
                const colorConfig = YEAR_LEVEL_COLORS[level] || YEAR_LEVEL_COLORS['1st Year']
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-700">{level}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500">{percentage.toFixed(1)}%</span>
                        <span className="text-lg font-black text-indigo-700">{stats.count}</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`${colorConfig.bg} h-full rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* School Summary Preview */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
              Partner Schools Overview
            </h2>
            <p className="text-xs text-slate-500 ml-3 mt-1">
              Scholarship distribution across universities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolStats.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500">
              <School className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm font-medium">No schools yet</p>
              <p className="text-xs">Add scholars to see school breakdown</p>
            </div>
          ) : (
            schoolStats.slice(0, 8).map((stat) => (
              <div
                key={stat.school}
                className="group p-5 bg-gradient-to-br from-white via-amber-50/50 to-white border-2 border-amber-100 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-105"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center group-hover:bg-amber-600 transition-colors">
                    <School className="w-5 h-5 text-amber-600 group-hover:text-white transition-colors" />
                  </div>
                  <span className="flex items-center justify-center text-xs font-black text-white bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl px-3 py-1.5 shadow-md">
                    {stat.count} {stat.count === 1 ? 'scholar' : 'scholars'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-3 line-clamp-2 min-h-[40px] leading-tight">
                  {stat.school}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-slate-500 font-medium">Amount:</span>
                    <p className="text-base text-emerald-600 font-black">
                      {formatCurrency(stat.amount)}
                    </p>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-amber-600 h-full rounded-full"
                      style={{ width: `${stat.percentage}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-semibold text-right">
                    {stat.percentage.toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
