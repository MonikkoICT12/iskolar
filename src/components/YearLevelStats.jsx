import { TrendingUp, Users } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { YEAR_LEVELS } from '../config/yearLevels'
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
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition"
              style={{ border: '1px solid #E5E5EA' }}
            >
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className={`w-5 h-5 ${colorConfig.text}`} strokeWidth={1.5} />
                <span className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>{stats.count}</span>
              </div>
              <h3 className="text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>{level}</h3>
              <p className="text-xs font-medium" style={{ color: '#10b981' }}>
                {formatCurrency(stats.amount)}
              </p>
              <div className="mt-2 w-full rounded-full h-1.5" style={{ backgroundColor: '#E5E5EA' }}>
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
      <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
        <h3 className="text-base font-bold mb-1" style={{ color: '#1D1D1F' }}>
          Comparative Year Level Analytics
        </h3>
        <p className="text-xs mb-6" style={{ color: '#AAAAAA' }}>
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
                    <span className="font-semibold" style={{ color: '#1D1D1F' }}>{level}</span>
                  </div>
                  <div className="flex items-center gap-6 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
                      <span className="font-bold" style={{ color: '#1D1D1F' }}>{stats.count}</span>
                      <span style={{ color: '#AAAAAA' }}>({percentage.toFixed(1)}%)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-bold" style={{ color: '#10b981' }}>
                        {formatCurrency(stats.amount)}
                      </span>
                      <span style={{ color: '#AAAAAA' }}>({amountPercentage.toFixed(1)}%)</span>
                    </span>
                  </div>
                </div>
                <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#E5E5EA' }}>
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
