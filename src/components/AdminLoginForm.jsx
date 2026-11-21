import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from '@/components/ui/sonner'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const THROTTLE_KEY = 'iskolayan_auth_throttle'
const MAX_ATTEMPTS = 5
const BASE_LOCK_MS = 60 * 1000
const MAX_LOCK_MS = 15 * 60 * 1000

function readThrottleState() {
  try {
    const raw = sessionStorage.getItem(THROTTLE_KEY)
    if (!raw) return { failures: 0, lockCount: 0, lockedUntil: 0 }
    const parsed = JSON.parse(raw)
    return {
      failures: Number(parsed?.failures) || 0,
      lockCount: Number(parsed?.lockCount) || 0,
      lockedUntil: Number(parsed?.lockedUntil) || 0,
    }
  } catch {
    return { failures: 0, lockCount: 0, lockedUntil: 0 }
  }
}

function writeThrottleState(state) {
  try {
    sessionStorage.setItem(THROTTLE_KEY, JSON.stringify(state))
  } catch {
    // Ignore storage unavailability
  }
}

const AdminLoginForm = ({ onSuccess, idPrefix = 'login', variant = 'default' }) => {
  const isGlass = variant === 'glass'
  const navigate = useNavigate()
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    const state = readThrottleState()
    const diff = state.lockedUntil - Date.now()
    return diff > 0 ? Math.ceil(diff / 1000) : 0
  })

  useEffect(() => {
    if (remainingSeconds <= 0) return
    const timer = setInterval(() => {
      const state = readThrottleState()
      const diff = state.lockedUntil - Date.now()
      setRemainingSeconds(diff > 0 ? Math.ceil(diff / 1000) : 0)
    }, 1000)
    return () => clearInterval(timer)
  }, [remainingSeconds])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const throttle = readThrottleState()
    if (throttle.lockedUntil > Date.now()) {
      const secs = Math.ceil((throttle.lockedUntil - Date.now()) / 1000)
      setRemainingSeconds(secs)
      setError(`Too many failed attempts. Try again in ${secs}s.`)
      return
    }

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await signIn(trimmedEmail, password)
      writeThrottleState({ failures: 0, lockCount: 0, lockedUntil: 0 })
      setRemainingSeconds(0)
      setPassword('')
      toast.success('Welcome back to IskoLayan Admin')
      if (onSuccess) onSuccess()
      navigate('/admin')
    } catch (err) {
      console.error('Sign in error:', err)
      setShowPassword(false)

      const nextFailures = throttle.failures + 1
      let nextLockCount = throttle.lockCount
      let nextLockedUntil = 0

      if (nextFailures >= MAX_ATTEMPTS) {
        nextLockCount += 1
        const duration = Math.min(
          BASE_LOCK_MS * Math.pow(2, nextLockCount - 1),
          MAX_LOCK_MS
        )
        nextLockedUntil = Date.now() + duration
        setRemainingSeconds(Math.ceil(duration / 1000))
      }

      writeThrottleState({
        failures: nextFailures >= MAX_ATTEMPTS ? 0 : nextFailures,
        lockCount: nextLockCount,
        lockedUntil: nextLockedUntil,
      })

      if (err?.code === 'ADMIN_UNAUTHORIZED') {
        setError(err.message)
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Please confirm your email address before signing in.')
      } else if (
        err.status === 429 ||
        err.message?.toLowerCase().includes('rate limit')
      ) {
        setError('Too many sign-in attempts. Please wait before trying again.')
      } else if (nextLockedUntil > Date.now()) {
        const secs = Math.ceil((nextLockedUntil - Date.now()) / 1000)
        setError(`Too many failed attempts. Sign-in locked for ${secs}s.`)
      } else {
        setError('Invalid email or password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isLocked = remainingSeconds > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className={`p-3 rounded-xl border flex items-start gap-2.5 animate-in fade-in duration-200 ${
            isGlass
              ? 'bg-red-500/15 border-red-400/35 text-red-100'
              : 'bg-red-50/90 border-red-200'
          }`}
        >
          <AlertCircle
            className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
              isGlass ? 'text-red-300' : 'text-red-600'
            }`}
          />
          <p
            className={`text-xs font-medium ${
              isGlass ? 'text-red-100' : 'text-red-700'
            }`}
          >
            {error}
          </p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor={`${idPrefix}-email`}
          className={isGlass ? 'text-xs font-semibold text-white/85 tracking-wide' : ''}
        >
          Admin Email
        </Label>
        <div className="relative">
          <Mail
            className={`w-4 h-4 absolute left-3.5 top-1/2 z-10 -translate-y-1/2 pointer-events-none ${
              isGlass ? 'text-[#EDDA5E]/85' : 'text-brand'
            }`}
          />
          <Input
            id={`${idPrefix}-email`}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || isLocked}
            autoFocus
            maxLength={254}
            className={
              isGlass
                ? 'h-11 pl-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/45 hover:bg-white/[0.14] focus-visible:bg-white/[0.16] focus-visible:border-[#EDDA5E]/75 shadow-inner'
                : 'pl-9'
            }
            placeholder="admin@palayancity.gov.ph"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor={`${idPrefix}-password`}
          className={isGlass ? 'text-xs font-semibold text-white/85 tracking-wide' : ''}
        >
          Password
        </Label>
        <div className="relative">
          <Lock
            className={`w-4 h-4 absolute left-3.5 top-1/2 z-10 -translate-y-1/2 pointer-events-none ${
              isGlass ? 'text-[#EDDA5E]/85' : 'text-brand'
            }`}
          />
          <Input
            id={`${idPrefix}-password`}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading || isLocked}
            maxLength={128}
            className={
              isGlass
                ? 'h-11 pl-10 pr-10 rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/45 hover:bg-white/[0.14] focus-visible:bg-white/[0.16] focus-visible:border-[#EDDA5E]/75 shadow-inner'
                : 'pl-9 pr-10'
            }
            placeholder="Enter your password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword(!showPassword)}
            disabled={loading || isLocked}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg ${
              isGlass
                ? 'text-white/65 hover:text-white hover:bg-white/10'
                : 'text-muted-foreground'
            }`}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      <Button
        type="submit"
        variant="gradient"
        disabled={loading || isLocked}
        className={
          isGlass
            ? 'w-full h-11 rounded-xl mt-3 bg-gradient-to-r from-[#587529] to-[#71951E] hover:from-[#64842D] hover:to-[#7FA823] text-white font-semibold shadow-[0_12px_30px_rgba(88,117,41,0.45)] border border-white/20 gap-2'
            : 'w-full h-10 rounded-xl mt-2'
        }
      >
        <span>
          {isLocked
            ? `Locked (${remainingSeconds}s)`
            : loading
              ? 'Signing in...'
              : 'Sign In to Dashboard'}
        </span>
        {!loading && !isLocked && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  )
}

export default AdminLoginForm
