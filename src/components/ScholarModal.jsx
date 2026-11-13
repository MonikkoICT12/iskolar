import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, Plus } from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { BARANGAYS } from '../config/barangays'
import SEMESTER_OPTIONS, { getSemesterGradeLabel } from '../config/semesters'
import { SUFFIXES } from '../config/suffixes'
import { YEAR_LEVELS } from '../config/yearLevels'
import { GRADING_CONFIG, validateGWA, formatGWA, isGWAWarning } from '../config/grading'
import GraduateConfirmModal from './GraduateConfirmModal'
import SchoolAutocomplete from './SchoolAutocomplete'

const ScholarModal = ({ scholar, onClose }) => {
  const { addScholar, updateScholar, getAllSchoolsList, bulkMarkAsGraduated } = useScholarStore()
  const isEditing = !!scholar

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    suffix: 'None',
    gender: 'Male',
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
    is_pwd: false,
    is_solo_parent: false,
    grades: [],
    ...scholar,
  })

  const [showGraduateModal, setShowGraduateModal] = useState(false)
  const [scholarshipAmountDisplay, setScholarshipAmountDisplay] = useState('')
  const [scholarshipAmountError, setScholarshipAmountError] = useState('')

  // Get existing schools from the system
  const existingSchools = getAllSchoolsList()

  // Grade entry state - semester will be synced from formData.semester
  const [newGrade, setNewGrade] = useState({
    schoolYear: '',
    gwa: ''
  })
  const [gradeError, setGradeError] = useState('')
  const [gradesError, setGradesError] = useState('')

  const handleAddGrade = () => {
    // Check if semester is selected in academic info
    if (!formData.semester) {
      setGradeError('Please select semester in Academic Information section first')
      return
    }

    if (!newGrade.schoolYear || !newGrade.gwa) {
      setGradeError('Please fill in all grade fields')
      return
    }

    const validation = validateGWA(newGrade.gwa)
    if (!validation.valid) {
      setGradeError(validation.error)
      return
    }

    const gradeEntry = {
      schoolYear: newGrade.schoolYear,
      semester: getSemesterGradeLabel(formData.semester), // Use grade label from academic semester
      gwa: parseFloat(newGrade.gwa),
      createdAt: new Date().toISOString()
    }

    setFormData(prev => ({
      ...prev,
      grades: [...(prev.grades || []), gradeEntry]
    }))

    setNewGrade({
      schoolYear: '',
      gwa: ''
    })
    setGradeError('')
    setGradesError('')
  }

  const handleRemoveGrade = (index) => {
    // Don't allow removing last grade
    if (formData.grades.length <= 1) {
      return
    }
    
    setFormData(prev => ({
      ...prev,
      grades: prev.grades.filter((_, idx) => idx !== index)
    }))
  }

  const handleGraduateClick = () => {
    setShowGraduateModal(true)
  }

  const handleGraduateConfirm = (year) => {
    bulkMarkAsGraduated([scholar.id], year)
    setShowGraduateModal(false)
    onClose()
  }

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

  const handleSchoolChange = (value) => {
    setFormData((prev) => ({ ...prev, school: value }))
  }

  const handleSchoolSelect = (school) => {
    setFormData((prev) => ({ ...prev, school: school }))
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
    setGradesError('')

    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.school) {
      alert('Please fill in all required fields')
      return
    }

    // Validate gender
    if (!formData.gender) {
      alert('Please select gender')
      return
    }

    // Validate scholarship amount
    if (!formData.scholarship_amount || formData.scholarship_amount === '' || parseFloat(formData.scholarship_amount) <= 0) {
      setScholarshipAmountError('Scholarship amount is required and must be greater than 0')
      return
    }

    // Check for pending grade (filled but not added)
    let finalGrades = [...(formData.grades || [])]
    if (newGrade.schoolYear && newGrade.gwa && formData.semester) {
      const validation = validateGWA(newGrade.gwa)
      if (validation.valid) {
        // Auto-add the pending grade
        const pendingGrade = {
          schoolYear: newGrade.schoolYear,
          semester: getSemesterGradeLabel(formData.semester),
          gwa: parseFloat(newGrade.gwa),
          createdAt: new Date().toISOString()
        }
        finalGrades = [...finalGrades, pendingGrade]
      }
    }

    // REQUIRED GRADES VALIDATION
    if (finalGrades.length === 0) {
      setGradesError('Add at least one grade entry')
      return
    }

    // Convert scholarship_amount to number
    const dataToSubmit = {
      ...formData,
      grades: finalGrades,
      suffix: formData.suffix === 'None' ? null : formData.suffix,
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
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
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  Suffix
                </label>
                <select
                  name="suffix"
                  value={formData.suffix || 'None'}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg text-sm"
                  style={{ border: '1px solid #E5E5EA' }}
                >
                  {SUFFIXES.map((suffix) => (
                    <option key={suffix} value={suffix}>
                      {suffix}
                    </option>
                  ))}
                </select>
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
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                  School / University <span className="text-red-500">*</span>
                </label>
                <SchoolAutocomplete
                  value={formData.school}
                  onChange={handleSchoolChange}
                  onSelect={handleSchoolSelect}
                  existingSchools={existingSchools}
                  isEditMode={isEditing}
                  placeholder={isEditing ? "Select from existing schools..." : "Type school name or select from existing..."}
                />
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
                      Payment Status
                    </label>
                    <div className="w-full px-3 py-2 rounded-lg text-sm flex items-center" style={{ border: '1px solid #E5E5EA', backgroundColor: '#F5F5F7' }}>
                      <span
                        className="px-3 py-1 rounded-md text-xs font-semibold"
                        style={{
                          backgroundColor: formData.status === 'Paid' ? '#D1FAE5' : '#FEF3C7',
                          color: formData.status === 'Paid' ? '#065F46' : '#92400E',
                        }}
                      >
                        {formData.status || 'Processing'}
                      </span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#AAAAAA' }}>
                      Payment status is changed using Mark as Paid or Mark as Unpaid in the Scholars tab.
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

          {/* Additional Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#1D1D1F' }}>
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>Male</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'}
                      onChange={handleChange}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>Female</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#1D1D1F' }}>
                  PWD (Person with Disability)
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_pwd"
                      checked={formData.is_pwd === true}
                      onChange={() => setFormData(prev => ({ ...prev, is_pwd: true }))}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_pwd"
                      checked={formData.is_pwd === false}
                      onChange={() => setFormData(prev => ({ ...prev, is_pwd: false }))}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>No</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: '#1D1D1F' }}>
                  Solo Parent
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_solo_parent"
                      checked={formData.is_solo_parent === true}
                      onChange={() => setFormData(prev => ({ ...prev, is_solo_parent: true }))}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>Yes</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="is_solo_parent"
                      checked={formData.is_solo_parent === false}
                      onChange={() => setFormData(prev => ({ ...prev, is_solo_parent: false }))}
                      className="w-4 h-4"
                      style={{ accentColor: '#007AFF' }}
                    />
                    <span className="text-sm" style={{ color: '#1D1D1F' }}>No</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Grades - REQUIRED */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider border-b pb-2" style={{ color: '#1D1D1F', borderColor: '#E5E5EA' }}>
              Grades <span className="text-red-500">*</span>
            </h3>
            
            {gradesError && (
              <p className="text-xs mt-2 text-red-600">{gradesError}</p>
            )}
            
            {/* Existing Grades */}
            {formData.grades && formData.grades.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold" style={{ color: '#AAAAAA' }}>Grade History</p>
                {formData.grades
                  .sort((a, b) => b.schoolYear.localeCompare(a.schoolYear) || (b.createdAt || '').localeCompare(a.createdAt || ''))
                  .map((grade, index) => {
                    const isLastGrade = formData.grades.length === 1
                    return (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: '#F5F5F7', border: '1px solid #E5E5EA' }}>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>
                            {grade.schoolYear} - {grade.semester}
                          </p>
                          <p className={`text-lg font-bold ${isGWAWarning(grade.gwa) ? 'text-red-600' : ''}`} style={!isGWAWarning(grade.gwa) ? { color: '#10b981' } : {}}>
                            GWA: {formatGWA(grade.gwa)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGrade(index)}
                          disabled={isLastGrade}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg transition-all"
                          style={{
                            color: isLastGrade ? '#AAAAAA' : '#DC2626',
                            backgroundColor: 'transparent',
                            border: isLastGrade ? '1px solid #AAAAAA' : '1px solid #DC2626',
                            opacity: isLastGrade ? 0.5 : 1,
                            cursor: isLastGrade ? 'not-allowed' : 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            if (!isLastGrade) e.currentTarget.style.backgroundColor = '#FEE2E2'
                          }}
                          onMouseLeave={(e) => {
                            if (!isLastGrade) e.currentTarget.style.backgroundColor = 'transparent'
                          }}
                          title={isLastGrade ? "A scholar must have at least one grade" : "Remove this grade"}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
              </div>
            )}

            {/* Add New Grade */}
            <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E5EA' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: '#1D1D1F' }}>Add Grade Entry</p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                    School Year
                  </label>
                  <input
                    type="text"
                    value={newGrade.schoolYear}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, schoolYear: e.target.value }))}
                    placeholder="2026-2027"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid #E5E5EA' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                    Semester
                  </label>
                  <input
                    type="text"
                    value={formData.semester ? getSemesterGradeLabel(formData.semester) : ''}
                    placeholder="Select semester above"
                    disabled
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ 
                      border: '1px solid #E5E5EA',
                      backgroundColor: '#F5F5F7',
                      color: '#AAAAAA',
                      cursor: 'not-allowed'
                    }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#1D1D1F' }}>
                    GWA (1.00 - 5.00)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={GRADING_CONFIG.MIN_GWA}
                    max={GRADING_CONFIG.MAX_GWA}
                    value={newGrade.gwa}
                    onChange={(e) => setNewGrade(prev => ({ ...prev, gwa: e.target.value }))}
                    placeholder="1.75"
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{ border: '1px solid #E5E5EA' }}
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={handleAddGrade}
                    className="w-full px-4 py-2 text-sm font-semibold text-white rounded-lg transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: '#10b981' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>
              </div>
              {gradeError && (
                <p className="text-xs mt-2 text-red-600">{gradeError}</p>
              )}
              <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                Scale: 1.00 (Highest) to 5.00 (Lowest). Grades above {GRADING_CONFIG.GWA_WARNING} will be highlighted.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between gap-3 pt-4 border-t" style={{ borderColor: '#E5E5EA' }}>
            <div>
              {isEditing && formData.scholarStatus !== 'Graduated' && (
                <button
                  type="button"
                  onClick={handleGraduateClick}
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition"
                  style={{
                    color: '#FFFFFF',
                    backgroundColor: '#10b981',
                    border: '1px solid #10b981'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
                >
                  Graduate
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
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
          </div>
        </form>
      </div>
      {showGraduateModal && (
        <GraduateConfirmModal
          scholar={scholar}
          onConfirm={handleGraduateConfirm}
          onCancel={() => setShowGraduateModal(false)}
        />
      )}
    </div>,
    document.body
  )
}

export default ScholarModal
