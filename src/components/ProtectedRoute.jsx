import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth()

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
          <p className="text-[#AAAAAA]">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated - redirect to sign in
  if (!user) {
    return <Navigate to="/" replace />
  }

  // Check role if required
  if (requiredRole && user.role !== requiredRole) {
    // Wrong role - redirect to appropriate page
    if (user.role === 'admin') {
      return <Navigate to="/admin" replace />
    }
    if (user.role === 'scholar') {
      return <Navigate to="/scholar-portal" replace />
    }
    return <Navigate to="/" replace />
  }

  // Authorized - render children
  return children
}

export default ProtectedRoute
