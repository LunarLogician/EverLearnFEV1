import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/index'
import { ShieldCheck } from 'lucide-react'

function OTPBoxes({ onComplete }) {
  const [digits, setDigits] = useState(Array(6).fill(''))

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[idx] = val
    setDigits(next)
    if (val && idx < 5) document.getElementById(`veotp-${idx + 1}`)?.focus()
    if (next.every((d) => d !== '')) onComplete(next.join(''))
  }

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      document.getElementById(`veotp-${idx - 1}`)?.focus()
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
          id={`veotp-${i}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className="w-11 h-13 text-center text-lg font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      ))}
    </div>
  )
}

export default function VerifyEmail() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { verifyEmail } = useAuth()

  const [email, setEmail] = useState(searchParams.get('email') || '')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')

  const handleOTPComplete = async (otp) => {
    if (!email.trim()) {
      setError('Please enter your email address first')
      return
    }
    setError('')
    setLoading(true)
    try {
      await verifyEmail(email.trim(), otp)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (!email.trim()) return
    setResendLoading(true)
    setResendMsg('')
    try {
      await authService.resendOtp(email.trim())
      setResendMsg('New code sent!')
    } catch {
      setResendMsg('Failed to resend. Try again.')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md border border-gray-200 shadow-sm p-8">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <ShieldCheck size={32} className="text-emerald-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-1">Verify your email</h1>
        <p className="text-gray-500 text-sm text-center mb-6">
          Enter your email and the 6-digit code we sent you.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-medium mb-1.5">Email address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <p className="text-sm text-gray-600 font-medium mb-3 text-center">Enter verification code</p>
        <OTPBoxes onComplete={handleOTPComplete} />

        {loading && (
          <div className="flex justify-center mt-4">
            <div className="animate-spin h-5 w-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full" />
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-500">
          Didn't receive a code?{' '}
          <button
            onClick={handleResend}
            disabled={resendLoading || !email.trim()}
            className="text-emerald-700 font-semibold hover:text-emerald-600 disabled:opacity-50"
          >
            {resendLoading ? 'Sending...' : 'Resend'}
          </button>
          {resendMsg && <p className="mt-1 text-emerald-600 text-xs">{resendMsg}</p>}
        </div>

        <div className="mt-4 text-center">
          <button onClick={() => navigate('/')} className="text-xs text-gray-400 hover:text-gray-600">
            ← Back to home
          </button>
        </div>
      </div>
    </div>
  )
}
