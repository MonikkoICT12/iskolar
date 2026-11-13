import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { YEAR_LEVELS } from '../config/yearLevels'
import { SEMESTER_OPTIONS } from '../config/semesters'

const AdvanceTermModal = ({ isOpen, onClose, school, scholars, onApply }) => {
  const [termsPerYear, setTermsPerYear] = useState('Semester') // 'Semester' or 'Trimester'
  const [yearLevelActions, setYearLevelActions] = useState({})
  const [semesterActions, setSemesterActions] = useState({})
  const [resetPaymentStatus, setResetPaymentStatus] = useState(true)
  const [yearGraduated, setYearGraduated] = useState(new Date().getFullYear())
  const [expandedGroups, setExpandedGroups] = useState({})
  const [scholarSelections, setScholarSelections] = useState({})
  const [confirmStep, setConfirmStep] = useState(false)

  // Initialize on open
  useMemo(() => {
    if (isOpen && scholars.length > 0) {
      // Detect if any scholar has 3rd Sem
      const has3rdSem = scholars.some(s => s.semester === '3rd Sem')
      setTermsPerYear(has3rdSem ? 'Trimester' : 'Semester')
      
      // Initialize all scholars as selected
      const initialSelections = {}
      scholars.forEach(s => {
        initialSelections[s.id] = true
      })
      setScholarSelections(initialSelections)
    }
  }, [isOpen, scholars])

  if (!isOpen) return null

  // Group scholars by year level
  const yearLevelGroups = useMemo(() => {
    const groups = {}
    scholars.forEach(scholar => {
      const level = scholar.yearLevel || 'Unknown'
      if (!groups[level]) {
        groups[level] = []
      }
      groups[level].push(scholar)
    })
    return groups
  }, [scholars])

  // Group scholars by semester
  const semesterGroups = useMemo(() => {
    const groups = {}
    scholars.forEach(scholar => {
      const sem = scholar.semester || 'No semester'
      if (!groups[sem]) {
        groups[sem] = []
      }
      groups[sem].push(scholar)
    })
    return groups
  }, [scholars])

  // Get next year level
  const getNextYearLevel = (currentLevel) => {
    const index = YEAR_LEVELS.indexOf(currentLevel)
    if (index >= 0 && index < YEAR_LEVELS.length - 1) {
      return YEAR_LEVELS[index + 1]
    }
    return null
  }

  // Get next semester
  const getNextSemester = (currentSem) => {
    const terms = termsPerYear === 'Trimester' 
      ? ['1st Sem', '2nd Sem', '3rd Sem']
      : ['1st Sem', '2nd Sem']
    
    const index = terms.indexOf(currentSem)
    if (index >= 0 && index < terms.length - 1) {
      return terms[index + 1]
    }
    return '1st Sem' // Start new year
  }

  const isLastTerm = (sem) => {
    const terms = termsPerYear === 'Trimester' 
      ? ['1st Sem', '2nd Sem', '3rd Sem']
      : ['1st Sem', '2nd Sem']
    return sem === terms[terms.length - 1]
  }

  // Handle year level action change
  const handleYearLevelAction = (level, action) => {
    setYearLevelActions(prev => ({ ...prev, [level]: action }))
  }

  // Handle semester action change
  const handleSemesterAction = (sem, action) => {
    setSemesterActions(prev => ({ ...prev, [sem]: action }))
  }

  // Toggle group expansion
  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  // Toggle scholar selection
  const toggleScholar = (scholarId) => {
    setScholarSelections(prev => ({ ...prev, [scholarId]: !prev[scholarId] }))
  }

  // Select/deselect all in group
  const toggleGroupSelection = (groupScholars, select) => {
    const updates = {}
    groupScholars.forEach(s => {
      updates[s.id] = select
    })
    setScholarSelections(prev => ({ ...prev, ...updates }))
  }

  // Promote all levels shortcut
  const promoteAllLevels = () => {
    const actions = {}
    Object.keys(yearLevelGroups).forEach(level => {
      const nextLevel = getNextYearLevel(level)
      if (nextLevel) {
        actions[level] = 'Promote'
      }
    })
    setYearLevelActions(actions)
  }

  // Calculate summary
  const summary = useMemo(() => {
    let promoted = 0
    let graduated = 0
    let termChanged = 0

    scholars.forEach(scholar => {
      if (!scholarSelections[scholar.id]) return

      const yearAction = yearLevelActions[scholar.yearLevel]
      const semAction = semesterActions[scholar.semester]

      if (yearAction === 'Promote') promoted++
      if (yearAction === 'Graduate') graduated++
      if (semAction === 'Move') termChanged++
    })

    return { promoted, graduated, termChanged }
  }, [scholars, yearLevelActions, semesterActions, scholarSelections])

  const hasChanges = summary.promoted > 0 || summary.graduated > 0 || summary.termChanged > 0

  // Handle apply
  const handleApply = () => {
    if (!hasChanges) return

    const changes = []
    scholars.forEach(scholar => {
      if (!scholarSelections[scholar.id]) return

      const change = {
        id: scholar.id,
        originalYearLevel: scholar.yearLevel,
        originalSemester: scholar.semester,
        originalStatus: scholar.status,
        originalScholarStatus: scholar.scholarStatus,
        originalYearGraduated: scholar.yearGraduated
      }

      const yearAction = yearLevelActions[scholar.yearLevel]
      const semAction = semesterActions[scholar.semester]

      // Apply year level change
      if (yearAction === 'Promote') {
        change.yearLevel = getNextYearLevel(scholar.yearLevel)
      } else if (yearAction === 'Graduate') {
        change.scholarStatus = 'Graduated'
        change.yearGraduated = yearGraduated
      }

      // Apply semester change
      if (semAction === 'Move') {
        change.semester = getNextSemester(scholar.semester)
        if (resetPaymentStatus) {
          change.status = 'Processing'
        }
      }

      // Only include if there's an actual change
      if (change.yearLevel || change.scholarStatus || change.semester || change.status) {
        changes.push(change)
      }
    })

    onApply(changes)
    onClose()
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5EA', backgroundColor: '#F5F5F7' }}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
              Advance Term: {school}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-all"
              style={{ color: '#AAAAAA' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E5E5EA'
                e.currentTarget.style.color = '#1D1D1F'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#AAAAAA'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {!confirmStep ? (
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Terms per year selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
                Terms per school year
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTermsPerYear('Semester')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: termsPerYear === 'Semester' ? '#007AFF' : '#FFFFFF',
                    color: termsPerYear === 'Semester' ? '#FFFFFF' : '#1D1D1F',
                    border: '1px solid #E5E5EA'
                  }}
                >
                  Semester (2 terms)
                </button>
                <button
                  onClick={() => setTermsPerYear('Trimester')}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{
                    backgroundColor: termsPerYear === 'Trimester' ? '#007AFF' : '#FFFFFF',
                    color: termsPerYear === 'Trimester' ? '#FFFFFF' : '#1D1D1F',
                    border: '1px solid #E5E5EA'
                  }}
                >
                  Trimester (3 terms)
                </button>
              </div>
            </div>

            {/* Section A: Year Level */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold" style={{ color: '#1D1D1F' }}>Section A: Year Level</h3>
                <button
                  onClick={promoteAllLevels}
                  className="text-xs font-semibold px-3 py-1 rounded-lg"
                  style={{ color: '#007AFF', border: '1px solid #007AFF' }}
                >
                  Promote all levels
                </button>
              </div>
              <div className="space-y-3">
                {YEAR_LEVELS.map(level => {
                  const group = yearLevelGroups[level]
                  if (!group || group.length === 0) return null

                  const nextLevel = getNextYearLevel(level)
                  const action = yearLevelActions[level] || 'Keep'
                  const isExpanded = expandedGroups[`year-${level}`]
                  const selectedCount = group.filter(s => scholarSelections[s.id]).length

                  return (
                    <div key={level} className="border rounded-lg" style={{ borderColor: '#E5E5EA' }}>
                      <div className="p-4" style={{ backgroundColor: '#F5F5F7' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: '#1D1D1F' }}>{level}</span>
                            <span className="text-sm" style={{ color: '#AAAAAA' }}>
                              ({selectedCount} of {group.length} selected)
                            </span>
                          </div>
                          <button
                            onClick={() => toggleGroup(`year-${level}`)}
                            className="p-1"
                            style={{ color: '#007AFF' }}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleYearLevelAction(level, 'Keep')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: action === 'Keep' ? '#007AFF' : '#FFFFFF',
                              color: action === 'Keep' ? '#FFFFFF' : '#1D1D1F',
                              border: '1px solid #E5E5EA'
                            }}
                          >
                            Keep
                          </button>
                          {nextLevel && (
                            <button
                              onClick={() => handleYearLevelAction(level, 'Promote')}
                              className="px-3 py-1 rounded text-xs font-semibold transition-all"
                              style={{
                                backgroundColor: action === 'Promote' ? '#007AFF' : '#FFFFFF',
                                color: action === 'Promote' ? '#FFFFFF' : '#1D1D1F',
                                border: '1px solid #E5E5EA'
                              }}
                            >
                              Promote to {nextLevel}
                            </button>
                          )}
                          <button
                            onClick={() => handleYearLevelAction(level, 'Graduate')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: action === 'Graduate' ? '#10b981' : '#FFFFFF',
                              color: action === 'Graduate' ? '#FFFFFF' : '#1D1D1F',
                              border: '1px solid #E5E5EA'
                            }}
                          >
                            Graduate
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="p-4 space-y-2">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => toggleGroupSelection(group, true)}
                              className="text-xs font-semibold"
                              style={{ color: '#007AFF' }}
                            >
                              Select all
                            </button>
                            <button
                              onClick={() => toggleGroupSelection(group, false)}
                              className="text-xs font-semibold"
                              style={{ color: '#AAAAAA' }}
                            >
                              Deselect all
                            </button>
                          </div>
                          {group.map(scholar => (
                            <label key={scholar.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={scholarSelections[scholar.id] || false}
                                onChange={() => toggleScholar(scholar.id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm" style={{ color: '#1D1D1F' }}>
                                {scholar.lastName}, {scholar.firstName}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Year Graduated input (if any group is set to Graduate) */}
            {Object.values(yearLevelActions).includes('Graduate') && (
              <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Year Graduated
                </label>
                <input
                  type="number"
                  value={yearGraduated}
                  onChange={(e) => setYearGraduated(parseInt(e.target.value))}
                  className="px-3 py-2 rounded-lg text-sm w-32"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
            )}

            {/* Section B: Semester */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3" style={{ color: '#1D1D1F' }}>Section B: Semester</h3>
              <div className="mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={resetPaymentStatus}
                    onChange={(e) => setResetPaymentStatus(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                    Reset payment status to Processing for scholars whose term changes
                  </span>
                </label>
              </div>
              <div className="space-y-3">
                {Object.entries(semesterGroups).map(([sem, group]) => {
                  if (group.length === 0) return null

                  const nextSem = getNextSemester(sem)
                  const action = semesterActions[sem] || 'Keep'
                  const isExpanded = expandedGroups[`sem-${sem}`]
                  const selectedCount = group.filter(s => scholarSelections[s.id]).length
                  const isLast = isLastTerm(sem)

                  return (
                    <div key={sem} className="border rounded-lg" style={{ borderColor: '#E5E5EA' }}>
                      <div className="p-4" style={{ backgroundColor: '#F5F5F7' }}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold" style={{ color: '#1D1D1F' }}>{sem}</span>
                            <span className="text-sm" style={{ color: '#AAAAAA' }}>
                              ({selectedCount} of {group.length} selected)
                            </span>
                          </div>
                          <button
                            onClick={() => toggleGroup(`sem-${sem}`)}
                            className="p-1"
                            style={{ color: '#007AFF' }}
                          >
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSemesterAction(sem, 'Keep')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: action === 'Keep' ? '#007AFF' : '#FFFFFF',
                              color: action === 'Keep' ? '#FFFFFF' : '#1D1D1F',
                              border: '1px solid #E5E5EA'
                            }}
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => handleSemesterAction(sem, 'Move')}
                            className="px-3 py-1 rounded text-xs font-semibold transition-all"
                            style={{
                              backgroundColor: action === 'Move' ? '#007AFF' : '#FFFFFF',
                              color: action === 'Move' ? '#FFFFFF' : '#1D1D1F',
                              border: '1px solid #E5E5EA'
                            }}
                          >
                            {isLast ? `Start new school year (${nextSem})` : `Move to ${nextSem}`}
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="p-4 space-y-2">
                          <div className="flex gap-2 mb-2">
                            <button
                              onClick={() => toggleGroupSelection(group, true)}
                              className="text-xs font-semibold"
                              style={{ color: '#007AFF' }}
                            >
                              Select all
                            </button>
                            <button
                              onClick={() => toggleGroupSelection(group, false)}
                              className="text-xs font-semibold"
                              style={{ color: '#AAAAAA' }}
                            >
                              Deselect all
                            </button>
                          </div>
                          {group.map(scholar => (
                            <label key={scholar.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={scholarSelections[scholar.id] || false}
                                onChange={() => toggleScholar(scholar.id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm" style={{ color: '#1D1D1F' }}>
                                {scholar.lastName}, {scholar.firstName}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Note */}
            <div className="p-3 rounded-lg" style={{ backgroundColor: '#FEF3C7', border: '1px solid #F59E0B' }}>
              <p className="text-xs" style={{ color: '#92400E' }}>
                <span className="font-bold">Note:</span> Add the new term's grades by editing each scholar.
              </p>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <h3 className="text-lg font-bold mb-4" style={{ color: '#1D1D1F' }}>Confirm Changes</h3>
            <div className="space-y-3 mb-6">
              {summary.promoted > 0 && (
                <p className="text-sm" style={{ color: '#1D1D1F' }}>
                  <span className="font-bold">{summary.promoted}</span> scholar{summary.promoted === 1 ? '' : 's'} will be promoted
                </p>
              )}
              {summary.graduated > 0 && (
                <p className="text-sm" style={{ color: '#1D1D1F' }}>
                  <span className="font-bold">{summary.graduated}</span> scholar{summary.graduated === 1 ? '' : 's'} will graduate
                </p>
              )}
              {summary.termChanged > 0 && (
                <p className="text-sm" style={{ color: '#1D1D1F' }}>
                  <span className="font-bold">{summary.termChanged}</span> scholar{summary.termChanged === 1 ? '' : 's'} will move to the next term
                </p>
              )}
            </div>
            <p className="text-sm mb-4" style={{ color: '#AAAAAA' }}>
              These changes will be applied immediately. You can undo them afterwards.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between" style={{ borderColor: '#E5E5EA', backgroundColor: '#F5F5F7' }}>
          {!confirmStep ? (
            <>
              <div className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                {summary.promoted > 0 && `${summary.promoted} will be promoted`}
                {summary.promoted > 0 && summary.graduated > 0 && ', '}
                {summary.graduated > 0 && `${summary.graduated} will graduate`}
                {(summary.promoted > 0 || summary.graduated > 0) && summary.termChanged > 0 && ', '}
                {summary.termChanged > 0 && `${summary.termChanged} will move to next term`}
                {!hasChanges && 'No changes selected'}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{ color: '#AAAAAA', border: '1px solid #E5E5EA' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setConfirmStep(true)}
                  disabled={!hasChanges}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all text-white"
                  style={{
                    backgroundColor: hasChanges ? '#007AFF' : '#AAAAAA',
                    cursor: hasChanges ? 'pointer' : 'not-allowed',
                    opacity: hasChanges ? 1 : 0.5
                  }}
                >
                  Review Changes
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                onClick={() => setConfirmStep(false)}
                className="px-4 py-2 rounded-lg font-semibold text-sm"
                style={{ color: '#007AFF' }}
              >
                ← Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all"
                  style={{ color: '#AAAAAA', border: '1px solid #E5E5EA' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleApply}
                  className="px-4 py-2 rounded-lg font-semibold text-sm transition-all text-white"
                  style={{ backgroundColor: '#10b981' }}
                >
                  Apply Changes
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default AdvanceTermModal
