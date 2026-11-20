import {
  Upload,
  FileSpreadsheet,
  FileText,
  Printer,
  Database,
  FileDown,
} from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { format } from 'date-fns'
import { useState } from 'react'
import {
  exportToCSV,
  exportToExcel,
  generateTemplate,
  downloadFile,
} from '../utils/exportUtils'
import {
  parseCSV,
  parseExcel,
  detectDuplicates,
  validateFileType,
  validateFileSize,
} from '../utils/importUtils'
import ImportPreviewModal from './ImportPreviewModal'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const BackupReports = () => {
  const {
    getTotalScholars,
    getScholarsBySchoolYear,
    bulkImportScholars,
    showToast,
    scholars,
  } = useScholarStore()

  const [showImportPreview, setShowImportPreview] = useState(false)
  const [parsedImportData, setParsedImportData] = useState(null)
  const [importDuplicates, setImportDuplicates] = useState([])

  const getLastUpdated = () => {
    if (scholars.length === 0) return format(new Date(), 'PPP')

    const dates = scholars
      .map((s) => s.updatedAt || s.createdAt)
      .filter(Boolean)
      .map((d) => new Date(d))

    if (dates.length === 0) return format(new Date(), 'PPP')

    const mostRecent = new Date(Math.max(...dates))
    return format(mostRecent, 'PPP')
  }

  const handleExportCSV = () => {
    try {
      const allScholars = getScholarsBySchoolYear()
      if (allScholars.length === 0) {
        showToast('No scholars to export', 'error')
        return
      }

      const blob = exportToCSV(allScholars)
      const filename = `iskolar-scholars-${format(new Date(), 'yyyy-MM-dd')}.csv`
      downloadFile(blob, filename)
      showToast('Exported to CSV successfully!', 'success')
    } catch (error) {
      console.error('Export CSV error:', error)
      showToast(`Export failed: ${error.message}`, 'error')
    }
  }

  const handleExportExcel = () => {
    try {
      const allScholars = getScholarsBySchoolYear()
      if (allScholars.length === 0) {
        showToast('No scholars to export', 'error')
        return
      }

      const blob = exportToExcel(allScholars)
      const filename = `iskolar-scholars-${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      downloadFile(blob, filename)
      showToast('Exported to Excel successfully!', 'success')
    } catch (error) {
      console.error('Export Excel error:', error)
      showToast(`Export failed: ${error.message}`, 'error')
    }
  }

  const handleDownloadTemplate = (fmt) => {
    try {
      const blob = generateTemplate(fmt)
      const extension = fmt === 'csv' ? 'csv' : 'xlsx'
      const filename = `iskolar-import-template.${extension}`
      downloadFile(blob, filename)
      showToast(`Template downloaded: ${filename}`, 'success')
    } catch (error) {
      console.error('Template download error:', error)
      showToast(`Download failed: ${error.message}`, 'error')
    }
  }

  const handleImportFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv,.xls,.xlsx'
    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) return

      try {
        const typeValidation = validateFileType(file)
        if (!typeValidation.valid) {
          showToast(typeValidation.error, 'error')
          return
        }

        const sizeValidation = validateFileSize(file)
        if (!sizeValidation.valid) {
          showToast(sizeValidation.error, 'error')
          return
        }

        const parsed =
          typeValidation.type === 'csv'
            ? await parseCSV(file)
            : await parseExcel(file)

        if (!parsed || parsed.length === 0) {
          showToast('No data found in file', 'error')
          return
        }

        const validScholars = parsed
          .filter((row) => row.valid)
          .map((row) => row.data)
        const existingScholars = getScholarsBySchoolYear()
        const duplicates = detectDuplicates(existingScholars, validScholars)

        setParsedImportData(parsed)
        setImportDuplicates(duplicates)
        setShowImportPreview(true)
      } catch (error) {
        console.error('Import error:', error)
        showToast(`Import failed: ${error.message}`, 'error')
      }
    }
    input.click()
  }

  const handleImportConfirm = async ({ skipDuplicates }) => {
    try {
      const validRows = parsedImportData.filter((row) => row.valid)
      let skipped = 0
      const toInsert = []
      const toUpdate = []

      validRows.forEach((row) => {
        const scholarData = row.data
        const duplicate = importDuplicates.find(
          (dup) =>
            dup.newScholar.firstName === scholarData.firstName &&
            dup.newScholar.lastName === scholarData.lastName &&
            dup.newScholar.school === scholarData.school
        )

        if (duplicate) {
          if (skipDuplicates) {
            skipped++
            return
          } else if (duplicate.existing) {
            toUpdate.push({ id: duplicate.existing.id, data: scholarData })
            return
          }
        }

        toInsert.push(scholarData)
      })

      const { imported, updated, failed, errorMessage } =
        await bulkImportScholars(toInsert, toUpdate)

      let message = `Import complete: ${imported} added`
      if (updated > 0) message += `, ${updated} updated`
      if (skipped > 0) message += `, ${skipped} skipped`
      if (failed > 0) message += `, ${failed} failed`

      showToast(
        failed > 0 && imported === 0 && updated === 0
          ? `Import failed: ${errorMessage || 'Unable to save to Supabase'}`
          : message,
        failed > 0 ? 'warning' : 'success'
      )

      setShowImportPreview(false)
      setParsedImportData(null)
      setImportDuplicates([])
    } catch (error) {
      console.error('Import confirm error:', error)
      showToast(`Import failed: ${error.message}`, 'error')
    }
  }

  const handleImportCancel = () => {
    setShowImportPreview(false)
    setParsedImportData(null)
    setImportDuplicates([])
  }

  const actionTiles = [
    {
      title: 'Export to CSV',
      desc: 'Opens in Excel & Google Sheets',
      icon: FileText,
      tone: 'bg-brand/10 border-border hover:bg-brand/15 text-foreground',
      iconColor: 'text-brand',
      onClick: handleExportCSV,
    },
    {
      title: 'Export to Excel (.xlsx)',
      desc: 'Microsoft Excel workbook format',
      icon: FileSpreadsheet,
      tone: 'bg-muted/80 border-border hover:bg-brand/15 text-foreground',
      iconColor: 'text-brand',
      onClick: handleExportExcel,
    },
    {
      title: 'Import from CSV / Excel',
      desc: 'Bulk add or update scholars in Supabase',
      icon: Upload,
      tone: 'bg-highlight/20 border-highlight/50 hover:bg-brand-soft/45 text-foreground',
      iconColor: 'text-foreground',
      onClick: handleImportFile,
    },
    {
      title: 'Download CSV Template',
      desc: 'Blank CSV with sample format',
      icon: FileDown,
      tone: 'bg-brand-soft/25 border-border hover:bg-brand-soft/45 text-foreground',
      iconColor: 'text-brand',
      onClick: () => handleDownloadTemplate('csv'),
    },
    {
      title: 'Download Excel Template',
      desc: 'Blank .xlsx with sample format',
      icon: FileDown,
      tone: 'bg-brand-soft/30 border-yellow-200 hover:bg-highlight/30 text-foreground',
      iconColor: 'text-foreground',
      onClick: () => handleDownloadTemplate('excel'),
    },
    {
      title: 'Print Official Report',
      desc: 'Print-ready official summary layout',
      icon: Printer,
      tone: 'bg-white/80 border-border hover:bg-muted/70 text-foreground',
      iconColor: 'text-brand',
      onClick: () => window.print(),
    },
  ]

  return (
    <div className="w-full space-y-6">
      <Card className="animate-fade-up">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-brand" />
                Export & Import Data
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Export scholar data to CSV or Excel for reporting, or bulk-import records directly into Supabase.
              </p>
            </div>
            <Badge variant="gold">Supabase Cloud Synced</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {actionTiles.map((tile) => {
              const Icon = tile.icon
              return (
                <button
                  key={tile.title}
                  type="button"
                  onClick={tile.onClick}
                  className={`p-4 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col items-start gap-2.5 text-left ${tile.tone}`}
                >
                  <div className="w-9 h-9 rounded-lg bg-white/85 border border-white flex items-center justify-center shadow-sm">
                    <Icon className={`w-5 h-5 ${tile.iconColor}`} />
                  </div>
                  <div>
                    <span className="font-bold text-sm block">{tile.title}</span>
                    <span className="text-xs opacity-75">{tile.desc}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="animate-fade-up" style={{ animationDelay: '70ms' }}>
        <CardContent className="p-6">
          <h3 className="text-base font-bold text-foreground mb-4">
            System Status
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-muted/80 border border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                Total Records in View
              </p>
              <p className="text-2xl font-black text-foreground">
                {getTotalScholars()}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-brand-soft/25 border border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                Storage Type
              </p>
              <p className="text-sm font-bold text-foreground">
                Supabase Database
              </p>
            </div>
            <div className="p-4 rounded-xl bg-brand-soft/25 border border-border">
              <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                Last Updated
              </p>
              <p className="text-sm font-bold text-foreground">
                {getLastUpdated()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card
        className="gradient-emerald-gold-soft border-brand/30 animate-fade-up"
        style={{ animationDelay: '130ms' }}
      >
        <CardContent className="p-5">
          <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand" />
            How to Use Export & Import
          </h3>
          <ul className="text-xs text-foreground/85 space-y-1.5 list-disc list-inside">
            <li>
              <strong>Export to CSV or Excel</strong> to save scholar data for offline backups or official LGU reporting.
            </li>
            <li>
              <strong>Download Template</strong> to inspect required columns before preparing spreadsheets.
            </li>
            <li>
              <strong>Import from CSV / Excel</strong> to add multiple scholars at once or update existing records.
            </li>
            <li>
              Duplicate detection matches full name + school and lets you skip or overwrite existing rows.
            </li>
            <li>Export regularly to keep offline spreadsheet backups.</li>
          </ul>
        </CardContent>
      </Card>

      {showImportPreview && parsedImportData && (
        <ImportPreviewModal
          parsedData={parsedImportData}
          duplicates={importDuplicates}
          onConfirm={handleImportConfirm}
          onCancel={handleImportCancel}
        />
      )}
    </div>
  )
}

export default BackupReports
