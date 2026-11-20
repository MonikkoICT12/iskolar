import { useState } from 'react'
import { Search, Eye, GraduationCap, RotateCcw } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { formatScholarName } from '../utils/helpers'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

const GraduatesTab = () => {
  const {
    getGraduatedSchoolsList,
    getGraduatedScholarsBySchool,
    getGraduatedScholars,
    returnToActive,
  } = useScholarStore()

  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [confirmReturnModal, setConfirmReturnModal] = useState(false)
  const [scholarToReturn, setScholarToReturn] = useState(null)

  const schools = getGraduatedSchoolsList()
  const totalGraduates = getGraduatedScholars().length

  const handleViewGraduates = (school) => {
    setSelectedSchool(school)
    setSearchTerm('')
    setYearFilter('ALL')
    setViewModalOpen(true)
  }

  const handleReturnToActive = (scholar) => {
    setScholarToReturn(scholar)
    setConfirmReturnModal(true)
  }

  const confirmReturn = async () => {
    if (scholarToReturn) {
      const ok = await returnToActive(scholarToReturn.id)
      if (!ok) return
      setConfirmReturnModal(false)
      setScholarToReturn(null)
      const remainingGraduates = getGraduatedScholarsBySchool(selectedSchool)
      if (remainingGraduates.length === 0) {
        setViewModalOpen(false)
      }
    }
  }

  const schoolGraduates = selectedSchool
    ? getGraduatedScholarsBySchool(selectedSchool)
    : []
  const graduateYears = [
    ...new Set(schoolGraduates.map((s) => s.yearGraduated).filter(Boolean)),
  ].sort((a, b) => b - a)

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-fade-up">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Graduates Directory
          </h2>
          <p className="text-sm text-muted-foreground">
            View graduated scholars grouped by institution.
          </p>
        </div>
        <Badge variant="success" className="self-start sm:self-auto px-3 py-1">
          {totalGraduates} Total {totalGraduates === 1 ? 'Graduate' : 'Graduates'}
        </Badge>
      </div>

      <Card className="overflow-hidden animate-fade-up" style={{ animationDelay: '60ms' }}>
        <Table wrapperClassName="max-h-[calc(100vh-16rem)] min-h-[280px]">
          <TableHeader className="sticky top-0 z-20 bg-[#F6F6F1] shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow className="hover:bg-transparent">
              <TableHead>School / University</TableHead>
              <TableHead className="text-center">Graduates</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="py-12 text-center text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  <p>No graduates yet.</p>
                </TableCell>
              </TableRow>
            ) : (
              schools.map((school) => {
                const graduateCount = getGraduatedScholarsBySchool(school).length
                return (
                  <TableRow
                    key={school}
                    className="cursor-pointer"
                    onClick={() => handleViewGraduates(school)}
                  >
                    <TableCell className="font-semibold text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand/15 to-brand-soft/45 border border-border flex items-center justify-center flex-shrink-0">
                          <GraduationCap className="w-4 h-4 text-brand" />
                        </div>
                        <span>{school}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="gold">
                        {graduateCount}{' '}
                        {graduateCount === 1 ? 'graduate' : 'graduates'}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewGraduates(school)}
                            aria-label="View graduates"
                          >
                            <Eye className="w-4 h-4 text-brand" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>View graduates</TooltipContent>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* View Graduates Dialog */}
      <Dialog
        open={viewModalOpen && !!selectedSchool}
        onOpenChange={(open) => !open && setViewModalOpen(false)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand-soft/25">
            <DialogTitle>{selectedSchool} — Graduates</DialogTitle>
            <DialogDescription>
              {schoolGraduates.length}{' '}
              {schoolGraduates.length === 1 ? 'graduate' : 'graduates'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-3 border-b border-border flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 w-4 h-4 text-brand" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or course..."
                className="pl-9"
              />
            </div>

            {graduateYears.length > 1 && (
              <div className="w-full sm:w-44">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger aria-label="Filter by Graduation Year">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Years</SelectItem>
                    {graduateYears.map((year) => (
                      <SelectItem key={year} value={String(year)}>
                        Batch {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Full Name</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">Year Graduated</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolGraduates
                  .filter((s) => {
                    const matchesSearch =
                      !searchTerm ||
                      formatScholarName(s, 'firstLast')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      (s.course || '')
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase())

                    const matchesYear =
                      yearFilter === 'ALL' ||
                      String(s.yearGraduated) === String(yearFilter)

                    return matchesSearch && matchesYear
                  })
                  .map((scholar) => (
                    <TableRow key={scholar.id}>
                      <TableCell className="font-medium text-foreground">
                        {formatScholarName(scholar, 'full')}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {scholar.course || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="success">
                          {scholar.yearGraduated || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleReturnToActive(scholar)}
                              aria-label="Return to Active"
                            >
                              <RotateCcw className="w-4 h-4 text-brand" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Return to Active</TooltipContent>
                        </Tooltip>
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

      {/* Return to Active AlertDialog */}
      <AlertDialog
        open={confirmReturnModal && !!scholarToReturn}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmReturnModal(false)
            setScholarToReturn(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Return to Active Status</AlertDialogTitle>
            <AlertDialogDescription>
              Return{' '}
              <strong>
                {scholarToReturn
                  ? formatScholarName(scholarToReturn, 'firstLast')
                  : ''}
              </strong>{' '}
              to active status? This scholar will move back from Graduates to the
              Scholars tab.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReturn}>
              Confirm Return
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default GraduatesTab
