/**
 * Storage Cleanup Utility
 * 
 * Handles one-time cleanup of legacy localStorage data.
 * Uses a schema version key to ensure cleanup runs only once.
 */

const SCHEMA_VERSION_KEY = 'scholarship_schema_version'
const CURRENT_VERSION = '2.0.0'
const LEGACY_STORAGE_KEY = 'iskolar-storage'

/**
 * Clean up legacy localStorage data if schema version is old or missing
 */
export const cleanupLegacyStorage = () => {
  try {
    const storedVersion = localStorage.getItem(SCHEMA_VERSION_KEY)
    
    // If version is current, no cleanup needed
    if (storedVersion === CURRENT_VERSION) {
      return {
        cleaned: false,
        message: 'Storage already up to date'
      }
    }
    
    // Check if legacy data exists
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY)
    
    if (legacyData) {
      // Parse to check for hardcoded data
      try {
        const parsed = JSON.parse(legacyData)
        const scholarCount = parsed?.state?.scholars?.length || 0
        
        console.log(`[Storage Cleanup] Found ${scholarCount} scholars in localStorage - clearing all legacy data`)
        
        // Clear the legacy storage key completely (including empty arrays)
        // This ensures the system truly starts at zero
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        
        // Set the new version
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_VERSION)
        
        return {
          cleaned: true,
          scholarCount,
          message: `Removed ${scholarCount} legacy scholars from localStorage`
        }
      } catch (parseError) {
        console.warn('[Storage Cleanup] Error parsing legacy data, removing anyway:', parseError)
        // If data is corrupted, remove it anyway
        localStorage.removeItem(LEGACY_STORAGE_KEY)
        localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_VERSION)
        return {
          cleaned: true,
          scholarCount: 0,
          message: 'Removed corrupted legacy data from localStorage'
        }
      }
    }
    
    // Update version even if no cleanup was needed
    localStorage.setItem(SCHEMA_VERSION_KEY, CURRENT_VERSION)
    
    return {
      cleaned: false,
      message: 'No legacy data found'
    }
  } catch (error) {
    console.error('[Storage Cleanup] Error during cleanup:', error)
    return {
      cleaned: false,
      error: error.message
    }
  }
}

/**
 * Force cleanup (for testing purposes)
 */
export const forceCleanup = () => {
  localStorage.removeItem(LEGACY_STORAGE_KEY)
  localStorage.removeItem(SCHEMA_VERSION_KEY)
  console.log('[Storage Cleanup] Forced cleanup complete')
}
