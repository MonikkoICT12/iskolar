import { useState, useEffect } from 'react'
import { Search, Edit2, Trash2, Eye, UserPlus, CheckSquare, Square, MinusSquare, X } from 'lucide-react'
import useScholarStore, { BARANGAYS, SEMESTERS } from '../store/scholarStore'
import { YEAR_LEVELS } from '../config/yearLevels'
import { formatGWA, isGWAWarning } from '../config/grading'
import ConfirmModal from './ConfirmModal'

const ScholarRecords = ({ onEditScholar }) => {
  const { getScholarsBySchoolYear, getActiveScholars, getSchoolsList, deleteScholar, bulkUpdateScholars, bulkMarkAsGraduated } = useScholarStore()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filterBarangay, setFilterBarangay] = useState('ALL')
  const [filterSchool, setFilterSchool] = useState('ALL')
  const [filterYear, setFilterYear] = useState('ALL')
  const [filterSemester, setFilterSemester] = useState('ALL')
  const [filterStatus, setFilterStatus] = useState('ALL')
  const [filterPWD, setFilterPWD] = useState('ALL')
  const [filterSoloParent, setFilterSoloParent] = useState('ALL')
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, scholar: null })
  const [selectedIds, setSelectedIds] = useState([])
  const [bulkPaidConfirm, setBulkPaidConfirm] = useState(false)
  const [bulkGraduatedConfirm, setBulkGraduatedConfirm] = useState(false)

  // Show only ACTIVE scholars
  const allScholars = getActiveScholars()
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
    const matchesPWD = filterPWD === 'ALL' || (filterPWD === 'Yes' ? scholar.is_pwd === true : scholar.is_pwd === false)
    const matchesSoloParent = filterSoloParent === 'ALL' || (filterSoloParent === 'Yes' ? scholar.is_solo_parent === true : scholar.is_solo_parent === false)

    return matchesSearch && matchesBarangay && matchesSchool && matchesYear && matchesSemester && matchesStatus && matchesPWD && matchesSoloParent
  })

  // Reset selection when filters or search changes
  useEffect(() => {
    setSelectedIds([])
  }, [searchTerm, filterBarangay, filterSchool, filterYear, filterSemester, filterStatus, filterPWD, filterSoloParent])

  // Helper function to get latest GWA
  const getLatestGWA = (scholar) => {
    if (!scholar.grades || scholar.grades.length === 0) return null
    const sorted = [...scholar.grades].sort((a, b) => {
      if (a.schoolYear !== b.schoolYear) {
        return b.schoolYear.localeCompare(a.schoolYear)
      }
      return (b.createdAt || '').localeCompare(a.createdAt || '')
    })
    return sorted[0].gwa
  }

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

  const handleBulkMarkAsGraduated = () => {
    if (selectedIds.length > 0) {
      setBulkGraduatedConfirm(true)
    }
  }

  const confirmBulkPaid = () => {
    bulkUpdateScholars(selectedIds, { status: 'Paid' })
    setSelectedIds([])
    setBulkPaidConfirm(false)
  }

  const confirmBulkGraduated = () => {
    bulkMarkAsGraduated(selectedIds)
    setSelectedIds([])
    setBulkGraduatedConfirm(false)
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
    (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
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
    <div className="space-y-5" style={{ maxWidth: '1600px', margin: '0 auto' }}>
      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="rounded-xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200" style={{ backgroundColor: 'rgba(0, 122, 255, 0.1)', border: '1px solid #007AFF' }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5" style={{ color: '#007AFF' }} strokeWidth={1.5} />
              <span className="font-semibold" style={{ color: '#1D1D1F' }}>
                {selectedIds.length} {selectedIds.length === 1 ? 'scholar' : 'scholars'} selected
              </span>
            </div>
            <button
              onClick={handleClearSelection}
              className="text-xs font-medium flex items-center gap-1 transition-colors"
              style={{ color: '#007AFF' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#0051D5'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#007AFF'}
            >
              <X className="w-3 h-3" />
              Clear selection
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleBulkMarkAsPaid}
              className="font-semibold px-4 py-2 rounded-lg transition-all shadow flex items-center gap-2 text-white"
              style={{ backgroundColor: '#10b981' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
              Mark as Paid
            </button>
            <button
              onClick={handleBulkMarkAsGraduated}
              className="font-semibold px-4 py-2 rounded-lg transition-all shadow flex items-center gap-2 text-white"
              style={{ backgroundColor: '#007AFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
            >
              <CheckSquare className="w-4 h-4" strokeWidth={1.5} />
              Mark as Graduated
            </button>
          </div>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4" style={{ border: '1px solid #E5E5EA' }}>
        <div className="flex flex-col gap-4">
          {/* Search Input - Full width, flexible */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, course, school, or barangay..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F', minWidth: '280px' }}
            />
          </div>

          {/* Filter Dropdowns - Grid layout for even spacing */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
            <select
              value={filterBarangay}
              onChange={(e) => setFilterBarangay(e.target.value)}
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
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
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
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
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
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
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
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
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
            >
              <option value="ALL">All Status</option>
              <option value="Processing">Processing</option>
              <option value="Paid">Paid</option>
            </select>

            <select
              value={filterPWD}
              onChange={(e) => setFilterPWD(e.target.value)}
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
            >
              <option value="ALL">All PWD</option>
              <option value="Yes">PWD: Yes</option>
              <option value="No">PWD: No</option>
            </select>

            <select
              value={filterSoloParent}
              onChange={(e) => setFilterSoloParent(e.target.value)}
              className="rounded-lg text-xs py-2 px-3 h-9"
              style={{ border: '1px solid #E5E5EA', color: '#1D1D1F' }}
            >
              <option value="ALL">All Solo Parent</option>
              <option value="Yes">Solo Parent: Yes</option>
              <option value="No">Solo Parent: No</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Scholar Table */}
      <div className="bg-white rounded-xl shadow-sm" style={{ border: '1px solid #E5E5EA' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" style={{ minWidth: '1250px' }}>
            <thead className="font-semibold text-xs uppercase tracking-wider" style={{ backgroundColor: '#F5F5F7', color: '#1D1D1F' }}>
              <tr>
                <th className="py-3 px-4" style={{ width: '50px', position: 'sticky', left: 0, backgroundColor: '#F5F5F7', zIndex: 10 }}>
                  <button
                    onClick={handleSelectAll}
                    className="flex items-center justify-center w-full"
                    title={allSelected ? "Deselect all" : "Select all"}
                  >
                    {isIndeterminate ? (
                      <MinusSquare className="w-4 h-4 text-amber-400" strokeWidth={1.5} />
                    ) : allSelected ? (
                      <CheckSquare className="w-4 h-4" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                    ) : (
                      <Square className="w-4 h-4" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
                    )}
                  </button>
                </th>
                <th className="py-3 px-4" style={{ minWidth: '220px', position: 'sticky', left: '50px', backgroundColor: '#F5F5F7', zIndex: 10 }}>Scholar Name</th>
                <th className="py-3 px-4" style={{ minWidth: '130px' }}>Barangay</th>
                <th className="py-3 px-4" style={{ minWidth: '260px' }}>School</th>
                <th className="py-3 px-4 text-center" style={{ minWidth: '100px' }}>Latest GWA</th>
                <th className="py-3 px-4" style={{ minWidth: '100px' }}>Year Level</th>
                <th className="py-3 px-4" style={{ minWidth: '90px' }}>Semester</th>
                <th className="py-3 px-4" style={{ minWidth: '200px' }}>Course / Program</th>
                <th className="py-3 px-4 text-right" style={{ minWidth: '110px' }}>Amount</th>
                <th className="py-3 px-4 text-center" style={{ minWidth: '110px' }}>Status</th>
                <th className="py-3 px-4 text-center no-print" style={{ width: '100px', position: 'sticky', right: 0, backgroundColor: '#F5F5F7', zIndex: 10 }}>Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm" style={{ borderTop: '1px solid #E5E5EA' }}>
              {filteredScholars.length === 0 ? (
                <tr>
                  <td colSpan="11" className="py-12 text-center text-slate-500">
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
                  <tr 
                    key={scholar.id} 
                    className="transition-colors"
                    style={{ 
                      borderBottom: '1px solid #E5E5EA',
                      backgroundColor: selectedIds.includes(scholar.id) ? 'rgba(0, 122, 255, 0.1)' : 'transparent',
                      height: '60px'
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedIds.includes(scholar.id)) {
                        e.currentTarget.style.backgroundColor = '#F5F5F7'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedIds.includes(scholar.id)) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    }}
                  >
                    <td 
                      className="py-3 px-4 sticky-col-left" 
                      style={{ 
                        position: 'sticky', 
                        left: 0, 
                        backgroundColor: 'inherit',
                        zIndex: 9 
                      }}
                    >
                      <button
                        onClick={() => handleSelectOne(scholar.id)}
                        className="flex items-center justify-center w-full"
                      >
                        {selectedIds.includes(scholar.id) ? (
                          <CheckSquare className="w-4 h-4" style={{ color: '#007AFF' }} strokeWidth={1.5} />
                        ) : (
                          <Square className="w-4 h-4" style={{ color: '#AAAAAA' }} strokeWidth={1.5} />
                        )}
                      </button>
                    </td>
                    <td 
                      className="py-3 px-4 sticky-col-name" 
                      style={{ 
                        position: 'sticky', 
                        left: '50px', 
                        backgroundColor: 'inherit',
                        zIndex: 9 
                      }}
                    >
                      <div className="font-semibold whitespace-nowrap" style={{ color: '#1D1D1F' }}>
                        {scholar.lastName}, {scholar.firstName} {scholar.middleName}
                      </div>
                    </td>
                    <td className="py-3 px-4" style={{ color: '#AAAAAA' }}>
                      <div className="whitespace-nowrap">{scholar.barangay}</div>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#AAAAAA' }} title={scholar.school}>
                      <div className="line-clamp-2">{scholar.school}</div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {(() => {
                        const latestGWA = getLatestGWA(scholar)
                        if (!latestGWA) {
                          return <span className="text-xs whitespace-nowrap" style={{ color: '#AAAAAA' }}>No grades</span>
                        }
                        const isWarning = isGWAWarning(latestGWA)
                        return (
                          <span 
                            className={`text-sm font-bold whitespace-nowrap ${isWarning ? 'text-red-600' : ''}`}
                            style={!isWarning ? { color: '#10b981' } : {}}
                          >
                            {formatGWA(latestGWA)}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-3 px-4" style={{ color: '#AAAAAA' }}>
                      <div className="whitespace-nowrap">{scholar.yearLevel}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium whitespace-nowrap" style={{ color: '#AAAAAA' }}>{scholar.semester || '1st Sem'}</span>
                    </td>
                    <td className="py-3 px-4 text-xs" style={{ color: '#AAAAAA' }} title={scholar.course}>
                      <div className="line-clamp-2">{scholar.course || '-'}</div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold" style={{ color: '#10b981' }}>
                      <div className="whitespace-nowrap">
                        {formatCurrency(scholar.scholarship_amount || scholar.amount || 0)}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${getStatusBadge(
                          scholar.status
                        )}`}
                      >
                        {scholar.status}
                      </span>
                    </td>
                    <td 
                      className="py-3 px-4 text-center no-print sticky-col-actions" 
                      style={{ 
                        position: 'sticky', 
                        right: 0, 
                        backgroundColor: 'inherit',
                        zIndex: 9 
                      }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEditScholar(scholar)}
                          className="p-1 transition-colors"
                          style={{ color: '#007AFF' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#0051D5'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#007AFF'}
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(scholar)}
                          className="p-1 transition-colors"
                          style={{ color: '#FF3B30' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#C62828'}
                          onMouseLeave={(e) => e.currentTarget.style.color = '#FF3B30'}
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={1.5} />
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
        <div className="px-4 py-3 flex flex-col sm:flex-row items-center justify-between text-xs gap-2" style={{ backgroundColor: '#F5F5F7', borderTop: '1px solid #E5E5EA' }}>
          <div style={{ color: '#AAAAAA' }}>
            Showing{' '}
            <span className="font-bold" style={{ color: '#1D1D1F' }}>{filteredScholars.length}</span> out of{' '}
            <span className="font-bold" style={{ color: '#1D1D1F' }}>{allScholars.length}</span> records
          </div>
          <div className="font-semibold" style={{ color: '#1D1D1F' }}>
            Filtered Total Amount:{' '}
            <span className="font-bold text-sm" style={{ color: '#10b981' }}>
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

      {/* Bulk Graduated Confirmation Modal */}
      <ConfirmModal
        isOpen={bulkGraduatedConfirm}
        onClose={() => setBulkGraduatedConfirm(false)}
        onConfirm={confirmBulkGraduated}
        title="Mark as Graduated?"
        message={`Are you sure you want to mark ${selectedIds.length} ${selectedIds.length === 1 ? 'scholar' : 'scholars'} as Graduated?`}
        confirmText="Mark as Graduated"
        cancelText="Cancel"
        type="success"
      />
    </div>
  )
}

export default ScholarRecords
