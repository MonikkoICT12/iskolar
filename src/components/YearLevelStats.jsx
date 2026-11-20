import { TrendingUp, Users } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { YEAR_LEVELS } from '../config/yearLevels'
import { formatCurrency } from '../utils/helpers'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

const LEVEL_GRADIENTS = {
  '1st Year': 'from-[#587529] to-[#71951E]',
  '2nd Year': 'from-[#71951E] to-[#9fb634]',
  '3rd Year': 'from-[#71951E] to-[#F4BE38]',
  '4th Year': 'from-[#F4BE38] to-[#EDDA5E]',
  '5th Year': 'from-[#587529] to-[#F4BE38]',
  '6th Year': 'from-[#587529] to-[#EDDA5E]',
}

const YearLevelStats = () => {
  const { getYearLevelStats, getTotalScholars, getTotalAmount } =
    useScholarStore()

  const yearLevelStats = getYearLevelStats(YEAR_LEVELS)
  const totalScholars = getTotalScholars()
  const totalAmount = getTotalAmount()

  return (
    <div className="w-full space-y-6">
      <div className="animate-fade-up">
        <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
          Year Level Statistics
        </h2>
        <p className="text-sm text-muted-foreground">
          Distribution of beneficiary headcount and allocations across college year levels.
        </p>
      </div>

      {/* Year Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {YEAR_LEVELS.map((level, idx) => {
          const stats = yearLevelStats[level]
          const percentage =
            totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
          const gradient =
            LEVEL_GRADIENTS[level] || 'from-[#587529] to-[#F4BE38]'

          return (
            <Card
              key={level}
              className="glass-card-hover animate-fade-up"
              style={{ animationDelay: `${idx * 45}ms` }}
            >
              <CardContent className="p-5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#587529]/15 to-[#F4BE38]/30 border border-brand/25 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-brand" />
                  </div>
                  <span className="text-2xl font-black text-foreground">
                    {stats.count}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">{level}</h3>
                  <p className="text-xs font-semibold text-brand">
                    {formatCurrency(stats.amount)}
                  </p>
                </div>
                <Progress
                  value={percentage}
                  indicatorClassName={`bg-gradient-to-r ${gradient}`}
                  className="h-2"
                />
                <p className="text-[11px] font-medium text-muted-foreground text-right">
                  {percentage.toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Comparative Analytics */}
      <Card className="animate-fade-up" style={{ animationDelay: '220ms' }}>
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Comparative Year Level Analytics
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Percentage and scholar counts grouped by academic level
              </p>
            </div>
            <Badge variant="gold">6 Levels</Badge>
          </div>

          <div className="space-y-5">
            {YEAR_LEVELS.map((level) => {
              const stats = yearLevelStats[level]
              const percentage =
                totalScholars > 0 ? (stats.count / totalScholars) * 100 : 0
              const amountPercentage =
                totalAmount > 0 ? (stats.amount / totalAmount) * 100 : 0
              const gradient =
                LEVEL_GRADIENTS[level] || 'from-[#587529] to-[#F4BE38]'

              return (
                <div key={level} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-3 h-3 rounded-full bg-gradient-to-r ${gradient}`}
                      />
                      <span className="font-bold text-sm text-foreground">
                        {level}
                      </span>
                    </div>
                    <div className="flex items-center gap-5 text-xs">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <strong className="text-foreground">
                          {stats.count}
                        </strong>
                        <span className="text-muted-foreground">
                          ({percentage.toFixed(1)}%)
                        </span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <strong className="text-brand">
                          {formatCurrency(stats.amount)}
                        </strong>
                        <span className="text-muted-foreground">
                          ({amountPercentage.toFixed(1)}%)
                        </span>
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    indicatorClassName={`bg-gradient-to-r ${gradient}`}
                    className="h-3"
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default YearLevelStats
