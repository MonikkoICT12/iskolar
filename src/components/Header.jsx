import { Award, HelpCircle, Plus, BarChart3, Users, School, Layers, Database, ExternalLink } from 'lucide-react'
import useScholarStore from '../store/scholarStore'

const Header = ({ activeTab, onTabChange, onAddScholar, onOpenHelp }) => {
  const { currentSchoolYear, setSchoolYear } = useScholarStore()

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: BarChart3 },
    { id: 'scholars', label: 'Scholars', icon: Users },
    { id: 'schools', label: 'Schools', icon: School },
    { id: 'yearlevel', label: 'Year Levels', icon: Layers },
    { id: 'reports', label: 'Reports', icon: Database },
  ]

  const handleLGUPortalClick = () => {
    window.open('https://palayancity.golgu.ph/login', '_blank', 'noopener,noreferrer')
  }

  return (
    <header 
      className="sticky top-0 z-50 no-print"
      style={{ 
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E5E5EA'
      }}
    >
      <div className="mx-auto px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo + Title + Tabs */}
          <div className="flex items-center gap-8">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Award className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                  Scholarship Program
                </h1>
                <p className="text-xs" style={{ color: '#AAAAAA' }}>
                  SY {currentSchoolYear}
                </p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <nav 
              className="hidden lg:flex items-center gap-1"
              aria-label="Main navigation"
            >
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className="relative px-3 h-14 flex items-center gap-2 transition-all duration-150"
                    style={{
                      color: isActive ? '#007AFF' : 'rgba(29, 29, 31, 0.6)',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = '#1D1D1F'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = 'rgba(29, 29, 31, 0.6)'
                      }
                    }}
                  >
                    <Icon className="w-4 h-4" strokeWidth={1.5} />
                    <span className="text-sm font-medium">{tab.label}</span>
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-0.5"
                        style={{ backgroundColor: '#007AFF' }}
                      />
                    )}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Right: Controls */}
          <div className="flex items-center gap-3">
            {/* School Year Dropdown */}
            <select
              id="sy-select"
              value={currentSchoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              className="hidden sm:block text-sm px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
              style={{
                color: '#1D1D1F',
                border: '1px solid #E5E5EA',
                backgroundColor: '#FFFFFF',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#007AFF'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#E5E5EA'
              }}
            >
              <option value="2025-2026">2025–2026</option>
              <option value="2026-2027">2026–2027</option>
              <option value="2027-2028">2027–2028</option>
            </select>

            {/* Help Icon Button */}
            <button
              onClick={onOpenHelp}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150"
              style={{ color: '#AAAAAA' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#1D1D1F'
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#AAAAAA'
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
              aria-label="Help"
            >
              <HelpCircle className="w-5 h-5" strokeWidth={1.5} />
            </button>

            {/* LGU Portal Link */}
            <button
              onClick={handleLGUPortalClick}
              className="hidden md:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{ color: '#1D1D1F' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
              }}
            >
              <span>LGU Portal</span>
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
            </button>

            {/* Add Scholar Button */}
            <button
              onClick={onAddScholar}
              className="flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-lg transition-all duration-150 shadow-sm"
              style={{
                backgroundColor: '#007AFF',
                color: '#FFFFFF',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0051D5'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#007AFF'
              }}
            >
              <Plus className="w-4 h-4" strokeWidth={2} />
              <span className="hidden sm:inline">Add Scholar</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Horizontal Scroll */}
        <nav 
          className="lg:hidden flex items-center gap-1 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide"
          aria-label="Main navigation"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className="relative px-3 py-2 flex items-center gap-2 transition-all duration-150 whitespace-nowrap flex-shrink-0"
                style={{
                  color: isActive ? '#007AFF' : 'rgba(29, 29, 31, 0.6)',
                }}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />
                <span className="text-sm font-medium">{tab.label}</span>
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: '#007AFF' }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}

export default Header
