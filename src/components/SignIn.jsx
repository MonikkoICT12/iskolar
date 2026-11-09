import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Award, AlertCircle } from 'lucide-react'

const SignIn = () => {
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const COLORS = {
    primary: '#007AFF',
    background: '#F5F5F7',
    text: '#1D1D1F',
    secondary: '#AAAAAA',
    error: '#FF3B30',
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/admin')
    } catch (err) {
      console.error('Sign in error:', err)
      
      // Friendly error messages
      if (err.message?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else if (err.message?.includes('User not found')) {
        setError('Admin account not set up yet. Please contact your system administrator.')
      } else {
        setError(err.message || 'Admin account not set up yet. Please contact your system administrator.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: COLORS.background }}
    >
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
              <Award className="w-10 h-10 text-white" strokeWidth={2} />
            </div>
          </div>
          <h1 
            className="text-2xl font-bold mb-2"
            style={{ color: COLORS.text }}
          >
            Admin Login
          </h1>
          <p style={{ color: COLORS.secondary }}>
            Palayan City Scholarship Management System
          </p>
        </div>

        {/* Sign In Form */}
        <div 
          className="bg-white rounded-xl shadow-sm p-8"
          style={{ border: '1px solid #E5E5EA' }}
        >
          <form onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div 
                className="mb-4 p-3 rounded-lg flex items-start gap-2"
                style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
              >
                <AlertCircle 
                  className="w-5 h-5 flex-shrink-0 mt-0.5" 
                  style={{ color: COLORS.error }} 
                />
                <p 
                  className="text-sm"
                  style={{ color: COLORS.error }}
                >
                  {error}
                </p>
              </div>
            )}

            {/* Email Field */}
            <div className="mb-4">
              <label 
                htmlFor="email"
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg text-sm transition-all duration-150"
                style={{
                  border: '1px solid #E5E5EA',
                  color: COLORS.text,
                  backgroundColor: loading ? '#F5F5F7' : '#FFFFFF',
                }}
                onFocus={(e) => {
                  if (!loading) e.currentTarget.style.borderColor = COLORS.primary
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5EA'
                }}
                placeholder="admin@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="mb-6">
              <label 
                htmlFor="password"
                className="block text-sm font-medium mb-2"
                style={{ color: COLORS.text }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg text-sm transition-all duration-150"
                style={{
                  border: '1px solid #E5E5EA',
                  color: COLORS.text,
                  backgroundColor: loading ? '#F5F5F7' : '#FFFFFF',
                }}
                onFocus={(e) => {
                  if (!loading) e.currentTarget.style.borderColor = COLORS.primary
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E5E5EA'
                }}
                placeholder="Enter your password"
              />
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-all duration-150 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: COLORS.primary,
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = '#0051D5'
              }}
              onMouseLeave={(e) => {
                if (!loading) e.currentTarget.style.backgroundColor = COLORS.primary
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Back to Home Link */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              disabled={loading}
              className="text-sm transition-all duration-150 disabled:opacity-50"
              style={{ color: COLORS.primary }}
              onMouseEnter={(e) => {
                if (!loading) e.currentTarget.style.textDecoration = 'underline'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.textDecoration = 'none'
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
