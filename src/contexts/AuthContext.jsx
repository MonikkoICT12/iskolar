import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

// DEVELOPMENT ONLY - In production, this should be handled by a secure backend
const ADMIN_CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
}

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION = 5 * 60 * 1000 // 5 minutes

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState(null)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = () => {
      const sessionData = sessionStorage.getItem('auth_session')
      if (sessionData) {
        try {
          const session = JSON.parse(sessionData)
          const now = Date.now()
          
          // Check if session is expired
          if (session.expiresAt > now) {
            setUser(session.user)
            setLastActivity(now)
          } else {
            sessionStorage.removeItem('auth_session')
          }
        } catch (error) {
          sessionStorage.removeItem('auth_session')
        }
      }
      setLoading(false)
    }

    checkSession()
  }, [])

  // Auto logout on inactivity
  useEffect(() => {
    if (!user) return

    const checkActivity = setInterval(() => {
      const now = Date.now()
      if (now - lastActivity > SESSION_TIMEOUT) {
        signOut()
      }
    }, 60000) // Check every minute

    return () => clearInterval(checkActivity)
  }, [user, lastActivity])

  // Update activity timestamp
  const updateActivity = () => {
    setLastActivity(Date.now())
  }

  const signInAdmin = (username, password) => {
    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000)
      return {
        success: false,
        error: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`
      }
    }

    // DEVELOPMENT ONLY - Validate against environment variables
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const userData = {
        type: 'admin',
        username: username
      }
      
      const session = {
        user: userData,
        expiresAt: Date.now() + SESSION_TIMEOUT
      }
      
      sessionStorage.setItem('auth_session', JSON.stringify(session))
      setUser(userData)
      setFailedAttempts(0)
      setLockoutUntil(null)
      setLastActivity(Date.now())
      
      return { success: true }
    } else {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockout = Date.now() + LOCKOUT_DURATION
        setLockoutUntil(lockout)
        return {
          success: false,
          error: 'Too many failed attempts. Please try again in 5 minutes.'
        }
      }
      
      return {
        success: false,
        error: 'We couldn\'t sign you in. Please check your details.'
      }
    }
  }

  const signInScholar = (school, schoolId) => {
    // Check lockout
    if (lockoutUntil && Date.now() < lockoutUntil) {
      const remainingSeconds = Math.ceil((lockoutUntil - Date.now()) / 1000)
      return {
        success: false,
        error: `Too many failed attempts. Please try again in ${remainingSeconds} seconds.`
      }
    }

    // Get scholars from localStorage
    const schoolYearData = localStorage.getItem('scholars')
    if (!schoolYearData) {
      const newAttempts = failedAttempts + 1
      setFailedAttempts(newAttempts)
      
      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        const lockout = Date.now() + LOCKOUT_DURATION
        setLockoutUntil(lockout)
      }
      
      return {
        success: false,
        error: 'We couldn\'t find a scholar with that school and ID. Please check your details.'
      }
    }

    try {
      const allData = JSON.parse(schoolYearData)
      const currentYear = localStorage.getItem('currentSchoolYear') || '2025-2026'
      const scholars = allData[currentYear] || []

      // Find scholar by school and schoolId (case-insensitive, trimmed)
      const scholar = scholars.find(s => 
        s.school?.toLowerCase().trim() === school.toLowerCase().trim() &&
        s.schoolId?.toLowerCase().trim() === schoolId.toLowerCase().trim()
      )

      if (scholar && scholar.schoolId) {
        const userData = {
          type: 'scholar',
          scholarId: scholar.id,
          schoolId: scholar.schoolId,
          school: scholar.school
        }
        
        const session = {
          user: userData,
          expiresAt: Date.now() + (15 * 60 * 1000) // 15 minutes for scholars
        }
        
        sessionStorage.setItem('auth_session', JSON.stringify(session))
        setUser(userData)
        setFailedAttempts(0)
        setLockoutUntil(null)
        setLastActivity(Date.now())
        
        return { success: true, scholar }
      } else {
        const newAttempts = failedAttempts + 1
        setFailedAttempts(newAttempts)
        
        if (newAttempts >= MAX_FAILED_ATTEMPTS) {
          const lockout = Date.now() + LOCKOUT_DURATION
          setLockoutUntil(lockout)
          return {
            success: false,
            error: 'Too many failed attempts. Please try again in 5 minutes.'
          }
        }
        
        return {
          success: false,
          error: 'We couldn\'t find a scholar with that school and ID. Please check your details.'
        }
      }
    } catch (error) {
      return {
        success: false,
        error: 'We couldn\'t find a scholar with that school and ID. Please check your details.'
      }
    }
  }

  const signOut = () => {
    sessionStorage.removeItem('auth_session')
    setUser(null)
    setLastActivity(Date.now())
  }

  const isAuthenticated = () => !!user
  const isAdmin = () => user?.type === 'admin'
  const isScholar = () => user?.type === 'scholar'

  const value = {
    user,
    loading,
    isAuthenticated,
    isAdmin,
    isScholar,
    signInAdmin,
    signInScholar,
    signOut,
    updateActivity,
    lockoutUntil
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
