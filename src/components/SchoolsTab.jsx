import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, Eye, Edit2, X, School } from 'lucide-react'
import useScholarStore from '../store/scholarStore'

const SchoolsTab = () => {
  const { 
    getSchoolsList, 
    getScholarsBySchool,
    updateSchoolName,
  } = useScholarStore()
  
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [editSchoolName, setEditSchoolName] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')

  const schools = getSchoolsList() // Only schools with active scholars

  const handleViewSchool = (school) => {
    setSelectedSchool(school)
    setViewModalOpen(true)
  }

  const handleEditSchool = (school) => {
    setSelectedSchool(school)
    setEditSchoolName(school)
    setError('')
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    const trimmed = editSchoolName.trim().replace(/\s+/g, ' ')
    
    if (!trimmed) {
      setError('School name cannot be empty')
      return
    }

    const result = updateSchoolName(selectedSchool, trimmed)
    if (result) {
      setEditModalOpen(false)
      setSelectedSchool(null)
      setEditSchoolName('')
      setError('')
    } else {
      setError('This school already exists')
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewModalOpen || editModalOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`

      return () => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  }, [viewModalOpen, editModalOpen])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status) => {
    const badges = {
      Processing: 'bg-amber-100 text-amber-700',
      Paid: 'bg-emerald-100 text-emerald-700',
    }
    return badges[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
          Schools
        </h2>
        <p style={{ color: '#AAAAAA' }}>
          View schools and the active scholars in each, and correct school names if needed.
        </p>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E5EA' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F5F5F7' }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                School / University
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                Active Scholars
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {schools.length === 0 ? (
              <tr>
                <td colSpan="3" className="px-6 py-12 text-center" style={{ color: '#AAAAAA' }}>
                  <School className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No schools with active scholars yet.</p>
                </td>
              </tr>
            ) : (
              schools.map((school, index) => {
                const scholarCount = getScholarsBySchool(school).length
                return (
                  <tr 
                    key={index}
                    className="border-t cursor-pointer"
                    style={{ borderColor: '#E5E5EA' }}
                    onClick={() => handleViewSchool(school)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-6 py-4" style={{ color: '#1D1D1F' }}>
                      <div className="flex items-center gap-3">
                        <School className="w-5 h-5" style={{ color: '#007AFF' }} />
                        <span className="font-medium">{school}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" style={{ color: '#AAAAAA' }}>
                      {scholarCount} {scholarCount === 1 ? 'scholar' : 'scholars'}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewSchool(school)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: '#007AFF' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title="View scholars"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditSchool(school)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: '#007AFF' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title="Edit school name"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Scholars Modal */}
      {viewModalOpen && selectedSchool && createPortal(
        <div 
          className="fixed z-[100]" 
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewModalOpen(false)
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E5EA' }}>
              <div>
                <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                  {selectedSchool}
                </h3>
                <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
                  {getScholarsBySchool(selectedSchool).length} active {getScholarsBySchool(selectedSchool).length === 1 ? 'scholar' : 'scholars'}
                </p>
              </div>
              <button
                onClick={() => setViewModalOpen(false)}
                className="p-2 rounded-lg transition-all"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Box */}
            <div className="px-6 py-4 border-b" style={{ borderColor: '#E5E5EA' }}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or course..."
                  className="w-full pl-9 pr-4 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
                />
              </div>
            </div>

            {/* Scholars Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#F5F5F7', position: 'sticky', top: 0 }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Year Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Course
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Payment Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getScholarsBySchool(selectedSchool)
                    .filter(s => {
                      if (!searchTerm) return true
                      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase()
                      const course = (s.course || '').toLowerCase()
                      return fullName.includes(searchTerm.toLowerCase()) || course.includes(searchTerm.toLowerCase())
                    })
                    .map((scholar, idx) => (
                      <tr 
                        key={idx} 
                        className="border-t"
                        style={{ borderColor: '#E5E5EA' }}
                      >
                        <td className="px-6 py-3 text-sm" style={{ color: '#1D1D1F' }}>
                          {scholar.lastName}, {scholar.firstName} {scholar.middleName}
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: '#AAAAAA' }}>
                          {scholar.yearLevel}
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: '#AAAAAA' }}>
                          {scholar.course || '-'}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(scholar.status)}`}>
                            {scholar.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-end" style={{ borderColor: '#E5E5EA' }}>
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#007AFF',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Edit School Name Modal */}
      {editModalOpen && selectedSchool && createPortal(
        <div 
          className="fixed z-[100]" 
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100dvh',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditModalOpen(false)
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E5EA' }}>
              <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                Edit School Name
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-2 rounded-lg transition-all"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                School / University name
              </label>
              <input
                type="text"
                value={editSchoolName}
                onChange={(e) => {
                  setEditSchoolName(e.target.value)
                  setError('')
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit()
                }}
                className="w-full px-4 py-2 rounded-lg border transition-all"
                style={{
                  borderColor: error ? '#FF3B30' : '#E5E5EA',
                  color: '#1D1D1F',
                }}
                onFocus={(e) => {
                  if (!error) e.currentTarget.style.borderColor = '#007AFF'
                }}
                onBlur={(e) => {
                  if (!error) e.currentTarget.style.borderColor = '#E5E5EA'
                }}
                autoFocus
              />
              {error && (
                <p className="text-xs mt-2" style={{ color: '#FF3B30' }}>
                  {error}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: '#E5E5EA' }}>
              <button
                onClick={() => setEditModalOpen(false)}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ color: '#1D1D1F' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={!editSchoolName.trim()}
                className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: '#007AFF',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#0051D5'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#007AFF'
                  }
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default SchoolsTab
