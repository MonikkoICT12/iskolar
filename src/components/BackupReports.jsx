import { Download, Upload, FileSpreadsheet, FileText, Printer, Database, FileDown } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { format } from 'date-fns'
import { useState } from 'react'
import { exportToCSV, exportToExcel, generateTemplate, downloadFile } from '../utils/exportUtils'
import { parseCSV, parseExcel, detectDuplicates, validateFileType, validateFileSize } from '../utils/importUtils'
import ImportPreviewModal from './ImportPreviewModal'

const BackupReports = () => {
  const { getTotalScholars, getScholarsBySchoolYear, addScholar, updateScholar, showToast, scholars } = useScholarStore()
  
  const [showImportPreview, setShowImportPreview] = useState(false)
  const [parsedImportData, setParsedImportData] = useState(null)
  const [importDuplicates, setImportDuplicates] = useState([])

  const getLastUpdated = () => {
    if (scholars.length === 0) return format(new Date(), 'PPP')
    
    const dates = scholars
      .map(s => s.updatedAt || s.createdAt)
      .filter(Boolean)
      .map(d => new Date(d))
    
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

  const handleDownloadTemplate = (format) => {
    try {
      const blob = generateTemplate(format)
      const extension = format === 'csv' ? 'csv' : 'xlsx'
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
        // Validate file type
        const typeValidation = validateFileType(file)
        if (!typeValidation.valid) {
          showToast(typeValidation.error, 'error')
          return
        }

        // Validate file size
        const sizeValidation = validateFileSize(file)
        if (!sizeValidation.valid) {
          showToast(sizeValidation.error, 'error')
          return
        }

        // Parse file
        let parsed
        if (typeValidation.type === 'csv') {
          parsed = await parseCSV(file)
        } else {
          parsed = await parseExcel(file)
        }

        if (!parsed || parsed.length === 0) {
          showToast('No data found in file', 'error')
          return
        }

        // Get valid scholars for duplicate detection
        const validScholars = parsed.filter(row => row.valid).map(row => row.data)
        
        // Detect duplicates
        const existingScholars = getScholarsBySchoolYear()
        const duplicates = detectDuplicates(existingScholars, validScholars)

        // Show preview modal
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

  const handleImportConfirm = ({ skipDuplicates }) => {
    try {
      const validRows = parsedImportData.filter(row => row.valid)
      let imported = 0
      let skipped = 0
      let updated = 0

      validRows.forEach((row) => {
        const scholarData = row.data
        
        // Check if duplicate
        const isDuplicate = importDuplicates.some(dup => 
          dup.newScholar.firstName === scholarData.firstName &&
          dup.newScholar.lastName === scholarData.lastName &&
          dup.newScholar.school === scholarData.school
        )

        if (isDuplicate) {
          if (skipDuplicates) {
            skipped++
            return
          } else {
            // Find existing scholar and update
            const existing = importDuplicates.find(dup => 
              dup.newScholar.firstName === scholarData.firstName &&
              dup.newScholar.lastName === scholarData.lastName &&
              dup.newScholar.school === scholarData.school
            )?.existing
            
            if (existing) {
              updateScholar(existing.id, scholarData)
              updated++
              return
            }
          }
        }

        // Add new scholar
        addScholar(scholarData)
        imported++
      })

      let message = `Import complete: ${imported} added`
      if (updated > 0) message += `, ${updated} updated`
      if (skipped > 0) message += `, ${skipped} skipped`
      
      showToast(message, 'success')
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

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      {/* Data Management Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Database className="w-5 h-5 text-lgu-blue" />
          Export & Import Data
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Export scholar data to CSV or Excel for backup, reporting, or sharing. Import data from
          spreadsheets to add or update scholar records in bulk.
        </p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 text-indigo-900 flex flex-col items-start gap-2 transition text-left"
          >
            <FileText className="w-5 h-5 text-lgu-blue" />
            <div>
              <span className="font-bold text-sm block">Export to CSV</span>
              <span className="text-xs text-slate-600">Opens in Excel, Google Sheets</span>
            </div>
          </button>

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 text-emerald-900 flex flex-col items-start gap-2 transition text-left"
          >
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-sm block">Export to Excel (.xlsx)</span>
              <span className="text-xs text-slate-600">Microsoft Excel format</span>
            </div>
          </button>

          {/* Import CSV / Excel */}
          <button
            onClick={handleImportFile}
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 text-purple-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Upload className="w-5 h-5 text-purple-600" />
            <div>
              <span className="font-bold text-sm block">Import from CSV / Excel</span>
              <span className="text-xs text-slate-600">Bulk add or update scholars</span>
            </div>
          </button>

          {/* Download CSV Template */}
          <button
            onClick={() => handleDownloadTemplate('csv')}
            className="p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 text-amber-900 flex flex-col items-start gap-2 transition text-left"
          >
            <FileDown className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-sm block">Download CSV Template</span>
              <span className="text-xs text-slate-600">Blank CSV with example</span>
            </div>
          </button>

          {/* Download Excel Template */}
          <button
            onClick={() => handleDownloadTemplate('excel')}
            className="p-4 bg-teal-50 border border-teal-200 rounded-xl hover:bg-teal-100 text-teal-900 flex flex-col items-start gap-2 transition text-left"
          >
            <FileDown className="w-5 h-5 text-teal-600" />
            <div>
              <span className="font-bold text-sm block">Download Excel Template</span>
              <span className="text-xs text-slate-600">Blank .xlsx with example</span>
            </div>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="p-4 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Printer className="w-5 h-5 text-slate-600" />
            <div>
              <span className="font-bold text-sm block">Print Official Report</span>
              <span className="text-xs text-slate-600">Print-ready format</span>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Total Records</p>
            <p className="text-2xl font-bold text-slate-900">{getTotalScholars()}</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Storage Type</p>
            <p className="text-sm font-bold text-slate-900">Browser Storage</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Last Updated</p>
            <p className="text-sm font-bold text-slate-900">{getLastUpdated()}</p>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          How to Use Export & Import
        </h3>
        <ul className="text-xs text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>Export to CSV or Excel</strong> to save scholar data for backup or reporting</li>
          <li><strong>Download Template</strong> to see the correct format for importing data</li>
          <li><strong>Import from CSV / Excel</strong> to add multiple scholars at once or update existing records</li>
          <li>Import automatically detects duplicates (same name + school) and lets you skip or overwrite</li>
          <li>New schools found in the import file are created automatically</li>
          <li>Optional columns: School Year, Semester, GWA (creates grade entry for each scholar)</li>
          <li>Export regularly to prevent data loss if the browser cache is cleared</li>
        </ul>
      </div>

      {/* Import Preview Modal */}
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
