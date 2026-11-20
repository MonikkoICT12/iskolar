import { useState, useRef, useLayoutEffect, useCallback } from 'react'
import {
  Award,
  HelpCircle,
  BarChart3,
  Users,
  School,
  Layers,
  Database,
  ExternalLink,
  LogOut,
  RefreshCw,
  MoreVertical,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import useScholarStore from '../store/scholarStore'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/**
 * Navigation tab strip with a GPU-accelerated sliding olive pill indicator.
 */
const ModuleNavTabs = ({
  tabs,
  activeTab,
  onTabChange,
  listClassName = '',
  triggerClassName = '',
  iconClassName = 'w-4 h-4',
}) => {
  const listRef = useRef(null)
  const canAnimateRef = useRef(false)
  const [indicator, setIndicator] = useState({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
    animate: false,
  })

  const measureIndicator = useCallback(() => {
    const listEl = listRef.current
    if (!listEl) return
    const activeEl = listEl.querySelector(`[data-tab-id="${activeTab}"]`)
    if (!activeEl || activeEl.offsetWidth === 0) return

    const animate = canAnimateRef.current
    setIndicator({
      left: activeEl.offsetLeft,
      top: activeEl.offsetTop,
      width: activeEl.offsetWidth,
      height: activeEl.offsetHeight,
      ready: true,
      animate,
    })

    if (!canAnimateRef.current) {
      requestAnimationFrame(() => {
        canAnimateRef.current = true
      })
    }
  }, [activeTab])

  useLayoutEffect(() => {
    measureIndicator()
    const listEl = listRef.current
    if (!listEl || typeof ResizeObserver === 'undefined') return undefined

    const observer = new ResizeObserver(() => measureIndicator())
    observer.observe(listEl)
    return () => observer.disconnect()
  }, [measureIndicator])

  return (
    <TabsList
      ref={listRef}
      className={`relative bg-[#F2F4EA]/90 border-border ${listClassName}`}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute left-0 top-0 rounded-lg bg-gradient-to-r from-[#587529] to-[#6B8C21] shadow-[0_2px_10px_rgba(88,117,41,0.28)] ${
          indicator.animate
            ? 'transition-[transform,width,height,opacity] duration-300'
            : ''
        }`}
        style={{
          width: `${indicator.width}px`,
          height: `${indicator.height}px`,
          transform: `translate3d(${indicator.left}px, ${indicator.top}px, 0)`,
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
          opacity: indicator.ready ? 1 : 0,
        }}
      />

      {tabs.map((tab) => {
        const Icon = tab.icon
        const isActive = activeTab === tab.id
        return (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            data-tab-id={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative z-10 transition-colors duration-300 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none hover:text-foreground ${triggerClassName}`}
          >
            <Icon
              className={`${iconClassName} transition-transform duration-300 ease-out ${
                isActive ? 'scale-110' : 'scale-100'
              }`}
              strokeWidth={1.75}
            />
            <span>{tab.label}</span>
          </TabsTrigger>
        )
      })}
    </TabsList>
  )
}

