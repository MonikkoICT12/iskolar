// Shared constants and helper functions

// Year Level Colors - shared between Dashboard and YearLevelStats
export const YEAR_LEVEL_COLORS = {
  '1st Year': {
    bg: 'bg-[#587529]',
    text: 'text-[#587529]',
    bgLight: 'bg-[#587529]/10',
    border: 'border-[#587529]/30'
  },
  '2nd Year': {
    bg: 'bg-[#71951E]',
    text: 'text-[#587529]',
    bgLight: 'bg-[#71951E]/15',
    border: 'border-[#71951E]/35'
  },
  '3rd Year': {
    bg: 'bg-[#F4BE38]',
    text: 'text-[#1A1A14]',
    bgLight: 'bg-[#F4BE38]/20',
    border: 'border-[#F4BE38]/50'
  },
  '4th Year': {
    bg: 'bg-[#EDDA5E]',
    text: 'text-[#1A1A14]',
    bgLight: 'bg-[#EDDA5E]/30',
    border: 'border-[#EDDA5E]/60'
  }
}

// Scholar count pluralization helper
export const pluralizeScholar = (count) => {
  if (count === 1) return '1 Scholar'
  return `${count} Scholars`
}

// Format currency helper
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Safe division helper - prevents divide by zero errors
export const safeDivide = (numerator, denominator, fallback = 0) => {
  if (!denominator || denominator === 0) return fallback
  return numerator / denominator
}

// Safe percentage helper - prevents divide by zero errors
export const safePercentage = (part, total) => {
  return safeDivide(part * 100, total, 0)
}

// Format scholar full name with suffix
export const formatScholarName = (scholar, format = 'lastFirst') => {
  if (!scholar) return ''
  
  const { firstName = '', middleName = '', lastName = '', suffix = null } = scholar
  const suffixDisplay = suffix && suffix !== 'None' ? ` ${suffix}` : ''
  
  if (format === 'lastFirst') {
    // "Dela Cruz, Juan A. Jr."
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : ''
    return `${lastName}${suffixDisplay}, ${firstName}${middleInitial}`.trim()
  } else if (format === 'firstLast') {
    // "Juan A. Dela Cruz Jr."
    const middleInitial = middleName ? ` ${middleName.charAt(0)}.` : ''
    return `${firstName}${middleInitial} ${lastName}${suffixDisplay}`.trim()
  } else if (format === 'full') {
    // "Juan Alba Dela Cruz Jr."
    const middle = middleName ? ` ${middleName}` : ''
    return `${firstName}${middle} ${lastName}${suffixDisplay}`.trim()
  }
  
  return `${lastName}, ${firstName}`
}
