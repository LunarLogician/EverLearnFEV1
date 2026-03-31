import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/index'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, User, Eye, EyeOff, X, ShieldCheck } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  OTP Input — 6 boxes                                                */
/* ------------------------------------------------------------------ */
function OTPBoxes({ onComplete }) {
  const [digits, setDigits] = useState(Array(6).fill(''))

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    if (val && idx < 5) {
      document.getElementById(`otp-${idx + 1}`)?.focus()
    }
    if (next.every((d) => d !== '')) onComplete(next.join(''))
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus()
    }
  }

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setDigits(pasted.split(''))
      onComplete(pasted)
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          id={`otp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-10 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Modal                                                          */
/* ------------------------------------------------------------------ */
export default function AuthModal({ onClose, onSuccess }) {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [view, setView] = useState('auth') // 'auth' | 'verify'
  const [pendingEmail, setPendingEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMsg, setResendMsg] = useState('')
  const [error, setError] = useState('')
  const { login, register, verifyEmail } = useAuth()

  const [formData, setFormData] = useState({ name: '', email: '', password: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Client-side validation — fast feedback before hitting the API
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (isLogin) {
      if (!formData.email.trim()) { setError('Email is required'); return }
      if (!formData.password) { setError('Password is required'); return }
    } else {
      if (!formData.name || formData.name.trim().length < 2) {
        setError('Name must be at least 2 characters'); return
      }
      if (!emailRegex.test(formData.email.trim())) {
        setError('Please enter a valid email address'); return
      }
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters'); return
      }
    }

    setLoading(true)
    try {
      if (isLogin) {
        await login(formData.email, formData.password)
        onSuccess ? onSuccess() : onClose?.()
      } else {
        const data = await register(formData.name, formData.email, formData.password)
        if (data.requiresVerification) {
          setPendingEmail(formData.email)
          setView('verify')
        } else {
          onSuccess ? onSuccess() : onClose?.()
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOTPComplete = async (otp) => {
    setError('')
    setLoading(true)
    try {
      await verifyEmail(pendingEmail, otp)
      onSuccess ? onSuccess() : onClose?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setResendLoading(true)
    setResendMsg('')
    try {
      await authService.resendOtp(pendingEmail)
      setResendMsg('New code sent!')
    } catch {
      setResendMsg('Failed to resend. Try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const goForgotPassword = () => {
    onClose?.()
    navigate('/forgot-password')
  }

  /* ---- Verify view ---- */
  if (view === 'verify') {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-xl relative"
        >
          {onClose && (
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
              <X size={18} />
            </button>
          )}
          <div className="px-8 pt-8 pb-8">
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center">
                <ShieldCheck size={28} className="text-emerald-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-1">Check your email</h2>
            <p className="text-gray-500 text-sm text-center mb-6">
              We sent a 6-digit code to <span className="font-semibold text-gray-700">{pendingEmail}</span>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}

            <OTPBoxes onComplete={handleOTPComplete} />

            {loading && (
              <div className="flex justify-center mt-4">
                <div className="animate-spin h-5 w-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
              </div>
            )}

            <div className="mt-6 text-center text-sm text-gray-500">
              Didn't get it?{' '}
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="text-emerald-700 font-semibold hover:text-emerald-600 disabled:opacity-50"
              >
                {resendLoading ? 'Sending...' : 'Resend code'}
              </button>
              {resendMsg && <p className="mt-1 text-emerald-600 text-xs">{resendMsg}</p>}
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  /* ---- Auth (login / signup) view ---- */
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-xl relative"
      >
        {onClose && (
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors">
            <X size={18} />
          </button>
        )}

        <div className="px-8 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-emerald-900 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white text-[10px] font-bold">SA</span>
            </div>
            <span className="font-bold text-gray-900">StudentApp</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Sign in to continue your study sessions.' : 'Start for free — no credit card required.'}
          </p>
        </div>

        <div className="flex gap-0 mx-8 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Log in
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${!isLogin ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Sign up
          </button>
        </div>

        {error && (
          <div className="mx-8 mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-3 text-gray-400" />
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required={!isLogin} className="input-field pl-9" disabled={loading} />
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-sm font-medium mb-1.5">Email address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
              <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required className="input-field pl-9" disabled={loading} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-gray-700 text-sm font-medium">Password</label>
              {isLogin && (
                <button type="button" onClick={goForgotPassword} className="text-xs text-emerald-700 hover:text-emerald-600 font-medium">
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="input-field pl-9 pr-10"
                disabled={loading}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-3 mt-2">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </span>
            ) : (
              isLogin ? 'Sign in' : 'Create account'
            )}
          </button>

          <p className="text-center text-gray-500 text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-emerald-900 hover:text-emerald-700 font-semibold">
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  )
}

