import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Edit2, Trash2, X, School } from 'lucide-react'
import useScholarStore from '../store/scholarStore'

const SchoolsManagement = () => {
  const { 
    getSchoolsList, 
    addSchool, 
    updateSchoolName, 
    deleteSchool, 
    validateSchoolInUse,
    getScholarsBySchool 
  } = useScholarStore()
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [newSchoolName, setNewSchoolName] = useState('')
  const [editSchoolName, setEditSchoolName] = useState('')

  const schools = getSchoolsList()

  const handleAddSchool = () => {
    if (!newSchoolName.trim()) return
    
    const result = addSchool(newSchoolName.trim())
    if (result) {
      setNewSchoolName('')
      setIsAddModalOpen(false)
    }
  }

  const handleEditSchool = () => {
    if (!editSchoolName.trim() || !selectedSchool) return
    
    updateSchoolName(selectedSchool, editSchoolName.trim())
    setEditSchoolName('')
    setSelectedSchool(null)
    setIsEditModalOpen(false)
  }

  const handleDeleteSchool = () => {
    if (!selectedSchool) return
    
    const result = deleteSchool(selectedSchool)
    if (result) {
      setSelectedSchool(null)
      setIsDeleteModalOpen(false)
    }
  }

  const openEditModal = (school) => {
    setSelectedSchool(school)
    setEditSchoolName(school)
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (school) => {
    setSelectedSchool(school)
    setIsDeleteModalOpen(true)
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1D1D1F' }}>
          Schools Management
        </h2>
        <p style={{ color: '#AAAAAA' }}>
          Add, edit, or remove schools and universities in the system.
        </p>
      </div>

      {/* Add School Button */}
      <div className="mb-6">
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-150 shadow-sm"
          style={{
            backgroundColor: '#007AFF',
            color: '#FFFFFF',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#0051D5'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#007AFF'
          }}
        >
          <Plus className="w-4 h-4" />
          Add School
        </button>
      </div>

      {/* Schools Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead style={{ backgroundColor: '#F5F5F7' }}>
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                School / University
              </th>
              <th className="px-6 py-3 text-center text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                Scholars
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
                  <p>No schools added yet. Click "Add School" to get started.</p>
                </td>
              </tr>
            ) : (
              schools.map((school, index) => {
                const scholarCount = getScholarsBySchool(school).length
                return (
                  <tr 
                    key={index}
                    className="border-t"
                    style={{ borderColor: '#E5E5EA' }}
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
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(school)}
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
                        <button
                          onClick={() => openDeleteModal(school)}
                          className="p-2 rounded-lg transition-all duration-150"
                          style={{ color: '#FF3B30' }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 59, 48, 0.1)'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title="Delete school"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Add School Modal */}
      {isAddModalOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn"
            onClick={() => setIsAddModalOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E5EA' }}>
                <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                  Add School
                </h3>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg transition-all"
                  style={{ color: '#AAAAAA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                  School / University Name
                </label>
                <input
                  type="text"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSchool()
                  }}
                  placeholder="e.g., Nueva Ecija University of Science and Technology"
                  className="w-full px-4 py-2 rounded-lg border transition-all"
                  style={{
                    borderColor: '#E5E5EA',
                    color: '#1D1D1F',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#007AFF'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E5EA'
                  }}
                  autoFocus
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: '#E5E5EA' }}>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ color: '#1D1D1F' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSchool}
                  disabled={!newSchoolName.trim()}
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
                  Add School
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Edit School Modal */}
      {isEditModalOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn"
            onClick={() => setIsEditModalOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E5EA' }}>
                <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                  Edit School Name
                </h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg transition-all"
                  style={{ color: '#AAAAAA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-sm mb-4" style={{ color: '#AAAAAA' }}>
                  This will update the school name for all {getScholarsBySchool(selectedSchool).length} scholar(s) using this school.
                </p>
                <label className="block text-sm font-medium mb-2" style={{ color: '#1D1D1F' }}>
                  School / University Name
                </label>
                <input
                  type="text"
                  value={editSchoolName}
                  onChange={(e) => setEditSchoolName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSchool()
                  }}
                  className="w-full px-4 py-2 rounded-lg border transition-all"
                  style={{
                    borderColor: '#E5E5EA',
                    color: '#1D1D1F',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#007AFF'
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E5EA'
                  }}
                  autoFocus
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: '#E5E5EA' }}>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ color: '#1D1D1F' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSchool}
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
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* Delete School Modal */}
      {isDeleteModalOpen && createPortal(
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 animate-fadeIn"
            onClick={() => setIsDeleteModalOpen(false)}
            style={{ backdropFilter: 'blur(4px)' }}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div 
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto animate-slideUp"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: '#E5E5EA' }}>
                <h3 className="text-xl font-semibold" style={{ color: '#1D1D1F' }}>
                  Delete School
                </h3>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="p-1 rounded-lg transition-all"
                  style={{ color: '#AAAAAA' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {validateSchoolInUse(selectedSchool) ? (
                  <div 
                    className="p-4 rounded-lg mb-4"
                    style={{ backgroundColor: 'rgba(255, 59, 48, 0.1)' }}
                  >
                    <p className="font-medium mb-2" style={{ color: '#FF3B30' }}>
                      Cannot delete this school
                    </p>
                    <p className="text-sm" style={{ color: '#1D1D1F' }}>
                      There are {getScholarsBySchool(selectedSchool).length} scholar(s) still using this school. 
                      Please reassign or remove these scholars before deleting the school.
                    </p>
                  </div>
                ) : (
                  <p style={{ color: '#1D1D1F' }}>
                    Are you sure you want to delete <strong>{selectedSchool}</strong>? This action cannot be undone.
                  </p>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: '#E5E5EA' }}>
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 rounded-lg font-medium transition-all"
                  style={{ color: '#1D1D1F' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                >
                  Cancel
                </button>
                {!validateSchoolInUse(selectedSchool) && (
                  <button
                    onClick={handleDeleteSchool}
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: '#FF3B30',
                      color: '#FFFFFF',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#D32F2F'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#FF3B30'
                    }}
                  >
                    Delete School
                  </button>
                )}
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export default SchoolsManagement
