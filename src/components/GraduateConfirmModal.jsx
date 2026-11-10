import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, GraduationCap } from 'lucide-react'

const GraduateConfirmModal = ({ scholar, onConfirm, onCancel }) => {
  const currentYear = new Date().getFullYear()
  const [yearGraduated, setYearGraduated] = useState(scholar?.yearGraduated || currentYear)

  const handleConfirm = () => {
    onConfirm(parseInt(yearGraduated))
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[110] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E5EA' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E3F2FD' }}>
              <GraduationCap className="w-5 h-5" style={{ color: '#007AFF' }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: '#1D1D1F' }}>
              Graduate Scholar
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="transition p-2 hover:bg-slate-100 rounded-lg"
            style={{ color: '#AAAAAA' }}
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFF9C4', border: '1px solid #FBC02D' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              {scholar?.firstName} {scholar?.lastName}
            </p>
            <p className="text-xs" style={{ color: '#1D1D1F' }}>
              This scholar will be removed from the Scholars tab and moved to the Graduates tab.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>
              Year Graduated <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={yearGraduated}
              onChange={(e) => setYearGraduated(e.target.value)}
              min="2000"
              max="2100"
              className="w-full px-3 py-2 rounded-lg text-sm"
              style={{ border: '1px solid #E5E5EA' }}
            />
            <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
              Enter the year this scholar graduated
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: '#E5E5EA' }}>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-semibold rounded-lg transition"
            style={{
              color: '#1D1D1F',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E5E5EA'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition shadow"
            style={{ backgroundColor: '#007AFF' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
          >
            Confirm Graduation
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default GraduateConfirmModal
