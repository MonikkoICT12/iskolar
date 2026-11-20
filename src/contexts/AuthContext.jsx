import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from '@/components/ui/sonner'

const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes idle auto-logout

const AuthContext = createContext({
  user: null,
  isAdmin: false,
  securityWarning: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

async function verifyAdminAccess(sessionUser) {
  if (!sessionUser) {
    return { allowed: false, warning: null }
  }

  const appRole = sessionUser.app_metadata?.role
  if (appRole === 'admin') {
    return { allowed: true, warning: null }
  }

  if (appRole && appRole !== 'admin') {
    return { allowed: false, warning: null }
  }

  try {
    const { data, error } = await supabase.rpc('is_admin')

    if (!error) {
      return { allowed: data === true, warning: null }
    }

    const msg = String(error.message || '').toLowerCase()
    const isMissingRpc =
      error.code === 'PGRST202' ||
      error.code === '42883' ||
      msg.includes('could not find the function') ||
      msg.includes('is_admin')

    if (isMissingRpc) {
      return { allowed: true, warning: 'legacy_rls' }
    }

    return { allowed: false, warning: null }
  } catch {
    return { allowed: false, warning: null }
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [securityWarning, setSecurityWarning] = useState(null)
  const [loading, setLoading] = useState(true)

  const syncSession = useCallback(async (session) => {
    const sessionUser = session?.user ?? null
    if (!sessionUser) {
      setUser(null)
      setIsAdmin(false)
      setSecurityWarning(null)
      return { allowed: false, warning: null }
    }

    const { allowed, warning } = await verifyAdminAccess(sessionUser)
    if (!allowed) {
      await supabase.auth.signOut().catch(() => {})
      setUser(null)
      setIsAdmin(false)
      setSecurityWarning(null)
      return { allowed: false, warning: null }
    }

    setUser(sessionUser)
    setIsAdmin(true)
    setSecurityWarning(warning)
    return { allowed: true, warning }
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return
      await syncSession(session)
      if (active) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [syncSession])

  // Idle inactivity auto-logout for signed-in admin sessions
  useEffect(() => {
    if (!user || !isAdmin) return

    let timeoutId
    const resetIdleTimer = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(async () => {
        try {
          await supabase.auth.signOut()
          toast.warning('Signed out after 30 minutes of inactivity.')
        } catch {
          setUser(null)
          setIsAdmin(false)
        }
      }, IDLE_TIMEOUT_MS)
    }

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach((evt) =>
      window.addEventListener(evt, resetIdleTimer, { passive: true })
    )
    resetIdleTimer()

    return () => {
      clearTimeout(timeoutId)
      events.forEach((evt) => window.removeEventListener(evt, resetIdleTimer))
    }
  }, [user, isAdmin])

  const signIn = async (email, password) => {
    const normalizedEmail = String(email || '').trim()
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    })

    if (error) throw error

    const { allowed } = await syncSession(data?.session)
    if (!allowed) {
      const authError = new Error(
        'Access denied. This account is not authorized as an administrator.'
      )
      authError.code = 'ADMIN_UNAUTHORIZED'
      throw authError
    }

    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
    setSecurityWarning(null)
    if (error) throw error
  }

  const value = {
    user,
    isAdmin,
    securityWarning,
    loading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
