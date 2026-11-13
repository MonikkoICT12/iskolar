import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Search, Eye, X, GraduationCap, RotateCcw } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { formatScholarName } from '../utils/helpers'

const GraduatesTab = () => {
  const { 
    getGraduatedSchoolsList,
    getGraduatedScholarsBySchool,
    getGraduationYears,
    returnToActive,
  } = useScholarStore()
  
  const [viewModalOpen, setViewModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('ALL')
  const [confirmReturnModal, setConfirmReturnModal] = useState(false)
  const [scholarToReturn, setScholarToReturn] = useState(null)

  const schools = getGraduatedSchoolsList() // Schools with graduated scholars

  const handleViewGraduates = (school) => {
    setSelectedSchool(school)
    setSearchTerm('')
    setYearFilter('ALL')
    setViewModalOpen(true)
  }

  const handleReturnToActive = (scholar) => {
    setScholarToReturn(scholar)
    setConfirmReturnModal(true)
  }

  const confirmReturn = () => {
    if (scholarToReturn) {
      returnToActive(scholarToReturn.id)
      setConfirmReturnModal(false)
      setScholarToReturn(null)
      // Close view modal if no more graduates for this school
      const remainingGraduates = getGraduatedScholarsBySchool(selectedSchool)
      if (remainingGraduates.length === 0) {
        setViewModalOpen(false)
      }
    }
  }

  // Lock body scroll when modal is open
  useEffect(() => {
    if (viewModalOpen || confirmReturnModal) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`

      return () => {
        document.body.style.overflow = ''
        document.body.style.paddingRight = ''
      }
    }
  }, [viewModalOpen, confirmReturnModal])

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
          Graduates
        </h2>
        <p style={{ color: '#AAAAAA' }}>
          View graduated scholars by school.
        </p>
      </div>

      {/* Graduates Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden" style={{ border: '1px solid #E5E5EA' }}>
        <table className="w-full">
          <thead style={{ backgroundColor: '#F5F5F7' }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                School / University
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                Graduates
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
                  <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No graduates yet.</p>
                </td>
              </tr>
            ) : (
              schools.map((school, index) => {
                const graduateCount = getGraduatedScholarsBySchool(school).length
                return (
                  <tr 
                    key={index}
                    className="border-t cursor-pointer"
                    style={{ borderColor: '#E5E5EA' }}
                    onClick={() => handleViewGraduates(school)}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="px-6 py-4" style={{ color: '#1D1D1F' }}>
                      <div className="flex items-center gap-3">
                        <GraduationCap className="w-5 h-5" style={{ color: '#10b981' }} />
                        <span className="font-medium">{school}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center" style={{ color: '#AAAAAA' }}>
                      {graduateCount} {graduateCount === 1 ? 'graduate' : 'graduates'}
                    </td>
                    <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewGraduates(school)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: '#10b981' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title="View graduates"
                        >
                          <Eye className="w-4 h-4" />
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

      {/* View Graduates Modal */}
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
                  {selectedSchool} - Graduates
                </h3>
                <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
                  {getGraduatedScholarsBySchool(selectedSchool).length} {getGraduatedScholarsBySchool(selectedSchool).length === 1 ? 'graduate' : 'graduates'}
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

            {/* Search and Filter */}
            <div className="px-6 py-4 border-b space-y-3" style={{ borderColor: '#E5E5EA' }}>
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
              
              {/* Year Filter */}
              {(() => {
                const schoolGraduates = getGraduatedScholarsBySchool(selectedSchool)
                const years = [...new Set(schoolGraduates.map(s => s.yearGraduated).filter(Boolean))].sort((a, b) => b - a)
                
                if (years.length > 1) {
                  return (
                    <div>
                      <select
                        value={yearFilter}
                        onChange={(e) => setYearFilter(e.target.value)}
                        className="rounded-lg text-sm py-2 px-3"
                        style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
                      >
                        <option value="ALL">All Years</option>
                        {years.map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>
                  )
                }
                return null
              })()}
            </div>

            {/* Graduates Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: '#F5F5F7', position: 'sticky', top: 0 }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Course
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Year Graduated
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold" style={{ color: '#1D1D1F' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {getGraduatedScholarsBySchool(selectedSchool)
                    .filter(s => {
                      const matchesSearch = !searchTerm || 
                        formatScholarName(s, 'firstLast').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (s.course || '').toLowerCase().includes(searchTerm.toLowerCase())
                      
                      const matchesYear = yearFilter === 'ALL' || s.yearGraduated == yearFilter
                      
                      return matchesSearch && matchesYear
                    })
                    .map((scholar, idx) => (
                      <tr 
                        key={idx} 
                        className="border-t"
                        style={{ borderColor: '#E5E5EA' }}
                      >
                        <td className="px-6 py-3 text-sm" style={{ color: '#1D1D1F' }}>
                          {formatScholarName(scholar, 'full')}
                        </td>
                        <td className="px-6 py-3 text-sm" style={{ color: '#AAAAAA' }}>
                          {scholar.course || '-'}
                        </td>
                        <td className="px-6 py-3 text-center text-sm font-semibold" style={{ color: '#10b981' }}>
                          {scholar.yearGraduated || '-'}
                        </td>
                        <td className="px-6 py-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleReturnToActive(scholar)}
                              className="p-2 rounded-lg transition-all duration-150"
                              style={{ color: '#007AFF' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 122, 255, 0.1)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent'
                              }}
                              title="Return to Active"
                            >
                              <RotateCcw className="w-4 h-4" />
                            </button>
                          </div>
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
                  backgroundColor: '#10b981',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Return to Active Confirmation Modal */}
      {confirmReturnModal && scholarToReturn && createPortal(
        <div 
          className="fixed z-[110]" 
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
            if (e.target === e.currentTarget) {
              setConfirmReturnModal(false)
              setScholarToReturn(null)
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b" style={{ borderColor: '#E5E5EA' }}>
              <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                Return to Active Status
              </h3>
              <button
                onClick={() => {
                  setConfirmReturnModal(false)
                  setScholarToReturn(null)
                }}
                className="p-2 rounded-lg transition-all"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-6">
              <p className="mb-4" style={{ color: '#1D1D1F' }}>
                Return <strong>{formatScholarName(scholarToReturn, 'firstLast')}</strong> to active status?
              </p>
              <p className="text-sm" style={{ color: '#AAAAAA' }}>
                This scholar will be removed from Graduates and returned to the Scholars tab.
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t flex justify-end gap-3" style={{ borderColor: '#E5E5EA' }}>
              <button
                onClick={() => {
                  setConfirmReturnModal(false)
                  setScholarToReturn(null)
                }}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#F5F5F7',
                  color: '#1D1D1F',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E5E5EA'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
              >
                Cancel
              </button>
              <button
                onClick={confirmReturn}
                className="px-4 py-2 rounded-lg font-medium transition-all"
                style={{ 
                  backgroundColor: '#007AFF',
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
              >
                Confirm Return
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default GraduatesTab
