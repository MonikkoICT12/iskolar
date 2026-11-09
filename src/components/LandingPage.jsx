import { useNavigate } from 'react-router-dom'
import { Award } from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#F5F5F7' }}
    >
      <div className="text-center max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Award className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title */}
        <h1 
          className="text-4xl sm:text-5xl font-bold mb-4"
          style={{ color: '#1D1D1F' }}
        >
          Palayan City Scholarship Management System
        </h1>

        {/* Description */}
        <p 
          className="text-lg mb-8 leading-relaxed"
          style={{ color: '#AAAAAA' }}
        >
          A comprehensive system for managing scholarship programs in Palayan City. 
          Track scholars, manage institutions, monitor disbursements, and generate reports 
          all in one place.
        </p>

        {/* Admin Login Button */}
        <button
          onClick={() => navigate('/admin')}
          className="px-8 py-3 text-lg font-medium rounded-xl transition-all duration-150 shadow-lg hover:shadow-xl"
          style={{
            backgroundColor: '#007AFF',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0051D5'
            e.currentTarget.style.transform = 'translateY(-2px)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007AFF'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          Admin Login
        </button>
      </div>
    </div>
  )
}

export default LandingPage
