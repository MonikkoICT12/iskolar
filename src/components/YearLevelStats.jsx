import { TrendingUp, Users, DollarSign } from 'lucide-react'
import useScholarStore, { YEAR_LEVELS } from '../store/scholarStore'
import { YEAR_LEVEL_COLORS, formatCurrency } from '../utils/helpers'

const YearLevelStats = () => {
  const { getYearLevelStats, getTotalScholars, getTotalAmount } = useScholarStore()

  const yearLevelStats = getYearLevelStats()
  const totalScholars = getTotalScholars()
  const totalAmount = getTotalAmount()

  return (
    <div className="space-y-6">
      {/* Year Level Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {YEAR_LEVELS.map((level) => {
          const stats = yearLevelStats[level]
          const percentage = totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
          const colorConfig = YEAR_LEVEL_COLORS[level] || YEAR_LEVEL_COLORS['1st Year']

          return (
            <div
              key={level}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 hover:shadow-md transition"
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className={`w-5 h-5 ${colorConfig.text}`} />
                <span className="text-2xl font-bold text-slate-900">{stats.count}</span>
              </div>
              <h3 className="text-xs font-semibold text-slate-700 mb-1">{level}</h3>
              <p className="text-xs text-emerald-600 font-medium">
                {formatCurrency(stats.amount)}
              </p>
              <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className={`${colorConfig.bg} h-full rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Detailed Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-1">
          Comparative Year Level Analytics
        </h3>
        <p className="text-xs text-slate-500 mb-6">
          Percentage and scholar counts grouped by academic level.
        </p>

        <div className="space-y-6">
          {YEAR_LEVELS.map((level) => {
            const stats = yearLevelStats[level]
            const percentage = totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
            const amountPercentage = totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
            const colorConfig = YEAR_LEVEL_COLORS[level] || YEAR_LEVEL_COLORS['1st Year']

            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${colorConfig.bg}`}
                    ></div>
                    <span className="font-semibold text-slate-900">{level}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span className="font-bold text-slate-900">{stats.count}</span>
                      <span className="text-slate-500">({percentage.toFixed(1)}%)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3 text-emerald-600" />
                      <span className="font-bold text-emerald-700">
                        {formatCurrency(stats.amount)}
                      </span>
                      <span className="text-slate-500">({amountPercentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`${colorConfig.bg} h-full rounded-full transition-all flex items-center justify-end pr-2`}
                    style={{ width: `${percentage}%` }}
                  >
                    {percentage > 15 && (
                      <span className="text-[10px] font-bold text-white">
                        {percentage.toFixed(0)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default YearLevelStats
