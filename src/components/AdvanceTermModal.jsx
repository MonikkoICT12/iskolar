import { useState, useMemo, useEffect } from 'react'
import { ChevronDown, ChevronUp, Calendar } from 'lucide-react'
import { YEAR_LEVELS } from '../config/yearLevels'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

const AdvanceTermModal = ({ isOpen, onClose, school, scholars, onApply }) => {
  const [termsPerYear, setTermsPerYear] = useState('Semester')
  const [yearLevelActions, setYearLevelActions] = useState({})
  const [semesterActions, setSemesterActions] = useState({})
  const [resetPaymentStatus, setResetPaymentStatus] = useState(true)
  const [yearGraduated, setYearGraduated] = useState(new Date().getFullYear())
  const [expandedGroups, setExpandedGroups] = useState({})
  const [scholarSelections, setScholarSelections] = useState({})
  const [confirmStep, setConfirmStep] = useState(false)

  useEffect(() => {
    if (isOpen && scholars.length > 0) {
      const has3rdSem = scholars.some((s) => s.semester === '3rd Sem')
      setTermsPerYear(has3rdSem ? 'Trimester' : 'Semester')

      const initialSelections = {}
      scholars.forEach((s) => {
        initialSelections[s.id] = true
      })
      setScholarSelections(initialSelections)
      setConfirmStep(false)
      setYearLevelActions({})
      setSemesterActions({})
    }
  }, [isOpen, scholars])

  const yearLevelGroups = useMemo(() => {
    const groups = {}
    scholars.forEach((scholar) => {
      const level = scholar.yearLevel || 'Unknown'
      if (!groups[level]) groups[level] = []
      groups[level].push(scholar)
    })
    return groups
  }, [scholars])

  const semesterGroups = useMemo(() => {
    const groups = {}
    scholars.forEach((scholar) => {
      const sem = scholar.semester || 'No semester'
      if (!groups[sem]) groups[sem] = []
      groups[sem].push(scholar)
    })
    return groups
  }, [scholars])

  const getNextYearLevel = (currentLevel) => {
    const index = YEAR_LEVELS.indexOf(currentLevel)
    if (index >= 0 && index < YEAR_LEVELS.length - 1) {
      return YEAR_LEVELS[index + 1]
    }
    return null
  }

  const getNextSemester = (currentSem) => {
    const terms =
      termsPerYear === 'Trimester'
        ? ['1st Sem', '2nd Sem', '3rd Sem']
        : ['1st Sem', '2nd Sem']

    const index = terms.indexOf(currentSem)
    if (index >= 0 && index < terms.length - 1) {
      return terms[index + 1]
    }
    return '1st Sem'
  }

  const isLastTerm = (sem) => {
    const terms =
      termsPerYear === 'Trimester'
        ? ['1st Sem', '2nd Sem', '3rd Sem']
        : ['1st Sem', '2nd Sem']
    return sem === terms[terms.length - 1]
  }

  const handleYearLevelAction = (level, action) => {
    setYearLevelActions((prev) => ({ ...prev, [level]: action }))
  }

  const handleSemesterAction = (sem, action) => {
    setSemesterActions((prev) => ({ ...prev, [sem]: action }))
  }

  const toggleGroup = (groupKey) => {
    setExpandedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }))
  }

  const toggleScholar = (scholarId) => {
    setScholarSelections((prev) => ({ ...prev, [scholarId]: !prev[scholarId] }))
  }

  const toggleGroupSelection = (groupScholars, select) => {
    const updates = {}
    groupScholars.forEach((s) => {
      updates[s.id] = select
    })
    setScholarSelections((prev) => ({ ...prev, ...updates }))
  }

  const promoteAllLevels = () => {
    const actions = {}
    Object.keys(yearLevelGroups).forEach((level) => {
      if (getNextYearLevel(level)) {
        actions[level] = 'Promote'
      }
    })
    setYearLevelActions(actions)
  }

  const summary = useMemo(() => {
    let promoted = 0
    let graduated = 0
    let termChanged = 0

    scholars.forEach((scholar) => {
      if (!scholarSelections[scholar.id]) return
      const yearAction = yearLevelActions[scholar.yearLevel]
      const semAction = semesterActions[scholar.semester]

      if (yearAction === 'Promote') promoted++
      if (yearAction === 'Graduate') graduated++
      if (semAction === 'Move') termChanged++
    })

    return { promoted, graduated, termChanged }
  }, [scholars, yearLevelActions, semesterActions, scholarSelections])

  const hasChanges =
    summary.promoted > 0 || summary.graduated > 0 || summary.termChanged > 0

  const handleApply = () => {
    if (!hasChanges) return

    const changes = []
    scholars.forEach((scholar) => {
      if (!scholarSelections[scholar.id]) return

      const change = {
        id: scholar.id,
        originalYearLevel: scholar.yearLevel,
        originalSemester: scholar.semester,
        originalStatus: scholar.status,
        originalScholarStatus: scholar.scholarStatus,
        originalYearGraduated: scholar.yearGraduated,
      }

      const yearAction = yearLevelActions[scholar.yearLevel]
      const semAction = semesterActions[scholar.semester]

      if (yearAction === 'Promote') {
        change.yearLevel = getNextYearLevel(scholar.yearLevel)
      } else if (yearAction === 'Graduate') {
        change.scholarStatus = 'Graduated'
        change.yearGraduated = yearGraduated
      }

      if (semAction === 'Move') {
        change.semester = getNextSemester(scholar.semester)
        if (resetPaymentStatus) {
          change.status = 'Processing'
        }
      }

      if (
        change.yearLevel ||
        change.scholarStatus ||
        change.semester ||
        change.status
      ) {
        changes.push(change)
      }
    })

    onApply(changes)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand-soft/30">
          <DialogTitle className="text-xl">Advance Term: {school}</DialogTitle>
          <DialogDescription>
            Batch-promote year levels, graduate seniors, or transition semesters.
          </DialogDescription>
        </DialogHeader>

        {!confirmStep ? (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            <div className="space-y-2">
              <Label>Terms per school year</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant={termsPerYear === 'Semester' ? 'gradient' : 'outline'}
                  onClick={() => setTermsPerYear('Semester')}
                >
                  Semester (2 terms)
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={termsPerYear === 'Trimester' ? 'gradient' : 'outline'}
                  onClick={() => setTermsPerYear('Trimester')}
                >
                  Trimester (3 terms)
                </Button>
              </div>
            </div>

            {/* Section A: Year Level */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-foreground">
                  Section A: Year Level
                </h3>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={promoteAllLevels}
                >
                  Promote all levels
                </Button>
              </div>

              <div className="space-y-3">
                {YEAR_LEVELS.map((level) => {
                  const group = yearLevelGroups[level]
                  if (!group || group.length === 0) return null

                  const nextLevel = getNextYearLevel(level)
                  const action = yearLevelActions[level] || 'Keep'
                  const isExpanded = expandedGroups[`year-${level}`]
                  const selectedCount = group.filter(
                    (s) => scholarSelections[s.id]
                  ).length

                  return (
                    <div
                      key={level}
                      className="rounded-xl border border-border overflow-hidden bg-white/70"
                    >
                      <div className="p-4 bg-gradient-to-r from-brand/10 to-brand-soft/25">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {level}
                            </span>
                            <Badge variant="outline">
                              {selectedCount} of {group.length} selected
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleGroup(`year-${level}`)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={action === 'Keep' ? 'default' : 'outline'}
                            onClick={() => handleYearLevelAction(level, 'Keep')}
                          >
                            Keep
                          </Button>
                          {nextLevel && (
                            <Button
                              type="button"
                              size="sm"
                              variant={
                                action === 'Promote' ? 'default' : 'outline'
                              }
                              onClick={() =>
                                handleYearLevelAction(level, 'Promote')
                              }
                            >
                              Promote to {nextLevel}
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant={
                              action === 'Graduate' ? 'gradient' : 'outline'
                            }
                            onClick={() =>
                              handleYearLevelAction(level, 'Graduate')
                            }
                          >
                            Graduate
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-2 border-t border-border">
                          <div className="flex gap-3 mb-2">
                            <button
                              type="button"
                              onClick={() => toggleGroupSelection(group, true)}
                              className="text-xs font-semibold text-brand hover:underline"
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleGroupSelection(group, false)}
                              className="text-xs font-semibold text-muted-foreground hover:underline"
                            >
                              Deselect all
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.map((scholar) => (
                              <label
                                key={scholar.id}
                                className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                              >
                                <Checkbox
                                  checked={scholarSelections[scholar.id] || false}
                                  onCheckedChange={() =>
                                    toggleScholar(scholar.id)
                                  }
                                />
                                <span>
                                  {scholar.lastName}, {scholar.firstName}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {Object.values(yearLevelActions).includes('Graduate') && (
              <div className="p-4 rounded-xl bg-brand/10 border border-brand/35 space-y-2">
                <Label htmlFor="advance-year-graduated" className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-brand" />
                  <span>Year Graduated</span>
                </Label>
                <Input
                  id="advance-year-graduated"
                  type="number"
                  value={yearGraduated}
                  onChange={(e) =>
                    setYearGraduated(parseInt(e.target.value, 10) || new Date().getFullYear())
                  }
                  className="w-36"
                />
              </div>
            )}

            {/* Section B: Semester */}
            <div className="space-y-3">
              <h3 className="text-base font-bold text-foreground">
                Section B: Semester
              </h3>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <Checkbox
                  checked={resetPaymentStatus}
                  onCheckedChange={(checked) =>
                    setResetPaymentStatus(Boolean(checked))
                  }
                />
                <span className="text-sm font-medium text-foreground">
                  Reset payment status to Processing for scholars whose term changes
                </span>
              </label>

              <div className="space-y-3">
                {Object.entries(semesterGroups).map(([sem, group]) => {
                  if (group.length === 0) return null
                  const nextSem = getNextSemester(sem)
                  const action = semesterActions[sem] || 'Keep'
                  const isExpanded = expandedGroups[`sem-${sem}`]
                  const selectedCount = group.filter(
                    (s) => scholarSelections[s.id]
                  ).length
                  const isLast = isLastTerm(sem)

                  return (
                    <div
                      key={sem}
                      className="rounded-xl border border-border overflow-hidden bg-white/70"
                    >
                      <div className="p-4 bg-gradient-to-r from-brand/10 to-brand-soft/25">
                        <div className="flex items-center justify-between mb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-foreground">
                              {sem}
                            </span>
                            <Badge variant="outline">
                              {selectedCount} of {group.length} selected
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleGroup(`sem-${sem}`)}
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant={action === 'Keep' ? 'default' : 'outline'}
                            onClick={() => handleSemesterAction(sem, 'Keep')}
                          >
                            Keep
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant={action === 'Move' ? 'gradient' : 'outline'}
                            onClick={() => handleSemesterAction(sem, 'Move')}
                          >
                            {isLast
                              ? `Start new school year (${nextSem})`
                              : `Move to ${nextSem}`}
                          </Button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="p-4 space-y-2 border-t border-border">
                          <div className="flex gap-3 mb-2">
                            <button
                              type="button"
                              onClick={() => toggleGroupSelection(group, true)}
                              className="text-xs font-semibold text-brand hover:underline"
                            >
                              Select all
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleGroupSelection(group, false)}
                              className="text-xs font-semibold text-muted-foreground hover:underline"
                            >
                              Deselect all
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {group.map((scholar) => (
                              <label
                                key={scholar.id}
                                className="flex items-center gap-2 cursor-pointer text-sm text-foreground"
                              >
                                <Checkbox
                                  checked={scholarSelections[scholar.id] || false}
                                  onCheckedChange={() =>
                                    toggleScholar(scholar.id)
                                  }
                                />
                                <span>
                                  {scholar.lastName}, {scholar.firstName}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-highlight/20 border border-highlight/60 text-xs text-foreground">
              <strong>Note:</strong> Add each scholar&apos;s new term grades by editing their record after advancing.
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
            <h3 className="text-lg font-bold text-foreground">
              Confirm Changes
            </h3>
            <div className="space-y-2 p-4 rounded-xl bg-brand/10 border border-border">
              {summary.promoted > 0 && (
                <p className="text-sm text-foreground">
                  <strong>{summary.promoted}</strong> scholar
                  {summary.promoted === 1 ? '' : 's'} will be promoted
                </p>
              )}
              {summary.graduated > 0 && (
                <p className="text-sm text-foreground">
                  <strong>{summary.graduated}</strong> scholar
                  {summary.graduated === 1 ? '' : 's'} will graduate
                </p>
              )}
              {summary.termChanged > 0 && (
                <p className="text-sm text-foreground">
                  <strong>{summary.termChanged}</strong> scholar
                  {summary.termChanged === 1 ? '' : 's'} will move to the next term
                </p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Changes will be saved to Supabase immediately. You can undo them from the confirmation toast.
            </p>
          </div>
        )}

        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50 sm:justify-between">
          {!confirmStep ? (
            <>
              <div className="text-xs sm:text-sm font-semibold text-foreground flex items-center">
                {summary.promoted > 0 && `${summary.promoted} promoted`}
                {summary.promoted > 0 && summary.graduated > 0 && ', '}
                {summary.graduated > 0 && `${summary.graduated} graduated`}
                {(summary.promoted > 0 || summary.graduated > 0) &&
                  summary.termChanged > 0 &&
                  ', '}
                {summary.termChanged > 0 && `${summary.termChanged} moving term`}
                {!hasChanges && 'No changes selected'}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  onClick={() => setConfirmStep(true)}
                  disabled={!hasChanges}
                >
                  Review Changes
                </Button>
              </div>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setConfirmStep(false)}>
                ← Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="gradient" onClick={handleApply}>
                  Apply Changes
                </Button>
              </div>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default AdvanceTermModal
