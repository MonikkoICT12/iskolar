import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Award, Users, GraduationCap, School, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import dataService from '../services/dataService'

const LandingPage = () => {
  const navigate = useNavigate()
  const [selectedSchoolFilter, setSelectedSchoolFilter] = useState('ALL')

  // Get statistics
  const stats = dataService.getStatistics()
  const graduatedSchools = dataService.getGraduatedSchools()

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
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Scholars */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                <Users className="w-6 h-6" style={{ color: COLORS.primary }} />
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Total Scholars</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{stats.totalScholars}</p>
          </div>

          {/* Active Scholars */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <TrendingUp className="w-6 h-6" style={{ color: COLORS.success }} />
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Active Scholars</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{stats.totalActive}</p>
          </div>

          {/* Graduates */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <GraduationCap className="w-6 h-6" style={{ color: COLORS.success }} />
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Graduates</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{stats.totalGraduated}</p>
          </div>

          {/* Number of Schools */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)' }}>
                <School className="w-6 h-6" style={{ color: COLORS.primary }} />
              </div>
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: COLORS.secondary }}>Schools</p>
            <p className="text-3xl font-bold" style={{ color: COLORS.text }}>{stats.totalSchools}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Scholars per School */}
          <div className="bg-white rounded-xl shadow-sm p-6" style={{ border: '1px solid #E5E5EA' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: COLORS.text }}>
              Scholars per School
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.schoolStats.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                <XAxis type="number" stroke={COLORS.secondary} style={{ fontSize: '12px' }} />
                <YAxis 
                  type="category" 
                  dataKey="school" 
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
                <BarChart data={stats.yearLevelStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5EA" />
                  <XAxis dataKey="yearLevel" stroke={COLORS.secondary} style={{ fontSize: '12px' }} />
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
                        { name: 'Paid', value: stats.paidCount },
                        { name: 'Processing', value: stats.unpaidCount },
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

        {/* Graduates Section */}
        <div className="bg-white rounded-xl shadow-sm p-8" style={{ border: '1px solid #E5E5EA' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: COLORS.text }}>
                Graduates
              </h2>
              <p className="text-sm" style={{ color: COLORS.secondary }}>
                Celebrating our scholars who have completed their studies
              </p>
            </div>
            
            {/* School Filter */}
            {graduatedSchools.length > 0 && (
              <select
                value={selectedSchoolFilter}
                onChange={(e) => setSelectedSchoolFilter(e.target.value)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid #E5E5EA', color: COLORS.text }}
              >
                <option value="ALL">All Schools</option>
                {graduatedSchools.map(school => (
                  <option key={school} value={school}>{school}</option>
                ))}
              </select>
            )}
          </div>

          {/* Graduates List */}
          {graduatedSchools.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" style={{ color: COLORS.secondary }} />
              <p style={{ color: COLORS.secondary }}>No graduates yet.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {graduatedSchools
                .filter(school => selectedSchoolFilter === 'ALL' || school === selectedSchoolFilter)
                .map((school, index) => {
                  const graduates = dataService.getGraduatedScholarsBySchool(school)
                  return (
                    <div key={index}>
                      <div className="flex items-center gap-3 mb-4">
                        <GraduationCap className="w-5 h-5" style={{ color: COLORS.success }} />
                        <h3 className="text-lg font-bold" style={{ color: COLORS.text }}>
                          {school}
                        </h3>
                        <span className="text-sm" style={{ color: COLORS.secondary }}>
                          ({graduates.length} {graduates.length === 1 ? 'graduate' : 'graduates'})
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {graduates.map((graduate, idx) => (
                          <div 
                            key={idx} 
                            className="p-4 rounded-lg"
                            style={{ backgroundColor: COLORS.background, border: '1px solid #E5E5EA' }}
                          >
                            <p className="font-semibold" style={{ color: COLORS.text }}>
                              {graduate.firstName} {graduate.lastName}
                            </p>
                            <p className="text-sm mt-1" style={{ color: COLORS.secondary }}>
                              Graduated {graduate.yearGraduated || 'N/A'}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
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
