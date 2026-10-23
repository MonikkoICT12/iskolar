import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import useScholarStore, { BARANGAYS, YEAR_LEVELS, SEMESTERS } from '../store/scholarStore'
import NUEVA_ECIJA_SCHOOLS from '../utils/schools'

const ScholarModal = ({ scholar, onClose }) => {
  const { addScholar, updateScholar } = useScholarStore()
  const isEditing = !!scholar

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    barangay: 'Atate',
    school: '',
    yearLevel: '1st Year',
    semester: '1st Sem',
    course: '',
    amount: '',
    status: 'Processing',
    contactNumber: '',
    email: '',
    ...scholar,
  })

  const [schoolSearch, setSchoolSearch] = useState(scholar?.school || '')
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const [filteredSchools, setFilteredSchools] = useState(NUEVA_ECIJA_SCHOOLS)

  useEffect(() => {
    if (schoolSearch) {
      const filtered = NUEVA_ECIJA_SCHOOLS.filter(school =>
        school.toLowerCase().includes(schoolSearch.toLowerCase())
      )
      setFilteredSchools(filtered)
    } else {
      setFilteredSchools(NUEVA_ECIJA_SCHOOLS)
    }
  }, [schoolSearch])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Apply input mask for name fields (letters, spaces, hyphens, apostrophes only)
    if (name === 'firstName' || name === 'lastName' || name === 'middleName') {
      // Remove any characters that are not letters, spaces, hyphens, or apostrophes
      const sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, '')
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSchoolInputChange = (e) => {
    const value = e.target.value
    setSchoolSearch(value)
    setFormData((prev) => ({ ...prev, school: value }))
    setShowSchoolDropdown(true)
  }

  const handleSchoolSelect = (school) => {
    setSchoolSearch(school)
    setFormData((prev) => ({ ...prev, school: school }))
    setShowSchoolDropdown(false)
  }

  const handleKeyDown = (e) => {
    // When Enter is pressed in an input field
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault()
      
      // Get all form inputs and selects
      const form = e.target.form
      const inputs = Array.from(form.querySelectorAll('input, select, textarea'))
      const currentIndex = inputs.indexOf(e.target)
      
      // Move to next input
      if (currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus()
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.firstName || !formData.lastName || !formData.school || !formData.amount) {
      alert('Please fill in all required fields')
      return
    }

    if (isEditing) {
      updateScholar(scholar.id, formData)
    } else {
      addScholar(formData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-lgu-navy text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-bold">
            {isEditing ? 'Edit Scholar' : 'Add New Scholar'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-amber-300 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  autoFocus
                  placeholder="Enter first name"
                  title="Only letters, spaces, hyphens, and apostrophes allowed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  placeholder="Enter last name"
                  title="Only letters, spaces, hyphens, and apostrophes allowed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                  title="Only letters, spaces, hyphens, and apostrophes allowed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs text-slate-500 italic">
                ℹ️ Name fields accept only letters, spaces, hyphens (-), and apostrophes (')
              </p>
            </div>

            <div className="grid grid-cols-1 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Barangay <span className="text-red-500">*</span>
                </label>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                >
                  {BARANGAYS.map((brgy) => (
                    <option key={brgy} value={brgy}>
                      {brgy}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-3 relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  School / University <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="school"
                  value={schoolSearch}
                  onChange={handleSchoolInputChange}
                  onFocus={() => setShowSchoolDropdown(true)}
                  onBlur={() => setTimeout(() => setShowSchoolDropdown(false), 200)}
                  required
                  placeholder="Type to search Nueva Ecija schools..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
                {showSchoolDropdown && filteredSchools.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSchools.map((school, index) => (
                      <div
                        key={index}
                        onClick={() => handleSchoolSelect(school)}
                        className="px-3 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-slate-700 border-b border-slate-100 last:border-b-0"
                      >
                        {school}
                      </div>
                    ))}
                  </div>
                )}
                {showSchoolDropdown && filteredSchools.length === 0 && schoolSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-lg shadow-lg">
                    <div className="px-3 py-2 text-sm text-slate-500 italic">
                      No schools found. You can still enter a custom school name.
                    </div>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                >
                  {YEAR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Course / Program
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., BS Computer Science"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
            </div>
          </div>

          {/* Scholarship Details */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">
              Scholarship Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Scholarship Amount (₱) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter amount (e.g., 25000)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
              {isEditing && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Paid">Paid</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-1">
                    Update payment status when released
                  </p>
                </div>
              )}
              {!isEditing && (
                <div className="md:col-span-2">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
                    <p className="text-xs text-indigo-800">
                      <span className="font-semibold">Note:</span> New scholars are automatically set to{' '}
                      <span className="font-bold">"Processing"</span> status. You can change this to "Paid" after payment is released.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b pb-2">
              Contact Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="09XX XXX XXXX"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="scholar@example.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lgu-blue"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition shadow"
            >
              {isEditing ? 'Update Scholar' : 'Add Scholar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScholarModal
