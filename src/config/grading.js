/**
 * Grading System Configuration
 * 
 * Configurable grading scale and validation rules.
 * Supports both GWA scale (1.00 - 5.00) and percentage scale (50 - 100).
 */

export const GRADING_CONFIG = {
  // GWA Scale (1.00 = Highest, 5.00 = Lowest)
  MIN_GWA: 1.00,
  MAX_GWA: 5.00,

  // Percentage Scale (50.00 - 100.00)
  MIN_PERCENT: 50.00,
  MAX_PERCENT: 100.00,
  
  // Passing and Warning Thresholds
  GWA_PASSING: 3.00,
  GWA_WARNING: 2.50, // Show warning when GWA is worse than this
  PERCENT_PASSING: 75.00,
  PERCENT_WARNING: 80.00, // Show warning when percentage grade is below this
  
  // Display Settings
  DECIMALS: 2
}

/**
 * Validate GWA or percentage grade value
 * @param {number|string} gwa - The grade value to validate
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateGWA(gwa) {
  const numGWA = parseFloat(gwa)
  
  if (isNaN(numGWA)) {
    return { valid: false, error: 'Grade must be a number' }
  }

  const isValidGWA = numGWA >= GRADING_CONFIG.MIN_GWA && numGWA <= GRADING_CONFIG.MAX_GWA
  const isValidPercent = numGWA >= GRADING_CONFIG.MIN_PERCENT && numGWA <= GRADING_CONFIG.MAX_PERCENT
  
  if (!isValidGWA && !isValidPercent) {
    return { 
      valid: false, 
      error: `Grade must be a GWA (${GRADING_CONFIG.MIN_GWA.toFixed(2)}–${GRADING_CONFIG.MAX_GWA.toFixed(2)}) or percentage (${GRADING_CONFIG.MIN_PERCENT}–${GRADING_CONFIG.MAX_PERCENT})` 
    }
  }
  
  return { valid: true, error: null }
}

/**
 * Format GWA or percentage grade for display
 * @param {number|string} gwa - The grade value
 * @returns {string} Formatted grade string
 */
export function formatGWA(gwa) {
  const numGWA = parseFloat(gwa)
  if (isNaN(numGWA)) return ''
  return numGWA.toFixed(GRADING_CONFIG.DECIMALS)
}

/**
 * Check if grade triggers warning threshold
 * @param {number|string} gwa - The grade value
 * @returns {boolean} True if grade needs warning
 */
export function isGWAWarning(gwa) {
  const numGWA = parseFloat(gwa)
  if (isNaN(numGWA)) return false
  if (numGWA <= GRADING_CONFIG.MAX_GWA) {
    return numGWA > GRADING_CONFIG.GWA_WARNING
  }
  if (numGWA >= GRADING_CONFIG.MIN_PERCENT) {
    return numGWA < GRADING_CONFIG.PERCENT_WARNING
  }
  return false
}

export default GRADING_CONFIG
