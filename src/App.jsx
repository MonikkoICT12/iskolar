import { useState, useEffect, useCallback } from 'react'
import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import useScholarStore from './store/scholarStore'
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
import ErrorBoundary from './components/ErrorBoundary'
import {
  AdminModuleSkeleton,
  AdminShellSkeleton,
  LandingPageSkeleton,
} from './components/SkeletonScreens'
import { cleanupLegacyStorage } from './utils/storageCleanup'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent } from '@/components/ui/tabs'

const TAB_ORDER = [
  'dashboard',
  'scholars',
  'schools',
  'graduates',
  'yearlevel',
  'reports',
  'lgu-system',
]

function AdminLayout() {
  const { user, isAdmin, securityWarning } = useAuth()
  const {
    fetchScholars,
    resetStore,
    loading,
    error,
    rlsBlocked,
  } = useScholarStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab = TAB_ORDER.includes(tabParam) ? tabParam : 'dashboard'
  const [navDirection, setNavDirection] = useState('initial')
  const [isScholarModalOpen, setIsScholarModalOpen] = useState(false)
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false)
  const [editingScholar, setEditingScholar] = useState(null)

  const handleTabChange = useCallback(
    (nextTab) => {
      if (!nextTab || !TAB_ORDER.includes(nextTab) || nextTab === activeTab) return
      const prevIdx = TAB_ORDER.indexOf(activeTab)
      const nextIdx = TAB_ORDER.indexOf(nextTab)
      setNavDirection(nextIdx >= prevIdx ? 'forward' : 'backward')
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev)
          if (nextTab === 'dashboard') {
            next.delete('tab')
          } else {
            next.set('tab', nextTab)
          }
          return next
        },
        { replace: true }
      )
    },
    [activeTab, setSearchParams]
  )

  useEffect(() => {
    if (user?.id && isAdmin) {
      fetchScholars()
    } else {
      resetStore()
    }
  }, [user?.id, isAdmin, fetchScholars, resetStore])

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
        return (
          <ErrorBoundary>
            <Dashboard onEditScholar={handleEditScholar} onTabChange={handleTabChange} />
          </ErrorBoundary>
        )
      case 'lgu-system':
        return (
          <ErrorBoundary>
            <LGUSystemPage />
          </ErrorBoundary>
        )
      case 'scholars':
        return (
          <ErrorBoundary>
            <ScholarRecords
              onEditScholar={handleEditScholar}
              onAddScholar={handleAddScholar}
            />
          </ErrorBoundary>
        )
      case 'schools':
        return (
          <ErrorBoundary>
            <SchoolsTab />
          </ErrorBoundary>
        )
      case 'graduates':
        return (
          <ErrorBoundary>
            <GraduatesTab />
          </ErrorBoundary>
        )
      case 'yearlevel':
        return (
          <ErrorBoundary>
            <YearLevelStats />
          </ErrorBoundary>
        )
      case 'reports':
        return (
          <ErrorBoundary>
            <BackupReports />
          </ErrorBoundary>
        )
      default:
        return (
          <ErrorBoundary>
            <Dashboard onEditScholar={handleEditScholar} onTabChange={handleTabChange} />
          </ErrorBoundary>
        )
    }
  }

  return (
    <Tabs
      value={activeTab}
      onValueChange={handleTabChange}
      className="bg-frosted-canvas text-foreground flex flex-col font-sans min-h-screen w-full"
    >
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenHelp={() => setIsHelpModalOpen(true)}
      />

      <main className="flex-grow w-full overflow-x-clip px-4 sm:px-6 lg:px-8 py-6">
        {securityWarning === 'legacy_rls' && !error && (
          <Card className="mb-6 border-amber-300/90 bg-amber-50/90">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">
                  Database Security Hardening Required
                </p>
                <p className="text-xs mt-1 text-foreground/80">
                  Run the updated{' '}
                  <code className="font-mono font-semibold bg-white/80 px-1.5 py-0.5 rounded">
                    supabase-admin-rls.sql
                  </code>{' '}
                  script in your Supabase SQL Editor and register your admin email in{' '}
                  <code className="font-mono font-semibold bg-white/80 px-1.5 py-0.5 rounded">
                    public.admin_users
                  </code>{' '}
                  to enforce database-level admin RBAC.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card
            className={`mb-6 animate-in fade-in slide-in-from-top-2 duration-300 ${
              rlsBlocked
                ? 'border-highlight/60/90 bg-highlight/20'
                : 'border-red-300/90 bg-red-50/85'
            }`}
          >
            <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    rlsBlocked ? 'bg-highlight/25 text-foreground' : 'bg-red-100 text-red-700'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    {rlsBlocked
                      ? 'Supabase Row Level Security (RLS) Blocked Admin Read'
                      : 'Failed to Load Scholar Records'}
                  </p>
                  <p className="text-xs mt-1 text-foreground/80">{error}</p>
                  {rlsBlocked && (
                    <p className="text-xs mt-1 text-muted-foreground">
                      Open Supabase SQL Editor, run{' '}
                      <code className="font-mono font-semibold bg-white/70 px-1.5 py-0.5 rounded">
                        supabase-admin-rls.sql
                      </code>
                      , and click Retry.
                    </p>
                  )}
                </div>
              </div>
              <Button
                variant="gradient"
                size="sm"
                onClick={() => fetchScholars()}
                disabled={loading}
                className="self-start sm:self-center flex-shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Retry</span>
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <AdminModuleSkeleton activeTab={activeTab} />
        ) : (
          <TabsContent
            value={activeTab}
            className="mt-0 w-full data-[state=active]:animate-none"
          >
            <div
              key={activeTab}
              className={`w-full ${
                navDirection === 'forward'
                  ? 'animate-module-forward'
                  : navDirection === 'backward'
                  ? 'animate-module-backward'
                  : 'animate-module-initial'
              }`}
            >
              {renderContent()}
            </div>
          </TabsContent>
        )}
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
        <HelpModal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} />
      )}
    </Tabs>
  )
}

function App() {
  const { user, isAdmin, loading } = useAuth()

  useEffect(() => {
    const result = cleanupLegacyStorage()
    if (result.cleaned) {
      console.log(`[App] ${result.message}`)
    }
  }, [])

  if (loading) {
    const isAdminRoute =
      typeof window !== 'undefined' &&
      window.location.pathname.startsWith('/admin')
    return isAdminRoute ? <AdminShellSkeleton /> : <LandingPageSkeleton />
  }

  return (
    <TooltipProvider delayDuration={200}>
      <ErrorBoundary>
        <Routes>
          <Route
            path="/"
            element={
              <ErrorBoundary>
                <LandingPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/signin"
            element={
              user && isAdmin ? (
                <Navigate to="/admin" replace />
              ) : (
                <ErrorBoundary>
                  <SignIn />
                </ErrorBoundary>
              )
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <ErrorBoundary>
                  <AdminLayout />
                </ErrorBoundary>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </ErrorBoundary>
    </TooltipProvider>
  )
}

export default App
