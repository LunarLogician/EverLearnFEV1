import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/index'
import { KeyRound, Mail, Lock, Eye, EyeOff } from 'lucide-react'

function OTPBoxes({ onComplete }) {
  const [digits, setDigits] = useState(Array(6).fill(''))

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    if (val && idx < 5) document.getElementById(`fpotp-${idx + 1}`)?.focus()
    if (next.every((d) => d !== '')) onComplete(next.join(''))
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      document.getElementById(`fpotp-${idx - 1}`)?.focus()
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
          id={`fpotp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-11 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      ))}
    </div>
  )
}

export default function ForgotPassword() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1) // 1: email, 2: otp + new password
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authService.forgotPassword(email.trim())
      setStep(2)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    if (!otp || otp.length < 6) {
      setError('Please enter the complete 6-digit code')
      return
    }
    setLoading(true)
    try {
      await authService.resetPassword(email.trim(), otp, newPassword)
      setSuccess('Password reset successfully! Redirecting to login...')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-sm p-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center">
            <KeyRound size={32} className="text-purple-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">
          {step === 1 ? 'Forgot password?' : 'Reset password'}
        </h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          {step === 1
            ? "Enter your email and we'll send you a reset code."
            : `Enter the code sent to ${email} and choose a new password.`}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            {success}
          </div>
        )}

        {/* Step 1: Email */}
        {step === 1 && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Email address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Sending...
                </span>
              ) : 'Send reset code'}
            </button>
          </form>
        )}

        {/* Step 2: OTP + new password */}
        {step === 2 && (
          <form onSubmit={handleReset} className="space-y-5">
            <div>
              <p className="text-sm text-gray-600 font-medium mb-3 text-center">Enter 6-digit code</p>
              <OTPBoxes onComplete={(val) => setOtp(val)} />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">New password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-medium mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !otp || otp.length < 6}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                  Resetting...
                </span>
              ) : 'Reset password'}
            </button>

            <div className="text-center text-sm text-gray-500">
              Wrong email?{' '}
              <button type="button" onClick={() => { setStep(1); setOtp(''); setError(''); }} className="text-purple-600 font-semibold hover:text-purple-700">
                Go back
              </button>
            </div>
          </form>
        )}

        <div className="mt-5 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
