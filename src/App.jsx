import { useState } from 'react'
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

function App() {
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
    <div className="h-full text-slate-800 flex flex-col font-sans bg-slate-100 min-h-screen">
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

export default App
