/**
 * Barangays Configuration
 * 
 * Official list of 19 barangays in Palayan City plus "Other".
 * Used across the entire system for consistency.
 */

export const BARANGAYS = [
  'Atate',
  'Aulo',
  'Bagong Buhay',
  'Caballero',
  'Caimito',
  'Doña Josefa',
  'Ganaderia',
  'Imelda Valley',
  'Langka',
  'Malate',
  'Maligaya',
  'Manacnac',
  'Mapait',
  'Marcos Village',
  'Militar',
  'Popolon',
  'Santolan',
  'Sapang Buho',
  'Singalat',
  'Other'
]

/**
 * Normalize barangay name for matching (case-insensitive, accent-insensitive)
 * @param {string} name - The barangay name to normalize
 * @returns {string} Normalized name
 */
export function normalizeBarangay(name) {
  if (!name) return ''
  
  return name
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/\s+/g, ' ') // Normalize spaces
}

/**
 * Find matching barangay from the official list
 * @param {string} input - User input barangay name
 * @returns {string|null} Matched barangay name or null if not found
 */
export function matchBarangay(input) {
  if (!input) return null
  
  const normalized = normalizeBarangay(input)
  
  for (const barangay of BARANGAYS) {
    if (normalizeBarangay(barangay) === normalized) {
      return barangay
    }
  }
  
  return null
}

export default BARANGAYS
