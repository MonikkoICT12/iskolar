import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Users, GraduationCap, School, TrendingUp, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import dataService from '../services/dataService'

const LandingPage = () => {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState(null)
  const [graduatesData, setGraduatesData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPublicData = async () => {
      setLoading(true)
      try {
        const [dashboard, graduates] = await Promise.all([
          dataService.getPublicDashboardStats(),
          dataService.getPublicGraduatesBySchool(),
        ])
        setDashboardData(dashboard)
        setGraduatesData(graduates)
      } catch (err) {
        console.error('Error fetching public data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchPublicData()
  }, [])

  // Colors
  const COLORS = {
    primary: '#007AFF',
    success: '#10b981',
    warning: '#f59e0b',
    background: '#F5F5F7',
    text: '#1D1D1F',
    secondary: '#AAAAAA',
  }

  const PIE_COLORS = [COLORS.success, COLORS.warning]

  // Loading state
  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: COLORS.background }}
      >
        <div className="text-center">
          <div 
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: COLORS.primary, borderTopColor: 'transparent' }}
          />
          <p style={{ color: COLORS.secondary }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Data not available state
  const dataNotAvailable = !dashboardData?.available || !graduatesData?.available

  return (
    <div 
      className="min-h-screen"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1D1D1F 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Award className="w-12 h-12 text-white" strokeWidth={2} />
            </div>
          </div>

          {/* Title */}
          <h1 
            className="text-4xl sm:text-5xl font-bold mb-4"
            style={{ color: COLORS.text }}
          >
            Palayan City Scholarship Management System
          </h1>

          {/* Description */}
          <p 
            className="text-lg mb-8 leading-relaxed max-w-2xl mx-auto"
            style={{ color: COLORS.secondary }}
          >
            Supporting scholars in Palayan City through comprehensive scholarship management, 
            tracking academic progress, and celebrating achievements.
          </p>

          {/* Admin Login Button */}
          <button
            onClick={() => navigate('/admin')}
            className="px-8 py-3 text-lg font-medium rounded-xl transition-all duration-150 shadow-lg hover:shadow-xl"
            style={{
              backgroundColor: COLORS.primary,
              color: '#FFFFFF',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0051D5'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = COLORS.primary
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            Admin Login
          </button>
        </div>
      </div>

      {/* Public Dashboard Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Data Not Available Message */}
        {dataNotAvailable && (
          <div 
            className="mb-8 p-6 rounded-xl flex items-start gap-3"
            style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)', border: '1px solid #E5E5EA' }}
          >
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: COLORS.primary }} />
            <div>
              <h3 className="font-semibold mb-1" style={{ color: COLORS.text }}>
                Data is not available yet
              </h3>
              <p className="text-sm" style={{ color: COLORS.secondary }}>
                The public dashboard data will be available once the backend functions are configured.
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {dashboardData?.available && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Scholars */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                  <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Total Scholars</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.total_scholars || 0}</p>
            </div>

            {/* Active Scholars */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <TrendingUp className="w-6 h-6" style={{ color: COLORS.success }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Active Scholars</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.active_scholars || 0}</p>
            </div>

            {/* Graduates */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                  <GraduationCap className="w-6 h-6" style={{ color: COLORS.success }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Graduates</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.graduated_scholars || 0}</p>
            </div>

            {/* Number of Schools */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                  <School className="w-6 h-6" style={{ color: COLORS.primary }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Schools</p>
              <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.total_schools || 0}</p>
            </div>

            {/* PWD Scholars */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                  <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>PWD Scholars</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.pwd_count || 0}</p>
                <p className="text-sm" style={{ color: COLORS.secondary }}>
                  ({dashboardData.total_scholars > 0 
                    ? ((dashboardData.pwd_count || 0) / dashboardData.total_scholars * 100).toFixed(1)
                    : 0}%)
                </p>
              </div>
            </div>

            {/* Solo Parent Scholars */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                  <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
                </div>
              </div>
              <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Solo Parent Scholars</p>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{dashboardData.solo_parent_count || 0}</p>
                <p className="text-sm" style={{ color: COLORS.secondary }}>
                  ({dashboardData.total_scholars > 0 
                    ? ((dashboardData.solo_parent_count || 0) / dashboardData.total_scholars * 100).toFixed(1)
                    : 0}%)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Charts Section */}
        {dashboardData?.available && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Scholars per School */}
            <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
              <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>
                Scholars per School
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={(dashboardData.scholars_per_school || []).slice(0, 10)} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                  <XAxis type="number" stroke={COLORS.secondary} style={{ fontSize: '12px' }} />
                  <YAxis 
                    type="category" 
                    dataKey="school_name" 
                    stroke={COLORS.secondary} 
                    style={{ fontSize: '12px' }}
                    width={150}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #E5E5EA',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill={COLORS.primary} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Scholars per Year Level & Paid/Unpaid */}
            <div className="space-y-6">
              {/* Scholars per Year Level */}
              <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>
                  Scholars per Year Level
                </h3>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={dashboardData.scholars_per_year_level || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                    <XAxis dataKey="year_level" stroke={COLORS.secondary} style={{ fontSize: '12px' }} />
                    <YAxis stroke={COLORS.secondary} style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#FFFFFF', 
                        border: '1px solid #E5E5EA',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                    />
                    <Bar dataKey="count" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Paid vs Unpaid */}
              <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
                <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>
                  Payment Status
                </h3>
                <div className="flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={140}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Paid', value: dashboardData.paid_count || 0 },
                          { name: 'Processing', value: dashboardData.unpaid_count || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {PIE_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#FFFFFF', 
                          border: '1px solid #E5E5EA',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                      />
                      <Legend 
                        verticalAlign="middle" 
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Graduates Section */}
        <div className="bg-white rounded-xl shadow-sm p-8" style={{ border: '1px solid #E5E5EA' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
              Graduates
            </h2>
            <p className="text-sm" style={{ color: COLORS.secondary }}>
              Celebrating our scholars who have completed their studies
            </p>
          </div>

          {/* Overall Totals */}
          {graduatesData?.available && graduatesData.schools.length > 0 && (
            <div 
              className="mb-8 p-6 rounded-xl"
              style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)' }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>
                    Total Graduated Scholars
                  </p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.text }}>
                    {graduatesData.schools.reduce((sum, school) => sum + (school.graduate_count || 0), 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>
                    Total Scholarship Money
                  </p>
                  <p className="text-3xl font-bold" style={{ color: COLORS.success }}>
                    PHP {graduatesData.schools
                      .reduce((sum, school) => sum + (school.total_scholarship_amount || 0), 0)
                      .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Graduates by School - Aggregate Only (NO NAMES) */}
          {!graduatesData?.available || graduatesData.schools.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: COLORS.secondary }} />
              <p style={{ color: COLORS.secondary }}>No graduates yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {graduatesData.schools
                .sort((a, b) => (a.school_name || '').localeCompare(b.school_name || ''))
                .map((school, index) => (
                  <div 
                    key={index}
                    className="p-6 rounded-lg"
                    style={{ backgroundColor: COLORS.background, border: '1px solid #E5E5EA' }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <GraduationCap className="w-5 h-5 flex-shrink-0" style={{ color: COLORS.success }} />
                          <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                            {school.school_name}
                          </h3>
                        </div>
                        <p className="text-sm" style={{ color: COLORS.secondary }}>
                          {school.graduate_count} {school.graduate_count === 1 ? 'graduated scholar' : 'graduated scholars'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>
                          Total Scholarship
                        </p>
                        <p className="text-xl font-bold" style={{ color: COLORS.success }}>
                          PHP {(school.total_scholarship_amount || 0).toLocaleString('en-PH', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: 2 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t py-8 mt-12" style={{ borderColor: '#E5E5EA' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm" style={{ color: COLORS.secondary }}>
            Palayan City Scholarship Management System
          </p>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
