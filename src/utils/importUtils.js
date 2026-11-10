/**
 * Import Utilities
 * 
 * Functions for importing scholar data from CSV and Excel files.
 * Handles column detection, data validation, and duplicate detection.
 */

import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { YEAR_LEVELS } from '../config/yearLevels'
import { validateGWA } from '../config/grading'

/**
 * Column name mappings (case-insensitive, trimmed)
 */
const COLUMN_MAPPINGS = {
  lastName: ['last name', 'lastname', 'surname', 'family name'],
  firstName: ['first name', 'firstname', 'given name'],
  middleName: ['middle name', 'middlename', 'middle initial'],
  school: ['school', 'university', 'school / university', 'school/university'],
  course: ['course', 'program', 'degree'],
  yearLevel: ['year level', 'yearlevel', 'year', 'level'],
  is_pwd: ['pwd', 'is pwd', 'is_pwd', 'disability'],
  is_solo_parent: ['solo parent', 'soloparent', 'is solo parent', 'is_solo_parent', 'single parent'],
  scholarship_amount: ['scholarship amount', 'amount', 'scholarship', 'scholarship_amount'],
  status: ['payment status', 'status', 'payment'],
  scholarStatus: ['scholar status', 'scholarstatus', 'active/graduated'],
  yearGraduated: ['year graduated', 'yeargraduated', 'graduation year'],
  schoolYear: ['school year', 'schoolyear', 'sy'],
  semester: ['semester', 'sem'],
  gwa: ['gwa', 'grade', 'general weighted average']
}

/**
 * Find column index by name (case-insensitive)
 * @param {Array} headers - Array of header strings
 * @param {string} field - Field name to find
 * @returns {number} Column index or -1 if not found
 */
function findColumnIndex(headers, field) {
  const mappings = COLUMN_MAPPINGS[field] || [field]
  
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase().trim()
    if (mappings.some(mapping => header === mapping.toLowerCase())) {
      return i
    }
  }
  
  return -1
}

/**
 * Parse boolean value from string
 * @param {string} value - String value
 * @returns {boolean}
 */
function parseBoolean(value) {
  if (!value) return false
  const str = String(value).toLowerCase().trim()
  return ['yes', 'y', 'true', '1'].includes(str)
}

/**
 * Parse year level from string
 * @param {string} value - String value
 * @returns {string} Normalized year level or empty string
 */
function parseYearLevel(value) {
  if (!value) return ''
  const str = String(value).toLowerCase().trim()
  
  // Match patterns like "1", "1st", "1st year", "first", etc.
  const yearMap = {
    '1': '1st Year',
    '1st': '1st Year',
    '1st year': '1st Year',
    'first': '1st Year',
    'first year': '1st Year',
    '2': '2nd Year',
    '2nd': '2nd Year',
    '2nd year': '2nd Year',
    'second': '2nd Year',
    'second year': '2nd Year',
    '3': '3rd Year',
    '3rd': '3rd Year',
    '3rd year': '3rd Year',
    'third': '3rd Year',
    'third year': '3rd Year',
    '4': '4th Year',
    '4th': '4th Year',
    '4th year': '4th Year',
    'fourth': '4th Year',
    'fourth year': '4th Year',
    '5': '5th Year',
    '5th': '5th Year',
    '5th year': '5th Year',
    'fifth': '5th Year',
    'fifth year': '5th Year',
    '6': '6th Year',
    '6th': '6th Year',
    '6th year': '6th Year',
    'sixth': '6th Year',
    'sixth year': '6th Year',
  }
  
  return yearMap[str] || ''
}

/**
 * Validate and parse a single row of scholar data
 * @param {Array} row - Raw row data
 * @param {Array} headers - Column headers
 * @param {number} rowIndex - Row number (for error messages)
 * @returns {object} { valid: boolean, data: object, errors: Array }
 */
