import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  School, 
  MapPin, 
  Calendar, 
  CreditCard, 
  CheckCircle2, 
  Clock,
  LogOut,
  Shield
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import useScholarStore from '../store/scholarStore'
import { formatCurrency } from '../utils/helpers'

const ScholarPortal = () => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { getScholarBySchoolId } = useScholarStore()
  const [scholar, setScholar] = useState(null)

  useEffect(() => {
    if (!user || user.role !== 'scholar') {
      navigate('/')
      return
    }

    const scholarData = getScholarBySchoolId(user.schoolId)
    if (!scholarData) {
      // Scholar not found
      signOut()
      navigate('/')
      return
    }

    setScholar(scholarData)
  }, [user, navigate, signOut, getScholarBySchoolId])

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  if (!scholar) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-[#AAAAAA]">Loading your information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E5EA] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#007AFF] rounded-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-[#1D1D1F]">
                  Scholar Portal
                </h1>
                <p className="text-xs text-[#AAAAAA]">
                  {scholar.schoolId}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#AAAAAA] hover:text-[#1D1D1F] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-[#1D1D1F] mb-2">
            Welcome, {scholar.firstName} {scholar.lastName}!
          </h2>
          <p className="text-[#AAAAAA]">
            View your scholarship information and status below
          </p>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-[#1D1D1F]">
              Scholarship Status
            </h3>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
                scholar.status === 'Paid'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {scholar.status === 'Paid' ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3.5 h-3.5" />
              )}
              {scholar.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg flex-shrink-0">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-[#AAAAAA] mb-1">Scholarship Amount</p>
                <p className="text-xl font-semibold text-[#10b981]">
                  {formatCurrency(scholar.amount)}
                </p>
              </div>
            </div>

            {/* School Year */}
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-[#AAAAAA] mb-1">School Year</p>
                <p className="text-lg font-semibold text-[#1D1D1F]">
                  {scholar.schoolYear}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-6 mb-6">
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-6">
            Personal Information
          </h3>

          <div className="space-y-4">
            {/* Full Name */}
            <div className="flex items-start gap-4 py-3 border-b border-[#E5E5EA]">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                <User className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#AAAAAA] mb-1">Full Name</p>
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {scholar.firstName} {scholar.middleName} {scholar.lastName}
                </p>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start gap-4 py-3 border-b border-[#E5E5EA]">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                <MapPin className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#AAAAAA] mb-1">Address</p>
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {scholar.barangay}, Palayan City, Nueva Ecija
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="flex items-start gap-4 py-3">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                <User className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#AAAAAA] mb-1">Contact Number</p>
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {scholar.contactNumber}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E5EA] p-6">
          <h3 className="text-lg font-semibold text-[#1D1D1F] mb-6">
            Academic Information
          </h3>

          <div className="space-y-4">
            {/* School */}
            <div className="flex items-start gap-4 py-3 border-b border-[#E5E5EA]">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                <School className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#AAAAAA] mb-1">School</p>
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {scholar.school}
                </p>
              </div>
            </div>

            {/* Course */}
            <div className="flex items-start gap-4 py-3 border-b border-[#E5E5EA]">
              <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                <User className="w-5 h-5 text-[#007AFF]" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[#AAAAAA] mb-1">Course</p>
                <p className="text-sm font-medium text-[#1D1D1F]">
                  {scholar.course}
                </p>
              </div>
            </div>

            {/* Year Level & Semester */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-4 py-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#007AFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#AAAAAA] mb-1">Year Level</p>
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    {scholar.yearLevel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 py-3">
                <div className="flex items-center justify-center w-10 h-10 bg-[#F5F5F7] rounded-lg flex-shrink-0">
                  <Calendar className="w-5 h-5 text-[#007AFF]" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-[#AAAAAA] mb-1">Semester</p>
                  <p className="text-sm font-medium text-[#1D1D1F]">
                    {scholar.semester}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#AAAAAA]">
            If you notice any incorrect information, please contact your scholarship coordinator.
          </p>
        </div>
      </div>
    </div>
  )
}

export default ScholarPortal
