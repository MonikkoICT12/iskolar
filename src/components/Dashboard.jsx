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
    <div className="space-y-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Scholars */}
        <div className="card-box bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Scholars
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">
                {totalScholars}
              </h3>
              <p className="text-xs text-emerald-600 font-medium mt-1.5 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Encoded Records
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-lgu-blue flex items-center justify-center text-xl font-bold">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-lgu-blue"></div>
        </div>

        {/* Total Amount */}
        <div className="card-box bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Amount Allocated
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
                {formatCurrency(totalAmount)}
              </h3>
              <p className="text-xs text-slate-500 mt-1.5">Based on encoded records</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500"></div>
        </div>

        {/* Partner Schools */}
        <div className="card-box bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Partner Schools
              </p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{schools.length}</h3>
              <p className="text-xs text-slate-500 mt-1.5">Schools & Universities</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl font-bold">
              <School className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-amber-500"></div>
        </div>

        {/* Year Level Spread */}
        <div className="card-box bg-white rounded-xl shadow-sm border border-slate-200 p-5 relative overflow-hidden transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Year Level Spread
              </p>
              <h3 className="text-base font-bold text-slate-800 mt-1">1st–4th Year College</h3>
              <p className="text-xs text-slate-500 mt-1.5">View detailed breakdown</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-xl font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-purple-500"></div>
        </div>
      </div>

      {/* Two Column Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scholars Table */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">List of Scholars</h2>
              <p className="text-xs text-slate-500">
                Recently added scholars with their school, year level, barangay, and amount.
              </p>
            </div>
            <button
              onClick={() => onTabChange('scholars')}
              className="text-xs font-semibold text-lgu-blue hover:text-lgu-navy flex items-center gap-1 transition"
            >
              View All
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] border-b">
                <tr>
                  <th className="py-2.5 px-3">Scholar Name</th>
                  <th className="py-2.5 px-3">Barangay</th>
                  <th className="py-2.5 px-3">School</th>
                  <th className="py-2.5 px-3">Year Level</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
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
                    <tr key={scholar.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        {scholar.lastName}, {scholar.firstName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{scholar.barangay}</td>
                      <td className="py-2.5 px-3 text-slate-600 text-xs">{scholar.school}</td>
                      <td className="py-2.5 px-3 text-slate-600">{scholar.yearLevel}</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-slate-900">Summary per Year Level</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Distribution
              </span>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Number of scholars per level in the current year.
            </p>

            <div className="space-y-4">
              {Object.entries(yearLevelStats).map(([level, stats]) => {
                const percentage = totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
                const colorConfig = YEAR_LEVEL_COLORS[level] || YEAR_LEVEL_COLORS['1st Year']
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{level}</span>
                      <span className="font-bold text-slate-900">{stats.count}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`${colorConfig.bg} h-full rounded-full transition-all`}
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Summary per School</h2>
            <p className="text-xs text-slate-500">
              University, number of scholars, and total scholarship amount.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {schoolStats.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 text-sm">
              No schools yet. Add scholars to see school breakdown.
            </div>
          ) : (
            schoolStats.slice(0, 8).map((stat) => (
              <div
                key={stat.school}
                className="p-4 bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-lg shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <School className="w-5 h-5 text-lgu-blue" />
                  <span className="inline-flex items-center justify-center text-xs font-bold text-white bg-lgu-blue rounded-full w-6 h-6">
                    {stat.count}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 line-clamp-2 min-h-[32px]">
                  {stat.school}
                </h4>
                <p className="text-sm text-emerald-600 font-bold mb-1">
                  {formatCurrency(stat.amount)}
                </p>
                <p className="text-[10px] text-slate-500">
                  {stat.percentage.toFixed(1)}% of total budget
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