function parseScholarRow(row, headers, rowIndex) {
  const errors = []
  
  // Find column indices
  const indices = {}
  Object.keys(COLUMN_MAPPINGS).forEach(field => {
    indices[field] = findColumnIndex(headers, field)
  })
  
  // Extract values
  const getValue = (field) => {
    const idx = indices[field]
    return idx >= 0 ? String(row[idx] || '').trim() : ''
  }
  
  const data = {
    firstName: getValue('firstName'),
    lastName: getValue('lastName'),
    middleName: getValue('middleName'),
    school: getValue('school'),
    course: getValue('course'),
    yearLevel: parseYearLevel(getValue('yearLevel')),
    is_pwd: parseBoolean(getValue('is_pwd')),
    is_solo_parent: parseBoolean(getValue('is_solo_parent')),
    scholarship_amount: parseFloat(getValue('scholarship_amount')) || 0,
    status: getValue('status') || 'Processing',
    scholarStatus: getValue('scholarStatus') || 'Active',
    yearGraduated: getValue('yearGraduated'),
    grades: []
  }
  
  // Validate required fields
  if (!data.firstName) errors.push('First Name is required')
  if (!data.lastName) errors.push('Last Name is required')
  if (!data.school) errors.push('School / University is required')
  
  // Validate year level if provided
  if (getValue('yearLevel') && !data.yearLevel) {
    errors.push(`Invalid Year Level: ${getValue('yearLevel')}`)
  }
  
  // Validate scholarship amount
  if (data.scholarship_amount < 0) {
    errors.push('Scholarship Amount must be a positive number')
  }
  
  // Add grade entry if GWA is provided
  const schoolYear = getValue('schoolYear')
  const semester = getValue('semester')
  const gwa = getValue('gwa')
  
  if (schoolYear && semester && gwa) {
    const gwaValidation = validateGWA(gwa)
    if (gwaValidation.valid) {
      data.grades.push({
        schoolYear,
        semester,
        gwa: parseFloat(gwa),
        createdAt: new Date().toISOString()
      })
    } else {
      errors.push(`Invalid GWA: ${gwaValidation.error}`)
    }
  }
  
  return {
    valid: errors.length === 0,
    data,
    errors,
    rowIndex
  }
}

/**
 * Parse CSV file
 * @param {File} file - CSV file
 * @returns {Promise<Array>} Array of parsed rows
 */
export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('CSV file is empty'))
          return
        }
        
        const headers = results.data[0]
        const rows = results.data.slice(1).filter(row => 
          row.some(cell => cell && String(cell).trim())
        )
        
        const parsed = rows.map((row, idx) => 
          parseScholarRow(row, headers, idx + 2) // +2 because of header and 1-indexing
        )
        
        resolve(parsed)
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`))
      }
    })
  })
}

/**
 * Parse Excel file (.xlsx, .xls)
 * @param {File} file - Excel file
 * @returns {Promise<Array>} Array of parsed rows
 */
export function parseExcel(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        
        // Get first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })
        
        if (!jsonData || jsonData.length === 0) {
          reject(new Error('Excel file is empty'))
          return
        }
        
        const headers = jsonData[0]
        const rows = jsonData.slice(1).filter(row => 
          row.some(cell => cell !== null && cell !== undefined && String(cell).trim())
        )
        
        const parsed = rows.map((row, idx) => 
          parseScholarRow(row, headers, idx + 2)
        )
        
        resolve(parsed)
      } catch (error) {
        reject(new Error(`Failed to parse Excel: ${error.message}`))
      }
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Detect duplicate scholars (same full name + school)
 * @param {Array} existingScholars - Array of existing scholars
 * @param {Array} newScholars - Array of new scholar data
 * @returns {Array} Array of objects with duplicate info
 */
export function detectDuplicates(existingScholars, newScholars) {
  const duplicates = []
  
  newScholars.forEach((newScholar, idx) => {
    const fullName = `${newScholar.firstName} ${newScholar.middleName} ${newScholar.lastName}`.toLowerCase().trim()
    const school = newScholar.school.toLowerCase().trim()
    
    const existing = existingScholars.find(s => {
      const existingName = `${s.firstName} ${s.middleName || ''} ${s.lastName}`.toLowerCase().trim()
      const existingSchool = s.school.toLowerCase().trim()
      return existingName === fullName && existingSchool === school
    })
    
    if (existing) {
      duplicates.push({
        newIndex: idx,
        newScholar,
        existing
      })
    }
  })
  
  return duplicates
}

/**
 * Validate file type
 * @param {File} file - File to validate
 * @returns {object} { valid: boolean, error: string, type: string }
 */
export function validateFileType(file) {
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  
  const allowedExtensions = ['.csv', '.xls', '.xlsx']
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
  
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a .csv, .xls, or .xlsx file.',
      type: null
    }
  }
  
  // Determine file type
  let type = 'csv'
  if (fileExtension === '.xls' || fileExtension === '.xlsx') {
    type = 'excel'
  }
  
  return { valid: true, error: null, type }
}

/**
 * Validate file size (max 10MB)
 * @param {File} file - File to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateFileSize(file) {
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 10MB.'
    }
  }
  
  return { valid: true, error: null }
}
