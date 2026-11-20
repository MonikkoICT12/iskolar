import { useState } from 'react'
import { AlertCircle, CheckCircle, FileWarning } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const ImportPreviewModal = ({
  parsedData,
  duplicates,
  onConfirm,
  onCancel,
}) => {
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const totalRows = parsedData.length
  const validRows = parsedData.filter((row) => row.valid).length
  const errorRows = parsedData.filter((row) => !row.valid)
  const hasDuplicates = duplicates.length > 0
  const previewRows = parsedData.filter((row) => row.valid).slice(0, 5)

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 overflow-x-hidden">
        <DialogHeader className="sticky top-0 z-10 px-6 py-4 border-b border-border bg-gradient-to-r from-brand/10 to-brand-soft/30 backdrop-blur-xl">
          <DialogTitle className="text-xl">Import Preview</DialogTitle>
          <DialogDescription>
            Review parsed rows, validation errors, and duplicates before saving to Supabase.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/80 border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                Total Rows
              </p>
              <p className="text-2xl font-bold text-foreground">{totalRows}</p>
            </div>
            <div className="p-4 rounded-xl bg-brand/15 border border-brand/35">
              <p className="text-xs font-semibold text-brand mb-1">
                Valid Rows
              </p>
              <p className="text-2xl font-bold text-brand">{validRows}</p>
            </div>
            <div className="p-4 rounded-xl bg-red-50 border border-red-300">
              <p className="text-xs font-semibold text-red-700 mb-1">
                Rows with Errors
              </p>
              <p className="text-2xl font-bold text-red-700">
                {errorRows.length}
              </p>
            </div>
          </div>

          {errorRows.length > 0 && (
            <div className="rounded-xl p-4 bg-highlight/20 border border-highlight/60 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h3 className="font-bold text-sm text-foreground">
                  Rows with Errors (will be skipped)
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {errorRows.map((row) => (
                    <div
                      key={row.rowIndex}
                      className="text-xs p-2.5 rounded-lg bg-white/90 border border-highlight/50"
                    >
                      <p className="font-semibold text-foreground">
                        Row {row.rowIndex}: {row.data.firstName}{' '}
                        {row.data.lastName}
                      </p>
                      <ul className="list-disc list-inside mt-1 text-red-600">
                        {row.errors.map((err, idx) => (
                          <li key={idx}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasDuplicates && (
            <div className="rounded-xl p-4 bg-brand-soft/30 border border-highlight/60 flex items-start gap-3">
              <FileWarning className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-bold text-sm text-foreground">
                    {duplicates.length} Duplicate Scholar
                    {duplicates.length > 1 ? 's' : ''} Detected
                  </h3>
                  <p className="text-xs text-foreground/80">
                    Scholars with the same full name and school already exist in Supabase.
                  </p>
                </div>

                <RadioGroup
                  value={skipDuplicates ? 'skip' : 'overwrite'}
                  onValueChange={(val) => setSkipDuplicates(val === 'skip')}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="skip" id="dup-skip" />
                    <Label htmlFor="dup-skip" className="cursor-pointer font-semibold">
                      Skip Duplicates (recommended)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="overwrite" id="dup-overwrite" />
                    <Label
                      htmlFor="dup-overwrite"
                      className="cursor-pointer font-semibold"
                    >
                      Overwrite Existing Data
                    </Label>
                  </div>
                </RadioGroup>

                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {duplicates.map((dup, idx) => (
                    <div
                      key={idx}
                      className="text-xs p-2 rounded-lg bg-white/90 border border-highlight/50 font-medium text-foreground"
                    >
                      {dup.newScholar.firstName} {dup.newScholar.lastName} —{' '}
                      {dup.newScholar.school}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {previewRows.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-brand" />
                Preview (First 5 Valid Rows)
              </h3>
              <div className="rounded-xl border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Name</TableHead>
                      <TableHead>School</TableHead>
                      <TableHead>Year Level</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewRows.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-semibold text-foreground">
                          {row.data.firstName} {row.data.lastName}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.data.school}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {row.data.yearLevel}
                        </TableCell>
                        <TableCell className="text-xs text-right font-bold text-brand">
                          ₱{row.data.scholarship_amount.toLocaleString('en-PH')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {validRows > 5 && (
                <p className="text-xs text-muted-foreground">
                  ... and {validRows - 5} more valid row
                  {validRows - 5 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl p-4 gradient-emerald-gold-soft border border-brand/30">
            <p className="text-sm font-semibold text-foreground">
              {validRows} scholar{validRows !== 1 ? 's' : ''} ready.
              {errorRows.length > 0 &&
                ` ${errorRows.length} error row${errorRows.length > 1 ? 's' : ''} skipped.`}
              {hasDuplicates &&
                skipDuplicates &&
                ` ${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''} skipped.`}
              {hasDuplicates &&
                !skipDuplicates &&
                ` ${duplicates.length} existing record${duplicates.length > 1 ? 's' : ''} overwritten.`}
            </p>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 px-6 py-4 border-t border-border bg-white/95 backdrop-blur-xl">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={() => onConfirm({ skipDuplicates })}
            disabled={validRows === 0}
          >
            Import {validRows} Scholar{validRows !== 1 ? 's' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default ImportPreviewModal
