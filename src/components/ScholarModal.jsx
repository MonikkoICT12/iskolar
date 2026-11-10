import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import useScholarStore, { BARANGAYS, YEAR_LEVELS, SEMESTERS } from '../store/scholarStore'

const ScholarModal = ({ scholar, onClose }) => {
  const { addScholar, updateScholar, getAllSchoolsList } = useScholarStore()
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
    scholarStatus: 'Active',
    yearGraduated: new Date().getFullYear(),
    scholarship_amount: '',
    contactNumber: '',
    email: '',
    ...scholar,
  })

  const [scholarshipAmountDisplay, setScholarshipAmountDisplay] = useState('')
  const [scholarshipAmountError, setScholarshipAmountError] = useState('')

  const [schoolSearch, setSchoolSearch] = useState(scholar?.school || '')
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false)
  const [filteredSchools, setFilteredSchools] = useState([])

  // Get existing schools from the system
  const existingSchools = getAllSchoolsList()

  // Lock body scroll when modal is open
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    document.body.style.paddingRight = `${scrollbarWidth}px`

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [])

  // Initialize scholarship amount display
  useEffect(() => {
    if (scholar?.scholarship_amount) {
      setScholarshipAmountDisplay(formatNumberWithCommas(scholar.scholarship_amount))
    }
  }, [scholar])

  // Format number with thousand separators
  const formatNumberWithCommas = (value) => {
    if (!value) return ''
    const num = parseFloat(value)
    if (isNaN(num)) return ''
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
  }

  // Parse formatted number to plain number
  const parseFormattedNumber = (value) => {
    return value.replace(/,/g, '')
  }

  useEffect(() => {
    if (schoolSearch) {
      // Filter by matching each word separately (case-insensitive)
      const searchWords = schoolSearch.toLowerCase().split(/\s+/).filter(Boolean)
      const filtered = existingSchools.filter(school => {
        const schoolLower = school.toLowerCase()
        return searchWords.every(word => schoolLower.includes(word))
      })
      setFilteredSchools(filtered)
    } else {
      setFilteredSchools(existingSchools)
    }
  }, [schoolSearch, existingSchools])

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

  const handleScholarshipAmountChange = (e) => {
    const value = e.target.value
    // Allow only numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '')
    
    // Prevent multiple decimal points
    const parts = sanitized.split('.')
    const formatted = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized
    
    // Update display with commas
    if (formatted) {
      const plainNumber = parseFormattedNumber(formatted)
      const numericValue = parseFloat(plainNumber)
      
      if (!isNaN(numericValue) && numericValue >= 0) {
        setScholarshipAmountDisplay(formatNumberWithCommas(plainNumber))
        setFormData((prev) => ({ ...prev, scholarship_amount: plainNumber }))
        setScholarshipAmountError('')
      } else {
        setScholarshipAmountDisplay(formatted)
        setFormData((prev) => ({ ...prev, scholarship_amount: '' }))
      }
    } else {
      setScholarshipAmountDisplay('')
      setFormData((prev) => ({ ...prev, scholarship_amount: '' }))
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

  const handleCreateNewSchool = () => {
    const normalizedName = schoolSearch.trim().replace(/\s+/g, ' ')
    if (normalizedName) {
      setFormData((prev) => ({ ...prev, school: normalizedName }))
      setShowSchoolDropdown(false)
    }
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

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.school) {
      alert('Please fill in all required fields')
      return
    }

    // Validate scholarship amount
    if (!formData.scholarship_amount || formData.scholarship_amount === '' || parseFloat(formData.scholarship_amount) <= 0) {
      setScholarshipAmountError('Scholarship amount is required and must be greater than 0')
      return
    }

    // Convert scholarship_amount to number
    const dataToSubmit = {
      ...formData,
      scholarship_amount: parseFloat(formData.scholarship_amount) || 0,
      amount: parseFloat(formData.scholarship_amount) || 0 // Keep amount for backward compatibility
    }

    if (isEditing) {
      updateScholar(scholar.id, dataToSubmit)
    } else {
      addScholar(dataToSubmit)
    }

    onClose()
  }

  return createPortal(
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
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white px-6 py-4 flex items-center justify-between border-b z-10" style={{ borderColor: '#E5E5EA' }}>
          <h2 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>
            {isEditing ? 'Edit Scholar' : 'Add New Scholar'}
          </h2>
          <button
            onClick={onClose}
            className="transition p-2 hover:bg-slate-100 rounded-lg"
            style={{ color: '#AAAAAA' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#1D1D1F'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#AAAAAA'}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
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
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
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
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Middle Name
                </label>
                <input
                  type="text"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                  title="Only letters, spaces, hyphens, and apostrophes allowed"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
            </div>

            <div className="mt-2">
              <p className="text-xs flex items-center gap-2" style={{ color: '#AAAAAA' }}>
                <span className="font-medium">Note:</span>
                <span>Name fields accept only letters, spaces, hyphens (-), and apostrophes (')</span>
              </p>
            </div>

            <div className="grid grid-cols-1 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Barangay <span className="text-red-500">*</span>
                </label>
                <select
                  name="barangay"
                  value={formData.barangay}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
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
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Academic Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="md:col-span-3 relative">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
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
                  placeholder={isEditing ? "Select from existing schools..." : "Type school name or select from existing..."}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
                {showSchoolDropdown && filteredSchools.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg max-h-60 overflow-y-auto" style={{ border: '1px solid #E5E5EA' }}>
                    {filteredSchools.map((school, index) => {
                      // Highlight matching text
                      const searchWords = schoolSearch.toLowerCase().split(/\s+/).filter(Boolean)
                      const parts = []
                      let currentText = school
                      
                      searchWords.forEach(word => {
                        const regex = new RegExp(`(${word})`, 'gi')
                        const tempParts = []
                        currentText.split(regex).forEach(part => {
                          if (part.toLowerCase() === word.toLowerCase()) {
                            tempParts.push(<strong key={Math.random()}>{part}</strong>)
                          } else if (part) {
                            tempParts.push(part)
                          }
                        })
                        currentText = tempParts
                      })

                      return (
                        <div
                          key={index}
                          onClick={() => handleSchoolSelect(school)}
                          className="px-3 py-2 cursor-pointer text-sm border-b last:border-b-0"
                          style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F5F5F7'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {typeof currentText === 'string' ? school : currentText}
                        </div>
                      )
                    })}
                  </div>
                )}
                {showSchoolDropdown && filteredSchools.length === 0 && schoolSearch && (
                  <div className="absolute z-10 w-full mt-1 bg-white rounded-lg shadow-lg px-3 py-2" style={{ border: '1px solid #E5E5EA' }}>
                    {!isEditing ? (
                      <div
                        onClick={handleCreateNewSchool}
                        className="cursor-pointer"
                      >
                        <p className="text-xs font-medium" style={{ color: '#007AFF' }}>
                          Use "{schoolSearch.trim().replace(/\s+/g, ' ')}" as a new school
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                          This will be added to the system
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: '#AAAAAA' }}>
                        No matching schools found. Please select from existing schools.
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                  {isEditing 
                    ? "Select from existing schools only" 
                    : "Select from existing schools or type a new name"}
                </p>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                >
                  {YEAR_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Semester <span className="text-red-500">*</span>
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                >
                  {SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      {sem}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Course / Program
                </label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="e.g., BS Computer Science"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
            </div>
          </div>

          {/* Scholarship Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Scholarship Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Scholarship Amount (PHP) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={scholarshipAmountDisplay}
                  onChange={handleScholarshipAmountChange}
                  required
                  placeholder="Enter amount (e.g., 25,000)"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: scholarshipAmountError ? '1px solid #FF3B30' : '1px solid #E5E5EA' }}
                />
                {scholarshipAmountError && (
                  <p className="text-xs mt-1 text-red-600">{scholarshipAmountError}</p>
                )}
                <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                  Format: 25,000.00 (typed manually)
                </p>
              </div>
              {isEditing && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                      Payment Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 rounded-lg text-sm"
                      style={{ border: '1px solid #E5E5EA' }}
                    >
                      <option value="Processing">Processing</option>
                      <option value="Paid">Paid</option>
                    </select>
                    <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                      Update payment status when released
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                      Scholar Status <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scholarStatus"
                          value="Active"
                          checked={formData.scholarStatus === 'Active' || !formData.scholarStatus}
                          onChange={handleChange}
                          className="w-4 h-4"
                          style={{ accentColor: '#007AFF' }}
                        />
                        <span className="text-sm" style={{ color: '#1D1D1F' }}>Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="scholarStatus"
                          value="Graduated"
                          checked={formData.scholarStatus === 'Graduated'}
                          onChange={handleChange}
                          className="w-4 h-4"
                          style={{ accentColor: '#007AFF' }}
                        />
                        <span className="text-sm" style={{ color: '#1D1D1F' }}>Graduated</span>
                      </label>
                    </div>
                  </div>
                  {formData.scholarStatus === 'Graduated' && (
                    <div>
                      <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                        Year Graduated
                      </label>
                      <input
                        type="number"
                        name="yearGraduated"
                        value={formData.yearGraduated}
                        onChange={handleChange}
                        min="2000"
                        max="2100"
                        placeholder="e.g., 2024"
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ border: '1px solid #E5E5EA' }}
                      />
                    </div>
                  )}
                </>
              )}
              {!isEditing && (
                <div className="md:col-span-2">
                  <div className="rounded-lg p-3" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
                    <p className="text-xs" style={{ color: '#1D1D1F' }}>
                      <span className="font-semibold">Note:</span> New scholars are automatically set to{' '}
                      <span className="font-bold">"Active"</span> status with payment status{' '}
                      <span className="font-bold">"Processing"</span>. You can change these after adding the scholar.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  placeholder="09XX XXX XXXX"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="scholar@example.com"
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: '#E5E5EA' }}>
            <button
              type="button"
              onClick={onClose}
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
              type="submit"
              className="px-6 py-2 text-sm font-semibold text-white rounded-lg transition shadow"
              style={{ backgroundColor: '#007AFF' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0051D5'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007AFF'}
            >
              {isEditing ? 'Update Scholar' : 'Add Scholar'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}

export default ScholarModal
