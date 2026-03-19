import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { motion } from 'framer-motion'

const SUGGESTIONS = [
  { emoji: '📖', text: 'Explain photosynthesis in simple terms' },
  { emoji: '✏️', text: 'Help me outline an essay on climate change' },
  { emoji: '🧮', text: 'Solve step by step: 3x + 7 = 22' },
  { emoji: '📚', text: 'Give me 5 tips for studying effectively' },
]

export default function ChatWindow({ userInitials = 'ME', onLoginClick, onLimitReached }) {
  const { user } = useAuth()
  const { messages, loading, sendMessage, chatCount } = useChat()
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const handleSuggestion = (text) => {
    if (!user) { onLoginClick?.(); return }
    // Removed FREE_LIMIT check
    sendMessage(text, null, null, null)
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col chat-scroll">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/20 mb-5"
          >
            <span className="text-white font-black text-xl">SA</span>
          </motion.div>

          <motion.h3
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-bold text-slate-800 mb-1"
          >
            {user ? `Hi ${user.name.split(' ')[0]}, ready to study?` : 'Your AI Study Assistant'}
          </motion.h3>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-slate-400 text-sm mb-8 text-center"
          >
            Ask anything — homework, concepts, exam prep, or essays
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg"
          >
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestion(s.text)}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-gray-200 hover:border-emerald-200/70 rounded-xl px-4 py-3.5 text-left transition-all shadow-sm hover:shadow-md group"
              >
                <span className="text-xl flex-shrink-0">{s.emoji}</span>
                <span className="text-sm text-slate-500 group-hover:text-slate-700 leading-snug">{s.text}</span>
              </motion.button>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col px-4 py-6 max-w-3xl mx-auto w-full">
          {messages.map((message, index) => (
            <MessageBubble key={index} message={message} userInitials={userInitials} />
          ))}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 justify-start mb-4"
            >
              <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <span className="text-white text-[9px] font-black">SA</span>
              </div>
              <TypingIndicator />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  )
}
