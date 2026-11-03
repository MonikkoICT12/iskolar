import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ScholarRecords from './components/ScholarRecords'
import SchoolSummary from './components/SchoolSummary'
import YearLevelStats from './components/YearLevelStats'
import BackupReports from './components/BackupReports'
import LGUSystemPage from './components/LGUSystemPage'
import ScholarModal from './components/ScholarModal'
import HelpModal from './components/HelpModal'
import Toast from './components/Toast'
import SignIn from './components/SignIn'
import ScholarPortal from './components/ScholarPortal'
import ProtectedRoute from './components/ProtectedRoute'

function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isScholarModalOpen, setIsScholarModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [editingScholar, setEditingScholar] = useState(null)
  const { user } = useAuth()

  const handleAddScholar = () => {
    setEditingScholar(null)
    setIsScholarModalOpen(true)
  }

  const handleEditScholar = (scholar) => {
    setEditingScholar(scholar)
    setIsScholarModalOpen(true)
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onEditScholar={handleEditScholar} onTabChange={setActiveTab} />
      case 'lgu-system':
        return <LGUSystemPage />
      case 'scholars':
        return <ScholarRecords onEditScholar={handleEditScholar} />
      case 'schools':
        return <SchoolSummary />
      case 'yearlevel':
        return <YearLevelStats />
      case 'reports':
        return <BackupReports />
      default:
        return <Dashboard onEditScholar={handleEditScholar} onTabChange={setActiveTab} />
    }
  }

  return (
    <div className="h-full text-slate-800 flex flex-col font-sans min-h-screen" style={{ backgroundColor: '#F5F5F7' }}>
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddScholar={handleAddScholar}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderContent()}
      </main>

      {isScholarModalOpen && (
        <ScholarModal
          scholar={editingScholar}
          onClose={() => {
            setIsScholarModalOpen(false)
            setEditingScholar(null)
          }}
        />
      )}

      {isHelpModalOpen && (
        <HelpModal onClose={() => setIsHelpModalOpen(false)} />
      )}

      <Toast />
    </div>
  )
}

function App() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()

  // Redirect authenticated users on root path
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'admin') {
        navigate('/admin', { replace: true })
      } else if (user.role === 'scholar') {
        navigate('/scholar-portal', { replace: true })
      }
    }
  }, [user, loading, navigate])

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          user ? (
            user.role === 'admin' ? (
              <Navigate to="/admin" replace />
            ) : (
              <Navigate to="/scholar-portal" replace />
            )
          ) : (
            <SignIn />
          )
        } 
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      />

      {/* Protected Scholar Routes */}
      <Route
        path="/scholar-portal"
        element={
          <ProtectedRoute requiredRole="scholar">
            <ScholarPortal />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
