import { useState, useEffect } from 'react'
import { School, Users, Eye } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import {
  pluralizeScholar,
  formatCurrency,
  formatScholarName,
} from '../utils/helpers'
import Pagination from './Pagination'
import PesoIcon from './PesoIcon'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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

const SchoolSummary = () => {
  const {
    getSchoolStats,
    getTotalScholars,
    getTotalAmount,
    getScholarsBySchool,
  } = useScholarStore()
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const schoolStats = getSchoolStats()
  const totalScholars = getTotalScholars()
  const totalAmount = getTotalAmount()

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSchool])

  const selectedSchoolScholars = selectedSchool
    ? getScholarsBySchool(selectedSchool)
    : []
  const selectedTotal = selectedSchoolScholars.reduce(
    (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
    0
  )
  const totalPages = Math.ceil(selectedSchoolScholars.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedScholars = selectedSchoolScholars.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  return (
    <div className="w-full space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              School Breakdown Summary
            </h2>
            <p className="text-xs text-muted-foreground">
              Detailed view of partner institutions, scholar counts, and allocations.
            </p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>School Institution</TableHead>
                  <TableHead className="text-center">Active Scholars</TableHead>
                  <TableHead className="text-right">Total Amount</TableHead>
                  <TableHead className="text-center">Share %</TableHead>
                  <TableHead className="text-center no-print">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schoolStats.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-12 text-center text-muted-foreground"
                    >
                      <School className="w-12 h-12 mx-auto mb-2 opacity-40" />
                      <p>No schools yet. Add scholars to see breakdown.</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  schoolStats.map((stat, index) => (
                    <TableRow
                      key={stat.school}
                      onClick={() => setSelectedSchool(stat.school)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand/15 text-brand flex items-center justify-center font-bold text-xs">
                            {index + 1}
                          </div>
                          <span className="font-medium text-foreground">
                            {stat.school}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">
                          <Users className="w-3 h-3" />
                          {pluralizeScholar(stat.count)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-brand">
                        {formatCurrency(stat.amount)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="font-bold text-xs text-foreground">
                            {stat.percentage.toFixed(1)}%
                          </span>
                          <Progress value={stat.percentage} className="w-20 h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell
                        className="text-center no-print"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="gradient"
                          size="sm"
                          onClick={() => setSelectedSchool(stat.school)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Scholars
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell>TOTAL / ALL SCHOOLS</TableCell>
                  <TableCell className="text-center">{totalScholars}</TableCell>
                  <TableCell className="text-right text-brand">
                    {formatCurrency(totalAmount)}
                  </TableCell>
                  <TableCell className="text-center">100%</TableCell>
                  <TableCell className="no-print" />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedSchool}
        onOpenChange={(open) => !open && setSelectedSchool(null)}
      >
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand-soft/30 backdrop-blur-xl">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <School className="w-5 h-5 text-brand" />
              <span>{selectedSchool}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedSchoolScholars.length} scholars enrolled in this institution
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-muted/80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Total Scholars
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {selectedSchoolScholars.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-brand" />
                </CardContent>
              </Card>

              <Card className="bg-brand-soft/25">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Total Amount
                    </p>
                    <p className="text-2xl font-bold text-brand mt-1">
                      {formatCurrency(selectedTotal)}
                    </p>
                  </div>
                  <PesoIcon className="w-8 h-8 text-foreground" />
                </CardContent>
              </Card>

              <Card className="bg-muted/80">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground">
                      Avg per Scholar
                    </p>
                    <p className="text-2xl font-bold text-foreground mt-1">
                      {formatCurrency(
                        selectedSchoolScholars.length
                          ? selectedTotal / selectedSchoolScholars.length
                          : 0
                      )}
                    </p>
                  </div>
                  <School className="w-8 h-8 text-brand" />
                </CardContent>
              </Card>
            </div>

            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Scholar Name</TableHead>
                    <TableHead>Barangay</TableHead>
                    <TableHead>Year Level</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Course / Program</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedScholars.map((scholar, index) => (
                    <TableRow key={scholar.id}>
                      <TableCell className="font-semibold text-foreground">
                        {startIndex + index + 1}.{' '}
                        {formatScholarName(scholar, 'full')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {scholar.barangay}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {scholar.yearLevel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {scholar.semester || '1st Sem'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {scholar.course || '-'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-brand">
                        {formatCurrency(
                          scholar.scholarship_amount || scholar.amount || 0
                        )}
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

              <div className="px-4 pb-4">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={selectedSchoolScholars.length}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t border-border bg-muted/50 sm:justify-between">
            <p className="text-xs text-muted-foreground flex items-center">
              Showing {selectedSchoolScholars.length} scholar(s) from{' '}
              {selectedSchool}
            </p>
            <Button variant="outline" onClick={() => setSelectedSchool(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SchoolSummary
