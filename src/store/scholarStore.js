import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { BARANGAYS } from '../config/barangays'
import SEMESTER_OPTIONS from '../config/semesters'

const SEMESTERS = SEMESTER_OPTIONS.map(opt => opt.value)

const useScholarStore = create(
  persist(
    (set, get) => ({
      scholars: [],
      currentSchoolYear: '2026-2027',
      toast: null,

      // Scholar CRUD operations
      addScholar: (scholar) => {
        const newScholar = {
          ...scholar,
          id: crypto.randomUUID(), // Generate UUID for internal use
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          schoolYear: get().currentSchoolYear,
          status: scholar.status || 'Processing', // Default status
          scholarStatus: scholar.scholarStatus || 'Active', // Default to Active
          yearGraduated: scholar.yearGraduated || null,
          scholarship_amount: scholar.scholarship_amount || 0, // Default to 0
          is_pwd: scholar.is_pwd || false, // Default to false
          is_solo_parent: scholar.is_solo_parent || false, // Default to false
          grades: scholar.grades || [], // Default to empty array
        }
        set((state) => ({
          scholars: [...state.scholars, newScholar],
        }))
        get().showToast('Scholar added successfully!', 'success')
        return true
      },

      updateScholar: (id, updates) => {
        set((state) => ({
          scholars: state.scholars.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }))
        get().showToast('Scholar updated successfully!', 'success')
        return true
      },

      bulkUpdateScholars: (ids, updates) => {
        set((state) => ({
          scholars: state.scholars.map((s) =>
            ids.includes(s.id) ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
          ),
        }))
        const count = ids.length
        get().showToast(`${count} scholar${count === 1 ? '' : 's'} updated successfully!`, 'success')
      },

      bulkMarkAsGraduated: (ids, yearGraduated = null) => {
        const year = yearGraduated || new Date().getFullYear()
        set((state) => ({
          scholars: state.scholars.map((s) =>
            ids.includes(s.id) 
              ? { ...s, scholarStatus: 'Graduated', yearGraduated: year, updatedAt: new Date().toISOString() } 
              : s
          ),
        }))
        const count = ids.length
        get().showToast(`${count} scholar${count === 1 ? '' : 's'} marked as graduated!`, 'success')
      },

      returnToActive: (id) => {
        set((state) => ({
          scholars: state.scholars.map((s) =>
            s.id === id 
              ? { ...s, scholarStatus: 'Active', yearGraduated: null, updatedAt: new Date().toISOString() } 
              : s
          ),
        }))
        get().showToast('Scholar returned to active status!', 'success')
      },

      deleteScholar: (id) => {
        set((state) => ({
          scholars: state.scholars.filter((s) => s.id !== id),
        }))
        get().showToast('Scholar deleted successfully!', 'warning')
      },

      // Filtering
      getScholarsBySchoolYear: () => {
        const { scholars, currentSchoolYear } = get()
        return scholars.filter((s) => s.schoolYear === currentSchoolYear)
      },

      getActiveScholars: () => {
        const scholars = get().getScholarsBySchoolYear()
        // Treat missing scholarStatus as Active for backward compatibility
        return scholars.filter((s) => !s.scholarStatus || s.scholarStatus === 'Active')
      },

      getGraduatedScholars: () => {
        const scholars = get().getScholarsBySchoolYear()
        return scholars.filter((s) => s.scholarStatus === 'Graduated')
      },

      getGraduatedScholarsBySchool: (school) => {
        return get()
          .getGraduatedScholars()
          .filter((s) => s.school === school)
      },

      getGraduationYears: () => {
        const graduates = get().getGraduatedScholars()
        const years = [...new Set(graduates.map((s) => s.yearGraduated).filter(Boolean))]
        return years.sort((a, b) => b - a) // Most recent first
      },



      // Statistics
      getTotalScholars: () => {
        return get().getScholarsBySchoolYear().length
      },

      getTotalAmount: () => {
        return get()
          .getScholarsBySchoolYear()
          .reduce((sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0), 0)
      },

      getSchoolsList: () => {
        const scholars = get().getActiveScholars() // Only active scholars
        const schools = [...new Set(scholars.map((s) => s.school))]
        return schools.sort()
      },

      getGraduatedSchoolsList: () => {
        const scholars = get().getGraduatedScholars()
        const schools = [...new Set(scholars.map((s) => s.school))]
        return schools.sort()
      },

      getAllSchoolsList: () => {
        const allScholars = get().scholars.filter(s => s.schoolYear === get().currentSchoolYear)
        const schools = [...new Set(allScholars.map((s) => s.school))]
        return schools.sort()
      },

      getScholarsBySchool: (school) => {
        return get()
          .getActiveScholars() // Only active scholars
          .filter((s) => s.school === school)
      },

      getScholarsByYearLevel: (yearLevel) => {
        return get()
          .getScholarsBySchoolYear()
          .filter((s) => s.yearLevel === yearLevel)
      },

      getYearLevelStats: (yearLevels) => {
        const scholars = get().getScholarsBySchoolYear()
        const stats = {}
        
        yearLevels.forEach((level) => {
          const count = scholars.filter((s) => s.yearLevel === level).length
          const amount = scholars
            .filter((s) => s.yearLevel === level)
            .reduce((sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0), 0)
          stats[level] = { count, amount }
        })
        
        return stats
      },

      getSchoolStats: () => {
        const scholars = get().getScholarsBySchoolYear()
        const schools = get().getSchoolsList()
        const total = get().getTotalAmount()
        
        return schools.map((school) => {
          const schoolScholars = scholars.filter((s) => s.school === school)
          const count = schoolScholars.length
          const amount = schoolScholars.reduce(
            (sum, s) => sum + (parseFloat(s.scholarship_amount || s.amount) || 0),
            0
          )
          const percentage = total > 0 ? (amount / total) * 100 : 0
          
          return {
            school,
            count,
            amount,
            percentage,
          }
        })
      },

      // School Management
      addSchool: (schoolName) => {
        const schools = get().getSchoolsList()
        
        // Check for duplicates (case-insensitive)
        if (schools.some(s => s.toLowerCase() === schoolName.toLowerCase())) {
          get().showToast('School already exists', 'error')
          return false
        }
        
        // Add a temporary scholar with this school to register it, then remove
        const tempScholar = {
          id: crypto.randomUUID(),
          name: '__TEMP_SCHOOL_REGISTRATION__',
          school: schoolName,
          yearLevel: '1st Year',
          semester: '1st Sem',
          amount: 0,
          barangay: 'Poblacion',
          paymentStatus: 'Unpaid',
          schoolYear: get().currentSchoolYear,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        
        set((state) => ({
          scholars: [...state.scholars, tempScholar],
        }))
        
        // Remove the temporary scholar immediately
        set((state) => ({
          scholars: state.scholars.filter((s) => s.name !== '__TEMP_SCHOOL_REGISTRATION__'),
        }))
        
        get().showToast(`School "${schoolName}" added successfully!`, 'success')
        return true
      },

      updateSchoolName: (oldName, newName) => {
        // Normalize names for comparison
        const normalizedOld = oldName.trim().replace(/\s+/g, ' ')
        const normalizedNew = newName.trim().replace(/\s+/g, ' ')
        
        if (!normalizedNew) {
          get().showToast('School name cannot be empty', 'error')
          return false
        }

        // Get ALL schools (active + graduated)
        const allSchools = [...new Set(get().scholars.map((s) => s.school))]
        
        // Check for duplicates (case-insensitive), excluding the old name
        if (allSchools.some(s => 
          s.toLowerCase().replace(/\s+/g, ' ') === normalizedNew.toLowerCase() && 
          s.toLowerCase().replace(/\s+/g, ' ') !== normalizedOld.toLowerCase()
        )) {
          get().showToast('This school already exists', 'error')
          return false
        }
        
        // Update ALL scholars (active and graduated) with this school name
        set((state) => ({
          scholars: state.scholars.map((s) =>
            s.school === oldName 
              ? { ...s, school: normalizedNew, updatedAt: new Date().toISOString() } 
              : s
          ),
        }))
        
        get().showToast(`School name updated successfully!`, 'success')
        return true
      },

      deleteSchool: (schoolName) => {
        if (get().validateSchoolInUse(schoolName)) {
          const count = get().getScholarsBySchool(schoolName).length
          get().showToast(
            `Cannot delete: ${count} scholar${count === 1 ? '' : 's'} still using this school`, 
            'error'
          )
          return false
        }
        
        get().showToast(`School "${schoolName}" deleted successfully!`, 'warning')
        return true
      },

      validateSchoolInUse: (schoolName) => {
        return get().getScholarsBySchool(schoolName).length > 0
      },

      // School year management
      setSchoolYear: (year) => {
        set({ currentSchoolYear: year })
      },

      // Toast notifications
      showToast: (message, type = 'info') => {
        set({ toast: { message, type, id: Date.now() } })
        setTimeout(() => {
          set({ toast: null })
        }, 3000)
      },

      // Backup & Export
      exportData: () => {
        const data = {
          scholars: get().scholars,
          exportDate: new Date().toISOString(),
          schoolYear: get().currentSchoolYear,
        }
        return JSON.stringify(data, null, 2)
      },

      importData: (jsonString) => {
        try {
          const data = JSON.parse(jsonString)
          if (data.scholars && Array.isArray(data.scholars)) {
            set({ scholars: data.scholars })
            get().showToast('Data imported successfully!', 'success')
            return true
          }
          throw new Error('Invalid data format')
        } catch (error) {
          get().showToast('Failed to import data. Invalid format.', 'error')
          return false
        }
      },


    }),
    {
      name: 'iskolar-storage',
    }
  )
)

export { BARANGAYS, SEMESTERS }
export default useScholarStore
