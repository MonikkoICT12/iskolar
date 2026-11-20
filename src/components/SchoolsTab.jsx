import { useState } from 'react'
import { Search, Eye, Edit2, School, Calendar } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { formatScholarName } from '../utils/helpers'
import AdvanceTermModal from './AdvanceTermModal'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const SchoolsTab = () => {
  const {
    getSchoolsList,
    getAllSchoolsList,
    getScholarsBySchool,
    updateSchoolName,
    getActiveScholars,
    bulkUpdateScholars,
    bulkMarkAsGraduated,
    showToast,
  } = useScholarStore()

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [editSchoolName, setEditSchoolName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const [advanceTermModalOpen, setAdvanceTermModalOpen] = useState(false)
  const [advanceTermSchool, setAdvanceTermSchool] = useState(null)

  const schools = getSchoolsList()
  const allActiveScholars = getActiveScholars()

  const handleViewSchool = (school) => {
    setSelectedSchool(school)
    setSearchTerm('')
    setViewModalOpen(true)
  }

  const handleEditSchool = (school) => {
    setSelectedSchool(school)
    setEditSchoolName(school)
    setError('')
    setEditModalOpen(true)
  }

  const handleSaveEdit = async () => {
    const trimmed = editSchoolName.trim().replace(/\s+/g, ' ')
    const normalizedOld = (selectedSchool || '').trim().replace(/\s+/g, ' ')

    if (!trimmed) {
      setError('School name cannot be empty')
      return
    }

    const isDuplicate = getAllSchoolsList().some(
      (s) =>
        s.toLowerCase().replace(/\s+/g, ' ') === trimmed.toLowerCase() &&
        s.toLowerCase().replace(/\s+/g, ' ') !== normalizedOld.toLowerCase()
    )
    if (isDuplicate) {
      setError('This school already exists')
      return
    }

    const result = await updateSchoolName(selectedSchool, trimmed)
    if (result) {
      setEditModalOpen(false)
      setSelectedSchool(null)
      setEditSchoolName('')
      setError('')
    } else {
      setError('Failed to update school name in database')
    }
  }

  const handleAdvanceTerm = (school) => {
    setAdvanceTermSchool(school)
    setAdvanceTermModalOpen(true)
  }

  const triggerUndoAdvanceTerm = async (undoSnapshot) => {
    const results = await Promise.all(
      undoSnapshot.map((change) =>
        bulkUpdateScholars(
          [change.id],
          {
            yearLevel: change.oldYearLevel,
            semester: change.oldSemester,
            status: change.oldStatus,
            scholarStatus: change.oldScholarStatus,
            yearGraduated: change.oldYearGraduated,
          },
          { silent: true }
        )
      )
    )
    if (!results.some((ok) => ok === false)) {
      showToast('Term advance changes undone', 'success')
    }
  }

  const handleApplyAdvanceTerm = async (changes) => {
    const undoSnapshot = changes.map((c) => ({
      id: c.id,
      oldYearLevel: c.originalYearLevel,
      oldSemester: c.originalSemester,
      oldStatus: c.originalStatus,
      oldScholarStatus: c.originalScholarStatus,
      oldYearGraduated: c.originalYearGraduated,
    }))

    const graduatedIds = changes
      .filter((c) => c.scholarStatus === 'Graduated')
      .map((c) => c.id)

    const regularChanges = changes.filter(
      (c) => c.scholarStatus !== 'Graduated'
    )

    const tasks = []
    if (graduatedIds.length > 0) {
      tasks.push(bulkMarkAsGraduated(graduatedIds, null, { silent: true }))
    }

    regularChanges.forEach((change) => {
      const updates = {}
      if (change.yearLevel) updates.yearLevel = change.yearLevel
      if (change.semester) updates.semester = change.semester
      if (change.status) updates.status = change.status
      if (change.scholarStatus) updates.scholarStatus = change.scholarStatus
      if (change.yearGraduated !== undefined)
        updates.yearGraduated = change.yearGraduated

      if (Object.keys(updates).length > 0) {
        tasks.push(bulkUpdateScholars([change.id], updates, { silent: true }))
      }
    })

    const results = await Promise.all(tasks)
    if (results.some((ok) => ok === false)) return

    const promoted = changes.filter((c) => c.yearLevel).length
    const graduated = graduatedIds.length
    const termChanged = changes.filter((c) => c.semester).length

    const message = []
    if (promoted > 0) message.push(`${promoted} promoted`)
    if (graduated > 0) message.push(`${graduated} graduated`)
    if (termChanged > 0) message.push(`${termChanged} moved to next term`)

    showToast(`Term advanced: ${message.join(', ')}`, 'success', {
      duration: 7000,
      action: {
        label: 'Undo',
        onClick: () => triggerUndoAdvanceTerm(undoSnapshot),
      },
    })
  }

  const selectedSchoolScholars = selectedSchool
    ? getScholarsBySchool(selectedSchool)
    : []

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-up">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Partner Schools
          </h2>
          <p className="text-sm text-muted-foreground">
            Inspect active scholars by institution, rename schools, or advance academic terms.
          </p>
        </div>
        <Badge variant="gold" className="self-start sm:self-auto px-3 py-1">
          {schools.length} Active {schools.length === 1 ? 'School' : 'Schools'}
        </Badge>
      </div>

      <Card className="overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <Table wrapperClassName="max-h-[calc(100vh-16rem)] min-h-[280px]">
          <TableHeader className="sticky top-0 z-20 bg-[#F6F6F1] shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow className="hover:bg-transparent">
              <TableHead>School / University</TableHead>
              <TableHead className="text-center">Active Scholars</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  <School className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No schools with active scholars yet.</p>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => {
                const scholarCount = getScholarsBySchool(school).length
                return (
                  <TableRow
                    key={school}
                    className="cursor-pointer"
                    onClick={() => handleViewSchool(school)}
                  >
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand/15 border border-border flex items-center justify-center flex-shrink-0">
                          <School className="w-4 h-4 text-brand" />
                        </div>
                        <span>{school}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="default">
                        {scholarCount} {scholarCount === 1 ? 'scholar' : 'scholars'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewSchool(school)}
                              aria-label="View scholars"
                            >
                              <Eye className="w-4 h-4 text-brand" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View scholars</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSchool(school)}
                              aria-label="Edit school name"
                            >
                              <Edit2 className="w-4 h-4 text-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Rename school</TooltipContent>
                        </Tooltip>

                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleAdvanceTerm(school)}
                              aria-label="Advance term"
                            >
                              <Calendar className="w-4 h-4 text-brand" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Advance Term</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Scholars Dialog */}
      <Dialog
        open={viewModalOpen && !!selectedSchool}
        onOpenChange={(open) => !open && setViewModalOpen(false)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand-soft/25">
            <DialogTitle>{selectedSchool}</DialogTitle>
            <DialogDescription>
              {selectedSchoolScholars.length} active{' '}
              {selectedSchoolScholars.length === 1 ? 'scholar' : 'scholars'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-3 border-b border-border">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-brand" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or course..."
                className="pl-9"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Full Name</TableHead>
                  <TableHead>Year Level</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Payment Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedSchoolScholars
                  .filter((s) => {
                    if (!searchTerm) return true
                    const fullName = formatScholarName(s, 'firstLast').toLowerCase()
                    const course = (s.course || '').toLowerCase()
                    return (
                      fullName.includes(searchTerm.toLowerCase()) ||
                      course.includes(searchTerm.toLowerCase())
                    )
                  })
                  .map((scholar) => (
                    <TableRow key={scholar.id}>
                      <TableCell className="font-medium text-foreground">
                        {formatScholarName(scholar, 'full')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {scholar.yearLevel}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {scholar.course || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant={
                            scholar.status === 'Paid' ? 'success' : 'warning'
                          }
                        >
                          {scholar.status || 'Processing'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50">
            <Button variant="gradient" onClick={() => setViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit School Name Dialog */}
      <Dialog
        open={editModalOpen && !!selectedSchool}
        onOpenChange={(open) => !open && setEditModalOpen(false)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit School Name</DialogTitle>
            <DialogDescription>
              Updates all active and graduated scholars enrolled at this school.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label htmlFor="edit-school-name">School / University Name</Label>
            <Input
              id="edit-school-name"
              type="text"
              value={editSchoolName}
              onChange={(e) => {
                setEditSchoolName(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit()
              }}
              autoFocus
              className={error ? 'border-red-500' : ''}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSaveEdit}
              disabled={!editSchoolName.trim()}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {advanceTermModalOpen && advanceTermSchool && (
        <AdvanceTermModal
          isOpen={advanceTermModalOpen}
          onClose={() => {
            setAdvanceTermModalOpen(false)
            setAdvanceTermSchool(null)
          }}
          school={advanceTermSchool}
          scholars={allActiveScholars.filter(
            (s) => s.school === advanceTermSchool
          )}
          onApply={handleApplyAdvanceTerm}
        />
      )}
    </div>
  )
}

export default SchoolsTab
