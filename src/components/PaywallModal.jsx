import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, BookOpen, Brain, MessageSquare, Lock } from 'lucide-react'
import { subscriptionService } from '../services/index'

const PLANS = [
  {
    key: 'free',
    name: 'Free',
    price: 0,
    color: 'gray',
    features: [
      { icon: MessageSquare, text: 'AI Chat',           included: true },
      { icon: FileText,      text: 'Assignments',       included: false },
      { icon: FileText,      text: 'Document Upload',   included: false },
      { icon: Brain,         text: 'Quizzes',           included: false },
      { icon: BookOpen,      text: 'Flashcards',        included: false },
    ],
  },
  {
    key: 'basic',
    name: 'Basic',
    price: 399,
    badge: 'Popular',
    color: 'emerald',
    features: [
      { icon: MessageSquare, text: 'AI Chat',           included: true },
      { icon: FileText,      text: 'Assignments',       included: true },
      { icon: FileText,      text: 'Document Upload',   included: true },
      { icon: Brain,         text: 'Quizzes',           included: false },
      { icon: BookOpen,      text: 'Flashcards',        included: false },
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 899,
    badge: 'Best Value',
    color: 'purple',
    features: [
      { icon: MessageSquare, text: 'AI Chat',           included: true },
      { icon: FileText,      text: 'Assignments',       included: true },
      { icon: FileText,      text: 'Document Upload',   included: true },
      { icon: Brain,         text: 'Quizzes',           included: true },
      { icon: BookOpen,      text: 'Flashcards',        included: true },
    ],
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-5 sm:px-8 py-4 sm:py-5 flex justify-between items-center rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upgrade your plan</h2>
            {requiredPlan && (
              <p className="text-sm text-amber-600 mt-0.5 font-medium">
                This feature requires the{' '}
                <span className="capitalize font-bold">{requiredPlan}</span> plan.
              </p>
            )}
          </div>
          {onClose && (
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700">
              <X size={22} />
            </button>
          )}
        </div>

        <div className="p-4 sm:p-8">
          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan, idx) => {
              const isCurrent = plan.key === currentPlan
              const isHighlighted = plan.key === requiredPlan
              const ringClass =
                plan.color === 'purple'
                  ? 'border-purple-400 ring-2 ring-purple-200'
                  : plan.color === 'emerald'
                  ? 'border-emerald-400 ring-2 ring-emerald-200'
                  : 'border-gray-200'

              return (
                <motion.div
                  key={plan.key}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`rounded-xl border p-5 flex flex-col ${
                    isHighlighted ? ringClass : 'border-gray-200'
                  }`}
                >
                  {plan.badge && (
                    <span
                      className={`self-start text-[11px] font-bold px-2 py-0.5 rounded-full mb-3 ${
                        plan.color === 'purple'
                          ? 'bg-purple-100 text-purple-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {plan.badge}
                    </span>
                  )}

                  <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                  <div className="mt-1 mb-4">
                    {plan.price === 0 ? (
                      <span className="text-2xl font-bold text-gray-900">Free</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-gray-900">
                          Rs {plan.price.toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-sm">/mo</span>
                      </>
                    )}
                  </div>

                  <ul className="space-y-2 mb-5 flex-1">
                    {plan.features.map((f, i) => (
                      <li
                        key={i}
                        className={`flex items-center gap-2 text-sm ${
                          f.included ? 'text-gray-700' : 'text-gray-300'
                        }`}
                      >
                        {f.included ? (
                          <f.icon
                            size={14}
                            className={
                              plan.color === 'purple' ? 'text-purple-500' : 'text-emerald-500'
                            }
                          />
                        ) : (
                          <Lock size={14} className="text-gray-300" />
                        )}
                        {f.text}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-2.5 rounded-lg text-sm font-semibold bg-gray-100 text-gray-400 cursor-default"
                    >
                      Current Plan
                    </button>
                  ) : plan.price === 0 ? null : (
                    <button
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={!!loadingPlan}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
                        plan.color === 'purple'
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-emerald-700 hover:bg-emerald-800'
                      }`}
                    >
                      {loadingPlan === plan.key ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          Redirecting...
                        </span>
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </button>
                  )}
                </motion.div>
              )
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Payments processed securely by Lemon Squeezy. Cancel anytime.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
