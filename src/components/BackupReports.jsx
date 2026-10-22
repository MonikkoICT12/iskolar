import { Download, Upload, Trash2, FileJson, Printer, Database, Rocket, Users } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { format } from 'date-fns'
import { generateSampleScholars } from '../utils/sampleData'

const BackupReports = () => {
  const { exportData, importData, clearAllData, getTotalScholars, showToast } = useScholarStore()

  const handleLoadSampleData = () => {
    if (window.confirm('This will add 75 sample scholars (15 per university in Nueva Ecija). Continue?')) {
      const sampleScholars = generateSampleScholars()
      const currentScholars = useScholarStore.getState().scholars
      
      // Add sample scholars to existing data
      useScholarStore.setState({ 
        scholars: [...currentScholars, ...sampleScholars] 
      })
      
      showToast(`Successfully added ${sampleScholars.length} sample scholars!`, 'success')
    }
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
          Data Management & Local Backup
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          All data you enter is <strong>automatically saved</strong> to your computer's browser.
          You can export a backup file (JSON) so you won't lose data even if you switch computers.
        </p>

        {/* Free Hosting Guide Banner */}
        <div className="mb-5 bg-gradient-to-r from-blue-900 to-lgu-navy text-white p-4 rounded-xl border border-blue-700 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="bg-amber-400 text-lgu-navy font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                Want a real website link (.com / .app)?
              </span>
              <h4 className="font-bold text-sm">
                Turn this into an online website accessible to other staff!
              </h4>
              <p className="text-xs text-slate-300">
                You can host this <strong>FREE (Forever)</strong> on Netlify,
                GitHub Pages, or Vercel.
              </p>
            </div>
            <button className="bg-amber-400 hover:bg-amber-300 text-lgu-navy font-extrabold text-xs px-4 py-2.5 rounded-lg whitespace-nowrap shadow flex items-center gap-2 transition">
              <Rocket className="w-4 h-4" />
              Deploy Online
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Load Sample Data */}
          <button
            onClick={handleLoadSampleData}
            className="p-4 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 text-purple-900 flex flex-col items-start gap-2 transition text-left"
          >
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <span className="font-bold text-sm block">Load Sample Data</span>
              <span className="text-xs text-slate-600">Add 75 sample scholars (15/university)</span>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={handleExportJSON}
            className="p-4 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 text-blue-900 flex flex-col items-start gap-2 transition text-left"
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
            onClick={clearAllData}
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
            <p className="text-sm font-bold text-slate-900">Browser LocalStorage</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Last Updated</p>
            <p className="text-sm font-bold text-slate-900">{format(new Date(), 'PPP')}</p>
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
          <li>Click <strong>"Export / Backup JSON"</strong> to download your data</li>
          <li>Save the JSON file somewhere safe (USB drive, cloud storage, email)</li>
          <li>To restore data, click <strong>"Import / Restore JSON"</strong> and select your backup file</li>
          <li>Data is automatically saved in your browser - no manual save needed</li>
          <li>To move to another computer, export from old computer and import to new one</li>
        </ul>
      </div>
    </div>
  )
}

export default BackupReports
