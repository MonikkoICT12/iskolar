import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, AlertCircle, CheckCircle, FileWarning } from 'lucide-react'

const ImportPreviewModal = ({ parsedData, duplicates, onConfirm, onCancel }) => {
  const [skipDuplicates, setSkipDuplicates] = useState(true)

  const totalRows = parsedData.length
  const validRows = parsedData.filter(row => row.valid).length
  const errorRows = parsedData.filter(row => !row.valid)
  const hasDuplicates = duplicates.length > 0

  // Get first 5 valid rows for preview
  const previewRows = parsedData.filter(row => row.valid).slice(0, 5)

  const handleImport = () => {
    onConfirm({ skipDuplicates })
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <div
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between border-b z-10" style={{ borderColor: '#E5E5EA' }}>
          <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
            Import Preview
          </h2>
          <button
            onClick={onCancel}
            className="transition p-2 hover:bg-slate-100 rounded-lg"
            style={{ color: '#AAAAAA' }}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#AAAAAA' }}>
                Total Rows
              </p>
              <p className="text-2xl font-bold" style={{ color: '#1D1D1F' }}>
                {totalRows}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#E8F5E9', border: '1px solid #4CAF50' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#2E7D32' }}>
                Valid Rows
              </p>
              <p className="text-2xl font-bold" style={{ color: '#2E7D32' }}>
                {validRows}
              </p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: '#FFEBEE', border: '1px solid #F44336' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#C62828' }}>
                Rows with Errors
              </p>
              <p className="text-2xl font-bold" style={{ color: '#C62828' }}>
                {errorRows.length}
              </p>
            </div>
          </div>

          {/* Error Rows */}
          {errorRows.length > 0 && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF3E0', border: '1px solid #FF9800' }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#E65100' }} />
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#E65100' }}>
                    Rows with Errors (will be skipped)
                  </h3>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {errorRows.map((row) => (
                      <div key={row.rowIndex} className="text-xs p-2 rounded" style={{ backgroundColor: '#FFFFFF' }}>
                        <p className="font-semibold" style={{ color: '#1D1D1F' }}>
                          Row {row.rowIndex}: {row.data.firstName} {row.data.lastName}
                        </p>
                        <ul className="list-disc list-inside mt-1" style={{ color: '#C62828' }}>
                          {row.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Duplicates */}
          {hasDuplicates && (
            <div className="rounded-lg p-4" style={{ backgroundColor: '#FFF9C4', border: '1px solid #FBC02D' }}>
              <div className="flex items-start gap-3">
                <FileWarning className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#F57F17' }} />
                <div className="flex-1">
                  <h3 className="font-bold text-sm mb-2" style={{ color: '#F57F17' }}>
                    {duplicates.length} Duplicate Scholar{duplicates.length > 1 ? 's' : ''} Detected
                  </h3>
                  <p className="text-xs mb-3" style={{ color: '#1D1D1F' }}>
                    Scholars with the same full name and school already exist in the system.
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={skipDuplicates}
                        onChange={() => setSkipDuplicates(true)}
                        className="w-4 h-4"
                        style={{ accentColor: '#007AFF' }}
                      />
                      <span className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                        Skip Duplicates (recommended)
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        checked={!skipDuplicates}
                        onChange={() => setSkipDuplicates(false)}
                        className="w-4 h-4"
                        style={{ accentColor: '#007AFF' }}
                      />
                      <span className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                        Overwrite Existing Data
                      </span>
                    </label>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {duplicates.map((dup, idx) => (
                      <div key={idx} className="text-xs p-2 rounded" style={{ backgroundColor: '#FFFFFF' }}>
                        <p className="font-semibold" style={{ color: '#1D1D1F' }}>
                          {dup.newScholar.firstName} {dup.newScholar.lastName} - {dup.newScholar.school}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Preview Table */}
          {previewRows.length > 0 && (
            <div>
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#1D1D1F' }}>
                <CheckCircle className="w-4 h-4" style={{ color: '#4CAF50' }} />
                Preview (First 5 Valid Rows)
              </h3>
              <div className="overflow-x-auto rounded-lg" style={{ border: '1px solid #E5E5EA' }}>
                <table className="w-full text-xs">
                  <thead style={{ backgroundColor: '#F5F5F7' }}>
                    <tr>
                      <th className="py-2 px-3 text-left font-semibold" style={{ color: '#1D1D1F' }}>
                        Name
                      </th>
                      <th className="py-2 px-3 text-left font-semibold" style={{ color: '#1D1D1F' }}>
                        School
                      </th>
                      <th className="py-2 px-3 text-left font-semibold" style={{ color: '#1D1D1F' }}>
                        Year Level
                      </th>
                      <th className="py-2 px-3 text-right font-semibold" style={{ color: '#1D1D1F' }}>
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, idx) => (
                      <tr key={idx} className="border-t" style={{ borderColor: '#E5E5EA' }}>
                        <td className="py-2 px-3" style={{ color: '#1D1D1F' }}>
                          {row.data.firstName} {row.data.lastName}
                        </td>
                        <td className="py-2 px-3" style={{ color: '#1D1D1F' }}>
                          {row.data.school}
                        </td>
                        <td className="py-2 px-3" style={{ color: '#1D1D1F' }}>
                          {row.data.yearLevel}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold" style={{ color: '#10b981' }}>
                          ₱{row.data.scholarship_amount.toLocaleString('en-PH')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {validRows > 5 && (
                <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                  ... and {validRows - 5} more valid row{validRows - 5 > 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          {/* Summary Message */}
          <div className="rounded-lg p-4" style={{ backgroundColor: '#E3F2FD', border: '1px solid #2196F3' }}>
            <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
              {validRows} scholar{validRows !== 1 ? 's' : ''} will be imported.
              {errorRows.length > 0 && ` ${errorRows.length} row${errorRows.length > 1 ? 's' : ''} with errors will be skipped.`}
              {hasDuplicates && skipDuplicates && ` ${duplicates.length} duplicate${duplicates.length > 1 ? 's' : ''} will be skipped.`}
              {hasDuplicates && !skipDuplicates && ` ${duplicates.length} existing record${duplicates.length > 1 ? 's' : ''} will be overwritten.`}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white px-6 py-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: '#E5E5EA' }}>
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
            onClick={handleImport}
            disabled={validRows === 0}
            className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition shadow disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#007AFF' }}
            onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#0051D5')}
            onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#007AFF')}
          >
            Import {validRows} Scholar{validRows !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

export default ImportPreviewModal
