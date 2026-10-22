import { Award, HelpCircle, Calendar, Plus, BarChart3, Users, School, Layers, Database } from 'lucide-react'
import useScholarStore from '../store/scholarStore'

const Header = ({ activeTab, onTabChange, onAddScholar, onOpenHelp }) => {
  const { currentSchoolYear, setSchoolYear } = useScholarStore()

  const tabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: BarChart3 },
    { id: 'lgu-system', label: 'Palayan City LGU System', icon: Award },
    { id: 'scholars', label: 'Scholar Records', icon: Users },
    { id: 'schools', label: 'Summary per School', icon: School },
    { id: 'yearlevel', label: 'Year Level Stats', icon: Layers },
    { id: 'reports', label: 'Backup & Reports', icon: Database },
  ]

  return (
    <header className="bg-lgu-navy text-white shadow-lg sticky top-0 z-30 border-b-4 border-lgu-gold no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center text-lgu-navy font-black text-xl shadow-inner">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Palayan City LGU
                </h1>
                <span className="bg-amber-400 text-lgu-navy font-bold text-xs px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official Portal
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-medium flex items-center gap-2">
                <span>Scholarship Program</span>
                <span className="text-slate-500">•</span>
                <span className="text-amber-300 font-semibold">
                  School Year {currentSchoolYear}
                </span>
              </p>
            </div>
          </div>

          {/* Controls & Role Selector */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3">
            {/* Help Button */}
            <button
              onClick={onOpenHelp}
              className="bg-amber-500 hover:bg-amber-400 text-lgu-navy font-bold text-xs px-3 py-2 rounded-lg transition-all shadow flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4" />
              <span>How to Use?</span>
            </button>

            {/* School Year Selector */}
            <div className="flex items-center bg-slate-800/80 rounded-lg border border-slate-700 px-3 py-1.5">
              <Calendar className="w-4 h-4 text-amber-400 mr-2" />
              <label htmlFor="sy-select" className="text-xs text-slate-300 font-medium mr-2">
                SY:
              </label>
              <select
                id="sy-select"
                value={currentSchoolYear}
                onChange={(e) => setSchoolYear(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="2025-2026" className="text-slate-900">2025–2026</option>
                <option value="2026-2027" className="text-slate-900">2026–2027</option>
                <option value="2027-2028" className="text-slate-900">2027–2028</option>
              </select>
            </div>

            {/* Add Scholar Button */}
            <button
              onClick={onAddScholar}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-lg transition-all shadow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Scholar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-lgu-blue border-t border-slate-700/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2 text-xs sm:text-sm font-medium">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-3 py-2 rounded-md transition flex items-center gap-2 whitespace-nowrap ${
                    isActive
                      ? 'text-amber-300 bg-slate-800/90 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
