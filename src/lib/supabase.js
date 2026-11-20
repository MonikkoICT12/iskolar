import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper function to sanitize Supabase errors without leaking internal schema details
export const handleSupabaseError = (error) => {
  console.error('Supabase error:', error)

  if (!error) {
    return 'An unexpected error occurred'
  }

  if (error.code === 'PGRST116') {
    return 'No data found'
  }

  if (error.code === '23505') {
    return 'This record already exists'
  }

  if (error.code === '42501' || error.status === 401 || error.status === 403) {
    return 'Permission denied. Please verify your administrator session.'
  }

  if (error.code === '23514' || error.code === '23502' || error.code === '22P02') {
    return 'Invalid input values. Please check your entries and try again.'
  }

  if (
    typeof error.message === 'string' &&
    error.message.toLowerCase().includes('session')
  ) {
    return error.message
  }

  return 'Unable to complete the database request. Please try again.'
}

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}
