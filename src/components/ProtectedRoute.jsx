import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F5F5F7' }}
      >
        <div className="text-center">
          <div 
            className="inline-block w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4"
            style={{ borderColor: '#007AFF', borderTopColor: 'transparent' }}
          />
          <p style={{ color: '#AAAAAA' }}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute
