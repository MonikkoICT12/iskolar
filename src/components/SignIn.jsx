import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Shield, AlertCircle, Eye, EyeOff, School } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import NUEVA_ECIJA_SCHOOLS from '../utils/schools'

const SignIn = () => {
  const navigate = useNavigate()
  const { signInAsAdmin, signInAsScholar, rateLimitInfo } = useAuth()
  
  const [mode, setMode] = useState('scholar') // 'scholar' or 'admin'
  const [selectedSchool, setSelectedSchool] = useState('')
  const [schoolId, setSchoolId] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleScholarSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = signInAsScholar(selectedSchool, schoolId.trim())
      
      if (result.success) {
        navigate('/scholar-portal')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAdminSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = signInAsAdmin(username.trim(), password)
      
      if (result.success) {
        navigate('/admin')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const isRateLimited = rateLimitInfo.isLocked
  const remainingTime = rateLimitInfo.remainingLockTime

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#007AFF] rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
            Iskolar ng Palayan
          </h1>
          <p className="text-[#AAAAAA]">
            Scholarship Management System
          </p>
        </div>

        {/* Sign In Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] overflow-hidden">
          {/* Mode Tabs */}
          <div className="flex border-b border-[#E5E5EA]">
            <button
              onClick={() => {
                setMode('scholar')
                setError('')
                setUsername('')
                setPassword('')
                setSelectedSchool('')
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                mode === 'scholar'
                  ? 'text-[#007AFF] border-b-2 border-[#007AFF] bg-[#F5F5F7]'
                  : 'text-[#AAAAAA] hover:text-[#1D1D1F]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <User className="w-4 h-4" />
                Scholar Sign In
              </div>
            </button>
            <button
              onClick={() => {
                setMode('admin')
                setError('')
                setSchoolId('')
                setSelectedSchool('')
              }}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                mode === 'admin'
                  ? 'text-[#007AFF] border-b-2 border-[#007AFF] bg-[#F5F5F7]'
                  : 'text-[#AAAAAA] hover:text-[#1D1D1F]'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-4 h-4" />
                Admin Sign In
              </div>
            </button>
          </div>

          {/* Rate Limit Warning */}
          {isRateLimited && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Too many failed attempts
                </p>
                <p className="text-xs text-red-600 mt-1">
                  Please wait {Math.ceil(remainingTime / 60)} minutes before trying again.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isRateLimited && (
            <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Scholar Form */}
          {mode === 'scholar' && (
            <form onSubmit={handleScholarSignIn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  School / University
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#AAAAAA]" />
                  <select
                    value={selectedSchool}
                    onChange={(e) => {
                      setSelectedSchool(e.target.value)
                      setSchoolId('') // Clear School ID when school changes
                    }}
                    className="w-full pl-10 pr-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-[#1D1D1F] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all appearance-none"
                    disabled={isRateLimited || loading}
                    required
                  >
                    <option value="">Select your school...</option>
                    {NUEVA_ECIJA_SCHOOLS.map((school) => (
                      <option key={school} value={school}>
                        {school}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-[#AAAAAA] mt-2">
                  Select your school first
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  School ID
                </label>
                <input
                  type="text"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  placeholder="Enter your School ID"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-[#1D1D1F] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  disabled={isRateLimited || loading || !selectedSchool}
                  required
                />
                <p className="text-xs text-[#AAAAAA] mt-2">
                  Use your unique School ID to view your scholarship details
                </p>
              </div>

              <button
                type="submit"
                disabled={isRateLimited || loading || !schoolId.trim() || !selectedSchool}
                className="w-full px-4 py-3 bg-[#007AFF] text-white font-medium rounded-lg hover:bg-[#0051D5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Admin Form */}
          {mode === 'admin' && (
            <form onSubmit={handleAdminSignIn} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter admin username"
                  className="w-full px-4 py-3 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-[#1D1D1F] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                  disabled={isRateLimited || loading}
                  autoComplete="username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1D1D1F] mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full px-4 py-3 pr-12 bg-[#F5F5F7] border border-[#E5E5EA] rounded-lg text-[#1D1D1F] placeholder-[#AAAAAA] focus:outline-none focus:ring-2 focus:ring-[#007AFF] focus:border-transparent transition-all"
                    disabled={isRateLimited || loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#AAAAAA] hover:text-[#1D1D1F] transition-colors"
                    disabled={isRateLimited || loading}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isRateLimited || loading || !username.trim() || !password}
                className="w-full px-4 py-3 bg-[#007AFF] text-white font-medium rounded-lg hover:bg-[#0051D5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Signing In...' : 'Sign In as Admin'}
              </button>
            </form>
          )}
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 bg-white border border-[#E5E5EA] rounded-lg">
          <p className="text-xs text-[#AAAAAA] text-center">
            This is a development system. Production deployment requires proper backend authentication.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
