import { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Trash2,
  GraduationCap,
  UserPlus,
  User,
  School,
  Phone,
  BookOpen,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  X,
  AlertCircle,
  Wallet,
} from 'lucide-react'
import useScholarStore from '../store/scholarStore'
import { BARANGAYS } from '../config/barangays'
import SEMESTER_OPTIONS, { getSemesterGradeLabel } from '../config/semesters'
import { SUFFIXES } from '../config/suffixes'
import { YEAR_LEVELS } from '../config/yearLevels'
import {
  GRADING_CONFIG,
  validateGWA,
  formatGWA,
  isGWAWarning,
} from '../config/grading'
import GraduateConfirmModal from './GraduateConfirmModal'
import SchoolAutocomplete from './SchoolAutocomplete'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const SEMESTERS = SEMESTER_OPTIONS.map((opt) => opt.value)
const QUICK_AMOUNTS = [10000, 15000, 20000, 25000]
const QUICK_SCHOOL_YEARS = ['2026-2027', '2025-2026', '2024-2025', '2027-2028']

const formatNumberWithCommas = (value) => {
  if (!value && value !== 0) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}

const parseFormattedNumber = (value) => String(value).replace(/,/g, '')

const SegmentedOption = ({ active, onClick, children, className = '' }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 h-9 px-3 rounded-lg border text-xs font-semibold transition-all duration-200 flex items-center justify-center gap-1.5 ${
      active
        ? 'border-brand bg-brand/10 text-brand shadow-[0_1px_2px_rgba(88,117,41,0.12)]'
        : 'border-border bg-white text-muted-foreground hover:text-foreground hover:bg-[#F7F8F3]'
    } ${className}`}
  >
    {children}
  </button>
)

const ScholarModal = ({ scholar, onClose }) => {
  const {
    addScholar,
    updateScholar,
    getAllSchoolsList,
    bulkMarkAsGraduated,
    showToast,
  } = useScholarStore()
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

  const [activeStep, setActiveStep] = useState(1)
  const [stepDirection, setStepDirection] = useState('initial')
  const [showGraduateModal, setShowGraduateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [scholarshipAmountDisplay, setScholarshipAmountDisplay] = useState('')
  const [scholarshipAmountError, setScholarshipAmountError] = useState('')
  const [useSchoolSelectOnly, setUseSchoolSelectOnly] = useState(false)

  const existingSchools = getAllSchoolsList()

  const [newGrade, setNewGrade] = useState({
    schoolYear: '2026-2027',
    gwa: '',
  })
  const [gradeError, setGradeError] = useState('')
  const [gradesError, setGradesError] = useState('')

  useEffect(() => {
    if (scholar?.scholarship_amount) {
      setScholarshipAmountDisplay(
        formatNumberWithCommas(scholar.scholarship_amount)
      )
    }
  }, [scholar])

  const step1Complete = useMemo(() => {
    const amountNum = parseFloat(formData.scholarship_amount)
    return (
      Boolean(formData.firstName?.trim()) &&
      Boolean(formData.lastName?.trim()) &&
      Boolean(formData.gender) &&
      Boolean(formData.barangay) &&
      Boolean(formData.school?.trim()) &&
      !isNaN(amountNum) &&
      amountNum > 0
    )
  }, [formData])

  const step2Unlocked = isEditing || step1Complete

  const goToStep = (targetStep) => {
    if (targetStep === activeStep) return
    if (targetStep === 2 && !validateStep1()) return
    setStepDirection(targetStep > activeStep ? 'forward' : 'backward')
    setActiveStep(targetStep)
  }

  const validateStep1 = () => {
    if (!formData.firstName?.trim() || !formData.lastName?.trim()) {
      showToast('Please enter the scholar first and last name', 'error')
      return false
    }
    if (!formData.gender) {
      showToast('Please select gender', 'error')
      return false
    }
    if (!formData.school?.trim()) {
      showToast('Please select or enter a school', 'error')
      return false
    }
    if (
      !formData.scholarship_amount ||
      formData.scholarship_amount === '' ||
      parseFloat(formData.scholarship_amount) <= 0
    ) {
      setScholarshipAmountError(
        'Scholarship amount is required and must be greater than 0'
      )
      showToast('Please enter a valid scholarship amount', 'error')
      return false
    }
    setScholarshipAmountError('')
    return true
  }

  const handleAddGrade = () => {
    if (!formData.semester) {
      setGradeError('Please select semester in Academic Placement first')
      return
    }

    if (!newGrade.schoolYear?.trim() || !newGrade.gwa) {
      setGradeError('Please fill in School Year and GWA')
      return
    }

    const validation = validateGWA(newGrade.gwa)
    if (!validation.valid) {
      setGradeError(validation.error)
      return
    }

    const gradeEntry = {
      schoolYear: newGrade.schoolYear.trim(),
      semester: getSemesterGradeLabel(formData.semester),
      gwa: parseFloat(newGrade.gwa),
      createdAt: new Date().toISOString(),
    }

    setFormData((prev) => ({
      ...prev,
      grades: [...(prev.grades || []), gradeEntry],
    }))

    setNewGrade((prev) => ({ ...prev, gwa: '' }))
    setGradeError('')
    setGradesError('')
  }

  const handleRemoveGrade = (gradeToRemove) => {
    if (isEditing && (formData.grades || []).length <= 1) return
    setFormData((prev) => ({
      ...prev,
      grades: prev.grades.filter((g) => g !== gradeToRemove),
    }))
  }

  const handleGraduateConfirm = async (year) => {
    if (isSubmitting) return
    setIsSubmitting(true)
    try {
      const ok = await bulkMarkAsGraduated([scholar.id], year)
      if (ok) {
        setShowGraduateModal(false)
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'firstName' || name === 'lastName' || name === 'middleName') {
      const sanitizedValue = value.replace(/[^a-zA-Z\s\-']/g, '')
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleQuickAmountSelect = (amountValue) => {
    setScholarshipAmountDisplay(formatNumberWithCommas(amountValue))
    setFormData((prev) => ({ ...prev, scholarship_amount: String(amountValue) }))
    setScholarshipAmountError('')
  }

  const handleScholarshipAmountChange = (e) => {
    const sanitized = e.target.value.replace(/[^0-9.]/g, '')
    const parts = sanitized.split('.')
    const formatted =
      parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : sanitized

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
      e.preventDefault()
      const form = e.target.form
      if (!form) return
      const inputs = Array.from(form.querySelectorAll('input, textarea'))
      const currentIndex = inputs.indexOf(e.target)
      if (currentIndex >= 0 && currentIndex < inputs.length - 1) {
        inputs[currentIndex + 1].focus()
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isSubmitting) return
    setGradesError('')

    if (!validateStep1()) {
      if (activeStep !== 1) goToStep(1)
      return
    }

    let finalGrades = [...(formData.grades || [])]
    if (newGrade.schoolYear && newGrade.gwa && formData.semester) {
      const validation = validateGWA(newGrade.gwa)
      if (validation.valid) {
        finalGrades = [
          ...finalGrades,
          {
            schoolYear: newGrade.schoolYear.trim(),
            semester: getSemesterGradeLabel(formData.semester),
            gwa: parseFloat(newGrade.gwa),
            createdAt: new Date().toISOString(),
          },
        ]
      }
    }

    if (finalGrades.length === 0) {
      setGradesError('Add at least one grade entry before saving.')
      if (activeStep !== 2) {
        setStepDirection('forward')
        setActiveStep(2)
      }
      return
    }

    const numericAmount = parseFloat(formData.scholarship_amount) || 0
    const paymentStatus = formData.status || formData.paymentStatus || 'Processing'
    const dataToSubmit = {
      ...formData,
      grades: finalGrades,
      suffix: formData.suffix === 'None' ? null : formData.suffix,
      scholarship_amount: numericAmount,
      amount: numericAmount,
      status: paymentStatus,
      paymentStatus,
    }

    setIsSubmitting(true)
    try {
      const ok = isEditing
        ? await updateScholar(scholar.id, dataToSubmit)
        : await addScholar(dataToSubmit)
      if (ok) {
        onClose()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const sortedGrades = [...(formData.grades || [])].sort(
    (a, b) =>
      (b.schoolYear || '').localeCompare(a.schoolYear || '') ||
      (b.createdAt || '').localeCompare(a.createdAt || '')
  )

  const liveDraftGwaValid = newGrade.gwa ? validateGWA(newGrade.gwa).valid : false
  const liveDraftGwaWarn = liveDraftGwaValid ? isGWAWarning(newGrade.gwa) : false

  const displayFullName = [
    formData.firstName?.trim(),
    formData.middleName?.trim(),
    formData.lastName?.trim(),
    formData.suffix && formData.suffix !== 'None' ? formData.suffix : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <Dialog open onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          hideClose
          className="max-w-5xl w-[calc(100%-2rem)] h-[min(765px,92vh)] p-0 overflow-hidden flex flex-col gap-0 rounded-2xl bg-[#F7F8F3]"
        >
          {/* Top Modal Header with Integrated Step Switcher */}
          <div className="px-5 sm:px-6 py-4 bg-white border-b border-border flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl gradient-emerald-gold text-white shadow-sm flex items-center justify-center flex-shrink-0">
                {isEditing ? (
                  <GraduationCap className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-base sm:text-lg font-extrabold text-foreground">
                    {isEditing ? 'Edit Scholar Record' : 'Add New Scholar'}
                  </DialogTitle>
                  {isEditing ? (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F4EA] text-foreground/80 border border-border">
                      {formData.scholarStatus || 'Active'}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-brand/10 text-brand border border-brand/20">
                      New Beneficiary
                    </span>
                  )}
                </div>
                <DialogDescription className="text-xs text-muted-foreground truncate">
                  IskoLayan · Palayan City Scholarship Management System
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              {/* Step Pill Switcher */}
              <div className="bg-[#F2F4EA] p-1 rounded-xl border border-border inline-flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => goToStep(1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
                    activeStep === 1
                      ? 'bg-white text-foreground shadow-sm border border-border/70'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-brand" />
                  <span>1. Scholar Information</span>
                  {step1Complete && activeStep !== 1 && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => goToStep(2)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 inline-flex items-center gap-1.5 ${
                    activeStep === 2
                      ? 'bg-white text-foreground shadow-sm border border-border/70'
                      : step2Unlocked
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/70 hover:text-foreground'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-brand" />
                  <span>2. Academic &amp; Grades</span>
                  {sortedGrades.length > 0 ? (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-brand/15 text-brand">
                      {sortedGrades.length}
                    </span>
                  ) : !step2Unlocked ? (
                    <Lock className="w-3 h-3 opacity-60" />
                  ) : null}
                </button>
              </div>

              <DialogClose asChild>
                <button
                  type="button"
                  aria-label="Close modal"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-[#F2F4EA] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </DialogClose>
            </div>
          </div>

          {/* Form Body */}
          <form
            id="scholar-modal-form"
            onSubmit={handleSubmit}
            onKeyDown={handleKeyDown}
            className="flex-1 overflow-y-auto px-5 sm:px-6 py-5"
          >
            <div
              key={activeStep}
              className={`min-h-full flex flex-col ${
                stepDirection === 'forward'
                  ? 'animate-module-forward'
                  : stepDirection === 'backward'
                  ? 'animate-module-backward'
                  : ''
              }`}
            >
              {activeStep === 1 ? (
                <div className="space-y-4">
                  {/* Card 1: Personal Information */}
                  <div className="rounded-xl bg-white border border-border p-4 sm:p-5 space-y-4 shadow-[0_1px_2px_rgba(26,26,20,0.03)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-brand" />
                        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/85">
                          Personal Information
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F2F4EA] text-muted-foreground border border-border">
                        Required Fields
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-4 space-y-1.5">
                        <Label
                          htmlFor="firstName"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          autoFocus
                          placeholder="e.g. Juan"
                        />
                      </div>

                      <div className="lg:col-span-4 space-y-1.5">
                        <Label
                          htmlFor="lastName"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Dela Cruz"
                        />
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label
                          htmlFor="middleName"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Middle Name
                        </Label>
                        <Input
                          id="middleName"
                          name="middleName"
                          value={formData.middleName}
                          onChange={handleChange}
                          placeholder="Optional"
                        />
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Suffix
                        </Label>
                        <Select
                          value={formData.suffix || 'None'}
                          onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, suffix: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Suffix" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUFFIXES.map((suffix) => (
                              <SelectItem key={suffix} value={suffix}>
                                {suffix}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 items-end">
                      <div className="lg:col-span-4 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Gender <span className="text-red-500">*</span>
                        </Label>
                        <div className="flex items-center gap-2">
                          <SegmentedOption
                            active={formData.gender === 'Male'}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, gender: 'Male' }))
                            }
                          >
                            Male (M)
                          </SegmentedOption>
                          <SegmentedOption
                            active={formData.gender === 'Female'}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, gender: 'Female' }))
                            }
                          >
                            Female (F)
                          </SegmentedOption>
                        </div>
                      </div>

                      <div className="lg:col-span-4 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Barangay <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.barangay}
                          onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, barangay: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Barangay" />
                          </SelectTrigger>
                          <SelectContent>
                            {BARANGAYS.map((brgy) => (
                              <SelectItem key={brgy} value={brgy}>
                                {brgy}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          PWD
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <SegmentedOption
                            active={!formData.is_pwd}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, is_pwd: false }))
                            }
                          >
                            No
                          </SegmentedOption>
                          <SegmentedOption
                            active={Boolean(formData.is_pwd)}
                            onClick={() =>
                              setFormData((prev) => ({ ...prev, is_pwd: true }))
                            }
                          >
                            Yes
                          </SegmentedOption>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Solo Parent
                        </Label>
                        <div className="flex items-center gap-1.5">
                          <SegmentedOption
                            active={!formData.is_solo_parent}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                is_solo_parent: false,
                              }))
                            }
                          >
                            No
                          </SegmentedOption>
                          <SegmentedOption
                            active={Boolean(formData.is_solo_parent)}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                is_solo_parent: true,
                              }))
                            }
                          >
                            Yes
                          </SegmentedOption>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Academic Placement & Scholarship */}
                  <div className="rounded-xl bg-white border border-border p-4 sm:p-5 space-y-4 shadow-[0_1px_2px_rgba(26,26,20,0.03)]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <School className="w-4 h-4 text-brand" />
                        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/85">
                          Academic Placement &amp; Scholarship
                        </h3>
                      </div>
                      <span className="text-[11px] font-semibold text-brand">
                        {isEditing
                          ? `Payment: ${formData.status || 'Processing'}`
                          : 'Defaults: Active · Processing'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4">
                      <div className="lg:col-span-5 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            School / University <span className="text-red-500">*</span>
                          </Label>
                          {existingSchools.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                setUseSchoolSelectOnly((prev) => !prev)
                              }
                              className="text-[11px] font-medium text-brand hover:underline"
                            >
                              {useSchoolSelectOnly
                                ? 'Type custom'
                                : 'Choose from list'}
                            </button>
                          )}
                        </div>

                        {useSchoolSelectOnly && existingSchools.length > 0 ? (
                          <Select
                            value={
                              existingSchools.includes(formData.school)
                                ? formData.school
                                : ''
                            }
                            onValueChange={(val) =>
                              setFormData((prev) => ({ ...prev, school: val }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select partner school..." />
                            </SelectTrigger>
                            <SelectContent>
                              {existingSchools.map((school) => (
                                <SelectItem key={school} value={school}>
                                  {school}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <SchoolAutocomplete
                            value={formData.school}
                            onChange={(val) =>
                              setFormData((prev) => ({ ...prev, school: val }))
                            }
                            onSelect={(school) =>
                              setFormData((prev) => ({ ...prev, school }))
                            }
                            existingSchools={existingSchools}
                            isEditMode={isEditing}
                            placeholder={
                              isEditing
                                ? 'Select from existing schools...'
                                : 'Type school or pick from existing...'
                            }
                          />
                        )}
                      </div>

                      <div className="lg:col-span-3 space-y-1.5">
                        <Label
                          htmlFor="course"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Course / Program
                        </Label>
                        <Input
                          id="course"
                          name="course"
                          value={formData.course}
                          onChange={handleChange}
                          placeholder="e.g., BS Nursing"
                        />
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Year Level <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.yearLevel}
                          onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, yearLevel: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Year Level" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEAR_LEVELS.map((level) => (
                              <SelectItem key={level} value={level}>
                                {level}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="lg:col-span-2 space-y-1.5">
                        <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                          Semester <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.semester}
                          onValueChange={(val) =>
                            setFormData((prev) => ({ ...prev, semester: val }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Semester" />
                          </SelectTrigger>
                          <SelectContent>
                            {SEMESTERS.map((sem) => (
                              <SelectItem key={sem} value={sem}>
                                {sem}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                      <div className="lg:col-span-4 space-y-1.5">
                        <Label
                          htmlFor="scholarshipAmount"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Scholarship Amount (PHP) <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-xs font-bold text-brand">
                            ₱
                          </span>
                          <Input
                            id="scholarshipAmount"
                            type="text"
                            value={scholarshipAmountDisplay}
                            onChange={handleScholarshipAmountChange}
                            required
                            placeholder="25,000"
                            className={`pl-7 font-semibold ${
                              scholarshipAmountError
                                ? 'border-red-500 focus-visible:ring-red-400'
                                : ''
                            }`}
                          />
                        </div>
                        {scholarshipAmountError && (
                          <p className="text-[11px] font-medium text-red-600">
                            {scholarshipAmountError}
                          </p>
                        )}
                      </div>

                      {isEditing ? (
                        <>
                          <div className="lg:col-span-4 space-y-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Scholar Status
                            </Label>
                            <div className="flex items-center gap-2">
                              <SegmentedOption
                                active={(formData.scholarStatus || 'Active') === 'Active'}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scholarStatus: 'Active',
                                  }))
                                }
                              >
                                Active
                              </SegmentedOption>
                              <SegmentedOption
                                active={formData.scholarStatus === 'Graduated'}
                                onClick={() =>
                                  setFormData((prev) => ({
                                    ...prev,
                                    scholarStatus: 'Graduated',
                                  }))
                                }
                              >
                                Graduated
                              </SegmentedOption>
                            </div>
                          </div>

                          <div className="lg:col-span-4 space-y-1.5">
                            {formData.scholarStatus === 'Graduated' ? (
                              <>
                                <Label
                                  htmlFor="yearGraduated"
                                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                                >
                                  Year Graduated
                                </Label>
                                <Input
                                  id="yearGraduated"
                                  type="number"
                                  name="yearGraduated"
                                  value={formData.yearGraduated || ''}
                                  onChange={handleChange}
                                  min="2000"
                                  max="2100"
                                  placeholder="e.g., 2026"
                                />
                              </>
                            ) : (
                              <>
                                <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                                  Payment Status
                                </Label>
                                <div className="h-9 px-3 rounded-lg border border-border bg-[#F7F8F3] flex items-center justify-between">
                                  <Badge
                                    variant={
                                      formData.status === 'Paid' ? 'success' : 'warning'
                                    }
                                  >
                                    {formData.status || 'Processing'}
                                  </Badge>
                                  <span className="text-[11px] text-muted-foreground">
                                    Updated in table actions
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="lg:col-span-8 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                            Quick Amounts
                          </span>
                          <div className="flex flex-wrap items-center gap-2 min-h-[36px]">
                            {QUICK_AMOUNTS.map((amt) => {
                              const isSelectedAmt =
                                parseFloat(formData.scholarship_amount) === amt
                              return (
                                <button
                                  key={amt}
                                  type="button"
                                  onClick={() => handleQuickAmountSelect(amt)}
                                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    isSelectedAmt
                                      ? 'bg-brand/15 border-brand text-brand'
                                      : 'bg-[#F4F5EF] border-border text-muted-foreground hover:text-foreground hover:border-brand/40'
                                  }`}
                                >
                                  + ₱{amt.toLocaleString('en-US')}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card 3: Contact Information */}
                  <div className="rounded-xl bg-white border border-border p-4 sm:p-5 space-y-4 shadow-[0_1px_2px_rgba(26,26,20,0.03)]">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-brand" />
                        <h3 className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/85">
                          Contact Information
                        </h3>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-brand-soft/30 text-foreground/80 border border-brand-soft/50">
                        Optional Details
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="contactNumber"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Contact Number
                        </Label>
                        <Input
                          id="contactNumber"
                          type="tel"
                          name="contactNumber"
                          value={formData.contactNumber}
                          onChange={handleChange}
                          placeholder="09XX XXX XXXX"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label
                          htmlFor="email"
                          className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                        >
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="scholar@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1">
                  {/* Step 2 Left Panel: Add Grade Entry + Summary */}
                  <div className="lg:col-span-5 flex flex-col justify-between gap-4">
                    <div className="rounded-xl bg-white border border-border overflow-hidden shadow-[0_1px_2px_rgba(26,26,20,0.03)]">
                      <div className="px-4 py-3 bg-[#F2F4EA] border-b border-border flex items-center justify-between gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-foreground/80">
                          Add Grade Entry
                        </span>
                        <span className="text-[11px] font-semibold text-brand">
                          1.00–5.00 or 50–100
                        </span>
                      </div>

                      <div className="p-4 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <Label
                              htmlFor="newGradeSY"
                              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              School Year <span className="text-red-500">*</span>
                            </Label>
                          </div>
                          <Input
                            id="newGradeSY"
                            type="text"
                            value={newGrade.schoolYear}
                            onChange={(e) =>
                              setNewGrade((prev) => ({
                                ...prev,
                                schoolYear: e.target.value,
                              }))
                            }
                            placeholder="2026-2027"
                          />
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {QUICK_SCHOOL_YEARS.map((sy) => (
                              <button
                                key={sy}
                                type="button"
                                onClick={() =>
                                  setNewGrade((prev) => ({ ...prev, schoolYear: sy }))
                                }
                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border transition-colors ${
                                  newGrade.schoolYear === sy
                                    ? 'bg-brand/15 border-brand text-brand font-semibold'
                                    : 'bg-[#F7F8F3] border-border text-muted-foreground hover:text-foreground'
                                }`}
                              >
                                {sy}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                              Semester
                            </Label>
                            <div className="h-9 px-3 rounded-lg border border-border bg-[#F7F8F3] flex items-center text-sm font-medium text-foreground/85">
                              {formData.semester
                                ? getSemesterGradeLabel(formData.semester)
                                : 'Not selected'}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label
                              htmlFor="newGradeGwa"
                              className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground"
                            >
                              GWA / Grade <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="newGradeGwa"
                              type="number"
                              step="0.01"
                              min={GRADING_CONFIG.MIN_GWA}
                              max={GRADING_CONFIG.MAX_PERCENT}
                              value={newGrade.gwa}
                              onChange={(e) => {
                                setNewGrade((prev) => ({
                                  ...prev,
                                  gwa: e.target.value,
                                }))
                                setGradeError('')
                              }}
                              placeholder="1.75 or 90"
                              autoFocus
                            />
                          </div>
                        </div>

                        {liveDraftGwaValid && (
                          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#F7F8F3] border border-border text-xs">
                            <span className="text-muted-foreground font-medium">
                              Preview Standing:
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                liveDraftGwaWarn
                                  ? 'bg-red-50 border-red-200 text-red-700'
                                  : 'bg-brand/10 border-brand/30 text-brand'
                              }`}
                            >
                              {liveDraftGwaWarn ? 'Needs Attention' : 'Good Standing'}
                            </span>
                          </div>
                        )}

                        {gradeError && (
                          <p className="text-xs font-medium text-red-600 flex items-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{gradeError}</span>
                          </p>
                        )}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleAddGrade}
                          className="w-full border-brand/35 text-brand hover:bg-brand/10 hover:text-brand font-semibold"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Grade to Record</span>
                        </Button>
                      </div>
                    </div>

                    {/* Scholar Summary Mini-Card */}
                    <div className="rounded-xl bg-white border border-border p-4 space-y-2.5 shadow-[0_1px_2px_rgba(26,26,20,0.03)]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold uppercase tracking-wider text-muted-foreground text-[11px]">
                          Scholar Summary
                        </span>
                        <span className="inline-flex items-center gap-1 font-bold text-brand">
                          <Wallet className="w-3.5 h-3.5" />
                          ₱{formatNumberWithCommas(formData.scholarship_amount || 0)}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-foreground truncate">
                        {displayFullName || 'Unnamed Scholar'}
                      </div>
                      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>{formData.school || 'No school set'}</span>
                        <span>·</span>
                        <span>{formData.yearLevel}</span>
                        <span>·</span>
                        <span>Brgy. {formData.barangay}</span>
                      </div>
                    </div>
                  </div>

                  {/* Step 2 Right Panel: Parameter-Style Grade History Table */}
                  <div className="lg:col-span-7 rounded-xl bg-white border border-border overflow-hidden shadow-[0_1px_2px_rgba(26,26,20,0.03)] flex flex-col min-h-full">
                    <div className="px-4 py-3 bg-[#F2F4EA] border-b border-border grid grid-cols-12 items-center text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground flex-shrink-0">
                      <div className="col-span-5">School Year &amp; Term</div>
                      <div className="col-span-3 text-center">Grade / GWA</div>
                      <div className="col-span-3 text-center">Standing</div>
                      <div className="col-span-1 text-right">Action</div>
                    </div>

                    {gradesError && (
                      <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 flex-shrink-0">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span>{gradesError}</span>
                      </div>
                    )}

                    {sortedGrades.length === 0 ? (
                      <div className="p-8 text-center space-y-2 flex-1 flex flex-col items-center justify-center">
                        <BookOpen className="w-9 h-9 mx-auto text-brand/40" />
                        <p className="text-sm font-semibold text-foreground">
                          No grade entries added yet
                        </p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                          Enter the school year and GWA on the left and click{' '}
                          <strong>Add Grade to Record</strong>, or fill in the left form and save directly.
                        </p>
                      </div>
                    ) : (
                      <div className="divide-y divide-border/70 flex-1 overflow-y-auto">
                        {sortedGrades.map((grade, index) => {
                          const isLastGrade = isEditing && (formData.grades || []).length === 1
                          const warn = isGWAWarning(grade.gwa)
                          return (
                            <div
                              key={`${grade.schoolYear}-${grade.semester}-${index}`}
                              className="px-4 py-3 grid grid-cols-12 items-center even:bg-[#F7F8F3] hover:bg-[#F9F6DF]/70 transition-colors"
                            >
                              <div className="col-span-5 min-w-0 pr-2">
                                <p className="text-sm font-bold text-foreground truncate">
                                  {grade.schoolYear}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {grade.semester}
                                </p>
                              </div>

                              <div className="col-span-3 flex justify-center">
                                <span
                                  className={`min-w-[76px] px-3 py-1 rounded-full border text-center text-sm font-extrabold tabular-nums ${
                                    warn
                                      ? 'border-red-300 bg-red-50 text-red-700'
                                      : 'border-brand/40 bg-brand/10 text-brand'
                                  }`}
                                >
                                  {formatGWA(grade.gwa)}
                                </span>
                              </div>

                              <div className="col-span-3 flex justify-center">
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wide ${
                                    warn
                                      ? 'border-red-200 bg-red-50 text-red-700'
                                      : 'border-brand/30 bg-white text-brand'
                                  }`}
                                >
                                  {warn ? 'Warning' : 'Good'}
                                </span>
                              </div>

                              <div className="col-span-1 flex justify-end">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={isLastGrade}
                                  onClick={() => handleRemoveGrade(grade)}
                                  title={
                                    isLastGrade
                                      ? 'At least one grade entry is required'
                                      : 'Remove grade entry'
                                  }
                                  className="h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 disabled:opacity-35"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </form>

          {/* Sticky Bottom Footer */}
          <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-border flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>

              {isEditing && formData.scholarStatus !== 'Graduated' && (
                <Button
                  type="button"
                  variant="gold"
                  size="sm"
                  onClick={() => setShowGraduateModal(true)}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Mark Graduated</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {activeStep === 1 ? (
                <>
                  {isEditing && (
                    <Button
                      type="submit"
                      form="scholar-modal-form"
                      variant="outline"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Update Record'}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="gradient"
                    onClick={() => goToStep(2)}
                  >
                    <span>Next: Academic &amp; Grades</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => goToStep(1)}
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Scholar Info</span>
                  </Button>
                  <Button
                    type="submit"
                    form="scholar-modal-form"
                    variant="gradient"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Record'
                      : 'Add Scholar'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showGraduateModal && (
        <GraduateConfirmModal
          scholar={scholar}
          onConfirm={handleGraduateConfirm}
          onCancel={() => setShowGraduateModal(false)}
        />
      )}
    </>
  )
}

export default ScholarModal
