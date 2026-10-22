import { X, Book, Rocket, Code, Cloud } from 'lucide-react'

const HelpModal = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-lgu-navy text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Book className="w-6 h-6" />
            How to Use the Scholar System?
          </h2>
          <button onClick={onClose} className="text-white hover:text-amber-300 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Start */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Quick Start Guide</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
              <li>
                <strong>Add Scholar:</strong> Click the green "Add Scholar" button in the top right
              </li>
              <li>
                <strong>View Records:</strong> Navigate using the tabs (Dashboard, Scholar Records,
                etc.)
              </li>
              <li>
                <strong>Search & Filter:</strong> Use the search bar and filter dropdowns in Scholar
                Records
              </li>
              <li>
                <strong>Edit/Delete:</strong> Click the edit or delete icons on any scholar record
              </li>
              <li>
                <strong>Backup Data:</strong> Go to "Backup & Reports" to export your data
              </li>
            </ol>
          </div>

          {/* Features */}
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm text-blue-900 mb-1">Auto-Save</h4>
                <p className="text-xs text-slate-600">
                  All data is automatically saved to your browser's local storage
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-sm text-emerald-900 mb-1">Export/Import</h4>
                <p className="text-xs text-slate-600">
                  Backup your data to JSON files for safety and portability
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-sm text-purple-900 mb-1">Print Reports</h4>
                <p className="text-xs text-slate-600">
                  Generate printable official reports with proper formatting
                </p>
              </div>
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <h4 className="font-semibold text-sm text-amber-900 mb-1">Analytics</h4>
                <p className="text-xs text-slate-600">
                  View summaries by school, year level, and barangay
                </p>
              </div>
            </div>
          </div>

          {/* Deployment Guide */}
          <div className="bg-gradient-to-r from-lgu-navy to-lgu-blue text-white p-5 rounded-xl">
            <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Deploy Online (Free Forever!)
            </h3>
            <p className="text-sm mb-4 text-slate-200">
              Turn this into a real website accessible by multiple staff members:
            </p>

            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-bold text-sm text-amber-300 mb-2 flex items-center gap-2">
                  <Cloud className="w-4 h-4" />
                  Option 1: Netlify (Easiest)
                </h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-slate-200">
                  <li>Sign up at netlify.com (free)</li>
                  <li>Drag and drop your build folder</li>
                  <li>Get instant website link (yoursite.netlify.app)</li>
                </ol>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-bold text-sm text-amber-300 mb-2 flex items-center gap-2">
                  <Code className="w-4 h-4" />
                  Option 2: GitHub Pages
                </h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-slate-200">
                  <li>Upload your code to GitHub</li>
                  <li>Enable GitHub Pages in settings</li>
                  <li>Access at username.github.io/iskolar</li>
                </ol>
              </div>

              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <h4 className="font-bold text-sm text-amber-300 mb-2">
                  Option 3: Vercel (Professional)
                </h4>
                <ol className="text-xs space-y-1 list-decimal list-inside text-slate-200">
                  <li>Sign up at vercel.com</li>
                  <li>Import from GitHub</li>
                  <li>Auto-deploy on every update</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-slate-500">
              Built with React.js • Powered by Vite • Styled with Tailwind CSS
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Palayan City LGU Scholarship Management System
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HelpModal
