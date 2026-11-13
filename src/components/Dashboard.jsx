import { Users, School, TrendingUp, Edit2, ArrowRight, Heart, User, Users2 } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { YEAR_LEVEL_COLORS, formatCurrency, safeDivide, safePercentage, formatScholarName } from '../utils/helpers'
import { YEAR_LEVELS } from '../config/yearLevels'
import PesoIcon from './PesoIcon'

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
  const schoolStats = getSchoolStats()

  // PWD and Solo Parent statistics
  const pwdScholars = scholars.filter(s => s.is_pwd)
  const soloParentScholars = scholars.filter(s => s.is_solo_parent)
  const pwdCount = pwdScholars.length
  const soloParentCount = soloParentScholars.length
  const pwdPercentage = safePercentage(pwdCount, totalScholars)
  const soloParentPercentage = safePercentage(soloParentCount, totalScholars)
  
  // PWD breakdown by school
  const pwdBySchool = schools.map(school => {
    const count = scholars.filter(s => s.school === school && s.is_pwd).length
    return { school, count }
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)

  // Solo Parent breakdown by school
  const soloParentBySchool = schools.map(school => {
    const count = scholars.filter(s => s.school === school && s.is_solo_parent).length
    return { school, count }
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)

  // Gender statistics
  const maleScholars = scholars.filter(s => (s.gender || 'Male') === 'Male')
  const femaleScholars = scholars.filter(s => (s.gender || 'Male') === 'Female')
  const maleCount = maleScholars.length
  const femaleCount = femaleScholars.length
  const malePercentage = safePercentage(maleCount, totalScholars)
  const femalePercentage = safePercentage(femaleCount, totalScholars)

  // Gender breakdown by school
  const maleBySchool = schools.map(school => {
    const count = scholars.filter(s => s.school === school && (s.gender || 'Male') === 'Male').length
    return { school, count }
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)

  const femaleBySchool = schools.map(school => {
    const count = scholars.filter(s => s.school === school && (s.gender || 'Male') === 'Female').length
    return { school, count }
  }).filter(item => item.count > 0).sort((a, b) => b.count - a.count)

  // Payment Status statistics (active scholars only)
  const activeScholars = scholars.filter(s => s.scholarStatus === 'Active' || !s.scholarStatus)
  const paidScholars = activeScholars.filter(s => s.paymentStatus === 'Paid')
  const processingScholars = activeScholars.filter(s => s.paymentStatus === 'Processing' || !s.paymentStatus)
  const paidCount = paidScholars.length
  const processingCount = processingScholars.length
  const paidAmount = paidScholars.reduce((sum, s) => sum + (s.scholarship_amount || s.amount || 0), 0)
  const processingAmount = processingScholars.reduce((sum, s) => sum + (s.scholarship_amount || s.amount || 0), 0)
  const paidPercentage = safePercentage(paidCount, activeScholars.length)
  const processingPercentage = safePercentage(processingCount, activeScholars.length)

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
                <PesoIcon className="w-7 h-7" strokeWidth={2} />
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
              1st - {YEAR_LEVELS[YEAR_LEVELS.length - 1]}
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

      {/* PWD, Solo Parent, and Gender Cards - Three Column Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* PWD Scholars Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Heart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">PWD Scholars</h2>
                <p className="text-xs text-slate-500">Persons with Disability</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-blue-600">{pwdCount}</p>
              <p className="text-xs text-slate-500">{pwdPercentage.toFixed(1)}% of all</p>
            </div>
          </div>

          {pwdCount === 0 ? (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">No PWD scholars yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#EBF5FF', border: '1px solid #2196F3' }}>
                  <p className="text-xs text-slate-600 font-semibold">Active</p>
                  <p className="text-xl font-bold text-blue-600">{pwdScholars.filter(s => s.scholarStatus === 'Active' || !s.scholarStatus).length}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
                  <p className="text-xs text-slate-600 font-semibold">Graduated</p>
                  <p className="text-xl font-bold text-green-600">{pwdScholars.filter(s => s.scholarStatus === 'Graduated').length}</p>
                </div>
              </div>

              {pwdBySchool.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#AAAAAA' }}>Breakdown by School</p>
                  <div className="space-y-1.5">
                    {pwdBySchool.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 truncate flex-1">{item.school}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full rounded-full"
                              style={{ width: `${safeDivide(item.count, pwdCount, 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-blue-600 w-4 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Solo Parent Scholars Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Solo Parent Scholars</h2>
                <p className="text-xs text-slate-500">Single Parent Status</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-purple-600">{soloParentCount}</p>
              <p className="text-xs text-slate-500">{soloParentPercentage.toFixed(1)}% of all</p>
            </div>
          </div>

          {soloParentCount === 0 ? (
            <div className="text-center py-4 text-slate-500">
              <p className="text-sm">No solo parent scholars yet</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#F3E5F5', border: '1px solid #9C27B0' }}>
                  <p className="text-xs text-slate-600 font-semibold">Active</p>
                  <p className="text-xl font-bold text-purple-600">{soloParentScholars.filter(s => s.scholarStatus === 'Active' || !s.scholarStatus).length}</p>
                </div>
                <div className="p-2 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
                  <p className="text-xs text-slate-600 font-semibold">Graduated</p>
                  <p className="text-xl font-bold text-green-600">{soloParentScholars.filter(s => s.scholarStatus === 'Graduated').length}</p>
                </div>
              </div>

              {soloParentBySchool.length > 0 && (
                <div>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#AAAAAA' }}>Breakdown by School</p>
                  <div className="space-y-1.5">
                    {soloParentBySchool.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-slate-700 truncate flex-1">{item.school}</span>
                        <div className="flex items-center gap-2 ml-2">
                          <div className="w-12 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-purple-600 h-full rounded-full"
                              style={{ width: `${safeDivide(item.count, soloParentCount, 0) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-bold text-purple-600 w-4 text-right">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Gender Distribution Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
                <Users2 className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Gender Distribution</h2>
                <p className="text-xs text-slate-500">Male & Female Scholars</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-teal-600">{totalScholars}</p>
              <p className="text-xs text-slate-500">100% total</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#E0F2FE', border: '1px solid #0EA5E9' }}>
              <p className="text-xs text-slate-600 font-semibold">Male</p>
              <p className="text-xl font-bold text-sky-600">{maleCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">{malePercentage.toFixed(1)}%</p>
            </div>
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FCE7F3', border: '1px solid #EC4899' }}>
              <p className="text-xs text-slate-600 font-semibold">Female</p>
              <p className="text-xl font-bold text-pink-600">{femaleCount}</p>
              <p className="text-xs text-slate-500 mt-0.5">{femalePercentage.toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: '#AAAAAA' }}>Top Schools by Gender</p>
            <div className="space-y-1.5">
              {maleBySchool.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate flex-1">Male: {maleBySchool[0].school}</span>
                  <span className="font-bold text-sky-600 ml-2">{maleBySchool[0].count}</span>
                </div>
              )}
              {femaleBySchool.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-700 truncate flex-1">Female: {femaleBySchool[0].school}</span>
                  <span className="font-bold text-pink-600 ml-2">{femaleBySchool[0].count}</span>
                </div>
              )}
              {maleBySchool.length === 0 && femaleBySchool.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-2">No data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status and Year Level Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Status Card with Donut Chart */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
              Payment Status
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-700 font-semibold px-3 py-1 rounded-full">
              Active Scholars
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5 ml-3">
            Distribution of payment status across {activeScholars.length} active scholars
          </p>

          {activeScholars.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <p className="text-sm">No active scholars yet</p>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              {/* Donut Chart */}
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="transform -rotate-90">
                  {/* Processing (amber) segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="20"
                    strokeDasharray={`${processingPercentage * 2.512} 251.2`}
                    strokeDashoffset="0"
                  />
                  {/* Paid (green) segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="20"
                    strokeDasharray={`${paidPercentage * 2.512} 251.2`}
                    strokeDashoffset={`-${processingPercentage * 2.512}`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-black text-slate-900">{activeScholars.length}</p>
                    <p className="text-xs text-slate-500 font-semibold">Active</p>
                  </div>
                </div>
              </div>

              {/* Legend and Stats */}
              <div className="flex-1 space-y-3">
                {/* Paid */}
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#D1FAE5', border: '1px solid #10B981' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                    <span className="text-sm font-semibold text-slate-700">Paid</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-green-700">{paidCount}</p>
                    <p className="text-xs text-slate-600">{formatCurrency(paidAmount)}</p>
                    <p className="text-xs text-slate-500">{paidPercentage.toFixed(1)}%</p>
                  </div>
                </div>

                {/* Processing */}
                <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F59E0B' }}></div>
                    <span className="text-sm font-semibold text-slate-700">Processing</span>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-amber-700">{processingCount}</p>
                    <p className="text-xs text-slate-600">{formatCurrency(processingAmount)}</p>
                    <p className="text-xs text-slate-500">{processingPercentage.toFixed(1)}%</p>
                  </div>
                </div>
              </div>
            </div>
          )}
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
                const percentage = safePercentage(stats.count, totalScholars)
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

      {/* Recent Scholars and Partner Schools Grid */}
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
                        {formatScholarName(scholar, 'lastFirst')}
                      </td>
                      <td className="py-3 px-4 text-slate-600">{scholar.barangay}</td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{scholar.school}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-1 rounded-md whitespace-nowrap">
                          {scholar.yearLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold" style={{ color: '#10b981' }}>
                        {formatCurrency(scholar.scholarship_amount || scholar.amount || 0)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Partner Schools Count Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <div className="w-1 h-6 bg-amber-600 rounded-full"></div>
              Partner Schools
            </h2>
            <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full">
              Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5 ml-3">
            Universities and colleges
          </p>

          <div className="text-center py-6">
            <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <School className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-5xl font-black text-amber-600 mb-2">{schools.length}</h3>
            <p className="text-sm text-slate-600 font-semibold">Partner Institutions</p>
          </div>

          {schools.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <p className="text-xs font-semibold mb-2" style={{ color: '#AAAAAA' }}>Top Partner</p>
              <div className="text-sm text-slate-700 font-medium">
                {schoolStats[0]?.school || 'N/A'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {schoolStats[0]?.count || 0} scholars
              </p>
            </div>
          )}
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
            <div className="col-span-full text-center py-8 text-slate-500">
              <School className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No partner schools yet. Schools appear here automatically when you add a scholar.</p>
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
                    <p className="text-base font-black" style={{ color: '#10b981' }}>
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
