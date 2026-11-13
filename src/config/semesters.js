/**
 * Semesters Configuration
 * 
 * Single source of truth for semester values across the system.
 * Maps short form (used in academic info) to full form (used in grades).
 */

export const SEMESTER_OPTIONS = [
  { value: '1st Sem', label: '1st Sem', gradeLabel: '1st Semester' },
  { value: '2nd Sem', label: '2nd Sem', gradeLabel: '2nd Semester' },
  { value: '3rd Sem', label: '3rd Sem', gradeLabel: '3rd Semester' },
  { value: 'Summer', label: 'Summer', gradeLabel: 'Summer' }
]

/**
 * Get grade label from semester value
 * @param {string} semester - Semester value (e.g., "1st Sem")
 * @returns {string} Grade label (e.g., "1st Semester")
 */
export function getSemesterGradeLabel(semester) {
  const option = SEMESTER_OPTIONS.find(opt => opt.value === semester)
  return option ? option.gradeLabel : semester
}

/**
 * Get semester value from grade label
 * @param {string} gradeLabel - Grade label (e.g., "1st Semester")
 * @returns {string} Semester value (e.g., "1st Sem")
 */
export function getSemesterFromGradeLabel(gradeLabel) {
  const option = SEMESTER_OPTIONS.find(opt => opt.gradeLabel === gradeLabel)
  return option ? option.value : gradeLabel
}

export default SEMESTER_OPTIONS
