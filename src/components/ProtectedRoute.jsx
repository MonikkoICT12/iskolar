import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { AdminShellSkeleton } from './SkeletonScreens'

const ProtectedRoute = ({ children }) => {
  const { user, isAdmin, loading } = useAuth()

  if (loading) {
    return <AdminShellSkeleton />
  }

  if (!user || !isAdmin) {
    return <Navigate to="/signin" replace />
  }

  return children
}

export default ProtectedRoute
