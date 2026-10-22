// Shared constants and helper functions

// Year Level Colors - shared between Dashboard and YearLevelStats
export const YEAR_LEVEL_COLORS = {
  '1st Year': {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    bgLight: 'bg-blue-50',
    border: 'border-blue-200'
  },
  '2nd Year': {
    bg: 'bg-emerald-500',
    text: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-200'
  },
  '3rd Year': {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    bgLight: 'bg-amber-50',
    border: 'border-amber-200'
  },
  '4th Year': {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    bgLight: 'bg-purple-50',
    border: 'border-purple-200'
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
