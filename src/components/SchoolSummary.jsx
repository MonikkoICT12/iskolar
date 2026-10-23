import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { School, Users, DollarSign, Eye, X } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { pluralizeScholar, formatCurrency } from '../utils/helpers'
import Pagination from './Pagination'

const SchoolSummary = () => {
  const { getSchoolStats, getTotalScholars, getTotalAmount, getScholarsBySchool } = useScholarStore()
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const schoolStats = getSchoolStats()
  const totalScholars = getTotalScholars()
  const totalAmount = getTotalAmount()

  // Reset to page 1 when switching schools
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedSchool])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedSchool) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [selectedSchool])

  const openSchoolModal = (school) => {
    setSelectedSchool(school)
  }

  const closeSchoolModal = () => {
    setSelectedSchool(null)
    setCurrentPage(1)
  }

  const getStatusBadge = (status) => {
    const badges = {
      Processing: 'bg-amber-100 text-amber-700',
      Paid: 'bg-emerald-100 text-emerald-700',
    }
    return badges[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-5" style={{ border: '1px solid #E5E5EA' }}>
        <h2 className="text-lg font-bold mb-1" style={{ color: '#1D1D1F' }}>School Breakdown Summary</h2>
        <p className="text-xs mb-4" style={{ color: '#AAAAAA' }}>
          Detailed view of partner institutions, scholar counts, and monetary allocations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="font-semibold uppercase text-xs" style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
              <tr>
                <th className="py-3 px-4">School Institution</th>
                <th className="py-3 px-4 text-center">Active Scholars</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Share %</th>
                <th className="py-3 px-4 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody style={{ borderTop: '1px solid #E5E5EA' }}>
              {schoolStats.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <School className="w-12 h-12 text-slate-300" />
                      <p>No schools yet. Add scholars to see breakdown.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                schoolStats.map((stat, index) => (
                  <tr 
                    key={stat.school} 
                    className="transition-colors"
                    style={{ borderBottom: '1px solid #E5E5EA' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium" style={{ color: '#1D1D1F' }}>{stat.school}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)', color: '#007AFF' }}>
                        <Users className="w-3 h-3" strokeWidth={1.5} />
                        {pluralizeScholar(stat.count)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold" style={{ color: '#007AFF' }}>
                      {formatCurrency(stat.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold" style={{ color: '#1D1D1F' }}>
                          {stat.percentage.toFixed(1)}%
                        </span>
                        <div className="w-16 rounded-full h-1.5 mt-1" style={{ backgroundColor: '#E5E5EA' }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${stat.percentage}%`, backgroundColor: '#007AFF' }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => openSchoolModal(stat.school)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition shadow-sm"
                        style={{ backgroundColor: '#007AFF' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                        View Scholars
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="font-bold text-xs sm:text-sm" style={{ backgroundColor: '#F5F5F7', borderTop: '2px solid #E5E5EA' }}>
              <tr>
                <td className="py-3 px-4" style={{ color: '#1D1D1F' }}>TOTAL / ALL SCHOOLS</td>
                <td className="py-3 px-4 text-center" style={{ color: '#1D1D1F' }}>{totalScholars}</td>
                <td className="py-3 px-4 text-right" style={{ color: '#007AFF' }}>
                  {formatCurrency(totalAmount)}
                </td>
                <td className="py-3 px-4 text-center">100%</td>
                <td className="py-3 px-4 no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* School Scholars Modal */}
      {selectedSchool && createPortal(
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
            if (e.target === e.currentTarget) closeSchoolModal()
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between border-b z-10" style={{ borderColor: '#E5E5EA' }}>
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: '#1D1D1F' }}>
                  <School className="w-6 h-6" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                  {selectedSchool}
                </h2>
                <p className="text-sm mt-1" style={{ color: '#AAAAAA' }}>
                  {getScholarsBySchool(selectedSchool).length} scholars enrolled in this institution
                </p>
              </div>
              <button
                onClick={closeSchoolModal}
                className="transition p-2 hover:bg-slate-100 rounded-lg"
                style={{ color: '#AAAAAA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#1D1D1F'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
              >
                <X className="w-6 h-6" strokeWidth={1.5} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-lg p-4" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase" style={{ color: '#AAAAAA' }}>Total Scholars</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#1D1D1F' }}>
                        {getScholarsBySchool(selectedSchool).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase" style={{ color: '#AAAAAA' }}>Total Amount</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#007AFF' }}>
                        {formatCurrency(
                          getScholarsBySchool(selectedSchool).reduce(
                            (sum, s) => sum + (parseFloat(s.amount) || 0),
                            0
                          )
                        )}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                  </div>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase" style={{ color: '#AAAAAA' }}>Avg per Scholar</p>
                      <p className="text-2xl font-bold mt-1" style={{ color: '#1D1D1F' }}>
                        {formatCurrency(
                          getScholarsBySchool(selectedSchool).reduce(
                            (sum, s) => sum + (parseFloat(s.amount) || 0),
                            0
                          ) / getScholarsBySchool(selectedSchool).length || 0
                        )}
                      </p>
                    </div>
                    <School className="w-8 h-8" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                  </div>
                </div>
              </div>

              {/* Scholars Table */}
              <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid #E5E5EA' }}>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="font-semibold text-xs uppercase" style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
                      <tr>
                        <th className="py-3 px-4">Scholar Name</th>
                        <th className="py-3 px-4">Barangay</th>
                        <th className="py-3 px-4">Year Level</th>
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4">Course / Program</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody style={{ borderTop: '1px solid #E5E5EA' }}>
                      {(() => {
                        const allScholars = getScholarsBySchool(selectedSchool)
                        const totalPages = Math.ceil(allScholars.length / itemsPerPage)
                        const startIndex = (currentPage - 1) * itemsPerPage
                        const endIndex = startIndex + itemsPerPage
                        const paginatedScholars = allScholars.slice(startIndex, endIndex)

                        return (
                          <>
                            {paginatedScholars.map((scholar, index) => (
                              <tr 
                                key={scholar.id} 
                                className="transition-colors"
                                style={{ borderBottom: '1px solid #E5E5EA' }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <td className="py-3 px-4">
                                  <div className="font-semibold" style={{ color: '#1D1D1F' }}>
                                    {startIndex + index + 1}. {scholar.lastName}, {scholar.firstName} {scholar.middleName}
                                  </div>
                                </td>
                                <td className="py-3 px-4" style={{ color: '#AAAAAA' }}>{scholar.barangay}</td>
                                <td className="py-3 px-4" style={{ color: '#AAAAAA' }}>{scholar.yearLevel}</td>
                                <td className="py-3 px-4" style={{ color: '#AAAAAA' }}>{scholar.semester || '1st Sem'}</td>
                                <td className="py-3 px-4 text-xs" style={{ color: '#AAAAAA' }}>{scholar.course || '-'}</td>
                                <td className="py-3 px-4 text-right font-semibold" style={{ color: '#007AFF' }}>
                                  {formatCurrency(scholar.amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusBadge(
                                      scholar.status
                                    )}`}
                                  >
                                    {scholar.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </>
                        )
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-4 pb-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(getScholarsBySchool(selectedSchool).length / itemsPerPage)}
                    onPageChange={setCurrentPage}
                    totalItems={getScholarsBySchool(selectedSchool).length}
                    itemsPerPage={itemsPerPage}
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 flex items-center justify-between border-t" style={{ backgroundColor: '#F5F5F7', borderColor: '#E5E5EA' }}>
              <p className="text-xs" style={{ color: '#AAAAAA' }}>
                Showing {getScholarsBySchool(selectedSchool).length} scholar(s) from {selectedSchool}
              </p>
              <button
                onClick={closeSchoolModal}
                className="px-4 py-2 text-sm font-semibold rounded-lg transition"
                style={{ 
                  color: '#1D1D1F',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E5EA'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FFFFFF'}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

export default SchoolSummary
