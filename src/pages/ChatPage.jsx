import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useChat } from '../context/ChatContext'
import { SEOHelmet } from '../components/SEOHelmet'
import AuthModal from '../components/AuthModal'
import ChatWindow from '../components/ChatWindow'
import ChatInput from '../components/ChatInput'
import PaywallModal from '../components/PaywallModal'
import { motion, AnimatePresence } from 'framer-motion'
import { LogOut, Plus, MessageSquare, Menu, X, LayoutDashboard, FileText, Trash2 } from 'lucide-react'
import StudyTimer from '../components/StudyTimer'

export default function ChatPage() {
  const navigate = useNavigate()
  const { user, loading: authLoading, logout, streak } = useAuth()
  const { chatCount, tokenCount, tokenLimit, statsLoading, fetchChatCount, resetChat, loadHistory, historyLoading, deleteChat, deleteAllChats, recentChats, fetchRecentChats, chatsHasMore, loadMoreChats } = useChat()

  const [showPaywall, setShowPaywall] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const prevEmailRef = useRef(undefined)

  useEffect(() => {
    if (user) {
      if (prevEmailRef.current !== undefined && prevEmailRef.current !== user.email) {
        // Different user logged in — clear state
        resetChat()
      }
      prevEmailRef.current = user.email
      fetchChatCount()
      // Always start a new chat — fetch sidebar data without loading old messages
      resetChat()
      fetchRecentChats()
    } else {
      prevEmailRef.current = undefined
      resetChat()
    }
  }, [user, fetchChatCount, resetChat, fetchRecentChats])

  const userInitials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
        <div className="h-10 w-10 border-4 border-slate-200 border-t-emerald-600 rounded-full animate-spin" />
      </div>
    )
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#111111]">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="Everlearn logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">Everlearn</p>
            <p className="text-white/40 text-[11px] mt-0.5">AI </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="md:hidden p-1 text-white/40 hover:text-white/70 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* New session button */}
      {user && (
        <div className="px-4 pt-4 space-y-2">
          <button
            onClick={() => { resetChat(); fetchRecentChats(); setSidebarOpen(false) }}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-900 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
          >
            <Plus size={15} />
            New Study Session
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors"
          >
            <LayoutDashboard size={14} />
            Dashboard
          </button>
          <button
            onClick={() => navigate('/exam-papers')}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-lg text-white/50 hover:text-white hover:bg-white/[0.06] text-sm font-medium transition-colors"
          >
            <FileText size={14} />
            Exam Papers
          </button>
        </div>
      )}

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-4 py-4">
        {user ? (
          <>
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-widest mb-3 px-1">
              Recent Chats
            </p>
            {recentChats.length > 0 && (
              <button
                onClick={async () => {
                  await deleteAllChats()
                }}
                className="w-full flex items-center gap-1.5 px-3 py-1.5 mb-2 rounded-lg text-red-400/70 hover:text-red-400 hover:bg-white/[0.06] text-xs font-medium transition-colors"
              >
                <Trash2 size={12} />
                Delete all chats
              </button>
            )}
            {recentChats.length === 0 ? (
              <p className="text-white/25 text-xs px-1">No chats yet. Start a new session!</p>
            ) : (
              <>
                {recentChats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => { loadHistory(chat._id); setSidebarOpen(false) }}
                  className="group flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/[0.06] cursor-pointer transition-all mb-0.5"
                >
                  <MessageSquare size={13} className="flex-shrink-0" />
                  <span className="text-xs truncate flex-1">{chat.title || 'Untitled'}</span>
                  <button
                    onClick={async (e) => {
                      e.stopPropagation()
                      await deleteChat(chat._id)
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-white/30 hover:text-red-400 transition-all rounded flex-shrink-0"
                    title="Delete chat"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
              {chatsHasMore && (
                <button
                  onClick={loadMoreChats}
                  className="w-full text-center text-white/30 hover:text-white/60 text-xs py-2 transition-colors"
                >
                  Load more
                </button>
              )}
              </>
            )}
          </>
        ) : (
          <div className="mt-4 px-1">
            <p className="text-white/25 text-xs leading-relaxed">Sign in to see your recent chats and study history.</p>
            <button
              onClick={() => { setShowAuthModal(true); setSidebarOpen(false) }}
              className="mt-3 text-emerald-400 text-xs font-medium hover:text-emerald-300 transition-colors"
            >
              Sign in →
            </button>
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="px-4 pb-4 pt-3 border-t border-white/[0.06]">
        {user ? (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-semibold">{userInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-white text-xs font-medium truncate">{user.name}</p>
                {streak > 0 && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-1.5 py-0.5 rounded-full flex-shrink-0">
                    🔥 {streak}
                  </span>
                )}
              </div>
                    <p className="text-white/35 text-[11px] truncate">
                      {statsLoading ? '— / — tokens' : `${tokenCount.toLocaleString()} / ${tokenLimit.toLocaleString()} tokens`}
                    </p>
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-white/30 hover:text-white/60 transition-colors rounded hover:bg-white/[0.06]"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setShowAuthModal(true); setSidebarOpen(false) }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white/55 hover:text-white text-sm border border-white/10 hover:border-white/20 hover:bg-white/[0.04] transition-all"
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  )

  return (
    <>
      <SEOHelmet 
        title="AI Chat - Ask Homework Questions 24/7 - EverlearnAI"
        description="Chat with AI tutor 24/7 for homework help, exam prep, and concept clarification. Get instant answers to any academic question."
        url="https://everlearn.ai/chat"
        keywords="AI homework help, tutoring, exam prep, study assistant, Q&A"
      />
      <div className="flex h-screen bg-[#f8fafc] overflow-hidden">

      {/* ── Sidebar: always visible on md+, hidden on mobile ── */}
      <div className="hidden md:flex w-64 flex-shrink-0 flex-col bg-[#111111] overflow-hidden">
        <SidebarContent />
      </div>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed top-0 left-0 h-full w-72 z-50 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col bg-[#f8fafc] overflow-hidden min-w-0">

        {/* Top bar */}
        <div className="px-4 md:px-6 py-3.5 border-b border-slate-200 bg-white/80 backdrop-blur-sm flex items-center justify-between flex-shrink-0 gap-2">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger — mobile only */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex-shrink-0"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-slate-700 font-semibold text-sm truncate">New Conversation</h2>
          </div>
          <div className="flex-shrink-0">
            {/* Removed FREE_LIMIT chat count display and upgrade prompt */}
          </div>
        </div>

        {/* Chat messages */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          <ChatWindow
            userInitials={userInitials}
            onLoginClick={() => setShowAuthModal(true)}
            onLimitReached={() => setShowPaywall(true)}
          />

          {/* Paywall banner */}
          {/* Removed FREE_LIMIT upgrade block */}

          <ChatInput
            isAuthenticated={!!user}
            // Removed disabled prop for FREE_LIMIT
            onLoginClick={() => setShowAuthModal(true)}
            onLimitReached={() => setShowPaywall(true)}
          />
        </div>
      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showPaywall && <PaywallModal requiredPlan="basic" currentPlan="free" onClose={() => setShowPaywall(false)} />}
      <StudyTimer />
    </div>
    </>
  )
}
