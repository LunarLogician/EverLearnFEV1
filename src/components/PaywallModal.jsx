import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Zap, Check, Sparkles, Flame, ArrowRight, Loader2 } from 'lucide-react'
import { subscriptionService } from '../services/index'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    tokens: '10,000',
    tokenLabel: 'one-time tokens',
    color: 'gray',
    features: ['All AI tools', 'Document Upload', 'Quizzes & MCQs', 'Flashcards', '10K tokens only'],
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 399,
    tokens: '200K',
    tokenLabel: 'tokens / month',
    badge: '🔥 Popular',
    color: 'emerald',
    features: ['All AI tools', 'Document Upload', 'Quizzes & MCQs', 'Flashcards', 'Chat History'],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 899,
    tokens: '1,000K',
    tokenLabel: 'tokens / month',
    badge: '⚡ Best Value',
    color: 'violet',
    features: ['All AI tools', 'Document Upload', 'Quizzes & MCQs', 'Flashcards', 'Priority support'],
  },
]

export default function PaywallModal({ onClose, requiredPlan = null, currentPlan = 'free' }) {
  const [loadingPlan, setLoadingPlan] = useState(null)
  const [error, setError] = useState('')

  const handleUpgrade = async (planKey) => {
    setError('')
    setLoadingPlan(planKey)
    try {
      const { checkoutUrl } = await subscriptionService.createCheckout(planKey)
      window.location.href = checkoutUrl
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start checkout. Please try again.')
      setLoadingPlan(null)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(8,8,16,0.75)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 24 }}
          transition={{ type: 'spring', stiffness: 340, damping: 28 }}
          className="relative w-full max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl"
          style={{
            background: 'linear-gradient(145deg, #0f0f1a 0%, #13111e 100%)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
          }}
        >
          {/* Glow orbs */}
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full opacity-20"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full opacity-15"
            style={{ background: 'radial-gradient(circle, #059669 0%, transparent 70%)' }} />

          {/* Header */}
          <div className="relative px-6 sm:px-8 pt-7 pb-5 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}>
                  <Zap size={14} className="text-white" />
                </div>
                <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">
                  Upgrade
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white leading-tight">
                You've used all your tokens
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Pick a plan to keep learning — all features on every plan.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="ml-4 mt-0.5 flex-shrink-0 h-8 w-8 rounded-xl flex items-center justify-center transition-colors"
                style={{ background: 'rgba(255,255,255,0.06)' }}
              >
                <X size={16} className="text-white/50" />
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="mx-6 sm:mx-8 mb-4 px-4 py-3 rounded-xl text-sm text-red-300"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
              {error}
            </div>
          )}

          {/* Plans */}
          <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLANS.map((plan, idx) => {
              const isCurrent = plan.key === currentPlan
              const isPro = plan.key === 'pro'
              const isBasic = plan.key === 'basic'

              return (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07, type: 'spring', stiffness: 300, damping: 24 }}
                  className="relative rounded-2xl flex flex-col overflow-hidden"
                  style={
                    isPro
                      ? {
                          background: 'linear-gradient(145deg, #1e1040, #160d35)',
                          border: '1px solid rgba(139,92,246,0.5)',
                          boxShadow: '0 0 32px rgba(139,92,246,0.15)',
                        }
                      : isBasic
                      ? {
                          background: 'linear-gradient(145deg, #0d1f18, #0a1a14)',
                          border: '1px solid rgba(16,185,129,0.35)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.07)',
                        }
                  }
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div
                      className="absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={
                        isPro
                          ? { background: 'rgba(139,92,246,0.25)', color: '#c4b5fd' }
                          : { background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }
                      }
                    >
                      {plan.badge}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1">
                    {/* Plan name */}
                    <p className="text-xs font-semibold tracking-widest uppercase mb-1"
                      style={{ color: isPro ? '#a78bfa' : isBasic ? '#34d399' : 'rgba(255,255,255,0.3)' }}>
                      {plan.name}
                    </p>

                    {/* Price */}
                    <div className="mb-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-black text-white">Free</span>
                      ) : (
                        <div className="flex items-end gap-1">
                          <span className="text-3xl font-black text-white">₨{plan.price}</span>
                          <span className="text-white/30 text-sm mb-1">/mo</span>
                        </div>
                      )}
                    </div>

                    {/* Token highlight */}
                    <div className="flex items-center gap-1.5 mb-4 mt-1">
                      <Sparkles size={12} style={{ color: isPro ? '#a78bfa' : isBasic ? '#34d399' : 'rgba(255,255,255,0.25)' }} />
                      <span className="text-sm font-semibold"
                        style={{ color: isPro ? '#c4b5fd' : isBasic ? '#6ee7b7' : 'rgba(255,255,255,0.35)' }}>
                        {plan.tokens} {plan.tokenLabel}
                      </span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-5 flex-1">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-white/60">
                          <Check size={13} style={{ color: isPro ? '#a78bfa' : isBasic ? '#34d399' : 'rgba(255,255,255,0.25)', flexShrink: 0 }} />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    {isCurrent ? (
                      <div className="w-full py-2.5 rounded-xl text-sm font-semibold text-center text-white/20"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                        Current Plan
                      </div>
                    ) : plan.price === 0 ? null : (
                      <button
                        onClick={() => handleUpgrade(plan.key)}
                        disabled={!!loadingPlan}
                        className="w-full py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        style={
                          isPro
                            ? { background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', boxShadow: '0 4px 20px rgba(124,58,237,0.4)' }
                            : { background: 'linear-gradient(135deg, #059669, #047857)', boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }
                        }
                      >
                        {loadingPlan === plan.key ? (
                          <><Loader2 size={15} className="animate-spin" /> Redirecting…</>
                        ) : (
                          <><Flame size={13} /> Upgrade to {plan.name} <ArrowRight size={13} /></>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Footer */}
          <div className="px-6 sm:px-8 pb-6 text-center text-xs text-white/20">
            Payments processed securely by Lemon Squeezy · Cancel anytime
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
