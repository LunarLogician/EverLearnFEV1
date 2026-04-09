import { useEffect, useRef, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import MessageBubble from './MessageBubble'
import TypingIndicator from './TypingIndicator'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

const SUGGESTIONS = [
  { emoji: '📖', text: 'Explain photosynthesis in simple terms' },
  { emoji: '✏️', text: 'Help me outline an essay on climate change' },
  { emoji: '🧮', text: 'Solve step by step: 3x + 7 = 22' },
  { emoji: '📚', text: 'Give me 5 tips for studying effectively' },
]

export default function ChatWindow({ userInitials = 'ME', onLoginClick, onLimitReached }) {
  const { user } = useAuth()
  const { messages, loading, historyLoading, sendMessage, chatCount } = useChat()
  const messagesEndRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const [visibleCount, setVisibleCount] = useState(50)
  const [showScrollButton, setShowScrollButton] = useState(false)
  const [isAutoScrolling, setIsAutoScrolling] = useState(true)

  const hiddenCount = Math.max(0, messages.length - visibleCount)
  const visibleMessages = messages.slice(Math.max(0, messages.length - visibleCount))

  // Smart scrolling - auto-scroll only if we were already at the bottom
  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior })
      setIsAutoScrolling(true)
      setShowScrollButton(false)
    }
  }, [])

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target
    // Roughly within 100px of bottom means we are at the bottom
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setIsAutoScrolling(isAtBottom)
    setShowScrollButton(!isAtBottom)
  }

  useEffect(() => {
    if (messages.length === 0) setVisibleCount(50)
  }, [messages.length === 0])

  useEffect(() => {
    // Only auto-scroll on new content if the user hasn't manually scrolled up
    if (isAutoScrolling) {
      scrollToBottom('auto') // 'auto' ensures it snaps to the word if streaming fast
    }
  }, [messages, loading, isAutoScrolling, scrollToBottom])

  const handleSuggestion = (text) => {
    if (!user) { onLoginClick?.(); return }
    // Removed FREE_LIMIT check
    sendMessage(text, null, null, null)
    setTimeout(() => scrollToBottom(), 100)
  }

  return (
    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto flex flex-col chat-scroll relative pb-32"
    >
      {historyLoading ? (
        <div className="flex-1 flex flex-col px-4 py-8 max-w-3xl mx-auto w-full gap-8 mt-10">
          <div className="flex gap-4 justify-end">
            <div className="h-16 w-56 bg-slate-200/60 rounded-2xl rounded-tr-sm animate-pulse"></div>
            <div className="h-8 w-8 rounded-xl bg-slate-200 animate-pulse flex-shrink-0"></div>
          </div>
          <div className="flex gap-4 justify-start">
            <div className="h-8 w-8 rounded-xl bg-emerald-100 animate-pulse flex-shrink-0"></div>
            <div className="flex flex-col gap-2 w-3/4">
              <div className="h-4 w-full bg-slate-200/50 rounded animate-pulse"></div>
              <div className="h-4 w-[90%] bg-slate-200/50 rounded animate-pulse"></div>
              <div className="h-4 w-[60%] bg-slate-200/50 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-4 justify-end">
            <div className="h-12 w-48 bg-slate-200/60 rounded-2xl rounded-tr-sm animate-pulse"></div>
            <div className="h-8 w-8 rounded-xl bg-slate-200 animate-pulse flex-shrink-0"></div>
          </div>
        </div>
      ) : messages.length === 0 ? (
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl"
          >
            {SUGGESTIONS.map((s, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.05 }}
                whileHover={{ y: -3, backgroundColor: '#f8fafc', borderColor: '#34d399' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSuggestion(s.text)}
                className="flex items-start gap-4 bg-white border border-gray-200 rounded-2xl p-4 text-left transition-all shadow-sm hover:shadow-md group"
              >
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-slate-50 border border-slate-100 group-hover:bg-emerald-50 group-hover:border-emerald-100 transition-colors flex-shrink-0">
                  <span className="text-lg">{s.emoji}</span>
                </div>
                <div className="flex flex-col justify-center min-h-[40px]">
                  <span className="text-[0.9rem] font-medium text-slate-700 group-hover:text-emerald-800 transition-colors leading-snug">{s.text}</span>
                </div>
              </motion.button>
            ))}
          </motion.div>
        </div>
      ) : (
        <div className="flex flex-col px-4 py-6 max-w-3xl mx-auto w-full">
          {hiddenCount > 0 && (
            <button
              onClick={() => setVisibleCount(c => c + 50)}
              className="mx-auto mb-4 px-4 py-1.5 text-xs text-slate-500 bg-white border border-gray-200 rounded-full hover:bg-slate-50 transition-colors"
            >
              ↑ Load {Math.min(50, hiddenCount)} earlier messages
            </button>
          )}
          {visibleMessages.map((message, index) => (
            <MessageBubble 
              key={index} 
              message={message} 
              userInitials={userInitials} 
              isLatest={index === visibleMessages.length - 1}
              onQuickReply={handleSuggestion}
            />
          ))}
          {/* Show typing indicator only when loading AND no streaming placeholder is already visible */}
          {loading && !messages.some((m) => m.streaming) && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 sm:gap-4 justify-start mb-8"
            >
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-800 to-emerald-600 flex items-center justify-center flex-shrink-0 mt-2 shadow-sm border border-emerald-900/20">
                <span className="text-white text-[9px] font-black">SA</span>
              </div>
              <div className="bg-[#f9fafb] p-4 rounded-2xl shadow-sm border border-slate-200">
                <TypingIndicator />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-10" />
        </div>
      )}

      {/* Floating Action Button (FAB) for Scroll to bottom */}
      <AnimatePresence>
        {showScrollButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            onClick={() => scrollToBottom('smooth')}
            className="fixed bottom-32 left-[calc(50%+140px)] md:left-[calc(50%+160px)] -translate-x-1/2 p-2.5 bg-white border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] text-emerald-700 rounded-full hover:bg-slate-50 hover:text-emerald-900 transition-colors z-20"
            title="Scroll to bottom"
          >
            <ArrowDown size={18} strokeWidth={2.5} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
