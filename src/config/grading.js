/**
 * Grading System Configuration
 * 
 * Configurable grading scale and validation rules.
 * Easy to switch to percentage scale (1-100) by updating these values.
 */

export const GRADING_CONFIG = {
  // GWA Scale (1.00 = Highest, 5.00 = Lowest)
  MIN_GWA: 1.00,
  MAX_GWA: 5.00,
  
  // Passing and Warning Thresholds
  GWA_PASSING: 3.00,
  GWA_WARNING: 2.50, // Show warning when GWA is worse than this
  
  // Display Settings
  DECIMALS: 2,
  
  // Semester Options
  SEMESTERS: ['1st Semester', '2nd Semester', 'Summer']
}

/**
 * Validate GWA value
 * @param {number} gwa - The GWA value to validate
 * @returns {object} { valid: boolean, error: string }
 */
export function validateGWA(gwa) {
  const numGWA = parseFloat(gwa)
  
  if (isNaN(numGWA)) {
    return { valid: false, error: 'GWA must be a number' }
  }
  
  if (numGWA < GRADING_CONFIG.MIN_GWA || numGWA > GRADING_CONFIG.MAX_GWA) {
    return { 
      valid: false, 
      error: `GWA must be between ${GRADING_CONFIG.MIN_GWA} and ${GRADING_CONFIG.MAX_GWA}` 
    }
  }
  
  return { valid: true, error: null }
}

/**
 * Format GWA for display
 * @param {number} gwa - The GWA value
 * @returns {string} Formatted GWA string
 */
export function formatGWA(gwa) {
  return parseFloat(gwa).toFixed(GRADING_CONFIG.DECIMALS)
}

/**
 * Check if GWA is below warning threshold
 * @param {number} gwa - The GWA value
 * @returns {boolean} True if GWA needs warning
 */
export function isGWAWarning(gwa) {
  return parseFloat(gwa) > GRADING_CONFIG.GWA_WARNING
}

export default GRADING_CONFIG
