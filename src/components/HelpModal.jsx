import { Book, Database, FileSpreadsheet, BarChart3, ShieldCheck, X } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const HelpModal = ({ isOpen = true, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        hideClose
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden border-0 gap-0"
      >
        <DialogHeader className="sticky top-0 z-10 gradient-emerald-gold text-white px-6 py-5 flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1.5">
            <DialogTitle className="text-white text-xl flex items-center gap-2.5">
              <Book className="w-5 h-5" />
              <span>IskoLayan System Guide</span>
            </DialogTitle>
            <DialogDescription className="text-white/90 text-xs">
              Quick overview for managing scholars, partner schools, graduates, and reports.
            </DialogDescription>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close guide"
              className="rounded-lg p-1.5 text-white/85 hover:text-white hover:bg-white/15 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </DialogClose>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
              Quick Start Workflow
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-foreground/85">
              <li>
                <strong>Add Scholar:</strong> Click <strong>Add Scholar</strong> in the top header to encode a new scholar and GWA/percentage grades.
              </li>
              <li>
                <strong>Filter & Sort Records:</strong> Open the <strong>Scholars</strong> tab to filter by barangay, school, year level, semester, payment status, PWD, Solo Parent, or gender.
              </li>
              <li>
                <strong>Bulk Actions:</strong> Select multiple scholars to mark them as <strong>Paid</strong>, <strong>Processing</strong>, or <strong>Graduated</strong> in one click.
              </li>
              <li>
                <strong>Advance Term:</strong> In <strong>Schools</strong>, click the calendar action to promote year levels or move scholars to the next semester.
              </li>
              <li>
                <strong>Export & Import:</strong> Use the <strong>Reports</strong> tab for Excel/CSV backups, printable reports, and bulk spreadsheet imports.
              </li>
            </ol>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground mb-3">
              System Capabilities
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Card className="bg-muted/80 border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <Database className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-foreground">Supabase Cloud Sync</h4>
                      <Badge variant="success">Live</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Every create, edit, bulk status change, and graduation action persists directly to Supabase.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-soft/25 border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Excel & CSV Import/Export</h4>
                    <p className="text-xs text-foreground/80">
                      Export filtered school-year lists or upload spreadsheets with automatic duplicate detection.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/80 border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <BarChart3 className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Dual Grading Support</h4>
                    <p className="text-xs text-foreground/80">
                      Supports both 1.00–5.00 GWA and 50–100% grading scales across multi-term history.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-brand-soft/25 border-border">
                <CardContent className="p-4 flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-brand mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-1">Role-Protected Admin</h4>
                    <p className="text-xs text-foreground/80">
                      Individual scholar records remain private behind Supabase Auth while public statistics stay aggregate-only.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="text-center pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-medium">
              IskoLayan: Palayan City Scholarship Management System
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default HelpModal
