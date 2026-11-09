import { Download, Upload, Trash2, FileJson, Printer, Database } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { format } from 'date-fns'
import ConfirmModal from './ConfirmModal'
import { useState } from 'react'

const BackupReports = () => {
  const { exportData, importData, getTotalScholars, showToast, scholars } = useScholarStore()
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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

  const handleClearAllData = () => {
    setShowClearConfirm(true)
  }

  const confirmClearData = () => {
    useScholarStore.setState({ scholars: [] })
    showToast('All data cleared!', 'warning')
    setShowClearConfirm(false)
  }

  const handleExportJSON = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `iskolar-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImportJSON = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          importData(event.target.result)
        }
        reader.readAsText(file)
      }
    }
    input.click()
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
          Data Management & Backup
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All data is <strong>automatically saved</strong> in the browser of the device you are using.
          Admins should export a backup regularly to prevent data loss.
        </p>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 text-indigo-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Download className="w-5 h-5 text-lgu-blue" />
            <div>
              <span className="font-bold text-sm block">Export / Backup JSON</span>
              <span className="text-xs text-slate-600">Save full data to computer</span>
            </div>
          </button>

          {/* Import JSON */}
          <button
            onClick={handleImportJSON}
            className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 text-emerald-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Upload className="w-5 h-5 text-emerald-600" />
            <div>
              <span className="font-bold text-sm block">Import / Restore JSON</span>
              <span className="text-xs text-slate-600">Load backup from file</span>
            </div>
          </button>

          {/* Print Report */}
          <button
            onClick={handlePrint}
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 text-purple-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Printer className="w-5 h-5 text-purple-600" />
            <div>
              <span className="font-bold text-sm block">Print Official Report</span>
              <span className="text-xs text-slate-600">Print-ready format</span>
            </div>
          </button>

          {/* Clear All Data */}
          <button
            onClick={handleClearAllData}
            className="p-4 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 text-red-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Trash2 className="w-5 h-5 text-red-600" />
            <div>
              <span className="font-bold text-sm block">Clear All Data</span>
              <span className="text-xs text-slate-600">Delete everything (careful!)</span>
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2">
          <FileJson className="w-4 h-4" />
          How to Use the Backup System
        </h3>
        <ul className="text-xs text-amber-800 space-y-1 list-disc list-inside">
          <li>Click <strong>"Export / Backup JSON"</strong> regularly to download your data</li>
          <li>Save the backup file somewhere safe (USB drive, cloud storage, email)</li>
          <li>To restore data, click <strong>"Import / Restore JSON"</strong> and select your backup file</li>
          <li>Data is saved in the browser of the device you are using</li>
          <li>Regular backups prevent data loss if the browser cache is cleared</li>
        </ul>
      </div>

      {/* Clear Data Confirmation Modal */}
      {showClearConfirm && (
        <ConfirmModal
          title="Clear All Data?"
          message="This will permanently delete ALL scholar records. This action cannot be undone. Are you sure you want to proceed?"
          onConfirm={confirmClearData}
          onCancel={() => setShowClearConfirm(false)}
          type="danger"
        />
      )}
    </div>
  )
}

export default BackupReports
