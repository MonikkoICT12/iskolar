/**
 * Data Service Module
 * 
 * Centralizes all data reading/writing operations.
 * Current implementation uses scholarStore (LocalStorage via Zustand).
 * Future: easily swap to database without changing components.
 */

import useScholarStore from '../store/scholarStore'

// Get the store instance
const getStore = () => useScholarStore.getState()

export const dataService = {
  // Scholars
  getScholars: () => {
    return getStore().getScholarsBySchoolYear()
  },

  getActiveScholars: () => {
    return getStore().getActiveScholars()
  },

  getGraduatedScholars: () => {
    return getStore().getGraduatedScholars()
  },

  // Schools
  getSchools: () => {
    return getStore().getSchoolsList()
  },

  getGraduatedSchools: () => {
    return getStore().getGraduatedSchoolsList()
  },

  getScholarsBySchool: (school) => {
    return getStore().getScholarsBySchool(school)
  },

  getGraduatedScholarsBySchool: (school) => {
    return getStore().getGraduatedScholarsBySchool(school)
  },

  // Statistics
  getStatistics: () => {
    const store = getStore()
    const allScholars = store.getScholarsBySchoolYear()
    const activeScholars = store.getActiveScholars()
    const graduatedScholars = store.getGraduatedScholars()
    const schools = store.getSchoolsList()
    
    // Calculate statistics
    const totalScholars = allScholars.length
    const totalActive = activeScholars.length
    const totalGraduated = graduatedScholars.length
    const totalSchools = schools.length
    
    const paidCount = activeScholars.filter(s => s.status === 'Paid').length
    const unpaidCount = activeScholars.filter(s => s.status === 'Processing').length
    
    // Scholars per school
    const schoolStats = schools.map(school => {
      const count = store.getScholarsBySchool(school).length
      return { school, count }
    }).sort((a, b) => b.count - a.count)
    
    // Scholars per year level
    const yearLevels = ['1st Year', '2nd Year', '3rd Year', '4th Year']
    const yearLevelStats = yearLevels.map(level => {
      const count = activeScholars.filter(s => s.yearLevel === level).length
      return { yearLevel: level, count }
    })
    
    return {
      totalScholars,
      totalActive,
      totalGraduated,
      totalSchools,
      paidCount,
      unpaidCount,
      schoolStats,
      yearLevelStats,
    }
  },

  // Year levels
  getYearLevels: () => {
    return ['1st Year', '2nd Year', '3rd Year', '4th Year']
  },

  getScholarsByYearLevel: (yearLevel) => {
    return getStore().getScholarsByYearLevel(yearLevel)
  },

  // Graduation years
  getGraduationYears: () => {
    return getStore().getGraduationYears()
  },
}

export default dataService
