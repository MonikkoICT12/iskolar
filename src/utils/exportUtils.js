/**
 * Export Utilities
 * 
 * Functions for exporting scholar data to CSV and Excel formats.
 * NO internal IDs are exported - only user-facing data.
 */

import * as XLSX from 'xlsx'

/**
 * Get latest GWA from grades array
 * @param {Array} grades - Array of grade entries
 * @returns {string} Latest GWA or empty string
 */
function getLatestGWA(grades) {
  if (!grades || grades.length === 0) return ''
  
  // Sort by school year (desc) then semester
  const sorted = [...grades].sort((a, b) => {
    if (a.schoolYear !== b.schoolYear) {
      return b.schoolYear.localeCompare(a.schoolYear)
    }
    return b.createdAt?.localeCompare(a.createdAt || '') || 0
  })
  
  return sorted[0]?.gwa || ''
}

/**
 * Convert scholar object to export row
 * @param {object} scholar - Scholar object
 * @returns {object} Row object with export columns
 */
function scholarToRow(scholar) {
  return {
    'Last Name': scholar.lastName || '',
    'First Name': scholar.firstName || '',
    'Middle Name': scholar.middleName || '',
    'Suffix': (scholar.suffix && scholar.suffix !== 'None') ? scholar.suffix : '',
    'Gender': scholar.gender || 'Male',
    'Barangay': scholar.barangay || '',
    'School / University': scholar.school || '',
    'Course': scholar.course || '',
    'Year Level': scholar.yearLevel || '',
    'Semester': scholar.semester || '',
    'PWD': scholar.is_pwd ? 'Yes' : 'No',
    'Solo Parent': scholar.is_solo_parent ? 'Yes' : 'No',
    'Scholarship Amount': scholar.scholarship_amount || scholar.amount || 0,
    'Latest GWA': getLatestGWA(scholar.grades),
    'Payment Status': scholar.status || 'Processing',
    'Status': scholar.scholarStatus || 'Active',
    'Year Graduated': scholar.yearGraduated || ''
  }
}

/**
 * Export scholars to CSV format
 * UTF-8 with BOM, comma-separated, proper quoting for Excel compatibility
 * 
 * @param {Array} scholars - Array of scholar objects
 * @returns {Blob} CSV file blob
 */
export function exportToCSV(scholars) {
  // Convert scholars to rows
  const rows = scholars.map(scholarToRow)
  
  if (rows.length === 0) {
    throw new Error('No data to export')
  }
  
  // Get headers from first row
  const headers = Object.keys(rows[0])
  
  // Helper to escape CSV values
  const escapeCSV = (value) => {
    const str = String(value)
    // Quote if contains comma, newline, or quote
    if (str.includes(',') || str.includes('\n') || str.includes('"')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }
  
  // Build CSV string
  const headerRow = headers.map(escapeCSV).join(',')
  const dataRows = rows.map(row => 
    headers.map(header => escapeCSV(row[header])).join(',')
  ).join('\n')
  
  const csvContent = `${headerRow}\n${dataRows}`
  
  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  
  return blob
}

/**
 * Export scholars to Excel (.xlsx) format
 * 
 * @param {Array} scholars - Array of scholar objects
 * @returns {Blob} Excel file blob
 */
export function exportToExcel(scholars) {
  // Convert scholars to rows
  const rows = scholars.map(scholarToRow)
  
  if (rows.length === 0) {
    throw new Error('No data to export')
  }
  
  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(rows)
  
  // Set column widths
  const columnWidths = [
    { wch: 15 }, // Last Name
    { wch: 15 }, // First Name
    { wch: 15 }, // Middle Name
    { wch: 8 },  // Suffix
    { wch: 10 }, // Gender
    { wch: 18 }, // Barangay
    { wch: 40 }, // School / University
    { wch: 30 }, // Course
    { wch: 12 }, // Year Level
    { wch: 15 }, // Semester
    { wch: 8 },  // PWD
    { wch: 12 }, // Solo Parent
    { wch: 18 }, // Scholarship Amount
    { wch: 12 }, // Latest GWA
    { wch: 16 }, // Payment Status
    { wch: 12 }, // Status
    { wch: 14 }, // Year Graduated
  ]
  worksheet['!cols'] = columnWidths
  
  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scholars')
  
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  })
  
  return blob
}

/**
 * Generate a blank import template with headers and one example row
 * 
 * @param {string} format - 'csv' or 'excel'
 * @returns {Blob} Template file blob
 */
export function generateTemplate(format = 'excel') {
  const exampleRow = {
    'Last Name': 'Dela Cruz',
    'First Name': 'Juan',
    'Middle Name': 'Santos',
    'Suffix': '',
    'Gender': 'Male',
    'Barangay': 'Atate',
    'School / University': 'Nueva Ecija University of Science and Technology',
    'Course': 'BS Computer Science',
    'Year Level': '2nd Year',
    'Semester': '1st Semester',
    'PWD': 'No',
    'Solo Parent': 'No',
    'Scholarship Amount': 25000,
    'Latest GWA': '',
    'Payment Status': 'Processing',
    'Status': 'Active',
    'Year Graduated': '',
    'School Year': '2026-2027',
    'GWA': '1.75'
  }
  
  if (format === 'csv') {
    // Generate CSV template
    const headers = Object.keys(exampleRow)
    const escapeCSV = (value) => {
      const str = String(value)
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }
    
    const headerRow = headers.map(escapeCSV).join(',')
    const dataRow = headers.map(header => escapeCSV(exampleRow[header])).join(',')
    const csvContent = `${headerRow}\n${dataRow}`
    
    const BOM = '\uFEFF'
    return new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  } else {
    // Generate Excel template
    const worksheet = XLSX.utils.json_to_sheet([exampleRow])
    
    const columnWidths = [
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 8 },  // Last, First, Middle, Suffix
      { wch: 10 }, { wch: 18 }, { wch: 40 }, { wch: 30 }, // Gender, Barangay, School, Course
      { wch: 12 }, { wch: 15 }, { wch: 8 }, { wch: 12 },  // Year Level, Semester, PWD, Solo Parent
      { wch: 18 }, { wch: 12 }, { wch: 16 }, { wch: 12 }, // Scholarship, GWA, Payment, Status
      { wch: 14 }, { wch: 15 }, { wch: 8 }                // Year Graduated, School Year, GWA
    ]
    worksheet['!cols'] = columnWidths
    
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template')
    
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })
    return new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
  }
}

/**
 * Download a blob as a file
 * @param {Blob} blob - File blob
 * @param {string} filename - Desired filename
 */
export function downloadFile(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
