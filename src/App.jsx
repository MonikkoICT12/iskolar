import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Header from './components/Header'
import Dashboard from './components/Dashboard'
import ScholarRecords from './components/ScholarRecords'
import SchoolsTab from './components/SchoolsTab'
import GraduatesTab from './components/GraduatesTab'
import YearLevelStats from './components/YearLevelStats'
import BackupReports from './components/BackupReports'
import LGUSystemPage from './components/LGUSystemPage'
import ScholarModal from './components/ScholarModal'
import HelpModal from './components/HelpModal'
import Toast from './components/Toast'
import LandingPage from './components/LandingPage'
import SignIn from './components/SignIn'

function AdminLayout() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isScholarModalOpen, setIsScholarModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [editingScholar, setEditingScholar] = useState(null)

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
        return <SchoolsTab />
      case 'graduates':
        return <GraduatesTab />
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

  return (
    <Routes>
      {/* Landing Page - Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Sign In - Public */}
      <Route path="/signin" element={<SignIn />} />

      {/* Admin Routes - Protected */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
