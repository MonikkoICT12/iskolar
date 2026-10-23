import { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, Eye, UserPlus, CheckSquare, Square, MinusSquare, X } from 'lucide-react'
import useScholarStore, { BARANGAYS, YEAR_LEVELS, SEMESTERS } from '../store/scholarStore'
import ConfirmModal from './ConfirmModal'

const ScholarRecords = ({ onEditScholar }) => {
  const { getScholarsBySchoolYear, getSchoolsList, deleteScholar, bulkUpdateScholars } = useScholarStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBarangay, setFilterBarangay] = useState('ALL')
  const [filterSchool, setFilterSchool] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')
  const [filterSemester, setFilterSemester] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, scholar: null })
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkPaidConfirm, setBulkPaidConfirm] = useState(false)

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

  // Reset selection when filters or search changes
  useEffect(() => {
    setSelectedIds([])
  }, [searchTerm, filterBarangay, filterSchool, filterYear, filterSemester, filterStatus])

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredScholars.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredScholars.map(s => s.id))
    }
  }

  const handleSelectOne = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    )
  }

  const handleClearSelection = () => {
    setSelectedIds([])
  }

  const handleBulkMarkAsPaid = () => {
    if (selectedIds.length > 0) {
      setBulkPaidConfirm(true)
    }
  }

  const confirmBulkPaid = () => {
    bulkUpdateScholars(selectedIds, { status: 'Paid' })
    setSelectedIds([])
    setBulkPaidConfirm(false)
  }

  // Checkbox states
  const allSelected = filteredScholars.length > 0 && selectedIds.length === filteredScholars.length
  const someSelected = selectedIds.length > 0 && selectedIds.length < filteredScholars.length
  const isIndeterminate = someSelected && !allSelected

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
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-900">
                {selectedIds.length} {selectedIds.length === 1 ? 'scholar' : 'scholars'} selected
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          </div>
          <button
            onClick={handleBulkMarkAsPaid}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition-all shadow flex items-center gap-2"
          >
            <CheckSquare className="w-4 h-4" />
            Mark as Paid
          </button>
        </div>
      )}

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
                <th className="py-3 px-4 w-12">
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-full"
                    title={allSelected ? "Deselect all" : "Select all"}
                  >
                    {isIndeterminate ? (
                      <MinusSquare className="w-4 h-4 text-amber-400" />
                    ) : allSelected ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
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
                  <td colSpan="10" className="py-12 text-center text-slate-500">
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
                  <tr key={scholar.id} className={`hover:bg-slate-50 ${selectedIds.includes(scholar.id) ? 'bg-blue-50' : ''}`}>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleSelectOne(scholar.id)}
                        className="flex items-center justify-center w-full"
                      >
                        {selectedIds.includes(scholar.id) ? (
                          <CheckSquare className="w-4 h-4 text-blue-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </td>
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

      {/* Bulk Paid Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkPaidConfirm}
        onClose={() => setBulkPaidConfirm(false)}
        onConfirm={confirmBulkPaid}
        title="Mark as Paid?"
        message={`Are you sure you want to mark ${selectedIds.length} ${selectedIds.length === 1 ? 'scholar' : 'scholars'} as Paid?`}
        confirmText="Mark as Paid"
        cancelText="Cancel"
        type="success"
      />
    </div>
  )
}

export default ScholarRecords
