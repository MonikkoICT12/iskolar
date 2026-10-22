import { useState } from 'react'
import { Search, Edit2, Trash2, Eye, UserPlus } from 'lucide-react'
import useScholarStore, { BARANGAYS, YEAR_LEVELS, SEMESTERS } from '../store/scholarStore'
import ConfirmModal from './ConfirmModal'

const ScholarRecords = ({ onEditScholar }) => {
  const { getScholarsBySchoolYear, getSchoolsList, deleteScholar } = useScholarStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBarangay, setFilterBarangay] = useState('ALL')
  const [filterSchool, setFilterSchool] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')
  const [filterSemester, setFilterSemester] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, scholar: null })

  const allScholars = getScholarsBySchoolYear()
  const schools = getSchoolsList()

  const filteredScholars = allScholars.filter((scholar) => {
    const matchesSearch =
      searchTerm === '' ||
      `${scholar.firstName} ${scholar.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholar.course?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholar.school?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholar.barangay?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesBarangay = filterBarangay === 'ALL' || scholar.barangay === filterBarangay
    const matchesSchool = filterSchool === 'ALL' || scholar.school === filterSchool
    const matchesYear = filterYear === 'ALL' || scholar.yearLevel === filterYear
    const matchesSemester = filterSemester === 'ALL' || scholar.semester === filterSemester
    const matchesStatus = filterStatus === 'ALL' || scholar.status === filterStatus

    return matchesSearch && matchesBarangay && matchesSchool && matchesYear && matchesSemester && matchesStatus
  })

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const totalFiltered = filteredScholars.reduce(
    (sum, s) => sum + (parseFloat(s.amount) || 0),
    0
  )

  const handleDelete = (scholar) => {
    setDeleteConfirm({ isOpen: true, scholar })
  }

  const confirmDelete = () => {
    if (deleteConfirm.scholar) {
      deleteScholar(deleteConfirm.scholar.id)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      Processing: 'bg-amber-100 text-amber-700',
      Paid: 'bg-emerald-100 text-emerald-700',
    }
    return badges[status] || 'bg-slate-100 text-slate-700'
  }

  return (
    <div className="space-y-5">
      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search scholar name, course, school, or barangay..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={filterBarangay}
              onChange={(e) => setFilterBarangay(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            >
              <option value="ALL">All Barangays</option>
              {BARANGAYS.map((brgy) => (
                <option key={brgy} value={brgy}>
                  {brgy}
                </option>
              ))}
            </select>

            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            >
              <option value="ALL">All Schools</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            >
              <option value="ALL">All Year Levels</option>
              {YEAR_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={filterSemester}
              onChange={(e) => setFilterSemester(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            >
              <option value="ALL">All Semesters</option>
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem}
                </option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-slate-300 rounded-lg text-xs py-2 px-3 focus:outline-none focus:ring-2 focus:ring-lgu-blue"
            >
              <option value="ALL">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Scholar Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-800 text-white font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Scholar Name</th>
                <th className="py-3 px-4">Barangay</th>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-4">Year Level</th>
                <th className="py-3 px-4">Semester</th>
                <th className="py-3 px-4">Course / Program</th>
                <th className="py-3 px-4 text-right">Amount (₱)</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
              {filteredScholars.length === 0 ? (
                <tr>
                  <td colSpan="9" className="py-12 text-center text-slate-500">
                    {allScholars.length === 0 ? (
                      <div className="flex flex-col items-center gap-2">
                        <UserPlus className="w-12 h-12 text-slate-300" />
                        <p className="font-medium">No scholars yet</p>
                        <p className="text-xs">Click "Add Scholar" to get started</p>
                      </div>
                    ) : (
                      <p>No scholars match your filters</p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredScholars.map((scholar) => (
                  <tr key={scholar.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {scholar.lastName}, {scholar.firstName} {scholar.middleName}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{scholar.barangay}</td>
                    <td className="py-3 px-4 text-slate-600 text-xs max-w-xs truncate">
                      {scholar.school}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{scholar.yearLevel}</td>
                    <td className="py-3 px-4 text-slate-600">
                      <span className="text-xs font-medium">{scholar.semester || '1st Sem'}</span>
                    </td>
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
                    <td className="py-3 px-4 text-center no-print">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditScholar(scholar)}
                          className="text-blue-600 hover:text-blue-800 p-1"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(scholar)}
                          className="text-red-600 hover:text-red-800 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Stats */}
        <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing{' '}
            <span className="font-bold text-slate-800">{filteredScholars.length}</span> out of{' '}
            <span className="font-bold text-slate-800">{allScholars.length}</span> records
          </div>
          <div className="font-semibold text-slate-700">
            Filtered Total Amount:{' '}
            <span className="text-emerald-700 font-bold text-sm">
              {formatCurrency(totalFiltered)}
            </span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, scholar: null })}
        onConfirm={confirmDelete}
        title="Delete Scholar?"
        scholarName={deleteConfirm.scholar ? `${deleteConfirm.scholar.firstName} ${deleteConfirm.scholar.lastName}` : ''}
        message="Are you sure you want to delete this scholar record?"
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  )
}

export default ScholarRecords
