import {
  Users,
  School,
  TrendingUp,
  ArrowRight,
  Heart,
  User,
  Users2,
} from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import {
  formatCurrency,
  safeDivide,
  safePercentage,
  formatScholarName,
} from '../utils/helpers'
import { YEAR_LEVELS } from '../config/yearLevels'
import PesoIcon from './PesoIcon'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const YEAR_BAR_GRADIENTS = {
  '1st Year': 'from-[#587529] to-[#71951E]',
  '2nd Year': 'from-[#71951E] to-[#9fb634]',
  '3rd Year': 'from-[#71951E] to-[#F4BE38]',
  '4th Year': 'from-[#F4BE38] to-[#EDDA5E]',
  '5th Year': 'from-[#587529] to-[#F4BE38]',
  '6th Year': 'from-[#587529] to-[#EDDA5E]',
}

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
  const yearLevelStats = getYearLevelStats(YEAR_LEVELS)
  const schoolStats = [...getSchoolStats()].sort((a, b) => b.count - a.count)

  // PWD and Solo Parent statistics
  const pwdScholars = scholars.filter((s) => s.is_pwd)
  const soloParentScholars = scholars.filter((s) => s.is_solo_parent)
  const pwdCount = pwdScholars.length
  const soloParentCount = soloParentScholars.length
  const pwdPercentage = safePercentage(pwdCount, totalScholars)
  const soloParentPercentage = safePercentage(soloParentCount, totalScholars)

  const pwdBySchool = schools
    .map((school) => ({
      school,
      count: scholars.filter((s) => s.school === school && s.is_pwd).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)

  const soloParentBySchool = schools
    .map((school) => ({
      school,
      count: scholars.filter((s) => s.school === school && s.is_solo_parent)
        .length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)

  // Gender statistics
  const maleScholars = scholars.filter((s) => (s.gender || 'Male') === 'Male')
  const femaleScholars = scholars.filter(
    (s) => (s.gender || 'Male') === 'Female'
  )
  const maleCount = maleScholars.length
  const femaleCount = femaleScholars.length
  const malePercentage = safePercentage(maleCount, totalScholars)
  const femalePercentage = safePercentage(femaleCount, totalScholars)

  const maleBySchool = schools
    .map((school) => ({
      school,
      count: scholars.filter(
        (s) => s.school === school && (s.gender || 'Male') === 'Male'
      ).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)

  const femaleBySchool = schools
    .map((school) => ({
      school,
      count: scholars.filter(
        (s) => s.school === school && (s.gender || 'Male') === 'Female'
      ).length,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)

  // Payment Status statistics (active scholars only)
  const activeScholars = scholars.filter(
    (s) => s.scholarStatus === 'Active' || !s.scholarStatus
  )
  const paidScholars = activeScholars.filter((s) => s.paymentStatus === 'Paid')
  const processingScholars = activeScholars.filter(
    (s) => s.paymentStatus === 'Processing' || !s.paymentStatus
  )
  const paidCount = paidScholars.length
  const processingCount = processingScholars.length
  const paidAmount = paidScholars.reduce(
    (sum, s) => sum + (s.scholarship_amount || s.amount || 0),
    0
  )
  const processingAmount = processingScholars.reduce(
    (sum, s) => sum + (s.scholarship_amount || s.amount || 0),
    0
  )
  const paidPercentage = safePercentage(paidCount, activeScholars.length)
  const processingPercentage = safePercentage(
    processingCount,
    activeScholars.length
  )

  const recentScholars = [...scholars]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)

  return (
    <div className="w-full space-y-6">
      {/* Olive Dark + Butter Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl gradient-emerald-gold p-6 sm:p-7 text-white shadow-lg shadow-[#587529]/20 ring-1 ring-inset ring-white/20 animate-fade-up">
        <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-[#EDDA5E]/25 blur-2xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-16 w-56 h-56 rounded-full bg-[#F4BE38]/20 blur-2xl pointer-events-none" />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Badge className="mb-2 bg-[#F4BE38] text-[#1A1A14] border-transparent font-bold">
              IskoLayan · City Government of Palayan
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              IskoLayan Scholarship Dashboard
            </h1>
            <p className="text-white/90 text-sm mt-1">
              Real-time beneficiary overview, school allocations, and payment status
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/15 backdrop-blur-xl border border-white/25 rounded-2xl px-5 py-3 shadow-sm self-start sm:self-auto">
            <TrendingUp className="w-5 h-5 text-[#F4BE38]" />
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/85 font-semibold">
                Total Records
              </p>
              <p className="text-2xl font-black leading-none mt-0.5">
                {totalScholars}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card
          className="glass-card-hover relative overflow-hidden animate-fade-up"
          style={{ animationDelay: '40ms' }}
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-brand/15 blur-xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand text-brand-foreground flex items-center justify-center shadow-md shadow-brand/20">
                <Users className="w-6 h-6" />
              </div>
              <Badge variant="success">ACTIVE</Badge>
            </div>
            <h3 className="text-4xl font-black text-foreground mb-1">
              {totalScholars}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Total Scholars
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-brand font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                {activeScholars.length} active records in scope
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover relative overflow-hidden animate-fade-up"
          style={{ animationDelay: '90ms' }}
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-highlight/20 blur-xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-highlight text-highlight-foreground flex items-center justify-center shadow-md shadow-highlight/25">
                <PesoIcon className="w-6 h-6" strokeWidth={2} />
              </div>
              <Badge variant="gold">BUDGET</Badge>
            </div>
            <h3 className="text-3xl font-black text-brand mb-1">
              {formatCurrency(totalAmount)}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Total Allocated
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Scholarship grants tracked
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover relative overflow-hidden animate-fade-up"
          style={{ animationDelay: '140ms' }}
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-brand-soft/35 blur-xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-soft text-brand-soft-foreground border border-highlight/40 flex items-center justify-center shadow-md">
                <School className="w-6 h-6" />
              </div>
              <Badge variant="secondary">PARTNERS</Badge>
            </div>
            <h3 className="text-4xl font-black text-foreground mb-1">
              {schools.length}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              Partner Schools
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground font-medium">
                Universities & colleges
              </p>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover relative overflow-hidden animate-fade-up"
          style={{ animationDelay: '190ms' }}
        >
          <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-brand-secondary/15 blur-xl" />
          <CardContent className="p-6 relative">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#71951E] text-[#1A1A14] flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6" />
              </div>
              <Badge variant="outline">LEVELS</Badge>
            </div>
            <h3 className="text-2xl font-black text-foreground mb-1 mt-1">
              1st – {YEAR_LEVELS[YEAR_LEVELS.length - 1]}
            </h3>
            <p className="text-sm font-semibold text-muted-foreground">
              College Levels
            </p>
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-brand font-semibold">
                Academic level spread
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PWD, Solo Parent, and Gender Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '220ms' }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-highlight/25 border border-highlight/50 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    PWD Scholars
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Persons with Disability
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand">{pwdCount}</p>
                <p className="text-xs text-muted-foreground">
                  {pwdPercentage.toFixed(1)}% of all
                </p>
              </div>
            </div>

            {pwdCount === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No PWD scholars yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/25">
                    <p className="text-xs text-foreground font-semibold">
                      Active
                    </p>
                    <p className="text-xl font-bold text-brand">
                      {
                        pwdScholars.filter(
                          (s) => s.scholarStatus === 'Active' || !s.scholarStatus
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-soft/35 border border-highlight/50">
                    <p className="text-xs text-foreground font-semibold">
                      Graduated
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {
                        pwdScholars.filter(
                          (s) => s.scholarStatus === 'Graduated'
                        ).length
                      }
                    </p>
                  </div>
                </div>

                {pwdBySchool.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Top Schools
                    </p>
                    {pwdBySchool.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground truncate pr-2">
                            {item.school}
                          </span>
                          <span className="font-bold text-brand">
                            {item.count}
                          </span>
                        </div>
                        <Progress
                          value={safeDivide(item.count, pwdCount, 0) * 100}
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '260ms' }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-soft/45 border border-highlight/50 flex items-center justify-center">
                  <User className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Solo Parent Scholars
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Single Parent Status
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand">
                  {soloParentCount}
                </p>
                <p className="text-xs text-muted-foreground">
                  {soloParentPercentage.toFixed(1)}% of all
                </p>
              </div>
            </div>

            {soloParentCount === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <p className="text-sm">No solo parent scholars yet</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/25">
                    <p className="text-xs text-foreground font-semibold">
                      Active
                    </p>
                    <p className="text-xl font-bold text-brand">
                      {
                        soloParentScholars.filter(
                          (s) => s.scholarStatus === 'Active' || !s.scholarStatus
                        ).length
                      }
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-brand-soft/35 border border-highlight/50">
                    <p className="text-xs text-foreground font-semibold">
                      Graduated
                    </p>
                    <p className="text-xl font-bold text-foreground">
                      {
                        soloParentScholars.filter(
                          (s) => s.scholarStatus === 'Graduated'
                        ).length
                      }
                    </p>
                  </div>
                </div>

                {soloParentBySchool.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Top Schools
                    </p>
                    {soloParentBySchool.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground truncate pr-2">
                            {item.school}
                          </span>
                          <span className="font-bold text-brand">
                            {item.count}
                          </span>
                        </div>
                        <Progress
                          value={
                            safeDivide(item.count, soloParentCount, 0) * 100
                          }
                          className="h-1.5"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '300ms' }}
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand/15 border border-brand/25 flex items-center justify-center">
                  <Users2 className="w-5 h-5 text-brand" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">
                    Gender Distribution
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Male & Female Scholars
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-brand">{totalScholars}</p>
                <p className="text-xs text-muted-foreground">100% total</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/25">
                <p className="text-xs text-foreground font-semibold">Male</p>
                <p className="text-xl font-bold text-brand">{maleCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {malePercentage.toFixed(1)}%
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-highlight/20 border border-highlight/50">
                <p className="text-xs text-foreground font-semibold">Female</p>
                <p className="text-xl font-bold text-foreground">
                  {femaleCount}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {femalePercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground">
                Top Schools by Gender
              </p>
              {maleBySchool.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate flex-1">
                    Male: {maleBySchool[0].school}
                  </span>
                  <span className="font-bold text-brand ml-2">
                    {maleBySchool[0].count}
                  </span>
                </div>
              )}
              {femaleBySchool.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate flex-1">
                    Female: {femaleBySchool[0].school}
                  </span>
                  <span className="font-bold text-foreground ml-2">
                    {femaleBySchool[0].count}
                  </span>
                </div>
              )}
              {maleBySchool.length === 0 && femaleBySchool.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No data yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status and Year Level Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '340ms' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#587529] to-[#F4BE38] rounded-full" />
                Payment Status
              </h2>
              <Badge variant="success">Active Scholars</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-3.5">
              Distribution of payment status across {activeScholars.length} active scholars
            </p>

            {activeScholars.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">No active scholars yet</p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="relative w-40 h-40 flex-shrink-0">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    {/* Processing (Amber #F4BE38) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#F4BE38"
                      strokeWidth="18"
                      strokeDasharray={`${processingPercentage * 2.512} 251.2`}
                      strokeDashoffset="0"
                    />
                    {/* Paid (Olive Dark #587529) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#587529"
                      strokeWidth="18"
                      strokeDasharray={`${paidPercentage * 2.512} 251.2`}
                      strokeDashoffset={`-${processingPercentage * 2.512}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-2xl font-black text-foreground">
                        {activeScholars.length}
                      </p>
                      <p className="text-xs text-muted-foreground font-semibold">
                        Active
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-brand/10 border border-brand/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-[#587529]" />
                      <span className="text-sm font-semibold text-foreground">
                        Paid
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-brand">{paidCount}</p>
                      <p className="text-xs text-foreground">
                        {formatCurrency(paidAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {paidPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-highlight/20 border border-highlight/60">
                    <div className="flex items-center gap-2.5">
                      <div className="w-3 h-3 rounded-full bg-[#F4BE38]" />
                      <span className="text-sm font-semibold text-foreground">
                        Processing
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-foreground">
                        {processingCount}
                      </p>
                      <p className="text-xs text-foreground">
                        {formatCurrency(processingAmount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {processingPercentage.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '380ms' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#71951E] to-[#EDDA5E] rounded-full" />
                Year Level Stats
              </h2>
              <Badge variant="gold">Distribution</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-3.5">
              Breakdown by college year level
            </p>

            <div className="space-y-4">
              {Object.entries(yearLevelStats).map(([level, stats]) => {
                const percentage = safePercentage(stats.count, totalScholars)
                const gradient =
                  YEAR_BAR_GRADIENTS[level] || 'from-[#587529] to-[#F4BE38]'
                return (
                  <div key={level}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-bold text-foreground">
                        {level}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">
                          {percentage.toFixed(1)}%
                        </span>
                        <span className="text-base font-black text-brand">
                          {stats.count}
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={percentage}
                      indicatorClassName={`bg-gradient-to-r ${gradient}`}
                      className="h-2.5"
                    />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scholars and Partner Schools Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card
          className="xl:col-span-2 animate-fade-up"
          style={{ animationDelay: '420ms' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-5 gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <div className="w-1.5 h-6 bg-gradient-to-b from-[#587529] to-[#F4BE38] rounded-full" />
                  Recent Scholars
                </h2>
                <p className="text-xs text-muted-foreground ml-3.5 mt-1">
                  Latest 5 scholar records in scope
                </p>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => onTabChange('scholars')}
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="rounded-xl border border-border overflow-hidden bg-white/75">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Scholar Name</TableHead>
                    <TableHead>Barangay</TableHead>
                    <TableHead>School</TableHead>
                    <TableHead>Year Level</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentScholars.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-8 text-center text-muted-foreground"
                      >
                        No scholars yet. Click &ldquo;Add Scholar&rdquo; to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    recentScholars.map((scholar) => (
                      <TableRow
                        key={scholar.id}
                        onClick={() => {
                          if (window.getSelection()?.toString()) return
                          onEditScholar?.(scholar)
                        }}
                        className="cursor-pointer"
                      >
                        <TableCell className="font-semibold text-foreground">
                          {formatScholarName(scholar, 'lastFirst')}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {scholar.barangay}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {scholar.school}
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="whitespace-nowrap">
                            {scholar.yearLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-brand">
                          {formatCurrency(
                            scholar.scholarship_amount || scholar.amount || 0
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card
          className="glass-card-hover animate-fade-up"
          style={{ animationDelay: '460ms' }}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#F4BE38] rounded-full" />
                Partner Schools
              </h2>
              <Badge variant="gold">Active</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-5 ml-3.5">
              Universities and colleges
            </p>

            <div className="text-center py-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#587529]/15 to-[#F4BE38]/30 border border-brand/25 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                <School className="w-10 h-10 text-brand" />
              </div>
              <h3 className="text-5xl font-black text-brand mb-1">
                {schools.length}
              </h3>
              <p className="text-sm text-muted-foreground font-semibold">
                Partner Institutions
              </p>
            </div>

            {schools.length > 0 && (
              <div className="pt-4 border-t border-border">
                <p className="text-xs font-semibold text-muted-foreground mb-1">
                  Top Partner
                </p>
                <div className="text-sm text-foreground font-bold">
                  {schoolStats[0]?.school || 'N/A'}
                </div>
                <p className="text-xs text-brand font-semibold mt-1">
                  {schoolStats[0]?.count || 0} scholars
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* School Summary Preview */}
      <Card className="animate-fade-up" style={{ animationDelay: '500ms' }}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <div className="w-1.5 h-6 bg-gradient-to-b from-[#587529] to-[#F4BE38] rounded-full" />
                Partner Schools Overview
              </h2>
              <p className="text-xs text-muted-foreground ml-3.5 mt-1">
                Top institutions by beneficiary count
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onTabChange('schools')}
            >
              Manage Schools
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {schoolStats.length === 0 ? (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <School className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No partner schools yet. Schools appear automatically when scholars are added.
                </p>
              </div>
            ) : (
              schoolStats.slice(0, 8).map((stat) => (
                <Card
                  key={stat.school}
                  className="glass-card-hover bg-gradient-to-br from-white/90 via-muted/60 to-brand-soft/20 border-border"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 bg-brand/15 border border-brand/25 rounded-xl flex items-center justify-center">
                        <School className="w-5 h-5 text-brand" />
                      </div>
                      <Badge variant="gold">
                        {stat.count} {stat.count === 1 ? 'scholar' : 'scholars'}
                      </Badge>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mb-3 line-clamp-2 min-h-[40px] leading-tight">
                      {stat.school}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-muted-foreground font-medium">
                          Amount:
                        </span>
                        <p className="text-base font-black text-brand">
                          {formatCurrency(stat.amount)}
                        </p>
                      </div>
                      <Progress value={stat.percentage} className="h-1.5" />
                      <p className="text-[11px] text-muted-foreground font-semibold text-right">
                        {stat.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
