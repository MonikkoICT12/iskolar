/**
 * Data Service Module
 * 
 * Centralizes all data reading/writing operations.
 * Two modes of operation:
 * 1. PUBLIC DATA: Uses Supabase RPC functions for landing page (aggregate data only)
 * 2. ADMIN DATA: Direct access to scholarStore for authenticated admin routes
 */

import { supabase } from '../lib/supabase'
import useScholarStore from '../store/scholarStore'

// Get the store instance
const getStore = () => useScholarStore.getState()

export const dataService = {
  // PUBLIC DATA - for landing page (aggregate only, no personal info)
  
  /**
   * Get public dashboard statistics (aggregate data)
   * Calls Supabase RPC: public_dashboard_stats
   * Returns: total_scholars, active_scholars, graduated_scholars, total_schools,
   *          scholars_per_school, scholars_per_year_level, paid_count, unpaid_count
   * Fallback: Returns friendly message if RPC not available
   */
  getPublicDashboardStats: async () => {
    try {
      const { data, error } = await supabase.rpc('public_dashboard_stats')
      
      if (error) {
        console.warn('Public dashboard RPC not available:', error.message)
        return {
          available: false,
          message: 'Data is not available yet',
        }
      }
      
      return {
        available: true,
        ...data,
      }
    } catch (err) {
      console.warn('Error calling public dashboard RPC:', err)
      return {
        available: false,
        message: 'Data is not available yet',
      }
    }
  },

  /**
   * Get public graduates by school (aggregate data)
   * Calls Supabase RPC: public_graduates_by_school
   * Returns: array of {school_name, graduate_count, total_scholarship_amount}
   * Fallback: Returns friendly message if RPC not available
   */
  getPublicGraduatesBySchool: async () => {
    try {
      const { data, error } = await supabase.rpc('public_graduates_by_school')
      
      if (error) {
        console.warn('Public graduates RPC not available:', error.message)
        return {
          available: false,
          message: 'Data is not available yet',
          schools: [],
        }
      }
      
      return {
        available: true,
        schools: data || [],
      }
    } catch (err) {
      console.warn('Error calling public graduates RPC:', err)
      return {
        available: false,
        message: 'Data is not available yet',
        schools: [],
      }
    }
  },

  // ADMIN DATA - for authenticated routes (full scholar access)
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
