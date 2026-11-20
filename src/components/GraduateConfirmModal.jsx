import { useState } from 'react'
import { GraduationCap } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const GraduateConfirmModal = ({ scholar, onConfirm, onCancel }) => {
  const currentYear = new Date().getFullYear()
  const [yearGraduated, setYearGraduated] = useState(
    scholar?.yearGraduated || currentYear
  )

  const handleConfirm = () => {
    onConfirm(parseInt(yearGraduated, 10) || currentYear)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-md z-[110]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#587529] to-[#F4BE38] flex items-center justify-center text-white shadow-sm">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle>Graduate Scholar</DialogTitle>
              <DialogDescription>
                Move this scholar to the Graduates directory
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-gradient-to-r from-brand-soft/35 to-brand/10 border border-highlight/60/70">
            <p className="text-sm font-bold text-foreground mb-1">
              {scholar?.firstName} {scholar?.lastName}
            </p>
            <p className="text-xs text-foreground/80">
              This scholar will be moved from active Scholars to the Graduates tab.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="graduate-year-input">
              Year Graduated <span className="text-red-500">*</span>
            </Label>
            <Input
              id="graduate-year-input"
              type="number"
              value={yearGraduated}
              onChange={(e) => setYearGraduated(e.target.value)}
              min="2000"
              max="2100"
            />
            <p className="text-xs text-muted-foreground">
              Enter the year this scholar graduated
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" variant="gradient" onClick={handleConfirm}>
            Confirm Graduation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GraduateConfirmModal
