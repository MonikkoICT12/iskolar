import { useState, useEffect } from 'react'
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
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <h2 className="text-lg font-bold text-slate-900 mb-1">School Breakdown Summary</h2>
        <p className="text-xs text-slate-500 mb-4">
          Detailed view of partner institutions, scholar counts, and monetary allocations.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-xs border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">School Institution</th>
                <th className="py-3 px-4 text-center">Active Scholars</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-center">Share %</th>
                <th className="py-3 px-4 text-center no-print">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
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
                  <tr key={stat.school} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-lgu-blue/10 text-lgu-blue flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900">{stat.school}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-lgu-blue/10 text-lgu-blue rounded-full text-xs font-semibold">
                        <Users className="w-3 h-3" />
                        {pluralizeScholar(stat.count)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                      {formatCurrency(stat.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-bold text-slate-900">
                          {stat.percentage.toFixed(1)}%
                        </span>
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1">
                          <div
                            className="bg-lgu-blue h-full rounded-full"
                            style={{ width: `${stat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center no-print">
                      <button
                        onClick={() => openSchoolModal(stat.school)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-lgu-blue hover:bg-lgu-navy rounded-lg transition shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Scholars
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-slate-50 font-bold text-xs sm:text-sm border-t-2 border-slate-300">
              <tr>
                <td className="py-3 px-4 text-slate-800">TOTAL / ALL SCHOOLS</td>
                <td className="py-3 px-4 text-center text-slate-900">{totalScholars}</td>
                <td className="py-3 px-4 text-right text-emerald-700">
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
      {selectedSchool && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-lgu-navy text-white px-6 py-4 flex items-center justify-between rounded-t-xl border-b-4 border-lgu-gold">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <School className="w-6 h-6" />
                  {selectedSchool}
                </h2>
                <p className="text-sm text-slate-300 mt-1">
                  {getScholarsBySchool(selectedSchool).length} scholars enrolled in this institution
                </p>
              </div>
              <button
                onClick={closeSchoolModal}
                className="text-white hover:text-amber-300 transition p-2 hover:bg-white/10 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-indigo-600 uppercase">Total Scholars</p>
                      <p className="text-2xl font-bold text-indigo-900 mt-1">
                        {getScholarsBySchool(selectedSchool).length}
                      </p>
                    </div>
                    <Users className="w-8 h-8 text-indigo-600" />
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-emerald-600 uppercase">Total Amount</p>
                      <p className="text-2xl font-bold text-emerald-900 mt-1">
                        {formatCurrency(
                          getScholarsBySchool(selectedSchool).reduce(
                            (sum, s) => sum + (parseFloat(s.amount) || 0),
                            0
                          )
                        )}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-emerald-600" />
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-amber-600 uppercase">Avg per Scholar</p>
                      <p className="text-2xl font-bold text-amber-900 mt-1">
                        {formatCurrency(
                          getScholarsBySchool(selectedSchool).reduce(
                            (sum, s) => sum + (parseFloat(s.amount) || 0),
                            0
                          ) / getScholarsBySchool(selectedSchool).length || 0
                        )}
                      </p>
                    </div>
                    <School className="w-8 h-8 text-amber-600" />
                  </div>
                </div>
              </div>

              {/* Scholars Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-800 text-white font-semibold text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4">Scholar Name</th>
                        <th className="py-3 px-4">Barangay</th>
                        <th className="py-3 px-4">Year Level</th>
                        <th className="py-3 px-4">Semester</th>
                        <th className="py-3 px-4">Course / Program</th>
                        <th className="py-3 px-4 text-right">Amount (₱)</th>
                        <th className="py-3 px-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(() => {
                        const allScholars = getScholarsBySchool(selectedSchool)
                        const totalPages = Math.ceil(allScholars.length / itemsPerPage)
                        const startIndex = (currentPage - 1) * itemsPerPage
                        const endIndex = startIndex + itemsPerPage
                        const paginatedScholars = allScholars.slice(startIndex, endIndex)

                        return (
                          <>
                            {paginatedScholars.map((scholar, index) => (
                              <tr key={scholar.id} className="hover:bg-slate-50">
                                <td className="py-3 px-4">
                                  <div className="font-semibold text-slate-900">
                                    {startIndex + index + 1}. {scholar.lastName}, {scholar.firstName} {scholar.middleName}
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-slate-600">{scholar.barangay}</td>
                                <td className="py-3 px-4 text-slate-600">{scholar.yearLevel}</td>
                                <td className="py-3 px-4 text-slate-600">{scholar.semester || '1st Sem'}</td>
                                <td className="py-3 px-4 text-slate-600 text-xs">{scholar.course || '-'}</td>
                                <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                                  {formatCurrency(scholar.amount)}
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span
                                    className={`text-xs font-semibold px-2 py-1 rounded ${getStatusBadge(
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
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t rounded-b-xl">
              <p className="text-xs text-slate-500">
                Showing {getScholarsBySchool(selectedSchool).length} scholar(s) from {selectedSchool}
              </p>
              <button
                onClick={closeSchoolModal}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SchoolSummary
