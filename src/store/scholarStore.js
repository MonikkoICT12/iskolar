import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const BARANGAYS = [
  'Atate', 'Caballero', 'Caimito', 'Ganaderia', 'Langka', 
  'Mapangpang', 'Marcos Village', 'Malabo', 'Popolon', 
  'Singalat', 'Poblacion', 'Other'
]

const YEAR_LEVELS = [
  '1st Year', '2nd Year', '3rd Year', '4th Year'
]

const SEMESTERS = [
  '1st Sem', '2nd Sem'
]

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
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          schoolYear: get().currentSchoolYear,
          status: scholar.status || 'Processing', // Default status
        }
        set((state) => ({
          scholars: [...state.scholars, newScholar],
        }))
        get().showToast('Scholar added successfully!', 'success')
      },

      updateScholar: (id, updates) => {
        set((state) => ({
          scholars: state.scholars.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }))
        get().showToast('Scholar updated successfully!', 'success')
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

      // Statistics
      getTotalScholars: () => {
        return get().getScholarsBySchoolYear().length
      },

      getTotalAmount: () => {
        return get()
          .getScholarsBySchoolYear()
          .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
      },

      getSchoolsList: () => {
        const scholars = get().getScholarsBySchoolYear()
        const schools = [...new Set(scholars.map((s) => s.school))]
        return schools.sort()
      },

      getScholarsBySchool: (school) => {
        return get()
          .getScholarsBySchoolYear()
          .filter((s) => s.school === school)
      },

      getScholarsByYearLevel: (yearLevel) => {
        return get()
          .getScholarsBySchoolYear()
          .filter((s) => s.yearLevel === yearLevel)
      },

      getYearLevelStats: () => {
        const scholars = get().getScholarsBySchoolYear()
        const stats = {}
        
        YEAR_LEVELS.forEach((level) => {
          const count = scholars.filter((s) => s.yearLevel === level).length
          const amount = scholars
            .filter((s) => s.yearLevel === level)
            .reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0)
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
            (sum, s) => sum + (parseFloat(s.amount) || 0),
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

      clearAllData: () => {
        if (
          window.confirm(
            'Are you sure you want to delete ALL scholar records? This cannot be undone!'
          )
        ) {
          set({ scholars: [] })
          get().showToast('All data cleared!', 'warning')
        }
      },
    }),
    {
      name: 'iskolar-storage',
    }
  )
)

export { BARANGAYS, YEAR_LEVELS, SEMESTERS }
export default useScholarStore