const Header = ({ activeTab, onTabChange, onOpenHelp }) => {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { currentSchoolYear, setSchoolYear, fetchScholars, loading, showToast } =
    useScholarStore()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'scholars', label: 'Scholars', icon: Users },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'graduates', label: 'Graduates', icon: Award },
    { id: 'yearlevel', label: 'Year Levels', icon: Layers },
    { id: 'reports', label: 'Reports', icon: Database },
  ]

  const handleLGUPortalClick = () => {
    window.open('https://palayancity.golgu.ph/login', '_blank', 'noopener,noreferrer')
  }

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return
    setIsLoggingOut(true)
    try {
      await signOut()
      setLogoutDialogOpen(false)
      showToast('Signed out successfully', 'info')
      navigate('/')
    } catch (err) {
      console.error('Logout error:', err)
      showToast('Failed to sign out', 'error')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
    <header className="glass-header sticky top-0 z-50 no-print w-full transition-all duration-200">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex min-[1640px]:grid min-[1640px]:grid-cols-[1fr_auto_1fr] items-center justify-between h-16 gap-3">
          {/* Left: Brand */}
          <div className="flex items-center gap-3 flex-shrink-0 justify-self-start">
            <img
              src="/logo/iskolayan-square-light.png"
              alt="IskoLayan Logo"
              className="w-10 h-10 rounded-xl object-contain flex-shrink-0 shadow-sm transition-transform duration-200 hover:scale-105"
            />
            <div className="flex flex-col">
              <h1 className="text-sm font-extrabold tracking-tight text-foreground whitespace-nowrap">
                IskoLayan
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground whitespace-nowrap">
                {currentSchoolYear === 'ALL'
                  ? 'All School Years'
                  : `SY ${currentSchoolYear}`}
              </p>
            </div>
          </div>

          {/* Center: Desktop Shadcn Navigation Tabs */}
          <div className="hidden lg:flex flex-1 items-center justify-center min-w-0 px-2 min-[1640px]:flex-none min-[1640px]:px-0 min-[1640px]:justify-self-center">
            <ModuleNavTabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
              listClassName="inline-flex"
              triggerClassName="lg:px-2.5 xl:px-3"
            />
          </div>

          {/* Right: School Year Select, Utilities & Session */}
          <div className="flex items-center gap-2 flex-shrink-0 justify-self-end">
            <div className="hidden sm:block w-[168px]">
              <Select value={currentSchoolYear} onValueChange={setSchoolYear}>
                <SelectTrigger
                  id="sy-select"
                  aria-label="Select School Year"
                  className="h-9 rounded-lg text-xs"
                >
                  <SelectValue placeholder="School Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All School Years</SelectItem>
                  <SelectItem value="2026-2027">SY 2026–2027</SelectItem>
                  <SelectItem value="2025-2026">SY 2025–2026</SelectItem>
                  <SelectItem value="2024-2025">SY 2024–2025</SelectItem>
                  <SelectItem value="2027-2028">SY 2027–2028</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1.5">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => fetchScholars()}
                    disabled={loading}
                    aria-label="Refresh data from Supabase"
                    className="h-9 w-9 rounded-lg"
                  >
                    <RefreshCw
                      className={`w-4 h-4 text-brand ${
                        loading ? 'animate-spin' : ''
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Refresh data from Supabase</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={onOpenHelp}
                    aria-label="Help"
                    className="hidden md:inline-flex h-9 w-9 rounded-lg"
                  >
                    <HelpCircle className="w-4 h-4 text-brand" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>System Guide</TooltipContent>
              </Tooltip>

              <Button
                variant="outline"
                onClick={handleLGUPortalClick}
                className="hidden xl:inline-flex h-9 px-3 rounded-lg text-xs"
              >
                <span>LGU Portal</span>
                <ExternalLink className="w-3.5 h-3.5 text-brand" />
              </Button>

              {/* Mobile / Tablet overflow dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="xl:hidden h-9 w-9 rounded-lg"
                    aria-label="More actions"
                  >
                    <MoreVertical className="w-4 h-4 text-brand" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={onOpenHelp}
                    className="md:hidden"
                  >
                    <HelpCircle className="w-4 h-4 text-brand" />
                    <span>System Guide</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLGUPortalClick}>
                    <ExternalLink className="w-4 h-4 text-brand" />
                    <span>Open LGU Portal</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="sm:hidden" />
                  <DropdownMenuItem
                    onClick={() => setLogoutDialogOpen(true)}
                    className="sm:hidden text-red-600 focus:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="hidden sm:block h-5 w-px bg-border mx-0.5" />

            <Button
              variant="ghost"
              onClick={() => setLogoutDialogOpen(true)}
              className="hidden sm:inline-flex h-9 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-red-600 hover:bg-red-50/80"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile School Year + Horizontal Shadcn Tabs */}
        <div className="lg:hidden flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide">
          <div className="sm:hidden w-[145px] flex-shrink-0">
            <Select value={currentSchoolYear} onValueChange={setSchoolYear}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="SY" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Years</SelectItem>
                <SelectItem value="2026-2027">2026–2027</SelectItem>
                <SelectItem value="2025-2026">2025–2026</SelectItem>
                <SelectItem value="2024-2025">2024–2025</SelectItem>
                <SelectItem value="2027-2028">2027–2028</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <ModuleNavTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={onTabChange}
            listClassName="inline-flex h-9 mx-auto"
            triggerClassName="text-xs px-2.5 py-1"
            iconClassName="w-3.5 h-3.5"
          />
        </div>
      </div>
    </header>

    <AlertDialog
      open={logoutDialogOpen}
      onOpenChange={(open) => {
        if (!isLoggingOut) setLogoutDialogOpen(open)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center flex-shrink-0">
              <LogOut className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <AlertDialogTitle className="text-foreground">
                Sign out of IskoLayan?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {user?.email ? (
                  <>
                    You are currently signed in as{' '}
                    <span className="font-semibold text-foreground">
                      {user.email}
                    </span>
                    . Signing out will return you to the public portal.
                  </>
                ) : (
                  'Signing out will end your admin session and return you to the public portal.'
                )}
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              handleConfirmLogout()
            }}
            disabled={isLoggingOut}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoggingOut ? 'Signing out...' : 'Yes, Logout'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  )
}

export default Header
